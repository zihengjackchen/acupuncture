"""Build the mobile map from cached official geography; --refresh downloads sources."""
import csv
import hashlib
import html
import io
import json
import math
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "planning/mobile-coverage-source.json"
MUNICIPALITIES = ROOT / "planning/mobile-coverage-municipalities.json"
SERVICE = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer"
POSTAL = "https://postalpro.usps.com/mnt/glusterfs/2026-10/Zip_Locale_Detail.xlsx"
PLACES = ["Naperville", "Orland Park", "Chicago", "Highland Park", "Schaumburg"]
EXTENT = [-88.60, 41.43, -87.40, 42.34]
AREA_LABEL = "Highland Park, Schaumburg, Naperville, Orland Park, and Chicago"
MUNICIPAL_QUERY = {
    "where": "STATE='17' AND BASENAME IN ('Naperville','Orland Park','Chicago','Highland Park','Schaumburg')",
    "outFields": "GEOID,STATE,PLACE,BASENAME,NAME,CENTLAT,CENTLON", "outSR": 3857,
    "returnGeometry": "true", "geometryPrecision": 2,
}
RULE = (
    "Take the convex hull of every vertex of the five official municipal boundaries and ZCTA 60035. "
    "Select a ZCTA if its intersection with this hull exceeds one square metre in EPSG:3857. "
    "Cover and shade the full original geometry of every selected ZCTA, including portions beyond the selection hull. "
    "No city-centre, centroid, prefix, or anchor-override selection."
)


def download(url):
    with urllib.request.urlopen(url, timeout=90) as response:
        return response.read()


def query_url(layer, params):
    return f"{SERVICE}/{layer}/query?" + urllib.parse.urlencode({"f": "json", **params})


def query(layer, params):
    data = json.loads(download(query_url(layer, params)))
    if "error" in data or data.get("exceededTransferLimit"):
        raise RuntimeError(data.get("error", "Census result was truncated"))
    return data["features"]


def postal_localities(blob, wanted):
    ns = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    with zipfile.ZipFile(io.BytesIO(blob)) as archive:
        strings = ["".join(node.itertext()) for node in ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("s:si", ns)]
        localities = {}
        for name in archive.namelist():
            if not name.startswith("xl/worksheets/sheet") or not name.endswith(".xml"):
                continue
            for row in ET.fromstring(archive.read(name)).findall("s:sheetData/s:row", ns):
                values = {}
                for cell in row:
                    value = cell.find("s:v", ns)
                    if value is not None:
                        values["".join(c for c in cell.get("r") if c.isalpha())] = (strings[int(value.text)] if cell.get("t") == "s" else value.text).strip()
                code = values.get("D", "").zfill(5)
                if code in wanted and values.get("F"):
                    record = localities.setdefault(code, {"names": set(), "class": values.get("E", "")})
                    record["names"].add(values["F"])
    return {code: {"name": " / ".join(sorted(record["names"])).title(), "class": record["class"]} for code, record in localities.items()}


def refresh():
    params = {
        "where": "1=1", "geometry": ",".join(map(str, EXTENT)), "geometryType": "esriGeometryEnvelope",
        "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outSR": 3857,
        "outFields": "ZCTA5,NAME,CENTLAT,CENTLON", "returnGeometry": "true",
        "maxAllowableOffset": 65, "geometryPrecision": 0,
    }
    features = query(2, params)
    assert len(features) > 150, "Unexpectedly small Census response"
    postal = download(POSTAL)
    snapshot = {
        "retrieved": date.today().isoformat(), "census_layer": SERVICE + "/2", "request_url": query_url(2, params),
        "postal_source": POSTAL, "postal_sha256": hashlib.sha256(postal).hexdigest(),
        "query_extent": EXTENT, "features": features,
        "postal": postal_localities(postal, {f["attributes"]["ZCTA5"] for f in features}),
    }
    SOURCE.write_text(json.dumps(snapshot, separators=(",", ":")) + "\n", encoding="utf-8")
    refresh_municipalities()


def refresh_municipalities():
    features = query(28, MUNICIPAL_QUERY)
    assert {f["attributes"]["BASENAME"] for f in features} == set(PLACES)
    metadata = json.loads(download(SERVICE + "/28?f=json"))
    snapshot = {
        "retrieved": date.today().isoformat(), "source_layer": SERVICE + "/28",
        "source_vintage": metadata["description"], "request_url": query_url(28, MUNICIPAL_QUERY),
        "features": features,
    }
    MUNICIPALITIES.write_text(json.dumps(snapshot, separators=(",", ":")) + "\n", encoding="utf-8")


def cross(a, b, p):
    return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])


def convex_hull(points):
    points = sorted(set(map(tuple, points)))
    lower, upper = [], []
    for chain, ordered in ((lower, points), (upper, reversed(points))):
        for point in ordered:
            while len(chain) >= 2 and cross(chain[-2], chain[-1], point) <= 0:
                chain.pop()
            chain.append(point)
    return lower[:-1] + upper[:-1]  # Counterclockwise, unclosed.


def inside(point, hull):
    return all(cross(a, b, point) >= -0.01 for a, b in zip(hull, hull[1:] + hull[:1]))


def clip_ring(ring, hull):
    """Sutherland-Hodgman intersection with a convex, counterclockwise hull."""
    result = ring[:-1] if ring[0] == ring[-1] else ring[:]
    for a, b in zip(hull, hull[1:] + hull[:1]):
        subject, result = result, []
        if not subject:
            break
        previous = subject[-1]
        previous_side = cross(a, b, previous)
        for current in subject:
            current_side = cross(a, b, current)
            if (current_side >= 0) != (previous_side >= 0):
                ratio = previous_side / (previous_side - current_side)
                result.append([previous[0] + ratio * (current[0] - previous[0]), previous[1] + ratio * (current[1] - previous[1])])
            if current_side >= 0:
                result.append(current)
            previous, previous_side = current, current_side
    return result


def ring_area(ring):
    if len(ring) < 3:
        return 0
    # Translate first to avoid cancellation from large Web Mercator coordinates.
    origin = ring[0]
    points = [(p[0] - origin[0], p[1] - origin[1]) for p in ring]
    return sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(points, points[1:] + points[:1])) / 2


def merc(lon, lat):
    return lon * 20037508.34 / 180, math.log(math.tan((90 + lat) * math.pi / 360)) * 20037508.34 / math.pi


def lonlat(point):
    return [point[0] / 20037508.34 * 180, math.degrees(2 * math.atan(math.exp(point[1] / 20037508.34 * math.pi)) - math.pi / 2)]


def self_check():
    hull = convex_hull([(0, 0), (4, 0), (4, 4), (0, 4), (2, 2)])
    clipped = clip_ring([(-1, 1), (3, 1), (3, 3), (-1, 3), (-1, 1)], hull)
    assert abs(ring_area(clipped) - 6) < 1e-8
    assert inside((4, 2), hull) and not inside((5, 2), hull)
    assert not clip_ring([(5, 5), (6, 5), (6, 6)], hull)
    # A concave ring may intersect in two pieces; connecting boundary segments cancel.
    u_shape = [(0, 0), (4, 0), (4, 4), (3, 4), (3, 1), (1, 1), (1, 4), (0, 4)]
    upper = convex_hull([(-1, 2), (5, 2), (5, 5), (-1, 5)])
    assert abs(ring_area(clip_ring(u_shape, upper)) - 4) < 1e-8


def generate(snapshot, municipalities):
    features = sorted(snapshot["features"], key=lambda feature: feature["attributes"]["ZCTA5"])
    highland_zip = next(f for f in features if f["attributes"]["ZCTA5"] == "60035")
    boundary_features = municipalities["features"] + [highland_zip]
    boundary_points = [p for feature in boundary_features for ring in feature["geometry"]["rings"] for p in ring]
    hull = convex_hull(boundary_points)
    assert all(inside(point, hull) for point in boundary_points), "Hull must include every municipal boundary vertex"
    hull_lonlat = [[round(value, 8) for value in lonlat(point)] for point in hull]
    assert all(EXTENT[0] < p[0] < EXTENT[2] and EXTENT[1] < p[1] < EXTENT[3] for p in hull_lonlat), "Refresh with a wider ZCTA query extent"
    records, audit, selected_by_code = [], [], {}
    for feature in features:
        a = feature["attributes"]
        code = a["ZCTA5"]
        rings = feature["geometry"]["rings"]
        clipped = [clip_ring(ring, hull) for ring in rings]
        clipped = [ring for ring in clipped if len(ring) >= 3 and abs(ring_area(ring)) > 0.0001]
        source_area = abs(sum(map(ring_area, rings)))
        intersection_area = abs(sum(map(ring_area, clipped)))
        selected = intersection_area > 1
        assert intersection_area <= source_area + 1, f"Intersection exceeds original area: {code}"
        selection_overlap = ("full" if all(inside(p, hull) for ring in rings for p in ring) else "partial") if selected else "outside"
        if selected:
            assert all(inside(p, hull) for ring in clipped for p in ring), f"Clipped point outside hull: {code}"
            selected_by_code[code] = rings
        postal = snapshot["postal"].get(code, {})
        locality = postal.get("name", "ZIP " + code)
        fraction = round(min(1, intersection_area / source_area), 6) if source_area else 0
        audit.append({
            "zip_code": code, "prefix": code[:3], "usps_zip_class": postal.get("class", ""),
            "usps_postal_locale": locality, "census_zcta": code, "map_status": "zcta_available",
            "centroid_latitude": float(a["CENTLAT"]), "centroid_longitude": float(a["CENTLON"]),
            "accepted": selected, "coverage_status": "full" if selected else "outside",
            "selection_overlap": selection_overlap, "selection_intersection_fraction_projected": fraction,
            "selection_reason": "intersects_municipal_envelope" if selected else "outside_municipal_envelope",
        })
        if selected:
            records.append({"zip": code, "locality": locality, "mapped": True, "zip_class": postal.get("class", ""), "coverage": "full"})
    accepted = {record["zip"] for record in records}
    assert {"60035", "60614", "60601", "60617", "60633", "60462", "60467", "60173", "60193", "60194", "60195", "60540", "60563", "60564", "60565"} <= accepted
    assert {"60002", "60085", "60115", "60006"}.isdisjoint(accepted)
    assert 100 < len(accepted) < 250
    assert next(record for record in records if record["zip"] == "60035")["coverage"] == "full"
    for name, rows in [("mobile-service-zip-inventory.csv", [row for row in audit if row["accepted"]]), ("mobile-service-zip-audit.csv", audit)]:
        with (ROOT / "planning" / name).open("w", encoding="utf-8", newline="") as output:
            writer = csv.DictWriter(output, fieldnames=list(audit[0]))
            writer.writeheader()
            writer.writerows(rows)
    selection_full = sum(row["selection_overlap"] == "full" for row in audit)
    selection_partial = sum(row["selection_overlap"] == "partial" for row in audit)
    data = {
        "total": len(records), "mapped": len(records), "unmapped": 0, "full": len(records), "partial": 0,
        "prefixes": sorted({record["zip"][:3] for record in records}), "records": records, "area_label": AREA_LABEL,
    }
    (ROOT / "data/coverage.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    (ROOT / "static/data/mobile-coverage.json").write_text(json.dumps(records, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    boundary_geojson = {"type": "Feature", "properties": {"name": "Internal mobile ZIP selection envelope", "purpose": "Selection only; service coverage uses complete selected ZCTAs and extends beyond this envelope.", "method": RULE}, "geometry": {"type": "Polygon", "coordinates": [hull_lonlat + [hull_lonlat[0]]]}}
    (ROOT / "static/data/mobile-service-boundary.geojson").write_text(json.dumps(boundary_geojson, separators=(",", ":")) + "\n", encoding="utf-8")

    # Fit every complete selected region, including all disconnected rings.
    # The internal selection hull must never crop the displayed ZIP geometry.
    selected_points = [point for rings in selected_by_code.values() for ring in rings for point in ring]
    xmin, ymin = min(p[0] for p in selected_points), min(p[1] for p in selected_points)
    xmax, ymax = max(p[0] for p in selected_points), max(p[1] for p in selected_points)
    scale = min(852 / (xmax - xmin), 672 / (ymax - ymin))
    offset_x = (900 - (xmax - xmin) * scale) / 2
    offset_y = (720 - (ymax - ymin) * scale) / 2

    def xy(point):
        return (point[0] - xmin) * scale + offset_x, (ymax - point[1]) * scale + offset_y

    assert all(23.9 <= xy(p)[0] <= 876.1 and 23.9 <= xy(p)[1] <= 696.1 for p in selected_points), "Full highlighted regions must fit the viewport with padding"

    def path(rings):
        return "".join("M" + "L".join(f"{xy(p)[0]:.1f},{xy(p)[1]:.1f}" for p in ring) + "Z" for ring in rings if len(ring) > 2)

    by_code = {record["zip"]: record for record in records}
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 720" class="coverage-svg" aria-labelledby="coverage-map-title coverage-map-description" role="group">',
        f'<title id="coverage-map-title">Mobile service area: {AREA_LABEL}</title>',
        f'<desc id="coverage-map-description">{len(records)} complete ZIP areas are highlighted in green for mobile visits by request. Gray ZIP areas are outside the mapped service area. Use the ZIP lookup or complete text list.</desc>',
        '<defs><clipPath id="coverage-clip"><rect width="900" height="720"/></clipPath></defs>',
        '<rect width="900" height="720" fill="#f1eee5"/><g clip-path="url(#coverage-clip)">',
        '<g class="coverage-outside" fill="#e4e5dd" stroke="#cdd2c6" stroke-width="0.7" aria-hidden="true">']
    # Every source polygon is neutral underneath; selected ZIPs are filled in full.
    for feature in features:
        code = feature["attributes"]["ZCTA5"]
        svg.append(f'<path data-context-zip="{code}" d="{path(feature["geometry"]["rings"])}" fill-rule="evenodd" vector-effect="non-scaling-stroke"/>')
    svg.append('</g><g class="coverage-regions">')
    greens = ["#9cb99d", "#a8c2a7", "#88aa91", "#b7cbb0", "#97b59c"]
    for code, rings in selected_by_code.items():
        label = html.escape(f'{code}: {by_code[code]["locality"]}. Mobile visits by request.', quote=True)
        svg.append(f'<path class="coverage-region" data-zip="{code}" data-coverage-status="{by_code[code]["coverage"]}" d="{path(rings)}" fill="{greens[int(code) % len(greens)]}" fill-rule="evenodd" stroke="#f7f3e9" stroke-width="0.9" vector-effect="non-scaling-stroke" tabindex="-1" role="button" aria-pressed="false" aria-label="{label}"><title>{label}</title></path>')
    svg.append('</g>')
    svg.append('<g class="coverage-context" aria-hidden="true" fill="#36463d" font-family="sans-serif" font-size="13">')
    labels = [{"name": f["attributes"]["BASENAME"], "point": [float(f["attributes"]["CENTLON"]), float(f["attributes"]["CENTLAT"])]} for f in municipalities["features"]]
    labels.append({"name": "Lincoln Park", "point": [-87.6557, 41.9214]})
    for place in labels:
        x, y = xy(merc(*place["point"]))
        name = place["name"]
        svg.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3" fill="#36463d" stroke="#f7f3e9" stroke-width="1.5"/><text x="{x + 9:.1f}" y="{y + 3:.1f}" style="paint-order:stroke;stroke:#f7f3e9;stroke-width:3px;stroke-linejoin:round">{name}</text>')
    x, y = xy(merc(-87.50, 42.07))
    svg.append(f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="middle" font-size="11" letter-spacing="1.4" fill="#74867b">LAKE<tspan x="{x:.1f}" dy="16">MICHIGAN</tspan></text>')
    svg.append('</g></g><g aria-hidden="true" fill="#536459" font-family="sans-serif" font-size="11"><path d="M856 55V27m0 0l-4 8m4-8l4 8" fill="none" stroke="#536459"/><text x="856" y="19" text-anchor="middle">N</text><text x="28" y="692">Northeastern Illinois</text></g></svg>')
    (ROOT / "static/images/coverage/mobile-coverage.svg").write_text("".join(svg), encoding="utf-8")
    view_extent = lonlat([xmin - offset_x / scale, ymin - offset_y / scale]) + lonlat([xmax + offset_x / scale, ymax + offset_y / scale])
    provenance = {
        "updated": max(snapshot["retrieved"], municipalities["retrieved"]), "source_name": "U.S. Census Bureau TIGERweb / USPS ZIP Locale Detail",
        "source_layer": SERVICE + "/2", "source_vintage": "2020 Census ZCTA geography",
        "municipal_layer": SERVICE + "/28", "municipal_vintage": municipalities["source_vintage"],
        "municipal_query_url": municipalities["request_url"],
        "municipalities": [{"name": f["attributes"]["NAME"], "geoid": f["attributes"]["GEOID"]} for f in municipalities["features"]],
        "additional_boundary": "Every vertex of Census ZCTA 60035, as requested for Highland Park",
        "lincoln_park": "A Chicago neighborhood, already included by the full Chicago municipal boundary",
        "lincoln_park_reference": "https://ccpsa.chicago.gov/district-council/18th-district-council/",
        "postal_source": POSTAL, "postal_sha256": snapshot["postal_sha256"],
        "source_snapshots": ["planning/mobile-coverage-source.json", "planning/mobile-coverage-municipalities.json"],
        "source_sha256": {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in [SOURCE, MUNICIPALITIES]},
        "regenerate": "python scripts/prepare-coverage.py", "refresh_sources": "python scripts/prepare-coverage.py --refresh",
        "selection_rule": RULE, "coordinate_order": "longitude, latitude (EPSG:4326)",
        "boundary": hull_lonlat + [hull_lonlat[0]], "boundary_geojson": "static/data/mobile-service-boundary.geojson",
        "display_rule": "Fill each selected ZCTA's complete original rings. Fit all highlighted geometry with at least 24 SVG units of padding; draw no outer selection perimeter.",
        "intersecting_zips": len(records), "fully_covered_zctas": len(records), "partially_covered_zctas": 0,
        "selection_fully_inside_zctas": selection_full, "selection_intersecting_edge_zctas": selection_partial,
        "mapped_zctas": len(records), "accepted_zips_without_zcta": 0, "outside_context_zctas": len(features) - len(records),
        "neutral_base_zctas": len(features), "query_extent": EXTENT, "view_extent": [round(value, 8) for value in view_extent],
        "projection": "Web Mercator EPSG:3857; complete selected ZCTA geometry fitted to 900 by 720 SVG with at least 24 units padding",
        "simplification": "Municipal boundaries: no simplification, 0.01 m coordinates. ZCTAs: ArcGIS maxAllowableOffset 65 m and integer projected coordinates. SVG: 0.1 units.",
        "notes": [
            "The convex hull is the smallest convex envelope containing all supplied outer boundary vertices; it includes intervening areas and is not a travel-distance calculation.",
            "Municipal holes and disconnected parts do not create holes in the envelope. Full Chicago includes O'Hare and the Far South Side.",
            "Sutherland-Hodgman computes intersection areas for ZIP selection and audit only. Display and coverage use complete original ZCTA rings, preserving holes and disconnected parts.",
            "An intersection must exceed one projected square metre to exclude numerical and point-only contacts. Selection intersection fractions in the audit are projected area ratios, not coverage percentages.",
            "All 206 previously selected ZIPs remain selected. The 51 ZIPs crossing the internal hull now receive full-region coverage, including areas well beyond the hull where the original intersection was small.",
            "Small-intersection examples include 46327 (Hammond), 46394 (Whiting), 60120, and 60502. Their entire Census ZIP areas are now highlighted, including Indiana portions.",
            "Lake Michigan is not painted with an invented land shape: green follows the complete source ZCTA geography.",
            "ZCTAs approximate ZIP areas and are not official USPS delivery boundaries. Unmatched and PO-box-only ZIPs require a call, not an outside-area assertion.",
            "The directory and lookup treat every selected ZIP as a whole service region. The internal municipal envelope is a selection aid, not a displayed or enforced cutoff.",
            "USPS locale names may identify postal facilities rather than municipalities. Green shades distinguish ZIP areas, not a numerical value.",
            "All mobile visits need street-address, schedule, and travel-fee confirmation.",
        ],
    }
    (ROOT / "planning/mobile-coverage-provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    print(f'{len(records)} complete ZIP regions; {selection_partial} extend beyond the internal selection envelope; {len(features) - len(records)} outside context ZIPs.')
    print(f'Hull: {len(hull)} vertices from {len(boundary_points)} source vertices; SVG: {(ROOT / "static/images/coverage/mobile-coverage.svg").stat().st_size:,} bytes.')


if __name__ == "__main__":
    self_check()
    if "--refresh" in sys.argv or not SOURCE.exists():
        refresh()
    elif not MUNICIPALITIES.exists():
        refresh_municipalities()
    generate(json.loads(SOURCE.read_text(encoding="utf-8")), json.loads(MUNICIPALITIES.read_text(encoding="utf-8")))

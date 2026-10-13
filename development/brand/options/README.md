# Logo explorations

**Current identity: G, with revised spacing.** The website and media pack use the original treatment scene with slightly stronger contours, jade/sage colors, and Cormorant Garamond / DM Sans lettering. The descriptor now has more space below the name's descenders. All earlier alternatives remain here for future review.

| Option | Description | Preview | Editable SVG |
| --- | --- | --- | --- |
| A | Original artwork | [PNG](a-original.png) | [SVG](a-original.svg) |
| B | Original forms with stronger contours | [PNG](b-contour-refinement.png) | [SVG](b-contour-refinement.svg) |
| C | Original forms in the website's jade palette | [PNG](c-jade-palette.png) | [SVG](c-jade-palette.svg) |
| D | Simpler patient-and-needle concept with new lettering | [Size comparison](d-simple-preview.png) | [Outlined lockup](d-simple-lockup.svg), [live type](d-simple-lockup-editable.svg), [symbol](d-simple-symbol.svg) |
| E | Original forms with fewer needles and no small dots | [Original comparison](e-faithful-comparison.png) | [Lockup](e-faithful-reduction.svg), [symbol](e-faithful-symbol.svg) |
| F | Original scene with a simpler reclining patient and bench | [Size comparison](f-simpler-comparison.png) | [Lockup](f-simpler-patient-bench.svg), [symbol](f-simpler-symbol.svg) |
| G | Original scene, refined contours, jade palette, and website typography | [Header, card, footer and wallpaper preview](g-identity-preview.png) | [Outlined lockup](g-horizontal.svg), [live type](g-horizontal-editable.svg), [stacked](g-stacked.svg), [symbol](g-symbol.svg) |

The [A/B/C comparison](logo-options-comparison.png) and its [editable SVG](logo-options-comparison.svg) are also retained. This folder includes each later comparison's SVG, full-size PNG, and small-icon exports.

Generators for [D](simple-concept.mjs), [E](faithful-reduction.mjs), and [F](simpler-patient-bench.mjs) run from the repository root with `node development/brand/options/<filename>`. They generate previews only; they do not update the active identity.

The earlier leaf-and-needle redesign is preserved in [archive-v1](../archive-v1/): [complete media pack](../archive-v1/wangs-harmony-media-pack.zip) and [export generator](../archive-v1/export-brand.mjs). Its archive contains the vector masters and raster exports. Keep that historical generator as a reference; it is not the active export script.

The unmodified original source files remain in [original logo sources](../original/). The complete original A media pack and exporter are preserved in [archive-original-a](../archive-original-a/). The first selection of A was superseded by the request for G; no earlier artwork was deleted.

Rebuild G with `npm run brand`, using [scripts/export-brand.mjs](../../../scripts/export-brand.mjs). Its preview and [ivory](g-wallpaper-ivory.svg) / [jade](g-wallpaper-jade.svg) wallpaper vectors are retained here too.

The first G layout, preview, exporter and complete media pack remain in [g-original-spacing](g-original-spacing/). Inspect the revised logo at its actual display sizes: [250 px horizontal](g-horizontal-250.png) and [220 px stacked](g-stacked-220.png).

The [wallpaper collection preview](g-wallpaper-collection.png) shows ivory, jade and sage backgrounds in 16:9, 3:4, 4:5, 9:16 and 1:1 formats. Each format now uses the exact horizontal typography and spacing of [the approved ivory reference](g-wallpaper-ivory.svg), scaled to the same fraction of canvas width and centered. The [media-pack guide](../../../media-pack/brand-guide.html) includes thumbnails and individual PNG / SVG downloads; its [README](../../../media-pack/README.txt) lists dimensions and filenames.

The approved reference has an [immutable copy](g-wallpaper-reference/reference.svg) and [SHA-256 record](g-wallpaper-reference/SHA256.txt). The previous collection, which used stacked portrait logos and different scale proportions, remains in [g-mixed-wallpaper-layout](g-mixed-wallpaper-layout/) with its exporter and complete media pack.

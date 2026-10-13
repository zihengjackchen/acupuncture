# Wang’s Harmony Acupuncture

A static Hugo website for Dr Wang’s Chicago and Highland Park clinics, with a mobile-service map, a card that turns as visitors scroll, and a locally hosted ink landscape.

## Develop and check

Install **Node.js 24**, **Hugo Extended** (CI uses **0.155.3**), and Google Chrome for the browser checks. Run from the repository root:

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run build
npm.cmd test
npm.cmd run brand
```

- `dev`: serves the site at `http://127.0.0.1:1313`; generated files go to `.qa/preview/`.
- `build`: creates the production site in `dist/`.
- `test`: checks pages, links, booking routes, interactions, and mobile layouts in headless Chrome; starts a local Hugo server if needed. Screenshots live in `.qa/`; results print to the terminal. `HARMONY_TEST_URL` and `HARMONY_BROWSER` can select an existing server or another installed browser channel.
- `brand`: regenerates logo exports, social wallpapers, the brand guide, and the downloadable media pack.

Use normal `npm` commands on macOS/Linux or where PowerShell allows `npm.ps1`. `npm.cmd` avoids that script-policy issue on Windows.

## Maintain the site

| Change | Source |
| --- | --- |
| Clinic addresses, booking links, weekly hours | `data/clinics.json` |
| Main phone, email, service-area description | `data/contact.yaml` |
| Page copy and service/FAQ content | `content/` |
| Page structure and components | Root `layouts/` |
| Main design and interaction code | `assets/css/site.css`, `assets/js/main.js` |
| Map data and presentation | `data/coverage.json`, `layouts/partials/coverage-map.html`, `assets/css/coverage.css`, `assets/js/coverage.js` |
| Chinese ink-wash imagery | WebP exports in `static/images/editorial/`; PNG originals and prompts in `development/imagery/editorial-inkwash-v2/`, `editorial-inkwash-v3/`, and `editorial-inkwash-v4/` |
| Real practitioner portrait | `static/images/dan-wang.webp` |
| Logo generator and editable masters | `scripts/export-brand.mjs`, `assets/brand/masters/` |
| Production logos and media downloads | `static/images/brand/`, `media-pack/` |
| Logo history and original artwork | `development/brand/`, `development/imagery/` |

Hugo mounts the top-level `media-pack/` directory at `/media-pack/`, so existing download links stay the same. `development/` stores sources and design history and is not published.

The logo generator controls repeatable exports; update it when changing the identity so regeneration preserves the change. The active G identity preserves the original scene, refines its contours, uses jade/sage colors, and pairs Cormorant Garamond with DM Sans. Original logos remain in `development/brand/original/`; the options index in `development/brand/options/README.md` links every exploration and archive. Fonts and licenses are bundled locally. The footer links to the media guide and downloadable ZIP at `/media-pack/brand-guide.html` and `/media-pack/wangs-harmony-media-pack.zip`.

Keep `development/imagery/IMAGE_PROMPTS.md` and `development/imagery/editorial/` as historical references. The v2 ink-wash collection supplies the botanical service images; v3 adds twelve treatment, consultation, and traditional-medicine illustrations, with nine used and three reserves. The user chose the V3 paintings; the rejected V4 likeness edits remain archived and are not used on the website. Each collection's README records assignments and prompts. Editorial images do not repeat within an individual page; logos and the real practitioner portrait remain shared identity assets. Introduce the practitioner as **Dr Dan Wang** on Meet Dan, beneath her homepage portrait, and on the homepage name card; use **Dan** elsewhere in visible copy.

The media pack includes fifteen wallpaper variants: ivory, jade, and sage backgrounds in 16:9, 3:4, 4:5, 9:16, and square formats. Every variant uses the horizontal arrangement, font outlines, internal spacing, and proportional width of `development/brand/options/g-wallpaper-ivory.svg`, centered on its canvas. The guide previews and links to PNGs, outlined SVGs, and editable masters. The current G has added clearance below the wordmark; its previous spacing is preserved in `development/brand/options/g-original-spacing/`.

Chicago appointments are Monday and Wednesday, **noon–6 pm Central**, at Elite Healthcare. Highland Park’s **Sunday 9 am–6 pm** hours remain **provisional** and should be confirmed by phone. The site retains **847-786-0066** and **hello@wangsharmonyacu.com**. When confirming hours or changing contact details, update the data and any corresponding prose in `content/contact.md` and `content/team/peter-van-eijk.md`. Keep existing slugs unless providing redirects.

The content retains the previously published biography, **$20 virtual consultation**, and **$29.99 base travel fee per commute**. The travel charge is separate from treatment fees. Update the fee FAQ (`content/blog/fertility-focused-supplement-guidance.md`), consultation page, and `layouts/partials/contact-page.html` together when rates change.

## Mobile coverage and landscape

The map highlights **206 complete Census ZIP areas**. Selection uses an internal convex envelope around the outer boundaries of Naperville, Orland Park, Chicago, Highland Park, and Schaumburg, plus Highland Park ZIP **60035**. Lincoln Park is already within Chicago. Any ZCTA intersecting that envelope by more than one projected square metre is selected. The **entire selected ZIP region** is then green, including portions beyond the envelope; no outer line or hard cutoff is drawn. Another **108 ZIP areas** provide neutral context. The initial view fits all highlighted shapes with padding.

The same 206 ZIPs remain selected. Of these, 155 lie wholly inside the internal envelope and 51 cross it; these are selection statistics, not partial service restrictions. Showing full ZIPs expands the highlighted area for those 51 edge regions. This includes entire regions with small original intersections, such as **46327 (Hammond), 46394 (Whiting), 60120, and 60502**, including Indiana portions.

`planning/mobile-service-zip-inventory.csv` lists selected ZIPs; `planning/mobile-service-zip-audit.csv` records each selection decision, overlap type, and projected intersection fraction. Coverage status is `full` for every selected ZIP. `planning/mobile-coverage-provenance.json` stores the internal selection coordinates, selection/display rules, source URLs, vintages, and snapshot hashes. Municipal boundaries come from the Census Bureau's January 2026 incorporated-place layer; postal-area geometry uses 2020 ZCTAs. ZCTAs approximate postal coverage. Unmapped and postal-only ZIPs require a call. Confirm the street address, appointment, and travel fee for every home visit.

Run `python scripts/prepare-coverage.py` with Python 3 to regenerate the inventory, `data/coverage.json`, `static/data/mobile-coverage.json`, `static/data/mobile-service-boundary.geojson`, and `static/images/coverage/mobile-coverage.svg`. The GeoJSON preserves the **internal selection envelope**, not the final outer edge of coverage. The script reads cached official geography from `planning/mobile-coverage-source.json` and `planning/mobile-coverage-municipalities.json`. Add `--refresh` to download the sources again. It uses the Python standard library and checks selection geometry, named locations, outside locations, and viewport containment of every highlighted vertex. Keep the documented count in `data/contact.yaml` in sync if selection changes. The website makes no map API requests.

The footer uses a pinned adaptation of Lingdong Huang’s **Shan, Shui**. Source attribution and the MIT license are in `static/vendor/shan-shui/`. Its runtime is in `assets/js/landscape.js`. `node scripts/prepare-landscape.mjs` regenerates the local drawing primitives and fallback from the pinned upstream revision; this maintenance command needs network access. Preserve its attribution and license.

The landscape moves at 3 CSS pixels per second while visible and stops when offscreen or in a hidden tab. A Pause/Resume button gives visitors control. A worker generates the detailed scenery ahead of the viewport; the browser paints a bounded strip and translates it instead of repainting the canvas every frame. Reduced-motion and no-JavaScript visitors see the static fallback. The business-card section uses GSAP ScrollTrigger in `assets/js/main.js` to pin the card and turn it with native scrolling. It has no flip button. Reduced-motion and no-JavaScript visitors can read both faces without the animation. Entrances, accordion transitions, and the global bottom invitation use slower GSAP timing, with immediate keyboard-focus visibility.

## Deployment

`.github/workflows/hugo.yaml` builds and deploys to GitHub Pages on a push to `main` or manual workflow dispatch. It installs Node 24 and Hugo Extended 0.155.3, runs `npm ci`, builds into `dist/`, and uploads that static artifact. The domain is configured by `static/CNAME` and `config.toml`.

Edit source files rather than generated output. `dist/`, `.qa/`, `resources/`, and `node_modules/` are ignored local/build directories. The site uses the root `layouts/` and `assets/` directly; it has no external Hugo theme. Old `public/` and `tmp_build/` snapshots have been removed.

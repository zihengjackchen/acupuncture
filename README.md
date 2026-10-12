# Wang’s Harmony Acupuncture

A static Hugo website for Dan Wang’s Chicago and Highland Park clinics, with a mobile-service map, an animated business card, and a locally hosted ink landscape.

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
| Generated editorial imagery | WebP exports in `static/images/editorial/`; PNG originals and `prompts.json` in `assets/generated/editorial/` |
| Real practitioner portrait | `static/images/dan-wang.webp` |
| Logo generator and editable masters | `scripts/export-brand.mjs`, `assets/brand/masters/` |
| Production logos and media downloads | `static/images/brand/`, `static/media-pack/` |

The logo generator controls repeatable exports; update it when changing the identity so regeneration preserves the change. Original logos remain in `static/images/logo/`. Fonts and their licenses are bundled locally. Keep the existing `IMAGE_PROMPTS.md` as historical reference; the current generated-image records describe the makeover assets.

Chicago appointments are Monday and Wednesday, **noon–6 pm Central**, at Elite Healthcare. Highland Park’s **Sunday 9 am–6 pm** hours remain **provisional** and should be confirmed by phone. The site retains **847-786-0066** and **hello@wangsharmonyacu.com**. When confirming hours or changing contact details, update the data and any corresponding prose in `content/contact.md` and `content/team/peter-van-eijk.md`. Keep existing slugs unless providing redirects.

## Mobile coverage and landscape

The accepted inventory is `planning/mobile-service-zip-inventory.csv`: **263 ZIP codes**, with **201 matching Census polygons** and **62 without polygons**. The map is `static/images/coverage/mobile-coverage.svg`; the public ZIP records are `static/data/mobile-coverage.json`. Keep both synchronized with `data/coverage.json` and the inventory when coverage changes. Source vintage, projection, and simplification are recorded in `planning/mobile-coverage-provenance.json`.

Census ZIP Code Tabulation Areas approximate postal coverage; they are not exact USPS delivery boundaries. A missing polygon does not mean an accepted ZIP is excluded. All mobile visits still require address, availability, and travel-fee confirmation.

The footer uses a pinned adaptation of Lingdong Huang’s **Shan, Shui**. Source attribution and the MIT license are in `static/vendor/shan-shui/`. Its runtime is in `assets/js/landscape.js`. `node scripts/prepare-landscape.mjs` regenerates the local drawing primitives and fallback from the pinned upstream revision; this maintenance command needs network access. Preserve its attribution and license.

## Deployment

`.github/workflows/hugo.yaml` builds and deploys to GitHub Pages on a push to `main` or manual workflow dispatch. It installs Node 24 and Hugo Extended 0.155.3, runs `npm ci`, builds into `dist/`, and uploads that static artifact. Using a fresh destination keeps the older tracked `public/` snapshot out of deployments. The domain is configured by `static/CNAME` and `config.toml`.

Edit source files rather than generated output. `dist/`, `public/`, `.qa/`, `resources/_gen/`, and `node_modules/` are local/build output directories; `tmp_build/` is an older generated snapshot. None is the source of the redesigned pages. Root layouts override the retained Hugo theme.

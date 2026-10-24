# Wang’s Harmony Acupuncture

Website for Dan’s acupuncture practice in Chicago and Highland Park, Illinois. Visitors can explore services, learn about their first appointment, check the weekly clinic schedule, and request a home visit.

[Visit the website](https://www.wangsharmonyacu.com/)

The site uses Hugo, custom templates, CSS, and JavaScript with GSAP. Its design pairs Chinese ink-wash illustrations with jade and ivory colors, serif headings, and slow motion.

## Features

- Clinic schedule with location-specific booking links, directions, and phone contact.
- Mobile-service map with ZIP lookup, keyboard navigation, and 206 complete highlighted ZIP regions.
- Service pages, appointment FAQs, practitioner biography, and fees.
- Patient testimonials in a horizontal row with swipe, keyboard, and arrow controls.
- Business card that turns as visitors scroll, plus a continuous ink landscape with a pause control.
- Responsive layouts, local fonts, and reduced-motion and no-JavaScript fallbacks.
- Downloadable logos, brand guide, and 15 wallpaper variants in five formats and three colors.

## Launch video

A 20-second landscape tour of the website’s design, clinic schedule, mobile-service map, and motion.

[![Watch the Wang’s Harmony website tour](brag-output/brag.jpg)](brag-output/brag.mp4)

[Download the video](brag-output/brag.mp4) · [Share copy](brag-output/share-copy.txt) · [Editable composition](brag-output/composition/)

## Run locally

Install **Node.js 24** and **Hugo Extended**. GitHub Pages uses Hugo **0.155.3**. Install Google Chrome to run the browser checks.

```powershell
npm.cmd ci
npm.cmd run dev
```

Open **http://127.0.0.1:1313**. Hugo writes the preview to `.qa/preview/`.

| Command | Purpose |
| --- | --- |
| `npm.cmd run build` | Build the production site in `dist/` |
| `npm.cmd test` | Check routes, links, booking, map interactions, motion fallbacks, and mobile layouts |
| `node scripts/check-seo.mjs` | Check production canonicals, structured URLs, robots, and sitemap after a build |
| `npm.cmd run brand` | Rebuild logo exports, wallpapers, the brand guide, and media-pack ZIP |

Use `npm` instead of `npm.cmd` on macOS/Linux or when PowerShell permits `npm.ps1`. The test script starts a Hugo server when needed and saves screenshots in `.qa/`. Set `HARMONY_TEST_URL` to test an existing server or `HARMONY_BROWSER` to select another installed browser channel.

## Project files

| Location | Contents |
| --- | --- |
| [content/](content/) | Page copy, service descriptions, biography, and FAQs |
| [layouts/](layouts/) | Hugo page templates and shared components |
| [assets/](assets/) | CSS, JavaScript, active brand masters, and source fonts |
| [data/](data/) | Clinic schedules, contact information, patient testimonials, and ZIP records |
| [static/](static/) | Website images, fonts, map exports, and landscape runtime |
| [media-pack/](media-pack/) | Downloadable brand assets and guide |
| [development/](development/README.md) | Logo explorations, original artwork, prompts, and design history |
| [brag-output/](brag-output/) | Launch video, poster, share copy, and editable composition |
| [planning/](planning/) | Specifications, coverage inventory, and source provenance |
| [scripts/](scripts/) | Asset generators and verification scripts |

Hugo mounts the root `media-pack/` directory at `/media-pack/`. Keep those public download URLs when organizing files. Hugo does not publish `development/`.

## Maintain clinic information

Edit [data/clinics.json](data/clinics.json) for schedules, addresses, and booking links. Edit [data/contact.yaml](data/contact.yaml) for the main contact details. Keep corresponding page copy in `content/` and `layouts/partials/contact-page.html` in sync.

| Clinic | Schedule, Central Time | Address |
| --- | --- | --- |
| Elite Healthcare | Monday and Wednesday, noon–6 pm | 2732 N Lincoln Ave, Chicago, IL 60614 |
| Pulling Down the Moon | Sunday, 9 am–6 pm; provisional, confirm by phone | 1770 1st St, Suite 400, Highland Park, IL 60035 |

Chicago booking uses [Elite Healthcare’s Jane portal](https://elitehcare.janeapp.com/). Highland Park and home-visit requests use **847-786-0066**. The main email is **hello@wangsharmonyacu.com**.

Published fees include a **$20 virtual consultation** and a **$29.99 base travel fee per commute**, separate from treatment fees. Update the consultation page, [fee FAQ](content/blog/fertility-focused-supplement-guidance.md), and contact-page template together when rates change. Preserve existing page URLs or provide redirects.

Patient quotes live in [data/testimonials.json](data/testimonials.json). Keep their approved wording and attribution; see [testimonial provenance](planning/testimonial-provenance.md) for the approved reviews.

## Maintain maps and artwork

The map highlights 206 whole Census ZIP areas. Its internal selection envelope follows the outer boundaries of Chicago, Highland Park, Schaumburg, Naperville, and Orland Park, plus ZIP 60035. Some selected ZIPs extend beyond that envelope, including border areas in Indiana. Census ZCTAs approximate postal areas; confirm the street address and travel fee when booking.

```powershell
python scripts/prepare-coverage.py
```

Python 3 regenerates map assets and inventories from cached Census/USPS sources. Add `--refresh` to fetch them again. Review [coverage provenance](planning/mobile-coverage-provenance.json) when changing selection, and keep the count in `data/contact.yaml` consistent. The website uses the generated SVG without a map API.

Use `npm.cmd run brand` to maintain the active G identity. Keep editable masters in `assets/brand/masters/`, production logos in `static/images/brand/`, and earlier concepts in [development/brand/](development/brand/options/README.md). Preserve the media pack’s horizontal logo arrangement and spacing across wallpaper formats.

Website illustrations live in `static/images/editorial/`. Keep their original PNGs and prompts in [development/imagery/](development/imagery/README.md), including reserve and rejected artwork. Use `static/images/dan-wang.webp` for the real practitioner portrait.

The footer adapts Lingdong Huang’s **Shan, Shui**. Preserve its attribution and MIT license in `static/vendor/shan-shui/`. Run `node scripts/prepare-landscape.mjs` to regenerate the drawing code and static fallback from the pinned upstream revision; that command needs network access. The landscape pauses offscreen or in a hidden tab and supports reduced motion.

## Deploy

[.github/workflows/hugo.yaml](.github/workflows/hugo.yaml) builds and deploys to GitHub Pages on a push to `main` or a manual workflow run. It installs Node 24 and Hugo Extended 0.155.3, runs `npm ci`, and uploads `dist/`.

Set the domain in `static/CNAME` and `config.toml`. Keep `baseURL` set to `https://www.wangsharmonyacu.com/`; the deployment uses this value for canonical and sitemap URLs. The workflow checks production SEO output before uploading. Edit source files; `dist/`, `.qa/`, `resources/`, and `node_modules/` contain ignored local or build output.

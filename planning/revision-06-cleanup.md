# Revision 06: repository cleanup

Keep the site's appearance, content, URLs, and interactions unchanged while separating active files from development history.

- [x] Move all logo options, previews, original artwork, and archived identity packages into `development/brand/`.
- [x] Move downloadable assets into the root `media-pack/` directory; mount it at the existing `/media-pack/` URL in Hugo.
- [x] Update the brand exporter and preview scripts for the new paths; preserve current artwork and typography exactly.
- [x] Remove the unused Hugo theme and its configuration, empty submodule file, and unused Sass installation from CI.
- [x] Remove stale `public/`, `tmp_build/`, and tracked resource-cache output, plus obsolete theme data and favicon.
- [x] Keep original generated images and prompts under `development/imagery/`; remove unreferenced image exports and stock assets from the published site.
- [x] Verify production output, media downloads, and existing interaction checks.
- [x] Compare desktop/mobile screenshots with the pre-cleanup baseline.

The previous theme was removed only after a fresh production comparison found all 264 output files byte-identical. Brand relocation preserved all 158 active visual/font files and all 67 history/source files; only intended path references and archive instructions changed.

Original and reserved artwork remains available for future edits. Existing content routes, templates, CSS, interaction scripts, map data, and active illustration files are retained. No publication is part of this cleanup.

Image cleanup removed 48 unreferenced exports and stock files, and moved three original reference PNGs into `development/imagery/legacy-reference/`. All 44 generated collection files and the original image brief are preserved; the 28 original generation prompts are unchanged. Current paths in collection manifests resolve; removed export paths are labeled historical.

The fresh production build contains 209 files, down from 264. The 55 removed public assets total 11,618,687 bytes. All 25 HTML files, CSS, JavaScript, active images, fonts, map data, and landscape assets remain byte-identical. Only the media-pack README, source-path metadata, and packaged ZIP changed. The existing browser suite passed 21 routes, 50 local references, 29 anchors, map and accordion interactions, pinned card behavior, responsive layouts, reduced motion, and no-JavaScript fallbacks. The local preview is available at `http://localhost:1314/`.

Desktop/mobile comparison preserved all 24 screenshot dimensions and page layouts. Nineteen screenshots, including every mobile capture, are pixel-identical; five desktop images have minor browser raster differences with unchanged source files. All 68 dependency URLs and page links match, and all 89 media links load. No browser or HTTP errors occurred. Evidence and removal inventories are retained in `.qa/cleanup-*`.

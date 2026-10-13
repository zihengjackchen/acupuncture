# Revision 04: logo spacing, social wallpapers, and Dan illustrations

- [x] Keep logo G and increase separation between the wordmark's descenders and ACUPUNCTURE, in horizontal and stacked layouts; refresh all exports and the media pack.
- [x] Add landscape, portrait, story, and square branded wallpapers in the site palette. Include previews and direct downloads in the media guide and ZIP.
- [x] Remove the map's outer dashed line while preserving individual ZIP outlines, shaded coverage, boundary clipping, and lookup data.
- [x] Use Dan's actual portrait as the identity reference for the practitioners in the four ink-wash scenes with visible heads. Keep patients, composition, palette, and painting style. Preserve earlier artwork and save edit prompts.
- [x] Check the resulting assets in the site, media guide, and production build. Keep the preview available; do not publish.

The map change is visual only: the 206 ZIP intersections, 155 full / 51 partial classifications, and address-confirmation behavior remain unchanged.

The media pack includes fifteen wallpaper variants across three colors and five aspect ratios, with eighteen PNG exports including two landscape resolutions. Production SVGs have outlined lettering; editable masters and matching fonts are supplied. At a 250px horizontal-logo width, five fully empty raster rows separate the name and descriptor; at a 220px stacked width, twelve rows separate them. All 107 media ZIP entries match the current assets and pass CRC checks. Earlier G spacing and the old pack are archived.

The four image edits were made with the built-in image-generation tool. PNG originals, full prompts, and reference paths are in `development/imagery/editorial-inkwash-v4/`; responsive WebP files use `-dan` names. The existing portrait and previous paintings remain intact. Desktop/mobile review at 1440px and 390px found no broken assets, browser errors, horizontal overflow, or hidden faces in the new image crops. Map checks confirm retained ZIP outlines and shading with no dashed perimeter.

The production Hugo build and whitespace checks passed. Preview: `http://localhost:1314/`. No commit, push, or publication was performed.

## Final user selection

The user approved the increased logo G spacing, all fifteen wallpaper variants, and removal of the map's dashed perimeter. The Dan likeness illustrations were rejected. Restore the four V3 paintings and their alt descriptions on the homepage, questions page, pain service, and women's health service. V4 is archived, not in active use.

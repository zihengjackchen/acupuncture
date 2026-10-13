# Revision 03: warmer presentation and updated coverage

The user's latest feedback supersedes the earlier naming, landscape-control, logo, and copy choices. Keep Hugo, existing routes, source artwork, and the previous logo explorations. Do not publish during this revision.

- [x] Build mobile coverage from the outer boundaries of Naperville, Orland Park, Chicago (including Lincoln Park), Highland Park, and Schaumburg, with coverage between them. Document the geometry and ZIP selection; zoom the map in.
- [x] Make the media guide and ZIP easy to find, and refresh the pack after the logo update.
- [x] Preserve the original logo scene, refine contours, use the website palette, and use website typography in a clearer text layout. Archive this as another option.
- [x] Keep the rich Shan Shui landscape while reducing runtime work, slowing movement, buffering artwork, and adding a pause/resume control.
- [x] Restore the animated “Your next step can be a gentle one” banner once at the bottom of every page.
- [x] Retain Hugo. Do not remove framework files needed by the site or archived artwork requested by the user.
- [x] Slow and soften entrances, accordion transitions, and the card turn without delaying keyboard access or reduced-motion content.
- [x] Restore “Meet Dan. Feel heard.” and introduce the practitioner as “Dr Dan Wang” there; use “Dan” elsewhere.
- [x] Restore the Locations & hours destination and its three-step “Before you arrive” section. Retain useful fee and booking information.
- [x] Restore “A little clarity / Your questions” and the user's preferred introductory copy.
- [x] Restore navigation: Our care, Locations & hours, Meet Dan, Your questions.
- [x] Generate more relevant Chinese ink-wash illustrations than required, including acupuncture, consultation, pulse-taking, and gua sha; keep source images and prompts. Avoid repeating editorial images on the same rendered page.
- [x] Check the build, page content, map, animations, pause/resume, desktop/mobile layouts, and image assignments.

## Implementation and verification

- Coverage is a convex envelope of the official January 2026 Census municipal boundaries and ZCTA 60035. Lincoln Park is included through Chicago. The polygon intersects 206 ZCTAs: 155 full and 51 partial. Green fills are clipped to the envelope, and partial ZIPs require street-address confirmation. Geometry, sources, caveats, and reproducible snapshots are recorded in `mobile-coverage-provenance.json`.
- The active logo is G. The original scene is intact; contours, jade/sage colors, and Cormorant Garamond/DM Sans lettering are refined. All earlier versions remain in the options index and archives. The media guide, ZIP, favicon, card, footer, and header use G.
- Twelve illustrations were generated with the built-in image-generation tool. Nine are used and three are reserves. Full PNG sources, prompts, assignments, and responsive WebP exports are retained. No service overview repeats its hero image in its cards.
- The landscape retains the rich drawing primitives. Movement is now 3 CSS pixels per second, with prepainted strips, visible-only worker startup, pause/resume, bounded buffers, and reduced-motion/no-JavaScript fallback. A two-second browser sample recorded 6.06 pixels of movement and zero canvas repaint/draw calls during steady scrolling. A tile already computing can finish after pause; no subsequent tile is scheduled until resumed.
- Site checks passed: 21 routes, 50 local references, 29 anchors, restored copy/navigation, one invitation per page, map full/partial cases, accordion/crossfade behavior, pinned card, responsive layouts, reduced motion, and no-JavaScript fallbacks.
- Landscape checks passed generation over 120 panels, bounded caches, forward retirement, pause/resume, visibility handling, and cleanup. Brand checks passed all SVG/PNG exports, ZIP contents, dimensions, and responsive guide links/layout.
- Desktop and mobile pages were inspected. The mobile homepage hero now preserves the full treatment composition at 320px and 390px. Production Hugo build and whitespace checks pass. Physical low-end phones were not tested.
- Hugo remains the framework. No migration or framework cleanup was needed. Nothing was pushed or published; the preview runs at `http://localhost:1314/`.

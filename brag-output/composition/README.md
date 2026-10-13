# Wang’s Harmony launch composition

20 seconds · 1920 × 1080 · 30 fps · no narration.

The local HTML composition reproduces the website’s hero, weekly clinic schedule, and ZIP 60614 lookup, then closes with the original horizontal logo and invitation. All artwork, fonts, scripts, and audio are bundled locally. Open it with `npm.cmd run dev -- --background` from this directory.

`index.html` contains one paused GSAP timeline; `styles.css` controls the layout and typography. `index.motion.json` records the key reading and framing checks. Run `npm.cmd run check` after edits. The final delivery uses Hyperframes 0.8.151, `--quality delivery --fps 30`.

The transition recipe adapts the installed `fade-through` registry component, recorded in `hyperframes.json` and `hyperframes.lock.json`. The business logo is an unchanged copy of `static/images/brand/logo-horizontal.svg`; treatment art is the approved `static/images/editorial/acupuncture-session.webp`. The complete 206-ZIP map is unchanged, and `assets/images/zip-60614.svg` copies 60614’s actual path data for the highlight. Fonts and their OFL licenses live in `assets/fonts/`.

The closing scenery is a copy of the site’s shan-shui fallback, generated from Lingdong Huang’s MIT-licensed `shan-shui-inf`. Its license is included in `assets/images/LICENSE-Shan-Shui.txt`, with provenance in `shan-shui-ORIGIN.txt`. Audio provenance and gains are documented in `../audio-notes.md` and `assets/music/audio-plan.json`.

The music volume uses the native `data-automation` lane. The 0.65-second fade-in and final-second fade-out are authored in that lane, with the quiet bed at 0.22. Two UI sounds match the actual pointer gestures at 3.35 and 12.40 seconds. Precomputed energy changes only the closing landscape’s subtle opacity; text stays steady.

Generated preview thumbnails, browser proofs, raw render, and tool binaries are ignored. The delivery poster is the settled hero at 2 seconds, baked into only frame 0 of the final MP4 with audio copied through.

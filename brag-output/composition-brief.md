# Hyperframes composition brief: Wang’s Harmony Acupuncture

## Objective and output

Make a calm, polished 20-second launch video of the current website. Landscape 1920 × 1080 at 30 fps. Work in `brag-output/composition/`; deliver `brag-output/brag.mp4`, `brag.jpg`, and `share-copy.txt`.

The user explicitly invoked the full brag workflow. Keep rendering local and complete the deliverables; do not publish or submit anything to the business or social platforms.

## Source material and factual grounding

- `layouts/index.html`: actual hero, ink-wash painting, and CTA.
- `layouts/partials/schedule.html` and `data/clinics.json`: morning/afternoon weekly calendar and provisional Sunday hours.
- `layouts/partials/coverage-map.html`, `assets/js/coverage.js`, `data/coverage.json`, and `static/images/coverage/mobile-coverage.svg`: the real ZIP lookup copy and 60614 shape.
- `layouts/partials/booking-cta.html`: closing invitation.
- `assets/css/site.css`: brand colors and typography.
- `static/images/brand/logo-horizontal.svg`: accepted G lockup; no changes to its lettering or spacing.
- `static/images/editorial/acupuncture-session.webp`: approved painting, without rejected V4 edits.
- `static/images/landscape/` or the fallback named in `layouts/partials/landscape.html`: existing landscape artwork.
- `static/fonts/`: Cormorant Garamond and DM Sans, including the display italic.

Copy that must appear as written:

- “Acupuncture with Dan.”
- “Where to find Dan this week”
- “Usual weekly schedule · Chicago time”
- “Home visits, by request.”
- “Your next step can be a gentle one.”

Do not invent efficacy claims, appointment availability, reviews, or user records. This is a visual demonstration of the site’s existing scheduling and coverage tools. Do not display personal contact details. Public practice branding and the website domain are intentional.

## Direction and scene contract

Follow `brag-plan.md`: 0–4 seconds hero/booking gesture; 4–10 seconds regular weekly calendar; 10–16 seconds ZIP 60614 lookup and map result; 16–20 seconds logo and invitation.

Use the source UI as material, enlarged and composed for video rather than framed as a distant webpage. Type must remain readable. Preserve the two calendar rows and Sunday confirmation note. Display real whole ZIP polygons without the old outer cutoff or dashed line. The successful lookup is the main interaction payoff.

Palette: ivory `#f7f3eb`, jade `#28594b`, ink `#26352e`, sage `#dce5d8`. Cormorant Garamond display, DM Sans supporting text. Keep the warm ivory field throughout. Use restrained structural rules, the actual treatment artwork, and the existing landscape for depth. Do not add generic gradients, glass cards, glows, chart statistics, floating decorative icons, or unrelated stock imagery.

Motion should be continuous and soft. Entrance motion may take roughly 0.6–0.9 seconds where the reading hold remains sufficient. Prefer a few intentional transforms and opacity changes over shader transitions. The final frame remains composed and visible.

## Audio

The audio-preparation agent supplies only the selected local files, the vol-12 cue preset, and precomputed energy data under `composition/assets/`. Read its handoff before wiring audio. Music is a quiet instrumental bed; two sparse, soft sounds match the actual CTA and ZIP check gestures. No narration. No synthetic spoken track.

Use the bundled cue metadata as timing guidance, not as a reason to rush copy. Document any beat locks in source comments. One existing atmospheric/artwork layer may subtly respond to precomputed energy; text and layout must not pulse. Fade music cleanly at the ending using the current Hyperframes audio contract.

## Implementation and verification

Load the Hyperframes core, animation, creative, keyframes, and CLI skills; do not start the generic interview workflow. Search the local catalog before hand-authoring motion. Use a single paused timeline, finite root duration, locally bundled fonts/media/GSAP, and deterministic states. All assets needed to render must reside inside the composition project.

Pass the current `hyperframes check` with zero errors including layout and contrast. Inspect snapshots around 2, 7, 14, 18.5, and 19.97 seconds, plus a focused motion diagnostic. Provide an editable preview, then render locally and verify duration, dimensions, audio presence, a settled poster, and the first-frame poster bake. Preserve the website itself unchanged.

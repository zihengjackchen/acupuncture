# Revision 02: user feedback

Keep the warm jade/ivory design, useful information, existing routes, and GitHub Pages deployment. Do not publish during this revision.

## Required changes

- [x] Restore the original logo; show original plus two subtle refinements for the user's choice. Apply the chosen/original identity to the website, card, favicon, and media pack.
- [x] Explain the actual Shan Shui integration, restore its visual detail, keep infinite slow scrolling, and remove the visible pause control. Honor reduced-motion settings.
- [x] Install and apply Stop Slop for copy and Ponytail for code; retain Hugo and explain that no React migration occurred.
- [x] Remove vague slogans, decorative captions, the overlapping hero seal, and redundant hero service/location lines. Keep useful facts available in the relevant page.
- [x] Use “Dr Wang” consistently in visible text and accessible names.
- [x] Split the weekly schedule into morning and afternoon rows, preserving Mon/Wed noon–6 pm and provisional Sunday 9 am–6 pm, Chicago time.
- [x] Set homepage order after the hero: care, practitioner, first visit, personal connection, locations, mobile care. Put supplementary FAQs on their existing page.
- [x] Restrict colored map ZIPs and lookup coverage to the approximate Highland Park–Lincoln Park/Chicago–Tinley Park–Naperville polygon. Show surrounding ZIPs without green coverage color. Record exact selection rule and source.
- [x] Replace generated photoreal imagery with cohesive Chinese ink-wash illustrations related to each service. Keep the real practitioner portrait.
- [x] Improve card proportions and padding, use the restored brand logo, and pin the section while scrolling turns the card. No click required. Preserve readable reduced-motion/no-JS alternatives.
- [x] Animate service accordion expansion/collapse and crossfade its images, including rapid repeated input and reduced-motion handling.
- [x] Centralize appointment details on the appointments page. Practitioner pages link to the weekly schedule instead of repeating it. Give each navigation destination a clear purpose.
- [x] Confirm the media pack exists and refresh it for the restored identity. Use one consistent brand line: “Traditional medicine. Personal care.”
- [x] Inspect rendered desktop/mobile pages, compare old factual content, run interaction checks and a production build, and report any remaining choices.

## Sources and decisions

- User feedback in this conversation is the source of requirements.
- Writing: https://github.com/hardikpandya/stop-slop
- Code: https://github.com/DietrichGebert/ponytail/blob/main/skills/ponytail/SKILL.md
- Landscape: https://github.com/LingDong-/shan-shui-inf
- User selected the original logo after reviewing the refinements. Keep every alternative in the repository for future review.
- Retain the current telephone (847-786-0066), email, clinic addresses, and booking links.
- Keep existing page URLs so previously shared links remain valid.

## Review record

- All 21 routes, 41 local references, and 29 anchors passed browser checks.
- Morning/afternoon schedule, selected-area ZIP lookup, rapid accordion input, image crossfades, pinned front/back card states, mobile navigation, reduced motion, and no-JavaScript fallbacks passed.
- Checked layouts at 320, 390, 768, and 1440 pixels. Fixed mobile card type size and Today-badge contrast after visual review.
- Restored previously published biography details and the $20 virtual consultation / $29.99 base mobile commute fee. The latter is separate from treatment costs. Clinic fees remain subject to the booking location.
- The original practice name remains in structured data with the requested Dr honorific; displayed practitioner labels use Dr Wang.
- Original artwork and prior media exports are archived. Current generated art prompts: assets/generated/editorial-inkwash-v2/prompts.json.

## Logo feedback

- A: exact original, B: stronger contours, C: jade palette were presented. User requested improved small-size readability.
- D: a minimal treatment-table icon was presented and rejected as too different.
- E: a subtle simplification of the original was presented; the user requested simpler bench and patient shapes.
- F: the original practitioner, curved frame, colors, and lettering with a simpler reclining patient and bench was presented.
- Final decision: retain the original logo across the website and media pack. Preserve all generated alternatives and previews in assets/brand/options/, with the previous redesign in assets/brand/archive-v1/.

# Brag plan: Wang’s Harmony Acupuncture

## The nine-question planning rubric

1. **What is it?** A Hugo website for acupuncture and Chinese medicine in Chicago and Highland Park, with clinic booking links and a map for mobile visits by request.
2. **Strongest claim?** “Your next step can be a gentle one.” The useful proof is how easily a visitor can find clinic hours or check a ZIP area.
3. **Visual hook?** The original treatment-scene logo, large jade serif type, and the site’s acupuncture ink-wash painting on warm ivory.
4. **Actual UI to show?** The morning/afternoon weekly schedule and the working ZIP lookup, using the real 60614 region from the site map.
5. **Shortest satisfying video?** Twenty seconds: a four-second introduction, two six-second demonstrations, and a four-second closing.
6. **Tone?** Polished; a quiet editorial film with the warmth of the website. Clear gestures and long enough holds to read.
7. **Audio?** A restrained instrumental bed and two soft interaction accents. No narration. No dramatic hits, notification pings, or typing noise.
8. **Share caption?** “A new home for Wang’s Harmony Acupuncture: Chinese ink-wash artwork, clinic schedules, and a ZIP map for home visits. Built with Hugo and a little motion.”
9. **User flow?** Arrive at the site → find the weekly clinic schedule; for a home visit, enter 60614 → see the matching ZIP region and confirmation guidance. The film demonstrates the interface; it does not submit a booking or contact anyone.

## The angle and hook

Show the site doing something useful in the same calm visual language that makes it welcoming. Begin with the real treatment illustration and “Acupuncture with Dan.” already readable, then reveal the practical next steps. Use the project’s actual copy rather than new treatment claims.

## Format and identity

- Landscape, 1920 × 1080, 30 fps, 20 seconds.
- Ivory `#f7f3eb`; jade `#28594b`; ink `#26352e`; sage `#dce5d8`.
- Cormorant Garamond display type and DM Sans labels, supplied locally.
- Use the accepted G logo with its existing letterforms, spacing, and proportions.
- Public business branding is intentional. Do not show personal contact details, patient records, form submissions, browser chrome, or internal paths.
- Rhythm: introduce → observe → interact → settle. Slow, continuous moves; no bouncing or rapid cuts.

## Storyboard

### 1. Acupuncture with Dan — 0–4 seconds

The acupuncture ink-wash painting fills the right side while the site’s hero headline anchors the left. A compact G logo and “Chicago & Highland Park” establish the business. The “Book an appointment” button is a faithful recreation of the site CTA. The illustration drifts very slightly as the words settle.

Sequential/interaction: a subtle cursor gesture selects the booking CTA near the scene’s end, handing off to the schedule. The headline remains readable for at least two seconds.

Audio intent: quiet welcome; one soft click matches the gesture. Transition: the schedule rises into the same ivory field.

### 2. Where to find Dan this week — 4–10 seconds

An enlarged version of the site’s weekly schedule occupies most of the frame. Morning and afternoon remain separate rows. Monday and Wednesday show Chicago, noon–6 pm. Sunday shows Highland Park, 9 am–noon and noon–6 pm, with “Call to confirm.” “Usual weekly schedule · Chicago time” and the site’s booking-ahead note make clear these are regular hours, not live appointment inventory.

Sequential/interaction: the two Chicago afternoon cells are emphasized, then the Sunday cells. The complete schedule holds for at least three seconds; no fast line-by-line reading requirement.

Audio intent: the music carries the motion without extra sound effects. Transition: a gentle lateral move reveals the home-visit tool.

### 3. Home visits, by request — 10–16 seconds

Recreate the site’s ZIP form beside the full green coverage map. Use the real SVG and its actual whole ZIP shapes. Enter “60614,” select “Check area,” then highlight its real map region. Display “60614 · Chicago” and the grounded result “Dan accepts mobile requests throughout this ZIP area.” Keep “Call to confirm your address, appointment, and travel fee” visible as supporting copy.

Sequential/interaction: five digits appear in the field, the cursor clicks, and the result/highlight arrives. Hold the completed state for at least 2.5 seconds. Never display an invented appointment or completed booking.

Audio intent: one low, soft selection sound at the click. Transition: the UI eases away into the closing invitation.

### 4. A gentle next step — 16–20 seconds

The G horizontal logo, unchanged, sits above the site’s exact invitation: “Your next step can be a gentle one.” The public site URL, `wangsharmonyacu.com`, is the only destination. A cropped portion of the site’s ink landscape supplies a slow finishing motion at the bottom. The final composed state holds through the last frame; no fade to black.

Sequential/interaction: logo and invitation settle in a short sequence, then hold. Audio intent: fade the music gently over the last second.

## Audio direction and cue guidance

- Music: bundled `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`, a steady instrumental bed, at restrained volume.
- Use the first 20 seconds, with a short entrance and a one-second end fade.
- Read its bundled cue preset; use nearby strong cues only when they fit the planned holds. Readability and natural timing override beat alignment.
- Keep text reveals slower than the beat grid. Calendar highlights may align to nearby beats while the full table stays visible.
- Audio-reactive treatment: at most a slight opacity change in the existing landscape/artwork atmosphere, sampled from precomputed audio data. Never scale text or add visualizer graphics.
- SFX: two low high-frequency-risk files selected after the real gesture timings are authored.

## Delivery

Create a local Hyperframes composition, pass `hyperframes check`, inspect representative frames, render `brag.mp4`, and extract a settled hero poster to `brag.jpg`. Bake that poster into frame zero without changing the remaining frames or duration. Keep the editable composition, brief, plan, and one ready-to-post caption. Regenerate the project’s root `README.md` separately. No publication or social posting is part of this task.

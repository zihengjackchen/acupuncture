
This file maps the current image slots in the site to better-fitting visuals and gives detailed prompts for generating them.

## Keep As-Is

- `static/images/dan-wang.webp`
- `static/images/team/dan-wang.jpg`

Use Dr. Dan Wang's real photo for:

- homepage hero tertiary image
- homepage gallery practitioner portrait
- About page hero
- practitioner profile page

## Shared Style Anchor

Use these three existing images as style references when prompting any image model:

- `development/imagery/legacy-reference/room.png`
- `development/imagery/legacy-reference/converse.png`
- `development/imagery/legacy-reference/acupuncture.png`

Shared visual direction for all new illustrations:

- High-definition editorial medical illustration, not photorealistic
- Soft cream background with warm ambient glow
- Clean dark navy line work
- Muted teal accents and warm orange highlights
- Gentle shading, slightly luminous edges, subtle vignette
- Calm, welcoming, reassuring tone
- Minimal clutter, readable shapes, polished but human
- Landscape composition, suitable for hero and card crops
- No text, no logos, no watermark, no exaggerated cartoon faces
- Avoid purple, neon colors, harsh black shadows, stock-photo realism, and generic hospital imagery

Recommended size for all new website illustrations:

- `1792x1024` or `2048x1152`
- 16:9 landscape

## Slot Map

### Homepage

- `content/_index.md` hero image 1: replace `images/converse.png` with `images/home-mobile-consultation.png`
- `content/_index.md` hero image 2: replace `images/room.png` with `images/home-calm-home-visit-room.png`
- `content/_index.md` hero image 3: keep `images/dan-wang.webp`
- `content/_index.md` gallery image 1: replace `images/room.png` with `images/gallery-treatment-room-detail.png`
- `content/_index.md` gallery image 2: replace `images/acupuncture.png` with `images/gallery-acupuncture-treatment-detail.png`
- `content/_index.md` gallery image 3: replace `images/converse.png` with `images/gallery-follow-up-planning.png`
- `content/_index.md` gallery image 4: keep `images/dan-wang.webp`

### Main Section Pages

- `content/services/_index.md` hero: replace `images/room.png` with `images/services-overview-home-visit.png`
- `content/contact.md` hero: replace `images/converse.png` with `images/contact-service-area-planning.png`
- `content/blog/_index.md` hero: replace `images/converse.png` with `images/faq-questions-intro.png`

### Service Pages

- `content/services/accounting.md` hero and card: replace `images/converse.png` with `images/service-consultation-intake.png`
- `content/services/pain-and-injury-management.md` hero and card: replace `images/acupuncture.png` with `images/service-pain-recovery.png`
- `content/services/womens-health-and-fertility.md` hero and card: replace stock photo with `images/service-womens-health-fertility.png`
- `content/services/digestive-and-metabolic-health.md` hero and card: replace `images/room.png` with `images/service-digestive-support.png`
- `content/services/respiratory-immune-and-skin.md` hero and card: replace stock photo with `images/service-respiratory-immune-skin.png`
- `content/services/stress-sleep-and-wellness.md` hero and card: replace stock photo with `images/service-stress-sleep-wellness.png`

### Question Pages

- `content/blog/what-is-traditional-chinese-medicine.md`: `images/faq-tcm-overview.png`
- `content/blog/what-is-acupuncture.md`: `images/faq-what-is-acupuncture.png`
- `content/blog/fertility-acupuncture-faq.md`: `images/faq-does-acupuncture-hurt.png`
- `content/blog/fertility-focused-supplement-guidance.md`: `images/faq-mobile-acupuncture-cost.png`
- `content/blog/your-first-visit.md`: `images/faq-how-many-sessions.png`
- `content/blog/acupuncture-for-pain-recovery.md`: `images/faq-what-can-acupuncture-treat.png`
- `content/blog/what-are-the-risks-of-acupuncture.md`: `images/faq-acupuncture-safety.png`

## Prompt Library

### 1. `home-mobile-consultation.png`

Use case: illustration-story  
Asset type: homepage hero image  
Primary request: a warm mobile acupuncture consultation scene at home, showing a calm practitioner seated with a patient in a bright living-room setting, reviewing symptoms and goals before treatment  
Scene/backdrop: softly styled home interior with one plant, a side table, subtle treatment supplies, and a calm uncluttered environment  
Subject: practitioner and patient having a thoughtful one-on-one conversation, with a clipboard or tablet and gentle body language  
Style/medium: high-definition editorial medical illustration matching `room.png`, `converse.png`, and `acupuncture.png`  
Composition/framing: 16:9 landscape, centered conversational scene, enough clean negative space to crop for a hero card  
Lighting/mood: warm morning light, calm, reassuring, polished  
Color palette: cream, muted teal, soft orange, dark navy linework  
Constraints: no text, no speech bubbles, no stethoscope, no hospital feel, no dramatic expressions  
Avoid: photorealism, corporate stock scene, neon accents, purple, watermark

### 2. `home-calm-home-visit-room.png`

Use case: illustration-story  
Asset type: homepage hero secondary image  
Primary request: a serene in-home treatment setup prepared for a mobile acupuncture visit  
Scene/backdrop: elegant home bedroom or spare room adapted for treatment, treatment table with folded blanket, soft curtains, plant, tea cup, small tray of supplies  
Subject: no people, just a beautifully prepared calming environment that signals convenience and professionalism  
Style/medium: high-definition editorial medical illustration matching existing site artwork  
Composition/framing: 16:9 landscape, slightly angled view, layered depth with foreground and background details  
Lighting/mood: soft afternoon glow, peaceful, restorative  
Color palette: cream walls, warm orange fabric accents, muted teal details, navy outlines  
Constraints: home setting rather than clinical office, tidy and minimal  
Avoid: hospital bed, fluorescent lighting, clutter, realistic photo texture, text

### 3. `gallery-treatment-room-detail.png`

Use case: illustration-story  
Asset type: homepage gallery image  
Primary request: a close, refined detail view of a calm acupuncture treatment room with towels, bottles, plant life, and warm ambient light  
Scene/backdrop: cropped interior composition focused on treatment table corner, small tray, curtains, and shelving  
Subject: environment only, no people  
Style/medium: same luminous illustration style as existing assets  
Composition/framing: 16:9 landscape, tighter crop than the hero room image, visually distinct from the wider room scene  
Lighting/mood: warm, soothing, intimate  
Constraints: should feel like a complementary gallery detail, not a duplicate of `room.png`  
Avoid: sterile clinic vibe, over-detailing, text, watermark

### 4. `gallery-acupuncture-treatment-detail.png`

Use case: illustration-story  
Asset type: homepage gallery image  
Primary request: a calm close-up scene of acupuncture treatment in progress, focusing on relaxation rather than pain  
Scene/backdrop: patient resting comfortably on a treatment table with a blanket, a practitioner hand gently placing a needle, subtle abstract symbols of calm airflow or balance in the background  
Subject: one relaxed patient receiving treatment, no facial distress  
Style/medium: high-definition editorial illustration matching the existing acupuncture image style  
Composition/framing: 16:9 landscape, slightly closer crop than `acupuncture.png`, more polished and spacious  
Lighting/mood: quiet, comforting, restorative  
Constraints: emphasize comfort, trust, and gentleness  
Avoid: scary needles, blood, grimacing, medical drama, text

### 5. `gallery-follow-up-planning.png`

Use case: illustration-story  
Asset type: homepage gallery image  
Primary request: a follow-up planning moment after treatment, showing a practitioner and patient reviewing next steps together  
Scene/backdrop: soft home or office corner with a small table, tea, notepad, and simple anatomical chart in the background  
Subject: practitioner pointing to a treatment rhythm plan while patient listens with relief and clarity  
Style/medium: same clean glowing medical illustration style as site references  
Composition/framing: 16:9 landscape, clear two-person interaction, visually different from the initial consultation image  
Lighting/mood: warm, organized, reassuring  
Constraints: should communicate clarity, continuity, and practical guidance  
Avoid: corporate boardroom look, hospital equipment, text blocks, watermark

### 6. `services-overview-home-visit.png`

Use case: illustration-story  
Asset type: services index hero  
Primary request: a polished overview image showing the full mobile acupuncture experience, from arrival to treatment setup to calm care at home  
Scene/backdrop: welcoming home interior with treatment table, supply tray, and one practitioner arriving or preparing the space  
Subject: mobile care made simple and professional, with home comfort and practical convenience  
Style/medium: high-definition editorial medical illustration in the same palette and line style as the current image set  
Composition/framing: 16:9 landscape, broader scene with visual depth, suitable for the top of the Services page  
Lighting/mood: balanced, warm, confident, easy to understand  
Constraints: should feel more comprehensive than the room image, but still calm and uncluttered  
Avoid: busy multi-person hospital scene, text, brand logos

### 7. `contact-service-area-planning.png`

Use case: illustration-story  
Asset type: contact page hero  
Primary request: a warm planning scene that communicates reaching out, scheduling, and confirming mobile service area fit  
Scene/backdrop: simple desk or home setting with phone, map pins, calendar, and notes, rendered as tasteful illustrated objects rather than literal UI screenshots  
Subject: one person making contact or reviewing appointment details, with subtle visual cues for home visits across a local area  
Style/medium: high-definition editorial illustration matching the site's existing artwork  
Composition/framing: 16:9 landscape, uncluttered composition that reads clearly even when cropped  
Lighting/mood: approachable, helpful, organized  
Constraints: no actual map text, no visible phone numbers, no confusing interface elements  
Avoid: generic call center scene, corporate headset imagery, text labels, watermark

### 8. `faq-questions-intro.png`

Use case: illustration-story  
Asset type: blog/questions index hero  
Primary request: an inviting question-and-answer illustration about acupuncture, showing curiosity, clarity, and trust  
Scene/backdrop: calm treatment-space corner with a practitioner explaining something to a patient, with subtle icons for questions, comfort, and planning  
Subject: helpful conversation, clear guidance, patient feeling heard  
Style/medium: same glowing navy-line illustration style as the current site art  
Composition/framing: 16:9 landscape, slightly simplified for a category page  
Lighting/mood: friendly, informative, reassuring  
Constraints: no comic speech bubbles with text, no cartoon exaggeration  
Avoid: overly childish style, stock-photo realism, clutter, watermark

### 9. `service-consultation-intake.png`

Use case: illustration-story  
Asset type: consultation service hero and card  
Primary request: a clear intake and planning illustration for a brief pre-booking consultation  
Scene/backdrop: calm seated conversation with clipboard, intake notes, tea, and simple treatment-room context  
Subject: practitioner gathering health history and goals, patient relaxed and engaged  
Style/medium: high-definition editorial medical illustration matching the site references  
Composition/framing: 16:9 landscape, clear focus on planning and clarity rather than treatment itself  
Lighting/mood: warm, informative, low-pressure  
Constraints: should communicate confidence, transparency, and next steps  
Avoid: hospital exam feel, speech bubble text, stethoscope, watermark

### 10. `service-pain-recovery.png`

Use case: illustration-story  
Asset type: pain service hero and card  
Primary request: a calm acupuncture treatment scene focused on pain relief and physical recovery, with the patient receiving support for neck, back, or shoulder tension  
Scene/backdrop: treatment table in a soft home setting, subtle posture or body-area emphasis without looking clinical  
Subject: one patient resting comfortably while acupuncture points support pain relief and mobility  
Style/medium: high-definition editorial illustration in the same palette and line quality as existing assets  
Composition/framing: 16:9 landscape, strong central figure, readable as both card and hero image  
Lighting/mood: steady, restorative, hopeful  
Constraints: emphasize comfort and mobility support, not injury drama  
Avoid: sports clichés, visible bruises, blood, aggressive medical imagery, watermark

### 11. `service-womens-health-fertility.png`

Use case: illustration-story  
Asset type: women's health and fertility service hero and card  
Primary request: a gentle, sophisticated illustration representing women's health, fertility support, hormone balance, and cycle-aware care without using baby clichés  
Scene/backdrop: peaceful home treatment scene with soft botanical elements, a tea cup, subtle moon-cycle or calendar-inspired motifs, and a treatment table or consultation setup  
Subject: one adult woman in a calm, supported moment of care, with a practitioner nearby or just off-scene  
Style/medium: high-definition editorial illustration matching the site's current warm line-art style  
Composition/framing: 16:9 landscape, elegant, emotionally calm, suitable for both hero and card use  
Lighting/mood: gentle, hopeful, private, supportive  
Constraints: no pregnancy belly trope, no baby items, no infertility sadness cues, no over-sexualized imagery  
Avoid: stock maternity look, pink overload, text, watermark

### 12. `service-digestive-support.png`

Use case: illustration-story  
Asset type: digestive and metabolic service hero and card  
Primary request: a refined illustration representing digestive support, gut comfort, and steadier daily energy  
Scene/backdrop: calm home setting with warm tea, soft blanket, simple kitchen or living-room context, subtle abstract belly-comfort motifs rather than literal organs  
Subject: one person seated comfortably or resting with a sense of relief and steadier balance  
Style/medium: high-definition editorial medical illustration matching existing images  
Composition/framing: 16:9 landscape, clear focal point, soft surrounding details  
Lighting/mood: grounded, soothing, restorative  
Constraints: no stomach cutaways, no gross symptom visuals, no food chaos  
Avoid: medical infographic look, photoreal food shot, text, watermark

### 13. `service-respiratory-immune-skin.png`

Use case: illustration-story  
Asset type: respiratory, immune, and skin service hero and card  
Primary request: a calm illustration for allergy, sinus, cough, and immune resilience support, with subtle skin-health cues  
Scene/backdrop: bright home interior near an open window with clean air, plant life, tissues set aside, soft abstract airflow shapes, and a sense of easier breathing  
Subject: one person breathing comfortably and recovering, with a gentle practitioner-care context if helpful  
Style/medium: high-definition editorial illustration matching the site's navy, cream, teal, and orange visual language  
Composition/framing: 16:9 landscape, airy and spacious, suitable for hero and card crops  
Lighting/mood: fresh, light, relieved, grounded  
Constraints: no sneezing mid-action, no dramatic illness, no gross skin closeups  
Avoid: seasonal allergy advertising clichés, pollen overload, text, watermark

### 14. `service-stress-sleep-wellness.png`

Use case: illustration-story  
Asset type: stress, sleep, and wellness service hero and card  
Primary request: a tranquil illustration of a patient moving from stress into calm, restful regulation  
Scene/backdrop: soft bedroom or home retreat setting with pillow, blanket, plant, tea, and evening or early-morning light  
Subject: one person resting peacefully after treatment or preparing for restful sleep, with subtle cues of nervous-system settling  
Style/medium: high-definition editorial illustration matching the current site style  
Composition/framing: 16:9 landscape, quiet and uncluttered with strong emotional calm  
Lighting/mood: serene, restorative, emotionally safe  
Constraints: no insomnia distress face, no melodrama, no dark-night horror tone  
Avoid: sleep-product ad look, photoreal bedroom, text, watermark

### 15. `faq-tcm-overview.png`

Use case: illustration-story  
Asset type: FAQ page hero  
Primary request: an elegant overview illustration of Traditional Chinese Medicine as whole-person care, combining meridian imagery, balance, and calm treatment planning  
Scene/backdrop: softly lit treatment setting with a simple anatomical meridian chart, botanical details, and abstract symbols of balance  
Subject: practitioner thoughtfully explaining a whole-person care model to a patient, or a symbolic composition centered on balance and body systems  
Style/medium: high-definition editorial illustration matching existing site artwork  
Composition/framing: 16:9 landscape, concept-driven but still warm and human  
Lighting/mood: thoughtful, calm, clear  
Constraints: no dense textbook chart, no text labels, no mystical cliché overload  
Avoid: overly spiritual fantasy imagery, neon chakra art, watermark

### 16. `faq-what-is-acupuncture.png`

Use case: illustration-story  
Asset type: FAQ page hero  
Primary request: a clear explanatory illustration of acupuncture itself, showing a practitioner gently placing very fine needles while the patient rests comfortably  
Scene/backdrop: clean home-visit treatment environment with minimal equipment  
Subject: one practitioner hand and one relaxed patient, emphasizing gentleness and precision  
Style/medium: high-definition editorial medical illustration matching the current site palette and line work  
Composition/framing: 16:9 landscape, easy to understand at a glance  
Lighting/mood: clear, calm, informative  
Constraints: needles should look tiny and non-threatening  
Avoid: pain reaction, scary close-up needles, blood, watermark

### 17. `faq-does-acupuncture-hurt.png`

Use case: illustration-story  
Asset type: FAQ page hero  
Primary request: an illustration about treatment comfort, showing the contrast between a tiny acupuncture needle and a calm relaxed patient response  
Scene/backdrop: simplified treatment setting with subtle visual cues for comfort, warmth, heaviness, and relaxation  
Subject: patient at ease during a gentle needle placement, with emphasis on comfort rather than fear  
Style/medium: high-definition editorial illustration matching site references  
Composition/framing: 16:9 landscape, one clear focal scene, simple and reassuring  
Lighting/mood: gentle, comforting, educational  
Constraints: no giant needle close-up, no medical fear cues, no comic exaggeration  
Avoid: painful expression, dark background, text, watermark

### 18. `faq-mobile-acupuncture-cost.png`

Use case: illustration-story  
Asset type: FAQ page hero  
Primary request: an illustration about transparent pricing and planning for mobile acupuncture, showing clear organized decision-making rather than money stress  
Scene/backdrop: small table with calendar, phone, notebook, tea, and simple planning materials in a calm home setting  
Subject: patient reviewing options with a sense of clarity and practicality  
Style/medium: high-definition editorial illustration matching the site's current visual language  
Composition/framing: 16:9 landscape, tidy composition with clear planning cues  
Lighting/mood: practical, calm, reassuring  
Constraints: no visible dollar text, no bills flying around, no shopping-cart look  
Avoid: finance infographic style, corporate budgeting scene, watermark

### 19. `faq-how-many-sessions.png`

Use case: illustration-story  
Asset type: FAQ page hero  
Primary request: an illustration about treatment rhythm and progress over time, showing a calm plan for weekly or twice-weekly sessions without using text  
Scene/backdrop: home-treatment or planning scene with a simple visual progression motif like stepping stones, calendar blocks, or repeated appointment markers  
Subject: patient and practitioner reviewing progress and pacing together  
Style/medium: high-definition editorial illustration matching the rest of the site  
Composition/framing: 16:9 landscape, visually communicates continuity and structured follow-up  
Lighting/mood: clear, steady, encouraging  
Constraints: no visible written schedule text, no stopwatch or urgency cues  
Avoid: corporate productivity vibe, clutter, watermark

### 20. `faq-what-can-acupuncture-treat.png`

Use case: illustration-story  
Asset type: FAQ page hero  
Primary request: a broad but elegant illustration showing the range of concerns acupuncture can support, including pain, stress, digestion, sleep, fertility, and sinus relief  
Scene/backdrop: central patient figure or symbolic composition with subtle surrounding icons or vignettes for different support areas  
Subject: whole-person care across multiple symptom categories, without feeling crowded  
Style/medium: high-definition editorial illustration matching existing site images  
Composition/framing: 16:9 landscape, concept-driven but clear, balanced, and visually calm  
Lighting/mood: informative, hopeful, welcoming  
Constraints: no cluttered medical infographic, no text labels, no icon soup  
Avoid: overwhelming collage, harsh clinical tone, watermark

### 21. `faq-acupuncture-safety.png`

Use case: illustration-story  
Asset type: FAQ page hero  
Primary request: a reassuring acupuncture safety illustration focused on careful screening, professionalism, and gentle treatment  
Scene/backdrop: calm consultation or treatment-prep setting with clipboard, simple checklist cues, and a carefully arranged tray  
Subject: practitioner reviewing health details before treatment, patient feeling informed and at ease  
Style/medium: high-definition editorial medical illustration matching the rest of the site  
Composition/framing: 16:9 landscape, clear professional interaction, not scary  
Lighting/mood: trustworthy, calm, precise  
Constraints: no red warning symbols, no dramatic hazard cues, no text  
Avoid: legal-medical warning poster vibe, fear-based imagery, watermark

## Best First Batch

If you want to generate in phases, start with these first:

1. `service-womens-health-fertility.png`
2. `service-stress-sleep-wellness.png`
3. `service-respiratory-immune-skin.png`
4. `service-digestive-support.png`
5. `service-consultation-intake.png`
6. `contact-service-area-planning.png`
7. `faq-what-is-acupuncture.png`
8. `faq-does-acupuncture-hurt.png`

That first batch will remove the most mismatched stock photography and reduce repeated reuse of the same three illustrations.

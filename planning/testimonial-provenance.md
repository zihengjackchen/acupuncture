# Published patient testimonials

The site owner supplied the two current quotes directly in the site-editing
conversation and explicitly confirmed that they are real reviews. They replace
the two testimonials previously restored from commit `28032c4`.

`data/testimonials.json` preserves the supplied wording, including “Dr. Wong”
and “aliments.” No name accompanied the first review, so it uses the anonymous
attribution “Patient testimonial.” The second review is credited to Alex, as
supplied. No rating or review date is implied.

The three entries labeled `FAKE #1`, `FAKE #2`, and `FAKE #3` in the historical
file are excluded. Do not restore them as patient feedback. The testimonial
section does not emit Review or AggregateRating structured data.

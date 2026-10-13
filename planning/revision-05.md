# Revision 05: matching wallpapers and whole ZIP regions

- [x] Label the homepage practitioner portrait **Dr Dan Wang**, aligned left directly below the photo; keep the credentials alongside it.
- [x] Match every wallpaper to `assets/brand/options/g-wallpaper-ivory.svg`: the same horizontal logo arrangement, fonts, internal spacing, and proportional scale. Keep the approved ivory, jade, and sage backgrounds and all five canvas formats.
- [x] Highlight the complete shapes of the existing 206 selected ZIP areas. Use the city envelope only to select ZIPs; do not trim their green fills at that envelope. Keep the outer dashed boundary removed.
- [x] Update map lookup results, coverage notes, data, and export documentation to describe the revised behavior.
- [x] Check the generated media, map interactions, desktop/mobile presentation, and Hugo production build.

The approved logo G spacing remains in use. The rejected V4 practitioner illustrations remain archived; the V3 paintings stay active. These updates are local and do not publish the site.

All fifteen wallpaper SVGs preserve the reference logo geometry and spacing, with the logo centered at the reference width proportion of 2200/3840. The reference file remains byte-identical. Eighteen PNG exports have the expected dimensions and centered artwork; all 107 media-pack ZIP entries match their current files. Previous wallpaper layouts remain archived.

Every highlighted map path retains its original Census ZIP geometry and fits within the initial view. The 51 regions crossing the internal selection envelope are now shown in full, including the small border intersections documented in the coverage provenance. Lookup results and the directory describe whole-region coverage.

The Hugo production build and existing browser suite passed: 21 routes, 50 local references, 29 anchors, map interactions, responsive layouts, reduced motion, and no-JavaScript fallbacks. Targeted desktop/mobile review at 1440px and 390px confirmed the portrait caption, V3 artwork, complete map shapes, and all fifteen wallpaper previews; 48 media URLs loaded successfully. Screenshots and evidence are in `.qa/revision-05/`. No commit, push, or publication was performed.

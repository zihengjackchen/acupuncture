# Audio handoff

The 20-second composition uses a quiet instrumental bed and two short, warm interaction sounds. No narration.

| Asset, relative to `composition/` | Timing | Gain |
| --- | --- | --- |
| `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` | First 20 seconds; 0.65-second entrance fade and 1-second ending fade | 0.22 |
| `assets/sfx/interface/bong_001.ogg` | 3.35 seconds, hero appointment-button gesture; duration 0.123 seconds | 0.35 |
| `assets/sfx/impact/impactSoft_medium_001.ogg` | 12.40 seconds, ZIP-check gesture; duration 0.184 seconds | 0.40 |

The music uses a Hyperframes `data-automation` volume lane: 0 at the start, 0.22 at 0.65 seconds, held until 19 seconds, then 0 at 20 seconds. The sound effects use `data-volume`. The copied sources have no baked gain or fades. Tracks 10, 11, and 12 hold music and the two effects respectively.

The source music duration is 117.384 seconds. The bundled cue preset suggests nearby beats at 3.8197, 9.8337, and 15.836 seconds. Keep the readable scene boundaries at 4, 10, and 16 seconds; these are optional timing hints, not a promise of exact synchronization.

`assets/music/audio-plan.json` records timing, source hashes, and tool versions. `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json` preserves the bundled cue analysis.

## Optional artwork response

`assets/music/audio-data.json` contains 600 frames at 30 fps, with RMS and 16 frequency bands. `audio-data.js` exposes the same data as `window.AUDIO_DATA` without a runtime fetch. It was extracted with the Hyperframes creative helper from the first 20 seconds, including the planned entrance and ending fades. Use only a slight opacity change in the existing artwork atmosphere, sampled deterministically on the composition timeline.

## Local tools

FFmpeg 6.1.1 and FFprobe 4.0.2 are available in `composition/.hyperframes/bin/`; that directory is ignored by Git. Hyperframes discovers them when run from `composition/`. From another directory, set `HYPERFRAMES_FFMPEG_PATH` and `HYPERFRAMES_FFPROBE_PATH` to those absolute executable paths. Node v24.13.0 and Hyperframes 0.8.151 are installed; use `npm.cmd` / `npx.cmd` in PowerShell.

Hyperframes doctor passed FFmpeg, FFprobe, and Chrome. Docker and optional speech/music generators are absent and are not needed for this local render.

## Sources

Music credit: “Happy Beats & Business Moves Vol. 12” by Sascha Ende, ende.app, CC BY 4.0. This video uses a 20-second excerpt with reduced gain and entrance/ending fades. The two sound effects are bundled Kenney assets, identified as CC0 by the brag skill. All four copied source/preset files were verified byte-for-byte against the bundled originals. Only the selected music and sound files were copied.

The music license was verified against the [exact track page](https://ende.app/en/song/12881-happy-beats-business-moves-vol-12) and the [artist's official terms](https://ende.app/en/standard-license) on 2026-10-12: CC BY 4.0, commercial video use and editing allowed, with attribution optional. `composition/assets/music/LICENSE-MUSIC.md` records the sources and excerpt modifications. The older bundled source notice remains verbatim in `BUNDLED-SOURCE-NOTICE.md` for provenance.

The font OFL notices remain beside the copied fonts. `composition/assets/images/LICENSE-Shan-Shui.txt` preserves the landscape generator's MIT copyright and permission notice. The copied GSAP file retains its original copyright/license banner.

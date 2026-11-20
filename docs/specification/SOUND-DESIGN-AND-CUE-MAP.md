---
answers: >-
  Which sound effects are ready, exactly where they play, how the game mixes them, and which open audio sources were checked.
excludes: >-
  Music, recorded narrator speech, native operating-system notification sounds and certification of subjective speaker/headphone balance.
status: current
updated: 2026-11-17
---

# Sound design and cue map

**Ready:** 35 original procedural WAV effects, 398,660 bytes total. These are actual audio files, not generation prompts. They use no third-party samples and require no external download or API. `design/audio/sfx/sfx-manifest.json` lists duration, bytes, peak, RMS, SHA256 and provenance. `design/audio/sfx/sound-catalogue.csv` is the exact flat catalogue. `design/contracts/sound-cue-map.json` is the runtime source of truth.

## Delivered sounds

| File id | Duration | Scenes | Trigger / exact use |
| --- | ---: | --- | --- |
| click | 70 ms | G05–G09, G24, G36 | Accepted control activation, only when no semantic cue follows. |
| panel-open | 150 ms | G12–G16, G20, G24, G33–G34, G36 | Panel entrance. |
| panel-close | 130 ms | same panels | Accepted close. |
| ui-back | 90 ms | G07–G09, G21, G23 | Back navigation. |
| toggle-on / toggle-off | 100 ms each | G24, G36 | Preference switch. Turning audio off itself is silent. |
| action-unavailable | 150 ms | G09, G13 | Explicit unavailable-action explanation; never on hover/focus. |
| card-select | 120 ms | G13, G29, G31 | Paper-card preview. |
| card-play | 160 ms | G13, G32 | Engine has accepted the card. |
| whoosh | 280 ms | G26 | Generic transition, if no flight cue applies. |
| plane-launch | 360 ms | G09 | Confirmed level start. |
| plane-flyby | 520 ms | G26 | Paper plane passes after resolved week. |
| plane-land | 260 ms | G10 | Arrival at the next route node; no engine mutation. |
| lock-open | 480 ms | G09, G18 | Metal catch, spring and opening shackle; start of unlock motion. |
| unlock | 500 ms | G09, G18 | Reward accent 240 ms after mechanical opening. |
| rewind-tick | 75 ms | G20 | Mechanical dial detent per changed valid selection, throttled. |
| rewind-confirm | 280 ms | G20 | Snapshot restore succeeded; reverse gear sound. |
| message-send | 260 ms | G14, G16 | Message accepted locally, not a delivery/read claim. |
| message-received | 200 ms | G14, G16 | Actual reply displayed. |
| negotiation-accepted | 300 ms | G14 | Accepted engine outcome; replaces generic received cue. |
| counteroffer | 180 ms | G14 | Counteroffer displayed; no card applied. |
| save-confirmed | 240 ms | G22, G28 | Storage write succeeded. |
| save-error | 240 ms | G22, G28 | Real storage failure shown; never a success sound. |
| week-complete | 280 ms | G17 | Settled week's report ready. |
| star-award | 360 ms | G18 | One actual star; Pilot follows successful persistence. |
| competence-up | 440 ms | G21, G23 | New milestone, deduplicated across remount. |
| risk-reveal | 320 ms | G10, G12 | Newly revealed risk, not every chart render. |
| storm | 600 ms | G10 | One soft storm accent when it becomes visible; no loop. |
| storm-clear | 400 ms | G10 | Forecast confirms the risk has been removed. |
| notification | 220 ms | G33 | Foreground in-game inbox arrival only. |
| reminder-scheduled | 220 ms | G36 | Scheduler acknowledged a reminder; does not claim delivery. |
| pause / resume | 130 ms each | G24 / G10 | Explicit pause and resume. |
| success | 420 ms | G18 | Completed lap summary. |
| failure | 240 ms | G19 | Actual rejected transfer, once. |

Each id maps to `design/audio/sfx/<id>.wav` and runtime asset `sfx.<id>`. All 35 are present in `design/runtime-import-manifest.json`; runtime inventory is now 182 assets and 567 scene/asset bindings. Audio placements intentionally have no visual rectangle. The 12 initial scene asset sets still exclude sound; the first-load art/font maximum remains 1,167,718 bytes.

## Mixing and control

The cue map includes scene ids, semantic event, offset, gain, priority, group, cooldown and cancellation policy. Require an explicit audio-unlocking user gesture, master volume above zero, SFX enabled and visible document. A rejected play promise must not break game control.

Master SFX gain is 0.65. Maximum three effects concurrently and one per group (UI, world, feedback). Higher priority interrupts a lower cue within its group. Narration ducks effects by 12 dB with 35 ms attack / 180 ms release. Mechanical lock sound and its delayed chime are an intentional two-layer cue. A generic click never doubles a semantic feedback sound.

Cancel playing and queued effects on pause, scene disposal, hidden document, mute and reset. Do not replay missed sounds when the tab becomes visible. Narrator mute, SFX enable and master volume are independent settings; mute must also stop a sound already playing.

Hover, keyboard focus, typing, chart scrubbing, forecast recomputation, loader loops, email and native push stay silent. These actions retain accessible text and visual feedback. No continuous ambient loop is needed. Sound is decorative and never settles a week, commits a card, saves a plan or awards a star.

## Open-source alternatives checked

Checked on 17 November 2026 against official pages; no third-party file was downloaded into this pack.

- [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds): 100 interface sounds, CC0. [Kenney support](https://kenney.nl/support) confirms commercial use and optional attribution. Suitable replacement source for generic UI cues.
- [Freesound FAQ](https://freesound.org/help/faq/): per-recording licences include CC0, CC BY and CC BY-NC, with legacy cases. Prefer individually verified CC0 recordings; retain sound page, author and licence for every import. The entire site is not one CC0 library.
- [Sonniss GDC licence](https://sonniss.com/gdc-bundle-license/): custom royalty-free project-use terms, not CC0. Current terms distinguish finished projects from standalone sample/asset packs. Not included in this reusable audio handoff.

Provenance and source URLs are also bundled in `design/audio/sfx/SOURCE-AND-USAGE.md` and `open-sources.json`. No author attribution is fabricated for generated sounds, and ElevenLabs is not credited with these procedural effects.

## Audition and checks

Open `design/audio/index.html` for individual click-to-play audition with volume and stop controls. It works from an extracted local pack and has no external dependency. `design/audio/preview/sound-check.mp4` plays all 35 labelled cues in approximately 44 seconds; `sound-check.wav` is the same sequence without picture.

`python3 design/tooling/validate-sfx.py` passed: all files decode as mono 22,050 Hz / 16-bit PCM, SHA256 matches, no clipped samples, zero endpoints, durations within one sample, maximum peak 0.225135 full scale and all cue asset ids resolve. MP4 decodes successfully. Human listening remains the final judgement for comfort and speaker/headphone balance.

`render-sfx.py` regenerates the actual audio from the fixed seed; `build-sfx-preview.py` regenerates the labelled audition. Neither contacts a generative service. Recorded ElevenLabs narration remains a separate missing-media item.

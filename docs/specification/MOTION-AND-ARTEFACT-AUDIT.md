---
answers: >-
  Which assets are actually ready, how to embed the prepared animation artwork and transition blueprints, and what still needs completion before the hackathon.
excludes: >-
  Engine implementation details, actual ElevenLabs recordings and browser-runtime accessibility certification.
status: current
updated: 2026-11-17
---

# Motion assets and completeness audit

The motion set follows the product owner's request to avoid spending event time generating visuals. The earlier A1–A10 package contained static poses and transition timing guidance, not finished animation clips. This delivery adds ready motion artwork and A11 SFX; it does not claim the application itself has been implemented.

Asset evidence is `design/current-contract-qa.json`. Engine APIs are specified in RUNTIME-ENGINE-CONTRACT.md.

## 1. Completeness, with evidence

| Item | Actual delivery | Status |
|---|---|---|
| A1 world | 15 original/target PNG+WebP textures, 8 week/finish and 4 campaign island regions, weather, sky and studio | Ready |
| A2 characters | 32 named emotion/pose regions; exported individual PNG+WebP files, within 64 total exported atlas regions | Ready |
| A3 cards | 6 action, 5 event and crash illustrations without live financial text; frame specification | Ready |
| A4 kit | semantic game palette, component SVG/PNG and 46 contrast pairs | Ready |
| A5 layouts | 72 complete layout views for G01–G36, including desktop/mobile and two email widths; 567 scene/action/asset bindings with placement contracts | Ready for defined viewports; remaining application layout work is integration |
| A6 copy | 485 strings per resolved deck, four player/narrator combinations; 100 notification strings | Ready |
| A7 scripts | 49 triggered voice lines per combination, display/spoken forms and emotional intent | Scripts ready |
| Real narration audio | No ElevenLabs recordings in the package; project API-key handle checked and has no configured digest | **Not ready** |
| A8 boards | existing reviewed corrections plus revised board09 | Ready |
| A9 pitch | coherent 7-beat storyboard; 165-second script | Ready; live demo rehearsal still required |
| A10 identity | light/dark wordmarks and favicons | Ready |
| A11 SFX | 35 original procedural WAV files, source and playback manifest | Ready |
| Motion | 20 transparent APNG clips, matching PNG stills, 5 animated SVG assets, 18 transition blueprints, 20-second MP4 preview | Ready as assets |
| Game integration | event-to-state wiring, responsive runtime, persistence, push/email and media preferences | Integration underway; engine/narrative pass 49 tests |

There is sufficient authored visual material for the defined demo path without asking an image generator for more. That statement does not cover an unplanned feature, the remaining voice recordings or untested runtime behaviour.

## 2. Motion inventory

All paths below are relative to design/motion/. animation-manifest.json is the definitive list of sizes, bytes, loop counts, hashes, triggers and stills. The APNG files use .png extension and retain transparency. Their recorded decoder checks compare every decoded frame to its rendered source.

| Clip | Duration | Plays | Trigger |
|---|---:|---|---|
| M01-plane-hover | 2400 ms | loop | visible decorative plane |
| M02-plane-travel | 240 ms | once | resolved week; decorative travel accent |
| M03-storm-forming | 280 ms | once | risk revealed |
| M04-storm-active | 2400 ms | loop | active visible storm |
| M05-storm-dissolve | 280 ms | once | confirmed risk resolution |
| M06-card-select | 180 ms | once | card preview |
| M07-card-play | 240 ms | once | accepted committed card |
| M08-single-star-award | 600 ms | once | one confirmed awarded star |
| M09-soft-crash | 280 ms | once | payment rejected |
| M10-rewind | 280 ms | once | explicit rewind confirmed |
| M11-loader | 1600 ms | loop | actual pending operation |
| M12-save-confirmed | 240 ms | once | persistence acknowledged |
| M13-level-unlock | 480 ms | once | engine level-unlocked event |
| M14-notification-arrival | 280 ms | once | relevant inbox item received |
| M15-return-banner | 180 ms | once | saved run restored |
| M16-narrator-female-idle / male-idle | 2400 ms | loop | chosen narrator visible |
| M17-narrator-female-reaction / male-reaction | 180 ms | once | confirmed reaction |
| M18-dialog-enter | 180 ms | once | panel opened |

These are composited 2D illustrations: translation, opacity, scale and pose crossfade. They are not a skeletal character rig or mouth-synchronised speech. The latter is not required for this demo; live captions and expression poses remain the design.

## 3. Embedding contract

- Prefer the animated WebP file from the runtime manifest; use staticWebP when animation is disabled. APNG remains an authoring/reference format. Animated SVG artwork is self-contained and has a reduced-motion media rule. No external images or scripts are loaded by the five SVG assets.
- motion-blueprints.json describes transitions on the actual live UI elements. The application adapter uses the same declared slots and engine triggers. Resolve {fromX}, {fromY}, {toX}, {toY} from the selected viewport's route nodes before applying the travel keyframes.
- Do not animate a blank APNG card over live text. Apply card-preview/card-commit data to the whole live card component. The blank card clips are reusable artwork/study assets.
- The fixed horizontal M02 clip is an accent, not the source of the plane's true node coordinates. Actual game movement uses the bound route-flight blueprint.
- The film previews/motion-showreel.mp4 is an opaque review montage, not a transparent game overlay.
- Engine results and accessible text update immediately; the animation is decorative. Never commit a card, advance time, confirm a save or award a star on animation completion.
- M08 contains exactly one star. Instantiate only actual awarded stars; the Pilot star follows plan save, not mere lap completion. Unlocks follow level.unlocked.
- Changes to the financial chart use confirmed computed data and an opacity transition. Do not morph amounts, axes or a fake financial series for visual effect.
- Newer events cancel obsolete transitions. Close/unmount cancels motion; do not allow late narrator audio or a stale animation to restore a dismissed overlay.

## 4. Reduced motion and resource use

Every clip has an animated WebP runtime file and a staticWebP reduced-motion companion (plus authoring APNG/PNG). Swap the source when reduced motion is selected; CSS animation:none alone does not stop animated image playback. Use the final-state zero-duration transition in the blueprint and expose the same text/status. Never hide an error, route position or score when motion is off.

Loops stop or are removed when their scene is hidden/disposed. Do not preload the full motion folder: the APNG set is an authoring library. Use individual WebP portraits plus live transforms for the lightest runtime; load animated WebP only after first paint and only for visible scenes. The 12 current first-load sets include four font files and all interface icons; maximum 1,167,718 bytes under the 1,500,000-byte art/font budget. App code/network performance still require separate measurement. No need to show a loader for a fast operation; loading animation starts only if an operation is still pending.

## 5. Sound and voice

design/audio/sfx/ contains click, card-play, whoosh, storm, success, failure, unlock and notification WAV files. sfx-manifest.json records sample rate, length, peaks and procedural provenance. No third-party samples were used. Sounds respect user gesture, volume and mute; email/push must not auto-play these sounds.

Narration is the remaining generation dependency. Existing voice decks are complete scripts, not audio. To finish it before the event, the owner must supply approved narrator voice choices and make ElevenLabs access available through the project's secure key mechanism, then render and listen to the recordings. No secret belongs in chat or a repository. Until then captions are the genuine fallback.

## 6. Notification review corrections included

Board09 now uses “Ania · Szefowa”, the email signature is “Ania · Szefowa studia” (male: “Szef studia”), and return progress is “Tydzień {week.current} z {week.total}”. N-07 explicitly concerns a public obligation, distinct from a saved plan's N-05 deadline. No amounts or product promotion on the lock screen.

G36 has actual designed toggle hit areas, quiet-from/to fields, timezone and demo-send control, all at least44×44px. G33/G34/G36/return contain the chosen narrator art slot. The demo has dedicated pending/scheduled/failed/permission states and copy; scheduled acknowledgement says 30 seconds only after the scheduler confirms it. “Sent to service” is distinct from delivered/displayed/read.

## 7. Acceptance and remaining checks

The validation report covers PNG/WebP dimensions, atlas-region bounds, individual sprite coverage, every APNG frame/duration/loop and alpha, animated SVG syntax and reduced-motion rule, decoded WAV format/peaks, MP4 decode, notification layouts and controls, copy grammar/length and monetary fixture relationships.

Browser layout, keyboard/focus behaviour, real push delivery, email clients, media policy and genuine voice timing still require integration checks. This package removes the known visual-generation dependencies. Runtime acceptance and genuine voice recording remain separate checks.

## 8. Motion review fixes — 17 November

- Painted paper plane replaces the flat world icon; the brand glyph remains a separate interface asset.
- The lock rotates 48 degrees about the right socket, with the left shackle leg visibly clear. Closed/open stills are provided.
- Rewind rotates the painted brass G20 dial counterclockwise; no generic chevrons.
- M04 storm WebP is 547,486 bytes; narrator idle WebP female 265,462 bytes and male 331,352 bytes. None is in a first-load set.
- Twenty animated WebP files decode successfully: 212 encoded frames after duplicate-frame coalescing, matching exact durations; the APNG references contain 234 decoded frames. Both formats are valid; frame counts need not match.
- `data/voice-bindings.demo.json` resolves every narrator script for the fixed demo in spoken Polish. Voice render dry run: 184 narrator lines, 12,812 characters, zero skipped. This is a readiness check, not a recording.
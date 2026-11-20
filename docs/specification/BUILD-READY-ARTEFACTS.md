---
answers: >-
excludes: >-
  Application code, event eligibility approval, live voice recordings and live notification delivery.
status: current
updated: 2026-11-16
---

# Build-ready design handoff

D-01 remains in force: design data, original art, SVG specifications and previews only. No application source or runtime was built. Media are generated at the event from GENERATION-BRIEFS.md and shared through `design/` on `develop`.

| Artefact | Delivery |
|---|---|
| A1 world | PNG/WebP sky, studio, 8 week/finish islands, 4 campaign islands and weather atlas; asset manifest includes bounds, file sizes and source hashes |
| A2 characters | 32 named atlas regions: 7 emotions for each Boss, 4 poses for each player, client 3, bank advisor 2, AI-CFO 3, cat 2 |
| A3 cards | 12 text-free atlas regions: 6 actions, 5 events, crash; card-frame-spec.json defines live title/cost/timing slots |
| A4 UI | design/ui-kit/game-ui-kit.svg and .png, game tokens, 46 AA contrast checks |
| A5 layouts | 14 JSON/SVG/PNG specifications: G06, G10, G13, G14, G18, G19, G30 at 1440×900 and 844×390 |
| A6 copy | 382 base strings + 98 reminder strings = 480 per resolved gender deck; four player/narrator combinations; master templates and financial fixtures |
| A7 voice | 49 triggered lines per combination, 4 JSON/CSV decks, display/spoken forms and emotion/timing estimates |
| A8 corrections | already complete: 5 corrected current concept boards; G16 non-bank SMS, G10 plain icon, G19/G26 tags, narrator continuity |
| A9 storyboard | design/storyboard-v2/pitch-storyboard-seven-beats.png plus exact beat timing and engine overlay bindings; female narrator and player |
| A10 identity | light/dark SVG and PNG wordmarks; favicon SVG/PNG/ICO; clear-space spec |
| A11 sound | 8 original procedural WAV effects; design/audio/sfx/sfx-manifest.json, no third-party samples |
| Motion | 20 APNG clips + stills, 5 animated SVG, 18 transition blueprints and MP4 preview; design/motion/ |
| G33–G36 reminders | design/notifications/; 12 SVG/PNG layouts, copy, states and QA; NOTIFICATION-DESIGN.md governs behaviour |

## Asset contract

Canonical raster assets: design/assets/illustrations/. PNG preserves original generated pixels; WebP is an equivalent compressed export. Sprite regions are listed in illustration-manifest.json. These are atlas regions, not individual image files: render only the named rectangle. Use manifest cell boundaries and retain transparent padding. The Boss identity remains separate from player identity.

World labels, dates, financial numbers, costs and card text belong to the live SVG/HTML overlay, never to these illustration textures. Supporting invoice art may show decorative blank lines, not readable account or financial data. The bank advisor never fronts the non-bank offer.

Sky and studio sources are native 1672×941. Standard cover-layout exports target 2560×1440 desktop and 1688×780 mobile landscape. Enlarging the source does not add painted detail; higher-resolution repainting remains optional visual polish. Campaign uses four separate island regions positioned by the game, with a fog layer for locked areas; no route text baked in. Weather effects intentionally contain soft semi-transparent edges; never set a white backing colour.

Boss/player/supporting character sheets expose 32 emotion/pose regions, not animation frame sequences. The new design/motion/ pack performs composited position/opacity/scale and pose crossfade; it is not skeletal or lip-synchronised animation. Generated alpha can contain near-zero edge values and near-opaque interiors; preserve alpha rather than replacing it with a colour matte.

## Copy and voice

Financial examples are design fixtures from GAME-DESIGN §6 and the paper oracle. At implementation, resolve template bindings from the deterministic engine; the already resolved JSON files are grammar/QA examples, not a financial source. No selected gender changes any amount.

The intro now says “Mam klientów, dobre pomysły i kawę na trzy dni.” This avoids implying a team of employees before level 2's first hire. The Boss owns the business; the player is the helper.

Voice files are scripts only. No ElevenLabs calls were made. Choose approved voices and use the platform keychain at recording time. Captions appear immediately; voice never commits an action. TargetSecondsEstimate is a word-count estimate, not measured audio duration.

## Pitch

Seven-beat storyboard totals 165 seconds. Display balances/dates from the storyboard JSON bindings rather than reading pixels. A reminder demo is an additional segment and needs its own rehearsal time. The scene chart is illustrative, not a plotted financial acceptance oracle.

## Checks and remaining live verification

Static asset dimensions, alpha channels, atlas regions, JSON schemas, unique string IDs, four grammar combinations, 49 voice lines per deck, contrast ratios and financial fixture relationships are validated in the delivered QA report. PNG/SVG previews were reviewed. No static asset proves keyboard support, screen-reader behaviour, Web Push delivery, email-client rendering or ElevenLabs audio timing. Those checks belong to implementation at the event.

Initial-load budget uses only required WebP textures for the active scene, not every atlas and PNG. Load sky + chosen Boss/player on entry; world, cards and supporting cast on demand. The whole ZIP is an authoring handoff and is not a browser preload list.

## Completeness audit and motion supplement

The former static handoff is now supplemented by ready animation files and A11 SFX. See `MOTION-AND-ARTEFACT-AUDIT.md`, `design/motion/animation-manifest.json`, `design/motion/motion-qa.json` and `design/artefact-completeness-audit.json`. 64 atlas regions also exist as individual PNG/WebP files under `design/assets/sprites/`, so implementation does not need to slice sheets manually.

Notification review fixed all three of the product owner's details: Polish Ania/Szefowa nameplates, studio-owner signature, current/total week progress. Also added the actual designed demo-send control/states, editable channel/quiet-hours controls and narrator slots. Current copy:480strings pervariant;98notificationentries;12notificationlayouts.

**Actual narration audio is still not ready.** Scripts do not equal recordings. ElevenLabs voice choices and secure project access are required; event eligibility Q-06 remains open. The visual library removes generation work for the defined demo path; runtime integration is still hackathon work under D-01.

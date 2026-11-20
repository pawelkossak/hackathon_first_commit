---
answers: >-
  How the game's media (art, motion, voice, sound) are generated during the event, where each output goes,
  and when the pre-event version is used instead.
excludes: Layouts, copy deck, contracts and tokens (design material, see BUILD-READY-ARTEFACTS.md).
status: current
updated: 2026-11-20
---

# Generation briefs — media made at the event

## Rule: generate first, fall back if needed

1. Media are generated during the event from the briefs below and saved at the **same paths** the specification uses (`design/assets/…`, `design/voice/…`, `design/audio/…`), so the asset pipeline and the UI do not change.
2. The UI never waits: until an asset exists it shows a plain placeholder of the right size.
3. **Fallback:** the branch `assets/pre-event` holds design media prepared before the event (declared in `README.md` of this folder). If a generated asset is not ready or not good enough at the media review (**Sat 12:00**, G-07), the coordinator copies that one asset from the branch:
   `git checkout origin/assets/pre-event -- <path>` and commits it as `chore: use pre-event asset <path>`.
   Every asset taken this way is listed in `docs/team/handoffs/pre-event-assets.md` and in the submission.

## Style (all art)

Original painted floating islands, purple sky, mint paper-plane identity, cream panels and golden controls. No bank logos, no imitation of existing games or characters. Never bake labels, numbers, dates, balances or UI into texture art: the engine draws every value live.

## Art briefs (lane ui)

| Asset | Brief | Export |
|---|---|---|
| Sky | warm sunset above a turquoise cloud sea, distant purple mountains, open centre for the route | 16:9 source; covers 2560×1440 and 1688×780, WebP |
| Studio | warm creative workspace, lilac walls, desk, blank corkboard, panoramic window on floating islands; no people, no text | as sky |
| Week islands | 8 isolated cells (4×2): 7 studio/office/warehouse/garden islands + a finish island with a blank sign and checkered flag | transparent background, wide gutters |
| Campaign | 4 island regions (2×2): studio, first hire, investment, next generation; locked state by a separate fog layer | transparent |
| Boss | one consistent aviator per gender (Szef / Szefowa): brown jacket, goggles, red scarf; 7 emotions in a 4×2 atlas, last cell empty: welcoming, excited, confident, suspicious, exasperated, proud, relaxed | true alpha, no white matte |
| Player | woman (long dark wavy hair, red blouse) or man (dark hair, teal jacket), distinct from the Boss, no goggles; 4 poses (2×2): neutral, happy, worried, in the plane with the AI-CFO | identical framing per identity |
| Supporting cast | 5×2 atlas: client woman neutral / negotiating / happy; bank advisor neutral / explaining; AI-CFO neutral / thinking / happy; cat sleeping / alert | transparent |
| Card art | 4×3 atlas: advance handshake, blank discount invoice, calendar arrow, coin safe; non-bank phone warning, factoring invoice + plane, account-change magnifier, new-order parcel; AI tool robot, late-customer clock, obligation envelope, repairable broken plane. No frame, wording, amounts or logos | transparent |
| Weather | 3×2 atlas: purple storm forming / active / dissolving; sun, fog, stars | localised alpha |

**Demo-path minimum (MUST):** sky, week islands, Szefowa 7 emotions, player woman 4 poses, client 3, card atlas, storm. Everything else is SHOULD.

## Voice and sound briefs (lane narrative)

- **Voice:** ElevenLabs, two Polish narrator voices (Szefowa, Szef), pre-rendered at build time from the voice script in `design/voice/` (display text for captions, spoken form with numbers and dates written out). Demo-path lines for Szefowa are MUST; Szef, the supporting roles and dynamic lines are SHOULD. Keys only in `.env.local`, never in the repository.
- **Sound:** 8 short effects (click, card play, whoosh, storm, success, failure, unlock, notification), original or from a source whose licence allows commercial use; record the source of each in `design/audio/sfx/SOURCE-AND-USAGE.md`.
- **Motion:** simple CSS/Framer Motion transitions over the static art (plane along the route, storm forming, card flip). Respect reduced motion.

## Rights

Every generated asset must be usable by the team without third-party restrictions (rules §4.8): use tools whose terms grant commercial use of outputs, and note the tool in the asset's folder README.

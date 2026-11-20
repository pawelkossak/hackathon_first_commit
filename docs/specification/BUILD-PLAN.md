---
answers: >-
  How Pilot Płynności is built during Collabothon 2026: scope, the three independent lanes, the
  interfaces between them, the two phases (without assets, then with assets), every build task with its
  inputs and acceptance check, checkpoints and cut order.
excludes: >-
  Rules and numbers (GAME-DESIGN.md, ENGINE-DATA-AND-TESTS.md), look and voice (GAME-EXPERIENCE-AND-NARRATION.md),
  technical design (ARCHITECTURE.md), story acceptance (DEMO-REQUIREMENTS.md), media briefs (GENERATION-BRIEFS.md).
status: current
updated: 2026-11-20
---

# Build plan — Pilot Płynności

All application code is written during the event from this specification. Media (art, motion, voice, sound) and the
`design/` folder are produced during the event too (GENERATION-BRIEFS.md); until they exist every lane works against
the placeholder contracts of §3.2.

Clock: coding starts Fri 20 XI 11:00, submission Sun 22 XI 10:00 (≈ 47 h).

## 1. Definition of done

- The demo click-path of GAME-DESIGN.md §9 runs end to end from a local production build without network, with captions and voice; every number equals GAME-DESIGN.md §6.
- All MUST stories of DEMO-REQUIREMENTS.md pass their acceptance.
- `pnpm check` (typecheck, lint, Vitest, build) is green; the demo-path Playwright spec is green three runs in a row.
- Pitch rehearsed three times under 3:00; backup recording saved.

## 2. Scope

| View(s) | Content | Priority |
|---|---|---|
| G05–G08 | intro, player + narrator choice, goal, first decision | MUST |
| G09 | campaign map | MUST |
| G10, G11 | world route, events | MUST |
| G12, G30, G32 | Cash Flow drilldown | MUST |
| G13, G29, G31 | 6 action cards incl. factoring, comparison | MUST |
| G14 | negotiation with Klient A | MUST |
| G17–G20 | week, success, failure, rewind | MUST |
| G22, G23 | plan, validation on the synthetic account | MUST |
| return banner (G10) | comeback loop without push | MUST |
| G15, G16 | AI-CFO, bank advisor / loan-cost reveal | SHOULD |
| G21, G24 | achievements, settings | SHOULD |
| G25–G28 | loaders, offline, recovery | SHOULD (G25 initial load near-MUST) |
| 844×390 landscape | all MUST views | SHOULD |
| G33–G36, Web Push | opt-in, demo reminder, inbox | SHOULD |
| level 2 | First employee (FIRST-EMPLOYEE-SCENARIO.md) | SHOULD, only when MUST is green |
| G01–G04 | account screens as static front-end with guest entry | COULD |
| real auth, bank connectivity, e-mail delivery | — | WON'T |

## 3. Lanes — one owner each, independent by contract

| Lane | Owner | Owns (only this lane edits these paths) | Delivers to the others |
|---|---|---|---|
| **E — Engine and data** | Person A (coordinator) | `engine/`, `data/` | the engine API of RUNTIME-ENGINE-CONTRACT.md |
| **U — Game UI and art** | Person B | `app/` (without `app/api/`), `components/` (without `components/narrative/`), `public/`, `lib/ui/`, `lib/generated/`, `scripts/build-assets.ts`, `design/` (without `design/voice/`, `design/audio/`) | the screens of the demo path, the art |
| **N — Narrative, voice, AI, reminders, tests** | Person C | `narrative/`, `components/narrative/`, `lib/ai/`, `lib/reminders/`, `app/api/`, `public/sw.js`, `e2e/`, `playwright.config.ts`, `design/voice/`, `design/audio/` | copy, reactions, voice player and recordings, `/api/*`, the demo-path e2e, the pitch |

The authoritative map is `lanes.json` (longest matching path wins). Shared files (`package.json`, `pnpm-lock.yaml`, `tsconfig.json`, configs, `README.md`, `AGENTS.md`, `docs/specification/`) change only through the coordinator, one small commit at a time. The narrative lane builds its screens (intro, dialogue, negotiation, voice player, settings) in `components/narrative/`; the ui lane mounts them in its pages.

### 3.1 Interfaces that make the lanes independent

1. **Engine API (first, E-01).** `engine/types.ts` and `engine/index.ts` export every function of RUNTIME-ENGINE-CONTRACT.md with final signatures. Until a function is implemented it returns a fixture state built from `data/level1.json`. U and N code against these signatures from the first hours and never wait for engine logic.
2. **Copy keys.** `narrative/` exports `getCopy(id, state, playerGender, narratorGender, extra)`. U renders only through it, never hard-coded sentences.
3. **Asset registry.** `lib/ui/assets.ts` maps every asset id to its file in `public/media/` or to a placeholder (§3.2). Components ask the registry, never a file path.
4. **Engine events.** The typed event list in ENGINE-DATA-AND-TESTS.md §6 is the contract between E and N (reactions).

A change to any interface is announced in the team chat and committed by its owner as a separate commit before the dependent code.

### 3.2 Working without assets (phase 1)

| Missing | Placeholder contract | Replaced in phase 2 by |
|---|---|---|
| art (islands, characters, cards, storm) | `components/ui/Placeholder` — a box of the asset's size and aspect with its id and a flat colour; the registry returns it for every id without a file | generated WebP (G-01…G-03) through the same registry ids |
| layouts G10/G13/G30 | positions and sizes from GAME-EXPERIENCE-AND-NARRATION.md §6 and §17; 1440×900 first | layout specs in `design/layouts/` when produced |
| tokens, fonts | CSS variables in `app/globals.css` from the palette words of GAME-EXPERIENCE-AND-NARRATION.md §2 (purple sky, mint, cream panels, golden controls), system font; AA contrast checked by hand | `design/tokens.json` and the chosen fonts (U-16) |
| copy deck | `narrative/copy/seed.pl.ts` — the demo-path strings only, in 4 variants, written from the Polish lines quoted in the specification (GAME-DESIGN.md, DEMO-REQUIREMENTS.md, GAME-EXPERIENCE-AND-NARRATION.md) | the full copy deck through the same keys (N-13) |
| voice | captions-only mode of the voice player (it must exist anyway, rule 6) | recordings in `design/voice/` (G-04) |
| sound, motion | silent; CSS transitions only | G-05, U-17 |

Phase 1 is complete when the whole demo path runs on placeholders. Phase 2 never changes logic: it only fills the registry, the copy keys and the voice bindings.

## 4. Git workflow

- Branches: `develop` is the integration branch; each person works on `lane/engine`, `lane/ui`, `lane/narrative`. `main` receives only the final version, on the coordinator’s decision.
- Small commits with one topic: `feat:`, `fix:`, `test:`, `chore:`, `docs:`; the task id in the subject (`feat: U-05 world route G10`).
- Integration: pull request into `develop`, merged by the coordinator after `pnpm check`, `node scripts/lane-check.mjs --range develop...lane/<name>` and the qa review are green. After every merge each lane runs `git pull origin develop` (merge, no rebase of pushed work).
- Lane paths are machine-checked: `lanes.json`, the pre-commit hook `.githooks/pre-commit` and, in Claude Code, `.claude/hooks/lane-guard.mjs`.
- Never commit `.env*`, keys or tokens. Secrets are names in `.env.example` only.

## 5. Tasks

Each task fits ≤ 90 min. Acceptance names its check. Window = target clock time. **Phase 1** tasks need no assets; **phase 2** tasks start when the media exist (the generation tasks G-xx run in parallel from Fri evening).

### Lane E — Engine and data (Person A) — all phase 1

| Id | Task | Inputs | Window | Acceptance |
|---|---|---|---|---|
| E-01 | Engine types and the full API surface with fixture returns; `data/*.json` typed from the specification tables, validated with Zod (replaces the earlier quiz model) | RUNTIME-ENGINE-CONTRACT.md, ENGINE-DATA-AND-TESTS.md §1–§6, SYNTHETIC-DATA.md §3–§4 | Fri 14–16 | `pnpm typecheck` green; schema test loads every `data/*.json`; merged to `develop` at once |
| E-02 | Forecast: daily balance, same-day order, business days, crash detection | GAME-DESIGN.md §6, SYNTHETIC-DATA.md §3 | Fri 16–17 | ET-F cases and the no-action week-end balances green |
| E-03 | Action cards C1–C6: effects, windows, eligibility, exclusivity, disabled reasons (incl. factoring D-11) | GAME-DESIGN.md §6.1, §6.6, D-11 | Fri 17–19 | ET-C cases green |
| E-04 | Event deck E1–E6 and the seed | GAME-DESIGN.md §6.2 | Fri 19–20 | ET-E cases green |
| E-05 | Turn state machine, snapshots, rewind and card combinations | ENGINE-DATA-AND-TESTS.md §7 | Fri 20–22 | ET-R and ET-X cases green; inputs never mutated |
| E-06 | Score: stars, competences, cost of money, avoided cost, overdraft interest | GAME-DESIGN.md §6.3, §6.5 | Fri 22–23 | ET-S cases green (overdraft ≈ 194 zł) |
| E-07 | Cash Flow series and transactions for the drilldown | GAME-DESIGN.md §3, GM-19 | Sat 07–08 | series test: minimum and dates match §6 |
| E-08 | Agent rules: Klient A and bank negotiation outcomes | ENGINE-DATA-AND-TESTS.md §4 | Sat 08–09 | ET-A01…A07 green |
| E-09 | Plan matcher, account clock and future-script replay | ENGINE-DATA-AND-TESTS.md §5, US-06, US-07 | Sat 09–10 | ET-M cases green; account clock independent of the game clock |
| E-10 | Demo-path end-to-end engine test | GAME-DESIGN.md §9 | Sat 10–11 | ET-D01 green; all 58 ET cases green |
| E-11 | Level 2 engine (if MUST green) | FIRST-EMPLOYEE-SCENARIO.md | Sat 14–16 | level 2 acceptance cases green |
| E-12 | Coordinator duties | — | throughout | PRs merged, `develop` green, scope cuts decided at checkpoints |

### Lane U — Game UI and art (Person B)

| Id | Phase | Task | Inputs | Window | Acceptance |
|---|---|---|---|---|---|
| U-01 | 1 | App shell, routes, game store (Zustand), reset | ARCHITECTURE.md §3, US-08 | Fri 14–15 | `/`, `/mapa`, `/gra/1` render; reset clears state; `pnpm build` green |
| U-02 | 1 | Placeholder theme (CSS variables) and the asset registry with `Placeholder` | §3.2, GAME-EXPERIENCE-AND-NARRATION.md §2 | Fri 15–16 | every registry id renders a sized placeholder; body text ≥ 16 px |
| U-03 | 1 | Campaign map G09 with fog and unlock | GM-08 | Fri 16–17 | level 1 active, 2–4 locked |
| U-04 | 1 | World route G10: 7 week nodes + finish, markers, storm, plane, HUD | GM-01, GAME-DESIGN.md §3 | Fri 17–19 | dates and markers from the engine; storm on 28 XII with the engine minimum |
| U-05 | 1 | Card hand G13: six cards, preview, play, disabled states | GM-03 | Fri 19–21 | preview does not commit; disabled reason from the engine; keys 1–6 |
| U-06 | 1 | Event cards G11 incl. fraud reveal and SMS trap | GM-05 | Fri 21–22 | T1, T2, T3, T5, T6 shown in their weeks |
| U-07 | 1 | Week resolution G17 with lesson and floating amounts | US-04 | Fri 22–23 | numbers only from the engine |
| U-08 | 1 | Cash Flow drilldown G12/G30/G32 (Recharts) | GM-19 | Sat 07–09 | chart reacts < 200 ms; „Zadania” view |
| U-09 | 1 | Failure G19 and rewind G20 | GM-06 | Sat 09–10 | 22 XII rejected payment, shortfall 8 095 zł; rewind restores the week |
| U-10 | 1 | Lap summary G18, plan save G22, validation G23 | GM-07, US-06, US-07 | Sat 10–11 | ★ Pilot only after a confirmed save |
| U-11 | 1 | Fallback: week-card list instead of the route (behind a flag) | — | Sat 11–12 | demo path playable with the flag on |
| U-12 | 1 | Accessibility pass on the demo path | GAME-EXPERIENCE-AND-NARRATION.md §11 | Sat 12–13 | keyboard path, focus in dialogs, no colour-only meaning |
| U-13 | 2 | Asset pipeline `scripts/build-assets.ts` (`design/` → `public/media`, `lib/generated`) feeding the registry; first-load budget | GENERATION-BRIEFS.md | when G-01 exists | registry resolves generated files; first load ≤ 1.5 MB reported |
| U-14 | 2 | Swap placeholders for art on G09, G10, G13, G11, G17–G20 | GENERATION-BRIEFS.md | Sat 13–16 | screens use the generated art; no logic change |
| U-15 | 2 | Mobile landscape 844×390 and rotate prompt | GM-16 | Sat 16–18 | no horizontal scroll; 44 px targets |
| U-16 | 2 | Final tokens and fonts; AA contrast check | GAME-EXPERIENCE-AND-NARRATION.md §2, §11 | Sat 18–19 | AA pairs recorded in `design/contrast-audit.json` |
| U-17 | 2 | Motion over the art (plane, storm, card flip), reduced motion, performance budget | GAME-EXPERIENCE-AND-NARRATION.md §17 | Sat 19–21 | reduced motion respected; turn < 200 ms |
| U-18 | 2 | Level 2 screens (if E-11 done) | FIRST-EMPLOYEE-SCENARIO.md | Sat 21–23 | `/gra/2` playable from the map |

### Lane N — Narrative, voice, AI, reminders, tests (Person C)

| Id | Phase | Task | Inputs | Window | Acceptance |
|---|---|---|---|---|---|
| N-01 | 1 | Strings module: typed keys, 4 player/narrator variants, engine bindings; seed copy for the demo path | §3.2, GAME-EXPERIENCE-AND-NARRATION.md §3–§5, D-12 | Fri 14–16 | test: every seed key exists in all 4 variants; a missing binding fails explicitly |
| N-02 | 1 | Number guardrail for any generated text | ARCHITECTURE.md §6 | Fri 16–17 | test: a sentence with a number not from the engine is rejected |
| N-03 | 1 | Narrator reactions: engine event → emotion → line, with cooldown | ENGINE-DATA-AND-TESTS.md §6, GAME-EXPERIENCE-AND-NARRATION.md §5 | Fri 17–18 | every engine event maps to a line; one reaction per week |
| N-04 | 1 | Voice player with captions-only mode, mute, skip, replay, one speaker | GAME-EXPERIENCE-AND-NARRATION.md §10, GM-20 | Fri 18–19 | captions always shown; missing audio never blocks a decision |
| N-05 | 1 | Intro and character selection G05–G08; narrator dialogue component | GM-17, GM-18 | Fri 19–21 | 4 combinations playable; intro skippable |
| N-06 | 1 | Negotiation G14 UI + `/api/agent`: provider abstraction, intent schema, 3 s timeout → buttons, cache | ARCHITECTURE.md §6, BACKEND-SERVICES.md §3, GM-04 | Fri 21–Sat 00 | `PILOT_AI_OFFLINE=1` returns buttons; no key in the client bundle |
| N-07 | 1 | Demo-path Playwright spec (desktop 1440×900) | GAME-DESIGN.md §9 | Sat 08–10 | green against the local production build |
| N-08 | 1 | Return banner (local, no backend) | NOTIFICATION-DESIGN.md, GM-27 | Sat 10–11 | banner resumes the game after reload |
| N-09 | 1 | AI-CFO G15 and bank advisor G16 | GM-09, GM-10 | Sat 11–13 | hint shows 2 options with engine cost; loan is a non-bank SMS |
| N-10 | 1 | Loaders G25–G28, settings G24 | GM-22, GM-23 | Sat 13–15 | save failure shown honestly; settings persist |
| N-11 | 1 | PWA service worker, opt-in G34, `/api/push/demo` (30 s) | BACKEND-SERVICES.md §4, D-14 | Sat 15–18 | demo reminder arrives in Chrome; banner still works without push |
| N-12 | 2 | Voice bindings: every demo-path line → recording in `design/voice/` | G-04 | when G-04 exists | every demo-path binding resolves to an existing file |
| N-13 | 2 | Full copy: all screens in 4 variants through the same keys | GAME-EXPERIENCE-AND-NARRATION.md | Sat 18–20 | key test green for every screen of §2 MUST |
| N-14 | 2 | e2e for 4 crews and mobile landscape | DEMO-REQUIREMENTS.md | Sat 20–22 | spec green in 4 variants |

### Media generation (in the lanes, briefs: GENERATION-BRIEFS.md)

Generated media go to the paths of GENERATION-BRIEFS.md. Generation runs in parallel to phase 1 and never blocks it. Media reach every lane only through `develop`: the owning lane commits them separately, the coordinator merges them first, every lane pulls `develop`.

| Id | Lane | Task | Window | Acceptance |
|---|---|---|---|---|
| G-01 | ui | Sky, studio and week islands | Fri 23–Sat 01 or Sat 07–09 | WebP at the export sizes |
| G-02 | ui | Szefowa 7 emotions, player woman 4 poses, client 3 | Sat 07–10 | atlas regions with true alpha; one consistent identity |
| G-03 | ui | Card atlas (12) and storm/weather atlas | Sat 10–12 | no text or numbers in the art |
| G-04 | narrative | Voice: Szefowa demo-path lines pre-rendered (ElevenLabs) | Sat 08–11 | one file per demo-path line; spoken numbers checked by ear |
| G-05 | narrative | 8 sound effects with recorded sources | Sat 11–12 | `design/audio/sfx/SOURCE-AND-USAGE.md` lists each file |
| G-06 | ui + narrative | SHOULD media: Szef, player man, supporting cast, campaign, Szef voice | Sat 14–18 | as above |
| G-07 | coordinator | Media review: which demo-path media are in `develop`; a missing one stays a placeholder (GENERATION-BRIEFS.md §Rule) | Sat 12:00 | `docs/team/handoffs/G-07.md` lists every placeholder kept, or says none |

### Pitch (shared, led by Person C, all three present)

| Id | Task | Window | Acceptance |
|---|---|---|---|
| P-01 | Confirm scope against the challenge card; mentor questions | Fri 14–15 | scope list agreed in the team chat |
| P-02 | Deck from PITCH.md, 90 s live demo window, screenshots of the built app | Sat 16–19 | deck matches the built app |
| P-03 | Rehearsals, backup recording, offline drill on two laptops | Sat 22, Sun 07, Sun 09 | 3 runs under 3:00 |
| P-04 | Submission | Sun before 10:00 | repository link and materials sent |

## 6. Checkpoints

| When | Check | If not met |
|---|---|---|
| Fri 23:00 | E-01…E-05 green and merged; U shows G09, G10, G13 on placeholders with the engine API; N strings, guardrail, reactions and captions done | move SHOULDs out; pair on the blocker |
| **Sat 12:00** | **demo path 1–7 clickable end to end on placeholders, local production build, N-07 green; media review G-07** | switch to the U-11 fallback, cut SHOULDs in §7 order |
| Sat 23:00 | feature freeze | only fixes after this |
| Sun 08:00 | code freeze; local builds on two laptops | present from the backup recording |

## 7. Cut order (drop in this order when late)

1. Account screens G01–G04 (COULD).
2. Level 2, achievements G21, settings beyond mute/captions.
3. Web Push (keep the return banner), dynamic TTS, the second narrator voice.
4. Mobile landscape (keep desktop).
5. Animated world route → static background with week cards (U-11).
6. Generated art for secondary screens (keep placeholders styled with the theme).

Never cut: engine numbers, Cash Flow, failure with rewind, plan with validation, captions.

## 8. Rules for agents working in a lane

- Build from this specification; no code from outside this repository.
- Stay in your lane's paths (`lanes.json`); anything else is a message to its owner.
- Every number shown to the player comes from the engine; generated text passes the guardrail.
- Every image goes through the asset registry, every sentence through `getCopy`, every voice line through the voice player.
- Synthetic data only; the game never favours a bank product and labels the factoring card as a scenario.
- Every AI feature has a deterministic fallback; tests never call a real LLM API.
- Finish a task only with its acceptance check green, then commit with one topic.

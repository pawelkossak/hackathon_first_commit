---
answers: >-
  How Pilot Płynności is built during Collabothon 2026: scope, the three independent lanes, the
  interfaces between them, every build task with its inputs and acceptance check, checkpoints and cut order.
excludes: >-
  Rules and numbers (GAME-DESIGN.md, ENGINE-DATA-AND-TESTS.md), look and voice (GAME-EXPERIENCE-AND-NARRATION.md),
  technical design (ARCHITECTURE.md), story acceptance (DEMO-REQUIREMENTS.md).
status: current
updated: 2026-11-20
---

# Build plan — Pilot Płynności

All application code is written during the event, from this specification and the design contracts in `design/`.
Design material prepared before the start (art, layouts, copy, voice recordings, data tables, this specification)
is declared in the root `README.md`.

Clock: coding starts Fri 20 XI 11:00, submission Sun 22 XI 10:00 (≈ 47 h).

## 1. Definition of done

- The demo click-path of GAME-DESIGN.md §9 runs end to end from a local production build without network, with captions and pre-rendered voice; every number equals GAME-DESIGN.md §6.
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
| **E — Engine and data** | Person A | `engine/`, `data/`, `engine/*.test.ts` | the engine API of RUNTIME-ENGINE-CONTRACT.md |
| **U — Game UI and art** | Person B | `app/` (pages, layout, styles), `components/`, `public/`, `scripts/build-assets.ts`, `lib/ui/`, `lib/generated/` (generated) | the screens of the demo path |
| **N — Narrative, voice, AI, reminders, tests** | Person C | `narrative/`, `components/narrative/`, `lib/ai/`, `lib/reminders/`, `app/api/`, `public/sw.js`, `e2e/` | copy, reactions, voice player, `/api/*`, the demo-path e2e |

Shared files (`package.json`, `pnpm-lock.yaml`, `tsconfig.json`, configs, `README.md`, `AGENTS.md`, `docs/specification/`) change only through the coordinator (Person A), one small commit at a time. The narrative lane builds its screens (intro, dialogue, negotiation, voice player, settings) in `components/narrative/`; the ui lane mounts them in its pages.

### 3.1 Interfaces that make the lanes independent

1. **Engine API (hour 0–1, E-01).** `engine/types.ts` and `engine/index.ts` export every function of RUNTIME-ENGINE-CONTRACT.md with final signatures. Until a function is implemented it returns a fixture state built from `data/level1.json`. U and N code against these signatures from the first hour and never wait for engine logic.
2. **Copy and voice keys.** `design/copy/` and `design/voice/` are the contract between N and U: U renders `getCopy(id, …)` and the voice player; N owns how keys resolve.
3. **Asset manifest.** `design/runtime-import-manifest.json` is the contract between the art and U: the app reads only `public/media/` and `lib/generated/`, never `design/` directly.
4. **Engine events.** The typed event list in ENGINE-DATA-AND-TESTS.md §6 is the contract between E and N (reactions).

A change to any of these four interfaces is announced in the team chat and committed by its owner as a separate commit before the dependent code.

## 4. Git workflow

- Branches: `develop` is the integration branch; each person works on `lane/engine`, `lane/ui`, `lane/narrative`. `main` receives only the final version, on the coordinator’s decision.
- Small commits with one topic: `feat:`, `fix:`, `test:`, `chore:`, `docs:`.
- Integration: pull request into `develop`, merged by the coordinator after `pnpm check`, `node scripts/lane-check.mjs --range develop...lane/<name>` and the qa review are green. After every merge each lane runs `git pull origin develop` (merge, no rebase of pushed work).
- Lane paths are machine-checked: `lanes.json`, the pre-commit hook `.githooks/pre-commit` and, in Claude Code, `.claude/hooks/lane-guard.mjs`.
- Never commit `.env*`, keys or tokens. Secrets are names in `.env.example` only.

## 5. Tasks

Each task fits ≤ 90 min. Acceptance names its check. Window = target clock time.

### Lane E — Engine and data (Person A)

| Id | Task | Inputs | Window | Acceptance |
|---|---|---|---|---|
| E-01 | Engine types and the full API surface with fixture returns; data files with Zod schema validation | RUNTIME-ENGINE-CONTRACT.md, ENGINE-DATA-AND-TESTS.md §1–§5 | Fri 11–13 | `pnpm typecheck` green; schema test loads every `data/*.json` |
| E-02 | Forecast: daily balance, same-day order, business days, crash detection | GAME-DESIGN.md §6, SYNTHETIC-DATA.md §3 | Fri 13–15 | ET cases for the ledger and the no-action week-end balances green |
| E-03 | Action cards C1–C6: effects, windows, eligibility, exclusivity, disabled reasons (incl. factoring D-11) | GAME-DESIGN.md §6.1, §6.6, D-11 | Fri 15–17 | ET card cases green |
| E-04 | Event deck E1–E6 and the seed | GAME-DESIGN.md §6.2 | Fri 17–18 | ET event cases green |
| E-05 | Turn state machine, snapshots, rewind and card combinations | ENGINE-DATA-AND-TESTS.md §7 | Fri 18–20 | ET turn and rewind cases green; inputs never mutated |
| E-06 | Score: stars, competences, cost of money, avoided cost, overdraft interest | GAME-DESIGN.md §6.3, §6.5 | Fri 20–21 | ET score cases green (overdraft ≈ 194 zł) |
| E-07 | Cash Flow series and transactions for the drilldown | GAME-DESIGN.md §3, GM-19 | Fri 21–22 | series test: minimum and dates match §6 |
| E-08 | Agent rules: Klient A and bank negotiation outcomes | ENGINE-DATA-AND-TESTS.md §4 | Fri 22–23 | ET-A01…A07 green |
| E-09 | Plan matcher, account clock and future-script replay | ENGINE-DATA-AND-TESTS.md §5, US-06, US-07 | Sat 08–09 | matcher cases green; account clock independent of the game clock |
| E-10 | Demo-path end-to-end engine test | GAME-DESIGN.md §9 | Sat 09–10 | ET-D01 green; all 58 ET cases green |
| E-11 | Level 2 engine (if MUST green) | FIRST-EMPLOYEE-SCENARIO.md | Sat 14–16 | level 2 acceptance cases green |
| E-12 | Coordinator duties | — | throughout | PRs merged, `main` green, scope cuts decided at checkpoints |

### Lane U — Game UI and art (Person B)

| Id | Task | Inputs | Window | Acceptance |
|---|---|---|---|---|
| U-01 | Import design assets and the asset pipeline (`scripts/build-assets.ts` → `public/media`, `lib/generated`) with a first-load budget check | `design/runtime-import-manifest.json`, `design/first-load-manifest.json` | Fri 11–13 | pipeline runs before dev/build; first load ≤ 1.5 MB reported |
| U-02 | Theme: tokens, fonts, identity | `design/tokens.json`, `design/fonts/`, `design/identity/` | Fri 13–14 | tokens available as CSS variables; AA pairs from `design/contrast-audit.json` |
| U-03 | App shell, routes, game store (Zustand) and reset | ARCHITECTURE.md §3, US-08 | Fri 14–15 | `/`, `/mapa`, `/gra/1` render; reset clears state |
| U-04 | Campaign map G09 with fog and unlock | `design/layouts/`, GM-08 | Fri 15–16 | level 1 active, 2–4 in fog |
| U-05 | World route G10: islands, markers, storm, plane, HUD | `design/layouts/G10-*`, GM-01 | Fri 16–18 | screenshot matches the layout at 1440×900 |
| U-06 | Card hand G13: six cards, preview, play, disabled states | `design/layouts/G13-*`, GM-03 | Fri 18–20 | preview does not commit; disabled reason shown |
| U-07 | Event cards G11 incl. fraud reveal and SMS trap | GM-05 | Fri 20–21 | T1, T2, T3, T5, T6 shown in their weeks |
| U-08 | Week resolution G17 with lesson and floating amounts | US-04 | Fri 21–22 | numbers only from the engine |
| U-09 | Cash Flow drilldown G12/G30/G32 | `design/layouts/G30-*`, GM-19 | Fri 22–Sat 00 | chart reacts < 200 ms; „Zadania” view |
| U-10 | Failure G19 and rewind G20 | GM-06 | Sat 08–09 | 22 XII rejected payment, shortfall 8 095 zł; rewind restores the week |
| U-11 | Lap summary G18, plan save G22, validation G23 | GM-07, US-06, US-07 | Sat 09–11 | ★ Pilot only after a confirmed save |
| U-12 | Fallback: week-card list over the static world (behind a flag) | — | Sat 11–12 | demo path playable with the flag on |
| U-13 | Mobile landscape 844×390 and rotate prompt | `design/layouts/*-844x390.*`, GM-16 | Sat 14–17 | no horizontal scroll; 44 px targets |
| U-14 | Accessibility pass, reduced motion, performance budgets | GAME-EXPERIENCE-AND-NARRATION.md §11, §17 | Sat 17–20 | keyboard path 1–6, focus in dialogs, budgets recorded |
| U-15 | Level 2 screens (if E-11 done) | FIRST-EMPLOYEE-SCENARIO.md | Sat 20–22 | `/gra/2` playable from the map |

### Lane N — Narrative, voice, AI, reminders, tests (Person C)

| Id | Task | Inputs | Window | Acceptance |
|---|---|---|---|---|
| N-01 | Strings module from the copy deck: typed keys, 4 player/narrator variants, engine bindings | `design/copy/` | Fri 11–13 | test: every key exists in all 4 variants; missing binding fails explicitly |
| N-02 | Number guardrail for any generated text | ARCHITECTURE.md (Agent text) | Fri 13–14 | test: a sentence with a number not from the engine is rejected |
| N-03 | Narrator reactions: engine event → emotion → line, with cooldown | ENGINE-DATA-AND-TESTS.md §6, GAME-EXPERIENCE-AND-NARRATION.md §5 | Fri 14–16 | every engine event maps to a line; one reaction per week |
| N-04 | Voice player: captions, mute, skip, replay, one speaker | `design/voice/`, GM-20 | Fri 16–18 | all demo-path bindings resolve to an existing file |
| N-05 | Intro and character selection G05–G08; narrator dialogue component | GM-17, GM-18 | Fri 18–21 | 4 combinations playable; intro skippable |
| N-06 | Negotiation G14 UI + `/api/agent`: provider abstraction, intent schema, 3 s timeout → buttons, cache | ARCHITECTURE.md, BACKEND-SERVICES.md §3, GM-04 | Fri 21–Sat 00 | offline mode returns buttons; no key in the client bundle |
| N-07 | Demo-path Playwright spec (desktop 1440×900) | GAME-DESIGN.md §9 | Sat 08–10 | green against the local production build |
| N-08 | Return banner (local, no backend) | NOTIFICATION-DESIGN.md, GM-27 | Sat 10–11 | banner resumes the game after reload |
| N-09 | AI-CFO G15 and bank advisor G16 | GM-09, GM-10 | Sat 11–13 | hint shows 2 options with engine cost; loan is a non-bank SMS |
| N-10 | Loaders G25–G28, settings G24 | GM-22, GM-23 | Sat 13–16 | save failure shown honestly; settings persist |
| N-11 | PWA service worker, opt-in G34, `/api/push/demo` (30 s) | BACKEND-SERVICES.md §4, D-14 | Sat 16–20 | demo reminder arrives in Chrome; banner still works without push |
| N-12 | e2e for 4 crews and mobile landscape | DEMO-REQUIREMENTS.md | Sat 20–22 | spec green in 4 variants |

### Pitch (shared, led by Person C, all three present)

| Id | Task | Window | Acceptance |
|---|---|---|---|
| P-01 | Confirm scope against the challenge card; mentor questions | Fri 11–12 | scope list agreed in the team chat |
| P-02 | Deck from PITCH.md, 90 s live demo window | Sat 12–16 | deck matches the built app |
| P-03 | Rehearsals, backup recording, offline drill on two laptops | Sat 22, Sun 07, Sun 09 | 3 runs under 3:00 |
| P-04 | Submission | Sun before 10:00 | repository link and materials sent |

## 6. Checkpoints

| When | Check | If not met |
|---|---|---|
| Fri 22:00 | engine ET cases for forecast, cards and turns green; U shows G10 + G13 on fixtures; N strings + voice player done | move SHOULDs out; pair on the blocker |
| **Sat 12:00** | **demo path 1–7 clickable end to end on the local production build** | switch to the U-12 fallback, cut SHOULDs in §7 order |
| Sat 23:00 | feature freeze | only fixes after this |
| Sun 08:00 | code freeze; local builds on two laptops | present from the backup recording |

## 7. Cut order (drop in this order when late)

1. Account screens G01–G04 (COULD).
2. Level 2, achievements G21, settings beyond mute/captions.
3. Web Push (keep the return banner), dynamic TTS, the second narrator voice.
4. Mobile landscape (keep desktop).
5. Animated world route → static island background with week cards (U-12).

Never cut: engine numbers, Cash Flow, failure with rewind, plan with validation, captions.

## 8. Rules for agents working in a lane

- Build from this specification and `design/` contracts; no code from outside this repository.
- Stay in your lane's paths (§3); anything else is a message to its owner.
- Every number shown to the player comes from the engine; generated text passes the guardrail.
- Synthetic data only; the game never favours a bank product and labels the factoring card as a scenario.
- Every AI feature has a deterministic fallback; tests never call a real LLM API.
- Finish a task only with its acceptance check green, then commit with one topic.

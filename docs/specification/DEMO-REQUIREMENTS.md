---
answers: >-
  What exactly the 48 h build of the Pilot Płynności web game must do: MoSCoW stories with acceptance criteria, mapped to the approved game views G01–G32, plus the fallback and the demo click-path.
excludes: >-
  Rules and numbers (GAME-DESIGN.md), look, story and voice (GAME-EXPERIENCE-AND-NARRATION.md), architecture (ARCHITECTURE.md), build order and cut lines (BUILD-PLAN.md).
status: current
updated: 2026-11-16
---

# Demo requirements

The demo is the illustrated web game (D-04, D-05, D-08, D-10) over the deterministic engine. Numbers in acceptance criteria come from GAME-DESIGN.md §6 ("per §6" = to the złoty). View ids G01–G32 are the approved concept boards in `design/concept/` (index in GAME-EXPERIENCE-AND-NARRATION.md §6). Two clocks: game clock 23 XI → 10 I; account clock starts 21 XI (time travel moves only the account clock).

## MUST — the 90-second demo path, on the pitch laptop, offline-capable

| Id | Story | View | Acceptance |
|---|---|---|---|
| GM-02 | Engine + forecast + turns | — | Ledger reproduced to the złoty; week-end balances with no action 33 700 · 41 080 · 25 380 · 31 705 · then crash 22 XII (short 8 095) in the demo seed; Vitest green for every row of GAME-DESIGN §6.1, §6.2, §6.5 and the PAPER-PLAYTEST-L1 §6 key |
| GM-17 | Intro + character selection | G05–G08 | Boss greets (≤ 4 beats, skippable), player woman/man and Szef/Szefowa chosen independently with a visible default, all 4 combinations render grammatically correct copy; ends on the first decision |
| GM-08 | Campaign map | G09 | Level 1 active; levels 2–4 in fog; level 2 unlocks at lap completion with ≥ 1 star |
| GM-01 | World route board | G10 | 7 week islands 23 XI … 4 I, finish 10 I; markers 25 XI, 21 XII, 28 XII; storm on 28 XII „−12 395 zł”; HUD 38 000 zł · 42 dni · Odporność „—” · Relacje 5/5 · 0 zł; „Dane syntetyczne” visible; all text live (none from art) |
| GM-05 | Event cards (demo seed) | G11 | T1, T2, T3, T5 (only while the gap is open), T6 in their weeks; each choice applies its effect per §6.2; „Zapłać jak jest” leads to the fraud crash on 8 I |
| GM-03 | Six action cards + preview | G13, G29 | Cards 1–6 per §6.1 incl. factoring (D-11); selecting shows a non-committing preview and the low + cost; playing resolves per §6.1; disabled states say why (too late, invoice already financed/paid); keys 1–6 |
| GM-04 | Negotiation with Klient A | G14 | Quick replies and free text; 50 % → counter 30 % (15 000 zł by 3 XII); T1–T2 only; outcome from the rules table; LLM text passes the number guardrail else cached line; works offline |
| GM-19 | Cash Flow drilldown (Alan, D-09) | G12, G30, G32 | Opens from any week node and from „Pokaż przepływy”; dates on x, zł on y, zero line; baseline vs preview vs committed; transaction list for the selected date; 28 XII shows −12 395 → +2 605 after the advance; counterfactual after a crash labelled „Prognoza bez działania”; never spends the week; focus returns on close |
| GM-18 | Boss reactions | G05, G17–G19 | Engine events trigger portrait + bubble with the emotion of GAME-EXPERIENCE §5 (≥ delighted, suspicious, exasperated, supportive), rate-limited, never covering cards or the primary action |
| US-04 | Week resolution + lesson | G17 | Week's transactions, balance change, one lesson line; numbers only from the engine |
| GM-06 | Failure + rewind | G19, G20 | „Przelew nie wystartował”: cause, date, shortfall (22 XII, 8 095 zł in the no-action path); Boss reaction then „Cofnij czas”; rewind restores the chosen week exactly |
| GM-07 | Lap success | G18 | ★ Przetrwanie and ★ Tanio final, ☆ Pilot pending until the plan is saved; avoided cost vs the loan (advance 2 400 zł) |
| US-06 | Save the plan | G22 | „Zaliczka 15 000 zł ±10% od Klienta A do 4 grudnia”; saving turns on ★ Pilot |
| US-07 | Validation on the synthetic account | G23 | „Przewiń czas o 2 tygodnie”: account clock 21 XI → 5 XII, plan met, „Luka 28 grudnia zamknięta”, Luka płynnościowa → 3; does not unlock levels |
| GM-20 | Voice (pre-rendered) | G05, G17–G19, G27 | Every scripted demo-path line has pre-rendered ElevenLabs audio for the pitch narrator; captions always; mute/skip/replay; audio starts after a user gesture; missing audio → captions without delay |
| US-08 | Reset | G24 | Restores both clocks, the seed and the pitch defaults; clears `localStorage` |
| GM-15 | Desktop pitch layout | all above | 1440×900 and 1280×800 in Chrome and Safari; first load < 2 s from the deployed build; local build works without network |

## SHOULD

| Id | Story | View | Acceptance |
|---|---|---|---|
| GM-09 | AI-CFO hint / delegate | G15 | 1 hint per week (risk + 2 options with engine cost); delegate plays the cheapest valid action; competence 1 vs 2 |
| GM-10 | Doradca banku: overdraft + loan-cost reveal | G16 | Overdraft only by end of T3, cost ≈ 194 zł labelled „szacunek”; the non-bank loan is shown as an SMS offer with full repayment 17 400 zł — **never offered by the bank advisor** |
| GM-16 | Mobile landscape | all MUST views | 844×390 (and 812×375, 932×430) without horizontal scroll; 44 px targets; card tray; Cash Flow as a sheet; portrait shows the rotate prompt with reachable help |
| GM-21 | Both narrator voices + dynamic TTS | G05, G14, G27 | All scripted lines pre-rendered for Szef and Szefowa; negotiation replies via `/api/tts` with captions first and discard of late audio |
| GM-22 | Loaders and recovery | G25–G28 | Initial load, between weeks, AI wait, voice wait, save failure and offline states per GAME-EXPERIENCE §9; no fake percentages or artificial delays |
| GM-23 | Settings / pause | G24 | Change player and narrator without reset, voice volume, captions, reduced motion, narrator chattiness, resume |
| GM-24 | Achievements shelf | G21 | Nicknames tied to real competence milestones with their conditions |
| GM-11 | Level 2, 3 weeks | — | Hire scenario: cost ≈ 120 % of gross, payroll 10th, ZUS 15th |

## COULD

GM-25 account screens G01–G04 as front-end only (guest entry works; create / recover / logout static, no credentials stored) · GM-26 press-to-talk voice negotiation · GM-12 booth mode (60 s lap, QR) · GM-13 level 3 teaser · GM-14 random seed · US-11 language mode (A-1) · US-15 EN switch.

## WON'T (48 h)

Real authentication and cloud save, bank integration, real factoring or overdraft terms, native or Electron apps, multiplayer or a server leaderboard, levels 3–4 playable.

## Fallback (hour-18 checkpoint)

If the world route (GM-01) is not working on the deployed build at hour 18: the same engine and scenes run with the island art as a static background and the weeks as a vertical list of week cards; characters, dialogue, Cash Flow and stars stay. If voice is not ready at hour 34: captions only, the narrator still reacts visually.

## Demo click-path (≈ 90 s, pitch 0:45–2:15, `/gra/1?seed=demo`)

As GAME-DESIGN.md §9: Boss greeting → map → December route with the storm → white-list check → negotiation 50 % → 30 % → Cash Flow on 28 XII (−12 395 → +2 605) → weeks to the lap end (9 985 zł) → summary ★★ + pending Pilot, „Unikasz 2 400 zł” → save plan ★★★, level 2 unlocks → account time travel 21 XI → 5 XII, competence 3. Rehearse three times with a stopwatch; keep a screen recording as backup.

## Added 2026-11-16 — reminders (D-13)

| Id | Priority | Story | View | Acceptance |
|---|---|---|---|---|
| GM-27 | SHOULD (OD-6) | Reminder to the next move | map, G18, settings G24 | After the first lap the player is offered reminders (opt-in, per category); „Przypomnij mi” subscribes Web Push via `/api/push/subscribe`; the demo reminder arrives after 30 s in the narrator's voice with the N-01 text and opens `/gra/1?resume=T…`; an in-app banner greets a returning player („Tydzień N czeka”); quiet hours, caps and no product mention per BACKEND-SERVICES §4.1; works without push (banner only) |
| GM-28 | COULD | Real reminder delays | — | cron tick + worker send N-01 (+20 h) and N-02 (+2 h) with relevance re-check and idempotency |

**Update D-14 (2026-11-16): GM-27 is MUST.** The demo shows the reminder loop: after saving the plan the player taps „Przypomnij mi” (opt-in), the demo reminder arrives on stage after 30 s in Szefowa's voice with the N-01 text, and opening it shows the return banner and resumes the game. **Fallback:** if Web Push is blocked on the venue setup (permissions, network), the presenter shows the in-app return banner only; the demo never waits for the push. Demo path step 8: „Przypomnij mi” → push arrives during the bank-value slide → click → banner „Tydzień N czeka” (GAME-DESIGN §9). Acceptance adds: works on the pitch laptop in Chrome from the deployed build; VAPID keys provisioned before the event; push tested at the venue at hour 34.

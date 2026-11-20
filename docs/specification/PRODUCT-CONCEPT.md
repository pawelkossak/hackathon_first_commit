---
answers: >-
  What product we build for Finance Quest (Pilot Płynności / Liquidity Pilot), what in the owner's concept v2 holds, what must change before the event, and why.
excludes: >-
  Technical design (ARCHITECTURE.md), demo backlog (DEMO-REQUIREMENTS.md), dataset numbers (SYNTHETIC-DATA.md), game design (GAME-DESIGN.md).
status: current
updated: 2026-11-16
---

# Product concept — Pilot Płynności (Liquidity Pilot)

**Pitch language: Polish (D-02).** Demo UI in Polish; English switch optional. **Platform: web game (D-03).** **The demo is the game „Lot przez rok firmy” (D-04)** — the simulator of v2 is its engine.

## 1. The concept in one paragraph

A flight simulator for an entrepreneur's financial decisions, played as a quest. The user plays their own firm's calendar week by week (the game), tests "what happens if…" on their own account data, chooses an action or negotiates with an AI counterparty, saves the winning decision as a checkable action plan, and the app validates it on the real account and turns the result into a lesson and a stronger competence. Learning is a side effect; coming back is a habit. Thesis for the pitch: *„Przedsiębiorcy nie potrzebują kursów. Potrzebują bezpiecznego poligonu.”*

## 2. What holds (keep as is)

| Element | Why it is strong |
|---|---|
| Positioning: decision simulator, not a cash-flow tool | Answers the jury's first objection; builds on mBank's mOrganizer Finansów instead of duplicating it (mBank is in the Commerzbank group) |
| Closed loop: stimulus → simulation → decision → plan → validation → lesson | The only element that credibly proves "continuously improve" (E-05) |
| Deterministic engine computes, AI only explains | No invented amounts; easy answer to "does AI predict my balance?" |
| Avoided cost of mistake, in PLN | A learning metric a banker understands |
| Competence map earned by actions, not quizzes | Visible learning (E-01) without gamification clichés |
| Ethics of recommendations (§8.7) | Defuses "hidden sales funnel" |
| "Time travel" button in the demo | Makes weeks of validation visible in seconds |
| MoSCoW, synthetic data | Realistic for 48 h |

## 3. Required corrections (factual, before the pitch)

1. **Polish tax calendar.** The dip "9 December: VAT payment" is wrong: VAT is due by the 25th of the following month, PIT advance and ZUS (sole proprietor) by the 20th. In 2026: ZUS/PIT 20 Dec is a Sunday → 21 Dec; VAT 25 Dec is a holiday → 28 Dec. A banker on the jury will notice. Proposed dip: **28 December 2026** (VAT for November) after ZUS + PIT on 21 Dec, with the big client's invoice late the same week. See SYNTHETIC-DATA.md.
2. **Numbers must be engine outputs.** 64/100, "+6 points", 42 days, −12 400 zł must come out of the engine on the dataset, not be typed into slides. Runway 38 000 / 27 000 × 30 ≈ 42 days is consistent; the score and its "+6" depend on the weights in §8.5 and must be calibrated in the dataset (SYNTHETIC-DATA.md §4).
3. **First employee changes the ZUS date** (from the 20th to the 15th) and adds payroll on the 10th. A nice teaching moment for the "hire" scenario — build it in (game level 2).
4. **Employer cost ≈ 120 % of gross** — keep "about", it varies (≈ 120.5 % incl. accident insurance rate).

## 4. Proposed additions

| # | Addition | Why | Cost in 48 h |
|---|---|---|---|
| A-1 [proposal] | **"All generations" angle**: same simulator, language level adapts — "first business" mode (Gen Z founder: plain words, explains terms on tap) and "experienced owner" mode (short, numbers first); a scenario **"handing the firm to the next generation"** as a vision slide (game level 4) | The event theme is "Innovations for all generations" (E-07); the concept does not address it at all. The 2025 winner was an accessibility project | Low: one AI prompt parameter + one toggle |
| A-2 [proposal] | **Ask by voice or free text**: "czy stać mnie na drugi samochód?" → ready scenario | Already in §8.6; makes "actively seek out" tangible and accessible. In the game: free text in the agent chat (GM-04) | Low-medium (browser speech API, pl-PL) |
| A-3 | ~~English UI + English pitch~~ **Decided (D-02): Polish pitch and UI.** Keep UI strings in one file so an EN switch stays possible (COULD US-15); one English summary slide in the backup if the jury is mixed | — | None |
| A-4 [proposal] | Product name: **„Pilot Płynności”**, tagline **„Ucz się na błędach w symulatorze, a nie na własnym koncie.”** ("Liquidity Pilot" only in English materials); game title „Lot przez rok firmy” | One consistent name across slide, UI and repo | None |
| A-5 [proposal] | **Uncertainty band** on the forecast chart (late-payment range) | Concept §8.8 promises it; visually it also reads "simulator", not "accounting" | Low |
| A-6 [proposal] | Commerzbank angle on the bank-value slide: same layer fits Commerzbank's German SME clients (Mittelstand), not only mBank | Jury is Commerzbank; "may be developed after the event" (E-08) | None (slide) |
| A-7 | **Decided (D-04): the quest layer is the demo.** Agentic board game „Lot przez rok firmy” over the same engine — board = the firm's calendar (weeks, real tax dates), event and action cards with contemporary challenges, AI agents as counterparties (Klient A, bank advisor) and as the player's copilot (AI-CFO), levels that unlock (Płynność → Pierwszy pracownik → Rozwój i inwestycje → Następne pokolenie), stars, rewind; the winning decision becomes a real action plan validated on the account. Design: GAME-DESIGN.md; stories: DEMO-REQUIREMENTS.md | The challenge is called *Finance Quest*; v2 alone was a simulator without a quest (G-14, closed) | Medium-high: reuses engine, chart, plans; new turn engine, board, agent rules; fallback = week cards over the cockpit |

## 5. What we deliberately do not do

Not bookkeeping, not invoicing, not a new forecast product, not a course with quizzes, not a casino-style game, not a product sales channel. Not a bank integration in 48 h (synthetic data, integration described as next step).

## 6. Persona

Ania, sole proprietor, graphic design studio, considering her first hire. Balance 38 000 zł; fixed costs 27 000 zł / month; 3 regular clients, the largest = 55 % of revenue, pays after 60 days. Full dataset: SYNTHETIC-DATA.md.

## 7. Pitch skeleton (3 min, in Polish)

| Time | Part | Content (PL, as spoken) |
|---|---|---|
| 0:00–0:45 | Problem | „87% polskich firm czeka na spóźnione przelewy. Ania widzi na koncie 38 000 zł i czuje się bezpiecznie. Za pięć tygodni nie będzie miała na VAT. Kursy jej nie pomogły, bo przyszły w złym momencie. Przedsiębiorcy nie potrzebują kursów. Potrzebują bezpiecznego poligonu.” |
| 0:45–2:15 | Demo na żywo (DEMO-REQUIREMENTS.md, click-path) | Mapa poziomów → plansza grudnia Ani, turbulencje 28 grudnia −12 395 zł → karta „nowy numer konta” i biała lista → negocjacja z agentem Klienta A: „50%?” — „30%, 15 000 zł” → linia na radarze zielona → kolejne tygodnie → turbulencje przelecone, „unikasz 2 400 zł” → zapis planu, ★★★ → odblokowany poziom 2 → „przewiń czas o 2 tygodnie”: zaliczka wpłynęła na prawdziwe konto, kompetencja „Luka płynnościowa” na poziomie 3. „Ania przeszła grudzień w grze, zanim przeszła go na koncie.” |
| 2:15–3:00 | Wartość dla banku | „Bankowość kontekstowa zamiast banerów, niższe ryzyko portfela, codzienne zaangażowanie. Budujemy na tym, co bank już ma — i dodajemy to, czego brakuje: naukę przez decyzje. Dla przedsiębiorców każdego pokolenia.” |

Rule: only numbers we can defend; persona data called synthetic; market statistics only with a source (MARKET-AND-ALTERNATIVES.md §1).

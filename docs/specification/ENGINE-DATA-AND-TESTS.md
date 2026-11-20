---
answers: >-
  What exactly goes into the engine's data files for level 1 (persona.json, level1.json, agents.json, future-script.json, reactions.json) and which Vitest cases the engine must pass, with expected values computed by one reference model of the rules.
excludes: >-
  Why the rules are as they are (GAME-DESIGN.md), the look and the narrator's lines (GAME-EXPERIENCE-AND-NARRATION.md, the design team's copy and voice decks), the code itself (written at the event, D-01).
status: current
updated: 2026-11-16
---

# Engine data and tests — level 1 „Przetrwaj grudzień”

## 1. Global rules (engine constants)

| Rule | Value |
|---|---|
| Opening | balance 38 000 on 21 XI (account "today"); lap = 7 weeks, Mon 23 XI → Sun 10 I 2027 |
| Weeks | T1 23–29 XI · T2 30 XI–6 XII · T3 7–13 XII · T4 14–20 XII · T5 21–27 XII · T6 28 XII–3 I · T7 4–10 I |
| Same-day order (U-10) | on one date, inflows are booked before outflows |
| Business days (U-12) | an inflow or obligation landing on a weekend or holiday (24, 25, 26 XII, 1 I, 6 I) moves to the next business day |
| Crash | first transaction after which balance < −(available overdraft); lap stops; record date, transaction id and shortfall = −limit − balance; a crashed week has no week-end balance |
| Runway (Paliwo) | floor(balance / 900) days (27 000 / 30); start 42 |
| Relacje | start 5; postponement −2; rude message −1 |
| Cost of money | sum of card costs in the lap (discount 406, overdraft 150 + interest, loan 2 400, factoring 304) |
| Overdraft interest | round(Σ over days 21 XI…10 I of max(0, −end-of-day balance) × 0.12 / 365); not posted to the balance inside the lap |
| Avoided cost | 2 400 − cost of money (only for a lap without crash) |
| Demo seed | events T1, T2, T3, T5 (conditional), T6 (forced) as in §3.3 |

## 2. persona.json

### 2.1 Counterparties

| id | name | type | note |
|---|---|---|---|
| A | Klient A (agency) | client | 55 % of revenue, 60 days + delay; invoice INV-A1 |
| B | Klient B | client | 25 %, 14 days |
| C | Klient C | client | 20 %, 30 days |
| S1 | Podwykonawcy (2 freelancers) | supplier | on delivery |
| S2 | Podwykonawca zlecenia Klienta C | supplier | only after event E2 „Przyjmij” |
| O | Biuro, narzędzia, księgowa, leasing | supplier | monthly |
| US | Urząd skarbowy | public | VAT, PIT |
| ZUS | ZUS | public | |
| BANK | Bank (overdraft, factoring) | bank | factoring card title per D-09 |
| N | Firma pożyczkowa | non-bank lender | SMS loan, never the bank |

### 2.2 Ledger (21 XI 2026 → 8 I 2027)

| id | date | amount | counterparty | title | kind |
|---|---|---|---|---|---|
| L01 | 25 XI | −4 300 | US | VAT za październik | obligation |
| L02 | 30 XI | +7 380 | C | Klient C, faktura październikowa | receivable |
| L03 | 7 XII | −12 800 | S1 | Stali podwykonawcy | recurring |
| L04 | 10 XII | −2 900 | O | Czynsz + księgowa | recurring |
| L05 | 14 XII | +9 225 | B | Klient B, faktura listopadowa | receivable |
| L06 | 15 XII | −2 900 | O | Leasing auta, narzędzia, telefon | recurring |
| L07 | 21 XII | −4 100 | ZUS/US | ZUS + zaliczka PIT (20 XII is Sunday) | obligation |
| L08 | 22 XII | −35 700 | S1 | Podwykonawcy projektu Klienta A | committed |
| L09 | 28 XII | −4 300 | US | VAT za listopad (25 XII holiday) | obligation |
| L10 | 30 XII | +7 380 | C | Klient C, faktura listopadowa | receivable |
| L11 | 8 I 2027 | +20 295 | A | Klient A, faktura INV-A1 | receivable (late) |

Invoice INV-A1: Klient A, gross 20 295, expected 8 I 2027 (moved to 22 I 2027 by event E6), state `pending | discounted | factored | paid`.

## 3. level1.json

### 3.1 Action cards (one per week, each once per lap; keys 1–6)

| id | key | title (PL) | window | eligibility | effect (ForecastEvents) | cost | relations | competence (own / delegated) |
|---|---|---|---|---|---|---|---|---|
| C1 | 1 | Poproś o zaliczkę | T1–T2 | via negotiation with Klient A (agents §4.1) | +15 000 on 3 XII, cp A, title „Zaliczka 30% projekt rebranding” | 0 | = | Luka płynnościowa 2 / 1 |
| C2 | 2 | Zaproponuj skonto 2% | T1–T5 (T5 = "too late" state, still playable) | INV-A1 `pending` | remove L11; +19 889 on offer date + 3 calendar days, offer = Tuesday of the week, U-12 shift (T1 27 XI, T2 4 XII, T3 11 XII, T4 18 XII, T5 28 XII); INV-A1 → `discounted` | 406 | = | Koszt pieniądza 2 / 1 |
| C3 | 3 | Przesuń płatność podwykonawcom | T1–T4 | L08 not yet paid | L08 date → 8 I 2027 | 0 | −2 | Luka płynnościowa 2 / 1 |
| C4 | 4 | Limit w koncie 15 000 zł | T1–T3 | not yet active | available overdraft 15 000 for the rest of the lap | 150 + interest (§1) | = | none (product) |
| C5 | 5 | Pożyczka w 15 minut | T1–T5 | before L08 is booked | +15 000 on Monday of the week (T1 23 XI … T5 21 XII), cp N; −17 400 on 20 I 2027 (outside the lap) | 2 400 | = | none (product) |
| C6 | 6 | Faktoring ekspresowy mBank | T1–T5 | INV-A1 `pending` | remove L11; +19 991 on Tuesday of the week (next business day after the Monday request: 24 XI, 1 XII, 8 XII, 15 XII, 22 XII), cp BANK; INV-A1 → `factored` | 304 (= round(1.5 % × 20 295)) | = | none (product) |

Exclusivity: C2 ↔ C6 (same invoice, U-11). Disabled-state reasons: „Za późno — budżet klienta zamknięty” (C1 from T3), „Bank nie zdąży przed 22 grudnia” (C4 from T4), „Faktura już sfinansowana” / „Faktura już opłacona” (C2/C6), „Już zagrana w tym okrążeniu”.

### 3.2 Card labels (fixed, shown on the card)

C4 „szacunek”; C6 „Koszt: 1,5%”, „Założenie scenariusza”, „Dane syntetyczne”; every money screen „Dane syntetyczne”.

### 3.3 Event cards (demo seed)

| id | week | condition | choices → effect | competence |
|---|---|---|---|---|
| E1 | T1 | always | `check` („Sprawdź na białej liście i zadzwoń”) → none · `pay_as_is` („Zapłać jak jest”) → +reveal on 23 XII, −35 700 on 8 I 2027 (cp S1, „Ponowna zapłata podwykonawcom”) | Bezpieczne płatności: check own 2, delegated 1; pay_as_is 0 |
| E2 | T2 | always | `accept` → −3 000 on 14 XII (cp S2); +7 380 on 29 I 2027 (outside) · `decline` → none | — |
| E3 | T3 | always | `now` → −400 on 15 XII (and monthly after the lap) · `january` → none | — |
| E5 | T5 | gap open (the forecast from the current state still crashes) | `show_cost` → reveals C5 terms · `ignore` → none; C5 stays playable | Koszt pieniądza 1 on `show_cost` |
| E6 | T6 | forced | INV-A1 `pending` → L11 moved to 22 I 2027 (outside the lap); otherwise no effect | — |

### 3.4 Stars and unlock

| Star | Condition |
|---|---|
| Przetrwanie | lap completed without crash |
| Tanio | cost of money ≤ 500 and Relacje = 5 |
| Pilot | lowest own balance ≥ 0 over the lap **and** a played decision saved as the plan (pending until then) |
| Unlock level 2 | lap completed with ≥ 1 star |

Products (C4, C5, C6) never raise a competence. Competence levels are milestones 0–3, never above 3.

## 4. agents.json

### 4.1 Klient A (max 3 messages per turn)

| intent | week | condition | outcome | line id |
|---|---|---|---|---|
| ask_advance(p ≤ 30) | T1–T2 | — | accept: C1 effect | `a.advance.accept` |
| ask_advance(p > 30) | T1–T2 | — | counter 30 % (15 000 by 3 XII), awaiting accept | `a.advance.counter` |
| accept_counter | T1–T2 | counter pending | C1 effect | `a.advance.accept` |
| ask_advance(any) | T3+ | — | refuse | `a.advance.closed` |
| offer_discount(2 %) | T1–T5 | INV-A1 pending | C2 effect | `a.discount.accept` |
| rude / threat | any | — | refuse, Relacje −1 | `a.rude` |
| unknown / timeout | any | — | show quick replies | `a.fallback` |

### 4.2 Doradca banku

| intent | week | outcome | line id |
|---|---|---|---|
| ask_overdraft | T1–T3 | C4 effect, show cost formula | `bank.od.offer` |
| ask_overdraft | T4+ | refuse („Na ten scenariusz jest już za późno.”) | `bank.od.late` |
| ask_overdraft | gap already closed | inform not needed, allow anyway | `bank.od.notneeded` |
| — | any | the bank never offers C5 | — |

### 4.3 AI-CFO hint (computed, 1 per week)

Risk = earliest future crash (date, transaction, shortfall) in the current forecast; options = the two cheapest playable cards that remove it, with their engine cost. Delegate = play the cheapest such card → competence level 1 for that card's competence.

## 5. future-script.json (account clock)

| account clock | transactions replayed | expected |
|---|---|---|
| 21 XI → 5 XII (+2 weeks) | L01 25 XI −4 300 · L02 30 XI +7 380 · 3 XII +15 000 from Klient A „Zaliczka 30% projekt rebranding” (only if C1 was played) | account balance 5 XII: 56 080 with C1, 41 080 without; plan „Klient A, 15 000 ±10 %, by 4 XII, inflow” → `met` with C1, `missed` without (variant B offered) |

Plans from other cards keep status `open` (their deadline is after 5 XII). The account clock never changes the game state, stars or unlock.

## 6. reactions.json (engine events → narrator)

| engine event | emotion | line id prefix (the design team A7) |
|---|---|---|
| lapStart (also after `rewind` to week 1) / playerReturns | welcoming | `rx.welcome` |
| bigProject (E2 shown) | excited | `rx.project` |
| negotiationOpen | confident | `rx.negotiate` |
| lateClient (E6) | suspicious | `rx.late` |
| loanOffered (E5, C5 preview) | suspicious | `rx.loan` |
| fraudRevealed (E1 „Zapłać jak jest”: the 22 XII payment is reported as fraud on 23 XII; emitted by the week resolution that passes 23 XII, unless the lap crashed before it) | exasperated | `rx.fraud` |
| goodMove (crash removed by own action) | proud | `rx.goodmove` |
| crash | exasperated → supportive | `rx.crash`, then `rx.rewind` |
| quietWeek | relaxed | `rx.quiet` |
| lapWon | delighted | `rx.win` |
| planValidated | delighted | `rx.validated` |

Cooldown: at most one reaction per week resolution; a new scene cancels the previous line.

## 7. Engine test cases (Vitest)

Notation: week-end balances T1…T7 ("—" = no week-end, lap stopped); demo seed with safe event choices (E1 check, E2 decline, E3 january) unless stated.

### 7.1 Forecast, ordering, crash

| id | setup | expected |
|---|---|---|
| ET-F01 | no action, E6 off (ledger as written) | 33 700 · 41 080 · 25 380 · 31 705 · —; crash 22 XII at L08, short 8 095; counterfactual low −12 395 on 28 XII, counterfactual end 15 280 |
| ET-F02 | no action, demo seed | same crash 22 XII, short 8 095; counterfactual end −5 015 |
| ET-F03 | runway at start | 42 |
| ET-F04 | same-day order: C6 in T5 (+19 991 and −35 700 both 22 XII) | no crash; T5 end 11 896 |
| ET-F05 | business-day shift: C2 offered in T5 | money 28 XII (25 XII holiday); crash still 22 XII, short 8 095 |
| ET-F06 | every point decomposes into its transactions | sum of listed transactions for 28 XII equals the balance change |

### 7.2 Cards

| id | setup | week-ends T1…T7 | low | crash | cost | Relacje | stars after plan |
|---|---|---|---|---|---|---|---|
| ET-C01 | C1 in T1 | 33 700 · 56 080 · 40 380 · 46 705 · 6 905 · 9 985 · 9 985 | +2 605 (28 XII) | — | 0 | 5 | ★★★ |
| ET-C02 | C1 in T2 | same as ET-C01 | +2 605 | — | 0 | 5 | ★★★ |
| ET-C03 | C2 in T1 | 53 589 · 60 969 · 45 269 · 51 594 · 11 794 · 14 874 · 14 874 | +7 494 | — | 406 | 5 | ★★★ |
| ET-C04 | C2 in T4 | 33 700 · 41 080 · 25 380 · 51 594 · 11 794 · 14 874 · 14 874 | +7 494 | — | 406 | 5 | ★★★ |
| ET-C05 | C2 in T5 | 33 700 · 41 080 · 25 380 · 31 705 · — | — | 22 XII, short 8 095 | 406 | 5 | — |
| ET-C06 | C3 (demo seed) | 33 700 · 41 080 · 25 380 · 31 705 · 27 605 · 30 685 · — | — | 8 I, short 5 015 | 0 | 3 | — |
| ET-C07 | C3, E6 off | 33 700 · 41 080 · 25 380 · 31 705 · 27 605 · 30 685 · 15 280 | +15 280 (8 I) | — | 0 | 3 | ★★ (Przetrwanie, Pilot) |
| ET-C08 | C4 (demo seed) | 33 700 · 41 080 · 25 380 · 31 705 · −8 095 · −5 015 · −5 015 | −12 395 inside limit | — | 194 (44 interest + 150) | 5 | ★★ (Przetrwanie, Tanio) |
| ET-C09 | C4, E6 off | … · −8 095 · −5 015 · 15 280 | −12 395 | — | 189 (39 + 150) | 5 | ★★ |
| ET-C10 | C5 in T5 | 33 700 · 41 080 · 25 380 · 31 705 · 6 905 · 9 985 · 9 985 | +2 605 | — | 2 400 | 5 | ★★ (Przetrwanie, Pilot); ★ without plan |
| ET-C11 | C5 in T1 | 48 700 · 56 080 · 40 380 · 46 705 · 6 905 · 9 985 · 9 985 | +2 605 | — | 2 400 | 5 | ★★ |
| ET-C12 | C6 in T1 | 53 691 · 61 071 · 45 371 · 51 696 · 11 896 · 14 976 · 14 976 | +7 596 | — | 304 | 5 | ★★★ |
| ET-C13 | C6 in T4 | 33 700 · 41 080 · 25 380 · 51 696 · 11 896 · 14 976 · 14 976 | +7 596 | — | 304 | 5 | ★★★ |
| ET-C14 | C6 in T5 | 33 700 · 41 080 · 25 380 · 31 705 · 11 896 · 14 976 · 14 976 | +7 596 | — | 304 | 5 | ★★★ |
| ET-C15 | eligibility | C1 disabled from T3; C4 disabled from T4; C2 disabled after C6 and vice versa; any card disabled after being played; C5 disabled after 22 XII | | | | | |
| ET-C16 | factoring fee | round(0.015 × 20 295) = 304; payout 19 991 | | | | | |
| ET-C17 | avoided cost | C1 2 400 · C2 1 994 · C6 2 096 · C4 2 206 (demo seed) · C5 0 | | | | | |

### 7.3 Events

| id | setup | expected |
|---|---|---|
| ET-E01 | E1 pay_as_is, no card | crash 22 XII at L08, short 8 095 (before the fraud matters) |
| ET-E02 | E1 pay_as_is + C1 | week-ends … 6 905 · 9 985 · —; crash 8 I at E1, short 25 715 |
| ET-E03 | E1 pay_as_is + C1 + C2 in T4 | crash 8 I at E1, short 5 826 |
| ET-E04 | E2 accept, no card | crash 22 XII, short 11 095 |
| ET-E05 | E2 accept + C1 | 33 700 · 56 080 · 40 380 · 43 705 · 3 905 · —; crash 28 XII at L09, short 395 |
| ET-E06 | E3 now + C1 | … 46 305 · 6 505 · 9 585 · 9 585; low +2 205 |
| ET-E07 | E5 condition | shown when no card played by T5; hidden after C1, C2 (T1–T4), C3, C4 or C6 |
| ET-E08 | E6 after C2 or C6 | no effect (INV-A1 not pending) |
| ET-E09 | E1 check | Bezpieczne płatności = 2; delegated check = 1 |

### 7.4 Combinations (U-2)

| id | setup | week-ends T1…T7 | low | cost | stars after plan |
|---|---|---|---|---|---|
| ET-X01 | C1 + C2 (T4) | 33 700 · 56 080 · 40 380 · 66 594 · 26 794 · 29 874 · 29 874 | +22 494 | 406 | ★★★ |
| ET-X02 | C1 + C6 (T4) | 33 700 · 56 080 · 40 380 · 66 696 · 26 896 · 29 976 · 29 976 | +22 596 | 304 | ★★★ |
| ET-X03 | C1 + E2 accept + C2 (T4) | … 63 594 · 23 794 · 26 874 · 26 874 | +19 494 | 406 | ★★★ |
| ET-X04 | C1 + E2 accept + C6 (T4) | … 63 696 · 23 896 · 26 976 · 26 976 | +19 596 | 304 | ★★★ |
| ET-X05 | C1 + E2 accept + C4 | … 43 705 · 3 905 · 6 985 · 6 985 | −395 inside limit | 150 | ★★ (Przetrwanie, Tanio) |
| ET-X06 | C1 + C3 (T3) | … 46 705 · 42 605 · 45 685 · 9 985 | +9 985 (8 I) | 0, Relacje 3 | ★★ (Przetrwanie, Pilot) |
| ET-X07 | C1 + C5 (T5) | … 46 705 · 21 905 · 24 985 · 24 985 | +17 605 | 2 400 | ★★ (Przetrwanie, Pilot) |

### 7.5 Stars, competences, unlock

| id | expected |
|---|---|
| ET-S01 | after ET-C01 lap end: Przetrwanie ✓, Tanio ✓, Pilot pending; after plan save Pilot ✓ |
| ET-S02 | level 2 unlocked at lap end in every non-crash path; not unlocked after a crash |
| ET-S03 | C4, C5, C6 never change any competence |
| ET-S04 | competence never exceeds 3; repeated awards keep the maximum |
| ET-S05 | demo path: Bezpieczne płatności 2, Luka płynnościowa 2 at lap end, 3 after validation |

### 7.6 Agents

| id | input | expected |
|---|---|---|
| ET-A01 | T1 „50% zaliczki?” | counter 30 %, no effect until accept |
| ET-A02 | accept counter | C1 effect, card C1 marked played (counts as the week's action) |
| ET-A03 | T3 any advance | refuse, no effect |
| ET-A04 | rude message | refuse, Relacje 4 |
| ET-A05 | 4th message in a turn | blocked, quick replies only |
| ET-A06 | LLM reply contains a number not in the engine result | cached line used |
| ET-A07 | bank asked in T4 | refuse, C4 not applied |

### 7.7 Plan, account clock, rewind, seed, reset

| id | expected |
|---|---|
| ET-M01 | C1 path, plan saved, account clock +2 weeks → 5 XII, balance 56 080, plan `met`, Luka płynnościowa 3 |
| ET-M02 | matcher: 13 600 from Klient A on 3 XII → `met` (±10 %); 13 000 → `ask`; 15 000 on 5 XII → `missed`; 15 000 from Klient B → `ask` |
| ET-M03 | account clock advance does not change game week, stars or unlock |
| ET-R01 | rewind to T1 after any path restores 38 000, Relacje 5, cost 0, full hand, events unresolved |
| ET-R02 | same seed → same event order and same results |
| ET-R03 | reset clears both clocks and the stored state |

### 7.8 Demo path end to end

| id | steps | expected |
|---|---|---|
| ET-D01 | E1 check → C1 via negotiation in T1 → E2 decline → E3 january → (E5 hidden) → E6 → lap end → save plan → account +2 weeks | week-ends 33 700 · 56 080 · 40 380 · 46 705 · 6 905 · 9 985 · 9 985; low +2 605 on 28 XII; ★★★ after save; avoided 2 400; level 2 unlocked; plan met on 5 XII; Bezpieczne płatności 2, Luka płynnościowa 3 |

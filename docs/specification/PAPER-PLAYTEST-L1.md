---
answers: >-
  How to run the paper play-test of game level 1 „Przetrwaj grudzień” before the hackathon: goals and hypotheses, set-up, roles, turn procedure, agent scripts, crash, star and competence rules, the answer key computed against the ledger, the observation form, the edge rules it settled, and where results go.
excludes: >-
  The game design itself (GAME-DESIGN.md), the visual design (GAME-EXPERIENCE-AND-NARRATION.md), the printable kit (playtest/level-1/paper-playtest-level-1.pdf, generated from this document).
status: current
updated: 2026-11-16
---

# Paper play-test — level 1 „Przetrwaj grudzień”

Checklist item of BUILD-PLAN.md Plan task. Printable kit (A4, Polish, 10 pages): `playtest/level-1/paper-playtest-level-1.pdf` (and `.html`). No code is involved (D-01). Rules follow GAME-DESIGN.md §4–§6, including the edge rules §6.5 settled by D-07.

## 1. Goals and hypotheses

Find confusing cards and rules **before** they are coded, and check that the loop is fun and teaches.

| Id | Hypothesis | Pass if |
|---|---|---|
| H1 | The player notices the turbulence on 28 XII and links it to the 35 700 zł payment on 22 XII without help | by the end of T2, unprompted |
| H2 | The player picks a cheap tool (advance, discount, overdraft) instead of the non-bank loan | ≥ 3 of 4 players |
| H3 | A lap is short | ≤ 8 min on paper (the app target is ≤ 90 s) |
| H4 | The player can explain the lesson in their own words („zaliczkę trzeba wynegocjować przed startem prac”, „zysk to nie gotówka”) | ≥ 3 of 4 players |
| H5 | The player wants the next level | answers "yes" to „Zagrałbyś poziom 2?” |
| H6 | Stars are understood, including ★ Pilot waiting for the plan | the player saves the plan without being told to |

## 2. Set-up (20 min per player)

- **People:** 1 player (ideally someone off the team, best a sole proprietor), 1 facilitator (plays the engine, Klient A, Doradca banku and AI-CFO), 1 observer (timer, observation sheet). Facilitator and observer may be one person.
- **Print** (A4): rules, board (landscape), radar sheet, action cards and event cards (cut out), flight sheet, summary sheet, facilitator key (2 pages, do not show the player), observation sheet. A pen, a calculator, a token for the plane.
- **Deck:** events in the demo-seed order: T1 Nowy numer konta · T2 Zlecenie Klienta C · T3 Narzędzie AI · T5 SMS pożyczka (only while the gap is open) · T6 Klient A spóźni się 14 dni.
- **Start:** Gotówka 38 000 zł · Paliwo 42 dni (balance ÷ 900, rounded down) · Relacje 5 · Koszt pieniądza 0 zł · Odporność is not used on paper (engine-only).

## 3. Turn procedure (one week)

1. Move the plane to the week. Read the fixed payments of that week from the board.
2. If the week has an event card, the player reads it and chooses (resolving an event is not the week's action).
3. The player may play **one** action card (or negotiate with Klient A, or ask the bank — accepting an agent's offer is that same one action). Each card can be played once per lap. Before playing, they may look at the card's radar preview; a preview never commits.
4. The facilitator applies the week's payments and effects on the flight sheet (on one date, inflows before outflows); announces the week-end balance, Paliwo, Relacje, Koszt pieniądza.
5. The facilitator reads a one-sentence lesson if something changed; a successful combination gets „Dobry manewr!”. Crash check (§5): the lap stops at the first rejected payment.

## 4. Agent scripts (facilitator)

**Klient A** (55 % of revenue). At most 3 messages per turn.

| Player asks | Week | Klient A says | Effect |
|---|---|---|---|
| advance ≤ 30 % | T1–T2 | „Dobrze. 30% — 15 000 zł do 3 grudnia.” | +15 000 zł on 3 XII |
| advance > 30 % (e.g. 50 %) | T1–T2 | „50% to za dużo. Mogę dać 30% — 15 000 zł do 3 grudnia.” | if accepted: as above |
| any advance | T3+ | „Budżet na ten projekt jest już zamknięty. Zaliczki nie będzie.” | none |
| 2 % discount for paying the overdue invoice early | any | „Skonto 2%? Zgoda, zapłacę w 3 dni: 19 889 zł zamiast 20 295 zł.” | money 3 calendar days after the offer (paper rule: offer on Tuesday → money on Friday; T4 = 15 → 18 XII, the GAME-DESIGN fixture); the 8 I inflow disappears; cost 406 zł |
| threats or rudeness | any | „W takim tonie nie rozmawiamy.” | refused, Relacje −1 |

**Doradca banku.** Asked in T1–T3: „Limit 15 000 zł. Decyzja w 5 dni roboczych, wniosek przyjmuję do końca 3. tygodnia. Koszt: prowizja 150 zł i odsetki 12% rocznie od wykorzystanej kwoty.” Asked in T4+: „Na ten scenariusz jest już za późno.” (the end-of-T3 cutoff is a game constraint). If the gap is already closed: „Przy tym planie limit nie jest Ci potrzebny.”

**AI-CFO** (one hint per turn, only on request):

| Week | Hint |
|---|---|
| T1 | „22 grudnia płacisz podwykonawcom 35 700 zł, a Klient A zapłaci dopiero w styczniu. Masz dwie tanie opcje: zaliczka (0 zł, tylko teraz lub za tydzień) albo skonto (406 zł, do 4. tygodnia).” If asked about the account number: „Inny numer niż zwykle przy 35 700 zł? Sprawdź białą listę i zadzwoń.” |
| T2 | „To ostatni tydzień, żeby poprosić o zaliczkę. Przyjęcie nowego zlecenia pogłębi lukę o 3 000 zł.” |
| T3 | „Limit w banku trzeba złożyć teraz — to ostatni tydzień na wniosek. Skonto jest jeszcze możliwe.” |
| T4 | „Ostatni tydzień na skonto — w kolejnym przelew dojdzie za późno.” |
| T5 | gap open: „Zostaje szybka pożyczka: 2 400 zł kosztu. Tańszych opcji już nie ma.” · gap closed: „Luka zamknięta. Nic nie musisz robić.” |
| T6–T7 | „Klient A spóźnia się częściej — 55% przychodu u jednego klienta to ryzyko.” |

## 5. Crash, stars, plan, competences, unlock

- **Crash:** when a payment takes the balance below 0 (or below −15 000 zł with the overdraft) → read the crash card „Przelew odrzucony”, then „Cofnij do tygodnia N” (player picks the week; reset the sheet to that week's start).
- **Stars** at lap completion (GAME-DESIGN §6.3):
  - ★ Przetrwanie — no crash.
  - ★ Tanio — Koszt pieniądza (sum of all cards) ≤ 500 zł and Relacje not lowered.
  - ★ Pilot — own balance never below 0 **and** a winning decision saved as a plan; shown as „czeka na zapis planu” until the player fills „Zapisz jako plan” on the summary sheet. If several cards were played, the player picks one to save.
- **Competences** are milestones, not points: 1 = observed or played by AI-CFO, 2 = the player's own decision (e.g. checking the account number on the white list), 3 = validated on the account (not part of the paper test). Never go above 3; buying a product (loan, overdraft) never raises a competence.
- **Unlock:** level 2 unlocks when the lap ends with ≥ 1 earned star (tick it on the level map of the summary sheet).

## 6. Answer key (recomputed against SYNTHETIC-DATA §3, with the demo-seed T6 event „Klient A spóźni się 14 dni”, 2026-11-16)

Event choices "safe" (check the account, decline Klient C, AI tool from January) unless stated. Week-end balances T1…T7 in zł; "—" = the lap stopped at the crash.

| Path | T1 | T2 | T3 | T4 | T5 | T6 | T7 | Low | Outcome | Cost of money | Stars (after plan save) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| No action | 33 700 | 41 080 | 25 380 | 31 705 | −8 095 | — | — | −8 095 on 22 XII | **crash 22 XII** (short 8 095) | 0 | rewind |
| Advance (T1 or T2) | 33 700 | 56 080 | 40 380 | 46 705 | 6 905 | 9 985 | 9 985 | +2 605 on 28 XII | ok | 0 | ★★★ |
| Discount offered Tuesday T1 (money 27 XI) | 53 589 | 60 969 | 45 269 | 51 594 | 11 794 | 14 874 | 14 874 | +7 494 on 28 XII | ok (T6 event no longer matters) | 406 | ★★★ |
| Discount offered Tuesday T4 (money 18 XII) | 33 700 | 41 080 | 25 380 | 51 594 | 11 794 | 14 874 | 14 874 | +7 494 on 28 XII | ok | 406 | ★★★ |
| Discount offered Tuesday T5 (money 25 XII) | 33 700 | 41 080 | 25 380 | 31 705 | — | — | — | −8 095 on 22 XII | **crash 22 XII**, money arrives too late | 406 | rewind |
| Postpone subcontractors to 8 I | 33 700 | 41 080 | 25 380 | 31 705 | 27 605 | 30 685 | — | −5 015 on 8 I | **crash 8 I** (the T6 event removes the 8 I inflow) — intended (U-3) | 0, Relacje −2 | rewind |
| Overdraft (asked by end of T3) | 33 700 | 41 080 | 25 380 | 31 705 | −8 095 | −5 015 | −5 015 | −12 395 on 28 XII, inside the limit | ok | ≈ 194 (44 interest + 150 fee) | ★★ (Przetrwanie + Tanio) |
| Non-bank loan (T5, +15 000 on 21 XII) | 33 700 | 41 080 | 25 380 | 31 705 | 6 905 | 9 985 | 9 985 | +2 605 on 28 XII | ok, repay 17 400 on 20 I | 2 400 | ★★ (Przetrwanie + Pilot); ★ without a plan |
| Advance + accept Klient C (−3 000 on 14 XII) | 33 700 | 56 080 | 40 380 | 43 705 | 3 905 | — | — | −395 on 28 XII | **crash 28 XII** (VAT) — intended (U-7) | 0 | rewind |
| Advance + AI tool now (−400 on 15 XII) | 33 700 | 56 080 | 40 380 | 46 305 | 6 505 | 9 585 | 9 585 | +2 205 on 28 XII | ok | 0 | ★★★ |
| Advance + „Zapłać jak jest” (fraud: subcontractors paid again 8 I) | 33 700 | 56 080 | 40 380 | 46 705 | 6 905 | 9 985 | — | −25 715 on 8 I | **crash 8 I** (U-1) | 0 | rewind |

Combinations (U-2), checked the same day: advance + discount (T4) → low +22 494, ★★★ · advance + Klient C + discount (T4) → low +19 494 (rescue) · advance + Klient C + overdraft → low −395 inside the limit · advance + postponement → low +9 985, Relacje −2 · advance + discount + „Zapłać jak jest” → crash 8 I (−5 826). Without the T6 event (SYNTHETIC-DATA §3 as written), no action ends at 15 280 zł on 10 I and postponement does not crash (low +15 280, inflows before outflows on 8 I). Avoided cost vs the loan: advance 2 400 zł · discount 1 994 zł · overdraft ≈ 2 206 zł.

## 7. Observation sheet (observer)

Per turn: time, did the player look at the radar, did they ask AI-CFO, card played, visible confusion (quote). After the lap, ask in this order and write the answers verbatim:

1. „Dlaczego 28 grudnia był problemem?” (H1)
2. „Czego się nauczyłeś? Powiedz to swoimi słowami.” (H4)
3. „Co zrobiłbyś inaczej?”
4. „Która karta była niejasna?”
5. „Zagrałbyś poziom 2?” (H5)
6. Ratings 1–5: zabawa · zrozumiałość · chęć powrotu.

## 8. Edge rules found while preparing the test — all settled (D-07, GAME-DESIGN §6.5)

| Id | Gap | Settled as |
|---|---|---|
| U-1 | Effect of „Zapłać jak jest” | fraud: the 22 XII payment is lost, subcontractors paid again on 8 I → crash; red flag on the card and AI-CFO warning keep it fair |
| U-2 | Several action cards over a lap | allowed, one per week, each card once; effects and costs summed; the player picks the plan to save |
| U-3 | Postponement with the demo-seed T6 event | crash on 8 I kept on purpose („przesunięcie przesuwa problem”); the card warns |
| U-4 | Overdraft cost | engine-computed: 150 zł + 12 %/yr on the actual negative balance; ≈ 194 zł in the demo seed |
| U-5 | Discount payment date | 3 calendar days after the offer |
| U-6 | Which decisions can be saved as a plan | any winning decision; loan → ★★ after plan |
| U-7 | Advance + Klient C's order crashes on 28 XII | kept on purpose; rescued by discount or overdraft |
| U-8 | Loan played before T5 | arrives Monday of the week played; repay 17 400 zł on 20 I; cost 2 400 zł flat |
| U-9 | Odporność on paper | engine-only, left out |
| U-10 | Same-day ordering (new) | inflows before outflows |

## 9. Results

Write each session's observation sheet into this section (date, player profile without personal data, path played, stars, time, H1–H6 pass/fail, quotes). Changes to cards or copy go to GAME-DESIGN.md and GAME-UI-DESIGN-BRIEF.md.

_No session yet._

## 10. Factoring card added (D-09, D-11, 2026-11-16)

The kit now has a sixth action card „Faktoring ekspresowy mBank” (PDF page 4; the AI-CFO card moved to page 5). Facilitator rule: playable T1–T5 while Klient A's 20 295 zł invoice is neither discounted nor financed; money 19 991 zł on the Tuesday of the week played; the 8 I inflow disappears; cost 304 zł; no competence for buying it.

| Path | T1 | T2 | T3 | T4 | T5 | T6 | T7 | Low | Cost | Stars (after plan) |
|---|---|---|---|---|---|---|---|---|---|---|
| Factoring in T1 (24 XI) | 53 691 | 61 071 | 45 371 | 51 696 | 11 896 | 14 976 | 14 976 | +7 596 on 28 XII | 304 | ★★★ |
| Factoring in T4 (15 XII) | 33 700 | 41 080 | 25 380 | 51 696 | 11 896 | 14 976 | 14 976 | +7 596 | 304 | ★★★ |
| Factoring in T5 (22 XII, inflow before the payment) | 33 700 | 41 080 | 25 380 | 31 705 | 11 896 | 14 976 | 14 976 | +7 596 | 304 | ★★★ |
| Advance + factoring (T4) | 33 700 | 56 080 | 40 380 | 66 696 | 26 896 | 29 976 | 29 976 | +22 596 | 304 | ★★★ |
| Advance + Klient C + factoring (T4) | 33 700 | 56 080 | 40 380 | 63 696 | 23 896 | 26 976 | 26 976 | +19 596 | 304 | ★★★ |

Add to the observation sheet: did the player pick factoring over the free advance while the advance was still available (T1–T2)? That is a finding for the bank-value story, not a mistake.

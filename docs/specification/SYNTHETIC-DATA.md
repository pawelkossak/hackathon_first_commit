---
answers: >-
  Which synthetic data the demo runs on (persona Ania), which numbers it must produce, and which numbers in concept v2 are inconsistent and how to fix them.
excludes: >-
  Engine formulas (ARCHITECTURE.md §4) and the UI.
status: current
updated: 2026-11-16
---

# Synthetic data — persona Ania

All data is synthetic and is called so in the pitch. Demo "today" = **Saturday 2026-11-21** (pitch day).

## 1. Consistency findings in concept v2 (for Alan)

| # | In concept v2 | Problem | Proposed fix |
|---|---|---|---|
| F-1 | Dip "9 December: VAT payment" | VAT is due by the 25th of the next month; ZUS and PIT by the 20th | Dip on **Mon 28 Dec 2026** (VAT for November; 25 Dec is a holiday) after ZUS + PIT on Mon 21 Dec (20 Dec is a Sunday) |
| F-2 | Balance 38 000, fixed costs 27 000 / month, dip −12 400 within ~3 weeks | Even with zero inflows the balance after 5 weeks is ≈ +4 700 (38 000 − 27 000 × 37/30). A −12 400 dip needs ≈ 50 000 net outflow, i.e. a one-off commitment | Add a committed one-off: **Client A rebranding project, subcontractors paid on delivery 22 Dec (35 700 zł)**, Client A pays 60 days + its usual delay → in January. This is the "big client, long terms" lesson itself |
| F-3 | Plan "30 % advance from Client X by 20 November" | 20 Nov is before demo day | Plan deadline **Fri 4 Dec 2026**, advance 15 000 zł ±10 % |
| F-4 | "Score 64/100", "+6 points after the plan" | Must be outputs of the formula. With the proposed normalisations this dataset gives ≈ 54 and the advance lifts it by ≈ 14 (dip disappears) | Pitch uses the engine's numbers; calibrate normalisations on day 1 if a different start value is wanted |
| F-5 | Drill "you pay 25 000 zł of taxes and **salaries**"; card "**Delay salaries**" (p.5) | Ania is a sole proprietor with no employees yet — she is only considering the first hire | "taxes and **subcontractors**"; card "**Delay subcontractor payments**" (cost: relationship / delivery risk) |
| F-6 | Benchmark "similar studios 2.5 months reserve, you 1.4" (p.6) | Consistent: 42 days ≈ 1.4 months. The 2.5 is invented | Keep 1.4; label 2.5 "synthetic" on screen and in the pitch |

Runway 42 days (38 000 / 27 000 × 30) is consistent and stays.

## 2. Counterparties

| Id | Name | Type | Share of revenue | Terms | Avg delay | Note |
|---|---|---|---|---|---|---|
| A | Klient A (agency, synthetic NIP) | client | 55 % | 60 days | late, pays ~8 Jan | concentration risk |
| B | Klient B | client | 25 % | 14 days | 0 | |
| C | Klient C | client | 20 % | 30 days | 0 | |
| S1 | Subcontractors (2 freelancers) | supplier | — | on delivery | — | |
| O | Office, tools, accountant, car lease | supplier | — | monthly | — | |
| US / ZUS | Tax office, ZUS | public | — | statutory dates | — | |

Monthly revenue ≈ 30 000 net / 36 900 gross. Monthly fixed costs ≈ 27 000 incl. taxes: subcontractors 12 800 (7th), rent + accountant 2 900 (10th), car lease + tools + phone 2 900 (15th), ZUS + PIT ≈ 4 100 (20th), VAT ≈ 4 300 (25th).

## 3. Baseline ledger, 21 Nov 2026 → 8 Jan 2027 (opening balance 38 000 zł)

| Date | Amount (zł) | Balance (zł) | Event |
|---|---|---|---|
| 2026-11-25 | −4 300 | 33 700 | VAT for October |
| 2026-11-30 | +7 380 | 41 080 | Client C, October invoice |
| 2026-12-07 | −12 800 | 28 280 | Regular subcontractors |
| 2026-12-10 | −2 900 | 25 380 | Rent + accountant |
| 2026-12-14 | +9 225 | 34 605 | Client B, November invoice |
| 2026-12-15 | −2 900 | 31 705 | Car lease, tools, phone |
| 2026-12-21 | −4 100 | 27 605 | ZUS + PIT advance |
| 2026-12-22 | −35 700 | −8 095 | Subcontractors, Client A rebranding project (committed) |
| **2026-12-28** | **−4 300** | **−12 395** | **VAT for November — deepest dip** |
| 2026-12-30 | +7 380 | −5 015 | Client C, November invoice |
| 2027-01-08 | +20 295 | 15 280 | Client A, earlier invoice (late) |

Checked by a throw-away calculation on 2026-11-16; the engine must reproduce it to the złoty.

## 4. Scripted future (time travel)

| Clock jump | Transactions replayed | Expected result |
|---|---|---|
| +2 weeks (→ 5 Dec) | 3 Dec: +15 000 from Klient A, title "Zaliczka 30% projekt rebranding" | Plan met → notification; dip on 28 Dec gone (low ≈ +2 600); score up; competence "Liquidity gap" → level 3 |
| alt. path | no advance by 4 Dec | Plan missed → app proposes variant B (early-payment discount from Client A or factoring) |

## 5. Emergency drill (hypothetical, from concept §4.3, with F-5 applied)

"Your largest client is 20 days late with 40 000 zł. In 5 days you pay 25 000 zł of taxes and subcontractors."

| Card | Effect on chart | Cost (zł) |
|---|---|---|
| Non-bank quick loan | gap closed at once | ≈ 2 400 interest + fees; debt-spiral risk |
| Delay subcontractor payments | gap partly closed | relationship / delivery risk (non-monetary) |
| 2 % early-payment discount for paying in 3 days | inflow moved forward | 800 (2 % × 40 000) |
| Factoring / overdraft | closed only if signed earlier | fee / interest |
| Renegotiate supplier term | outflow moved | usually 0 |

Avoided cost if discount chosen vs loan (default): **1 600 zł**.

## 6. Files to create on day 1

`data/persona.json` (account, counterparties, invoices, obligations, committed events), `data/future-script.json` (§4), `data/drills.json` (§5), `data/answers.json` (cached AI texts for the demo path, PL + EN).

## 7. Game data (D-04)

The game (GAME-DESIGN.md) runs on the same ledger; its level 1 numbers were recomputed against §3 on 2026-11-16. Additional files on day 1:

- `data/level1.json` — the 7 weeks (23 XI → 10 I), action cards of GAME-DESIGN §6.1 with timing rules and effects, event cards of §6.2 with the demo seed order, star rules of §6.3. Replaces `data/drills.json` for the demo (the §5 drill stays as reference content).
- `data/agents.json` — rules tables of GAME-DESIGN §4 (Klient A, Doradca banku, AI-CFO) and cached Polish lines for every step of the demo path.

Demo path check (advance in T1, decline Klient C, AI tool from January, Klient A late 14 days): lowest balance +2 605 zł on 28 XII, lap end 9 985 zł on 10 I.

## 8. Persona in the game story (D-12)

Ania, the sole proprietor of this ledger, is the **Boss** of the game — Szefowa by default (if the player chooses „Szef”, the same firm and numbers are narrated by a male owner). The player is the „pilot finansów” she brought in to help; the player is not an employee, so the level 2 hire remains the firm's first. No number in §2–§7 changes with any player or narrator choice.

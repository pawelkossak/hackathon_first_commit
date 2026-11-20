---
answers: >-
  How the First employee mission (level 2) calculates timing, reserve and completion.
excludes: >-
  Real payroll calculation, legal tax deadlines and level 1 rules.
status: current
updated: 2026-11-17
---

# First employee — level 2 scenario

Canonical data: `data/level2.json`. Pure engine module: `engine/employee.ts`; route: `/gra/2`, unlocked by a completed first mission.

The three weeks run from 1 to21 February2027 with opening balance8,000PLN. All dates and values are synthetic assumptions.

| Date | Base ledger item | PLN |
| --- | --- | ---: |
| Feb1 | Rent and accounting | -2900 |
| Feb12 | Client invoice | +9000 |
| Feb15 | Public obligations | -4100 |
| Feb17 | Small January project | +3000 |
| Feb19 | Tax payment | -4300 |

Week1 selects hire or defer. Hiring adds6,000PLN gross salary onFeb10 and1,200PLN employer costs onFeb15; deferral adds neither. The20% cost increment is an explicit game simplification, not a payroll calculator.

Week2 selects a3,000PLN advance onFeb8 or waits for the invoice. Advance reduces theFeb12 invoice to6,000PLN, preserving total client revenue. Week3 selects an earmarked4,300PLN tax reserve or common balance. The reserve distinguishes cash from available funds; it creates neither income nor a second tax debit. It is funded only up to cash available and released when the actualFeb19 tax is paid.

Hire + wait crashes onFeb10 with a900PLN shortfall. Rewind week2 and choose advance; hire + advance + reserve completes with1,500PLN and three stars. Defer + wait + unreserved completes with8,700PLN and two stars. Choosing not to hire is a valid educational outcome.

Required APIs: `createEmployeeGame`, `employeeForecast`, `chooseEmployeeAction`, `resolveEmployeeWeek`, `rewindEmployeeGame`, `employeeScore`, `restoreEmployeeGame`. Functions must preserve input state. Restore reconstructs the game from validated choices instead of trusting stored balances. Storage key: `pilot.employee.v1`; global reset clears it. Save failures are shown explicitly.

Acceptance: engine tests cover the cash gap and rewind, advance conservation, tax without a duplicate debit, deferral, immutability and invalid restore/choice guards; a component test covers the failure-to-success flow, persistence after remount and the lock; an e2e spec covers the intro and the complete level 2 flow with a reload.

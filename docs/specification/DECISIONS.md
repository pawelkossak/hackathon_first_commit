---
answers: >-
  Which decisions were taken on this project: what, who decided, when, why and what each changed.
excludes: >-
status: current
updated: 2026-11-17
---

# Decisions

Numbered D-01 …, never reused; a later decision that replaces one names it.

## D-01 — The project enters Collabothon 2026 with challenge 1, "Finance Quest" (Commerzbank), …

- Decided: The project enters Collabothon 2026 with challenge 1, "Finance Quest" (Commerzbank), using Alan Bartczak's concept "Pilot Płynności" v2 (2026-11-11) as the base. No code is written before the hackathon starts; preparation covers concept, architecture and documentation only.
- Who: Alan Bartczak (owner)
- When: 2026-11-16
- Why: Hackathon rules do not allow starting the code before the event; the owner has prepared the concept for the Finance Quest challenge.

## D-02 — The pitch for Finance Quest is given in Polish. The demo UI is Polish too; an English …

- Decided: The pitch for Finance Quest is given in Polish. The demo UI is Polish too; an English switch stays optional (COULD).
- Who: The product owner (for owner Alan Bartczak)
- When: 2026-11-16
- What it changed: Closes gap G-03; resolves proposal A-3 (English UI + pitch) in favour of Polish; Q-02 no longer blocks.

## D-03 — The Finance Quest product, including the proposed game layer (A-7), is built as a web …

- Decided: The Finance Quest product, including the proposed game layer (A-7), is built as a web game: it runs in the browser on desktop and phone, with no install and no native app.
- Who: The product owner (for owner Alan Bartczak)
- When: 2026-11-16
- Why: A 48 h build, a live demo on a laptop and a booth where jury and visitors can play on their own phones via a link or QR code.
- What it changed: Fixes the platform for GAME-DESIGN.md (A-7) and confirms ARCHITECTURE.md (one web app; native mobile app stays WON'T). Does not decide A-7 itself.

## D-04 — The game layer A-7 (agentic board game „Lot przez rok firmy”, GAME-DESIGN.md) becomes …

- Decided: The game layer A-7 (agentic board game „Lot przez rok firmy”, GAME-DESIGN.md) becomes the hackathon demo: its GM stories enter DEMO-REQUIREMENTS.md and the 48 h plan, replacing the cockpit-first demo path. The cockpit-first path remains only as the hour-18 fallback.
- Who: The product owner (for owner Alan Bartczak)
- When: 2026-11-16
- Why: The challenge is "Finance Quest"; concept v2 alone is a simulator without a quest (G-14). The game makes engagement playable for the jury on the same engine and data.
- What it changed: Resolves proposal A-7 and gap G-14; DEMO-REQUIREMENTS.md and BUILD-PLAN.md rewritten; GAME-DESIGN.md status from proposal to current. A-1…A-6 stay open.

## D-05 — Adopt the colourful illustrated game-world concept shown in the design team: a flight adventure …

- Decided: Adopt the colourful illustrated game-world concept shown in the design team: a flight adventure across floating islands, character-led narrative, tactile decision cards and clear progression. The boss of the player's company is the narrator/guide; financial learning happens through playful choices and consequences.
- Who: The product owner
- When: 2026-11-16
- Why: The hackathon goal is an enjoyable game for entrepreneurs, with story, characters and engaging financial decisions, rather than a financial application dashboard.
- What it changed: Rejects the earlier financial-dashboard-style UI proposal as the visual target. Scope is one initial concept only; no full revised screen set or application code is authorized by this feedback.

## D-06 — The game must look and feel like a fun, colourful, playful game (illustrated world, …

- Decided: The game must look and feel like a fun, colourful, playful game (illustrated world, characters, cards, celebration), not a stiff financial app; the numbers stay exact and readable inside that game layer.
- Who: The product owner (for owner Alan Bartczak)
- When: 2026-11-16
- Why: Engagement is the core of the Finance Quest challenge; the first mockups read as a pastel finance dashboard.
- What it changed: Replaces "trust first, delight second" in GAME-UI-DESIGN-BRIEF.md §2 and the "bank-app look with a light game skin" in GAME-DESIGN.md §12; mockups to be reworked toward the playful concept art.

## D-07 — The open level-1 rules found by the paper play-test (U-1…U-10) are settled as written …

- Decided: The open level-1 rules found by the paper play-test (U-1…U-10) are settled as written in GAME-DESIGN.md §6.5: fraud on „Zapłać jak jest”, card combinations, postponement crashing with the demo-seed T6 event, engine-computed overdraft cost (≈ 194 zł in the demo seed), the Klient C crash kept as a lesson, early loan arrival, same-day inflows before outflows.
- When: 2026-11-16
- Why: Every card path must have one defined, computable outcome before the engine is built; outcomes were recomputed against the ledger.
- What it changed: Closes U-1…U-4, U-7, U-8 and adds U-10 in PAPER-PLAYTEST-L1.md §8; updates GAME-DESIGN.md §6.1–§6.3.

## D-08 — Expand approved D-05 into the complete illustrated game-screen suite, including …

- Decided: Expand approved D-05 into the complete illustrated game-screen suite, including account-entry/logout concepts, introduction, independent player and Boss/Boss Lady selection, contextual emotional narrator reactions, humorous success/failure, playful financial charts and meaningful loaders. Add voiced interactive narration through ElevenLabs with captions and a text fallback; document all agreed behaviour.
- Who: The product owner
- When: 2026-11-16
- Why: The experience should be a playful character-led financial adventure, with humour, personality, voice and visual continuity across the entire journey.
- What it changed: Replaces D-05's one-concept-only delivery limit. Authorizes full visual and narrative design, not pre-event application code; authentication screens are future-product design concepts and do not silently add accounts/backend to the guest-first hackathon build.

## D-09 — Include the proposed game action card 'Faktoring ekspresowy mBank' with a clearly …

- Decided: Include the proposed game action card 'Faktoring ekspresowy mBank' with a clearly labelled synthetic scenario cost of 1.5%, and Cash Flow drilldown opened by clicking a weekly node or a dedicated button. Show qualitative bank business value in pitch materials while preserving comparison with valid alternatives.
- Who: The product owner, incorporating Alan Bartczak's suggestion
- When: 2026-11-16
- Why: Connect gameplay with contextual invoice financing and let the player inspect exact cash-flow consequences before committing a move.
- What it changed: Adds four concept scenes G29–G32, extending T9 from 28 to 32 views. Five baseline actions gain an additional designed factoring action; actual deterministic fee base, eligibility and funding timing must be defined before enabling it. Allows this requested plain-text bank/product name, without logos, bank-brand styling or implying official pricing.

## D-10 — Approve the illustrated game concept suite for desktop and mobile landscape. Preserve …

- Decided: Approve the illustrated game concept suite for desktop and mobile landscape. Preserve the system views for login, account creation, password recovery and logout as part of the design.
- Who: The product owner
- When: 2026-11-16
- Why: Keep the immersive landscape game world and complete account journey while supporting readable touch interaction.
- What it changed: Mobile landscape supersedes the earlier portrait-first375px composition as the primary phone target. Existing browser-only platform D-03 and pre-event no-code rule remain; authentication is still a design inventory unless separately prioritised for implementation.

## D-11 — Rules of the factoring card „Faktoring ekspresowy mBank” (D-09): eligible only for …

- Decided: Rules of the factoring card „Faktoring ekspresowy mBank” (D-09): eligible only for Klient A's unpaid invoice of 20 295 zł while it is not discounted (mutually exclusive with the discount card), playable T1–T5; synthetic full cost 1.5 % of the gross invoice = 304 zł; payout 19 991 zł on the next business day after the Monday request (T1 24 XI … T5 22 XII); the original 8 I receipt goes to the factor (the T6 late-payment event no longer affects the player's cash in the lap); no competence level for buying it; stars by the usual rules (★★★ possible after plan save); keyboard 6.
- When: 2026-11-16
- Why: D-09 requires deterministic fee base, eligibility, payout timing and removal of the original receipt before the card can be enabled; values recomputed against the ledger (low +7 596 zł on every eligible week, lap end 14 976 zł).
- What it changed: Enables the sixth action card in GAME-DESIGN.md §6.1 and §6.6, DEMO-REQUIREMENTS GM-03 and the paper play-test. 1.5 % stays a labelled scenario assumption, not an mBank tariff.

## D-12 — Story roles (OD-1): Szef/Szefowa is the owner of the graphic studio — the synthetic …

- Decided: Story roles (OD-1): Szef/Szefowa is the owner of the graphic studio — the synthetic persona of the data (default Szefowa = Ania); the player is the new „pilot finansów” the Boss brought in to help steer the firm's money. The firm's numbers stay as in SYNTHETIC-DATA.md; the player is a helper/partner, not an employee, so level 2 „Pierwszy pracownik” remains the firm's first hire.
- Who: The product owner
- When: 2026-11-16
- Why: The product owner wants a Boss of the firm who guides the player; the data persona is the owner of a sole proprietorship, so the Boss must be the owner and the player a helper.
- What it changed: Closes OD-1 and gap G-15; unblocks the design team's copy deck A6 and voice script A7; GAME-DESIGN §4 and §9, BUILD-PLAN.md, GAPS updated.

## D-13 — The game includes reminder notifications that bring the player back to the next move …

- Decided: The game includes reminder notifications that bring the player back to the next move (Web Push, in-app inbox, email for account holders), in the chosen narrator's voice, with opt-in consent, quiet hours, frequency caps and no product promotion, as specified in BACKEND-SERVICES.md §4.
- Who: The product owner
- When: 2026-11-16
- Why: Reminders support the challenge goal that entrepreneurs come back on their own (E-04) and close the loop between game moves and plan deadlines.
- What it changed: Adds notification-service, worker and cron tick to the backend (BACKEND-SERVICES.md); adds story GM-27 (SHOULD) for the hackathon demo; adds notification templates to the design team's copy deck. Hackathon scope of reminders stays OD-6.

## D-14 — The hackathon demo includes reminders (OD-6): after the first lap the player opts in …

- Decided: The hackathon demo includes reminders (OD-6): after the first lap the player opts in to Web Push with „Przypomnij mi”, a demo reminder from the narrator arrives on stage, and a returning player sees the in-app banner „Tydzień N czeka”. If push fails on the venue setup, the banner alone is shown.
- Who: The product owner
- When: 2026-11-16
- Why: The comeback loop is the core of "entrepreneurs want to use it" (E-04); showing it live makes the claim visible to the jury.
- What it changed: Closes OD-6; GM-27 becomes MUST with the banner as the fallback; adds step 8 to the demo path; VAPID keys and Redis join the pre-event hosting items.

## D-15 — Approved the currently selected Voice Design sample (Voice 1) for Ania, the female …

- Decided: Approved the currently selected Voice Design sample (Voice 1) for Ania, the female narrator. The saved ElevenLabs character voice is Pilot Płynności — Ania, id XLf9vFrIQPgwhuq1DKHi.
- Who: The product owner
- When: 2026-11-17
- What it changed: Use this designed character voice for Ania dialogue and trailer. Maintain expressive, cheeky delivery rather than flat narration.

## D-16 — Approved both selected Polish character voices: Ania (XLf9vFrIQPgwhuq1DKHi) and Szef …

- Decided: Approved both selected Polish character voices: Ania (XLf9vFrIQPgwhuq1DKHi) and Szef (u3Dnxmjtuw3QrXOthMi5). Preserve their current voice identities and expressive settings, and include both voices in the game trailer.
- Who: The product owner
- When: 2026-11-17
- What it changed: Extends D-15: Szef Voice Design Voice1 / TTS Generation1 approved alongside Ania. Trailer becomes a two-character production; fixed offline audio remains the runtime default.

## D-17 — The AI-CFO suggests a product card only as the last resort

- Decided: `getCfoHint` lists only safe cards without a product (C1, C2, C3). A product card (C4 overdraft, C5 non-bank loan, C6 factoring) is suggested only when no card without a product removes the crash, and always with its engine cost. Every card stays playable from the hand.
- Who: The product owner (coordinator)
- When: 2026-11-20
- Why: Hard rule 3, no bank-product bias. In T1 of the demo seed the hint showed the overdraft (194 zł) next to the free C1, which reads as the AI pushing a product.
- What it changed: E-08 implements the rule in the engine with a test; N-09 shows a product hint only with its cost.

## D-18 — Engine event for the fraud reveal; lapStart after rewind to week 1

- Decided: The engine emits `fraudRevealed` when the week resolution passes 23 XII on the E1 „Zapłać jak jest” path (unless the lap crashed before it), and emits `lapStart` again after `rewind` to week 1. Until the reveal the player-facing views do not show the E1 effects.
- Who: The product owner (coordinator)
- When: 2026-11-20
- Why: The fraud reveal is a key moment of the story and had no engine event, so the narrator could not react to it; a rewind to the start of the lap greeted no one.
- What it changed: ENGINE-DATA-AND-TESTS.md §6 gains the `fraudRevealed` row (exasperated, `rx.fraud`) and the rewind note on `lapStart`; the engine event union and `data/reactions.json` follow in the engine lane; the narrative lane adds the `rx.fraud` lines.

## D-19 — Level 2 is built after the demo polish; the factoring card keeps its title

- Decided: Every MUST of the demo path is green on develop, so level 2 „Pierwszy pracownik” (E-11 engine, U-18 screens, FIRST-EMPLOYEE-SCENARIO.md) is built. The demo-path polish (voice, narrator reactions, the D-14 reminder on stage, copy keys) comes first and is never blocked by level 2; E-11 runs in parallel in the engine lane, U-18 starts when E-11 is merged. If level 2 is not green by the Sat 23:00 feature freeze it is cut (§7, cut 2) and `/gra/2` stays a locked placeholder. The C6 card keeps the title „Faktoring ekspresowy mBank” (D-09, D-11) with its „Założenie scenariusza” and „Dane syntetyczne” labels.
- Who: The product owner (coordinator)
- When: 2026-11-21
- Why: Level 2 shows the game goes beyond one lesson; the demo path stays the priority. mBank belongs to the Commerzbank group, so the title fits the challenge.
- What it changed: BUILD-PLAN.md §5 marks E-11 and U-18 as approved after the demo polish, with the Sat 23:00 cut rule.

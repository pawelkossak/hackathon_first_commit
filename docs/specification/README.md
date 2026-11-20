# Specification — Pilot Płynności

Start with **BUILD-PLAN.md** (scope, lanes, tasks, checkpoints). Then read the documents of your lane.

| Document | What it answers | Lane |
|---|---|---|
| BUILD-PLAN.md | what is built, by whom, in which order, how each task is accepted | all |
| PRODUCT-CONCEPT.md | the product, the user, the problem | all |
| CLIENT-EXPECTATIONS.md | what the challenge owner expects | all |
| DECISIONS.md | decisions D-01… and why | all |
| GAME-DESIGN.md | rules, numbers, demo click-path (§9) | E, U |
| SYNTHETIC-DATA.md | the synthetic company, ledger and scripted future | E |
| ENGINE-DATA-AND-TESTS.md | data tables and the 58 engine test cases | E |
| RUNTIME-ENGINE-CONTRACT.md | the engine API used by the UI and the narrative layer | E, U, N |
| FIRST-EMPLOYEE-SCENARIO.md | level 2 | E, U |
| PAPER-PLAYTEST-L1.md | the paper play-test, a second test oracle | E |
| DEMO-REQUIREMENTS.md | stories GM-xx / US-xx with acceptance | all |
| ARCHITECTURE.md | stack, folder layout, engine, AI and voice layers | all |
| BACKEND-SERVICES.md | API routes, reminders, secrets by name | N |
| GAME-EXPERIENCE-AND-NARRATION.md | look, characters, reactions, voice behaviour, accessibility | U, N |
| ARTEFACT-PLACEMENT-GUIDE.md | where each design artefact goes on screen | U |
| BUILD-READY-ARTEFACTS.md | the inventory of design artefacts in `design/` | U |
| MOTION-AND-ARTEFACT-AUDIT.md | motion clips, stills and their triggers | U |
| SOUND-DESIGN-AND-CUE-MAP.md | sound effects and cues | U, N |
| NOTIFICATION-DESIGN.md | reminders, return banner, opt-in | N |
| MARKET-AND-ALTERNATIVES.md | market context for the pitch | pitch |
| PITCH.md | the three-minute stage script | pitch |
| GENERATION-BRIEFS.md | how art, voice and sound are generated at the event; how media reach every lane through `develop` | U, N |

Paths like `design/…` are where the media made at the event are stored (GENERATION-BRIEFS.md); until they exist, BUILD-PLAN.md §3.2 defines the placeholders. `data/…` is written from the tables of ENGINE-DATA-AND-TESTS.md and SYNTHETIC-DATA.md.

## Prepared before the event

The rules allow ideas, concepts and designs once the challenges are announced; coding starts Fri 20 XI 2026 11:00.
This specification was prepared before the coding phase. All application code and the media (art, motion, voice,
sound) are made during the event (GENERATION-BRIEFS.md); no code from earlier prototypes is used. Media live only in
`design/` on `develop`; a missing asset stays a placeholder.

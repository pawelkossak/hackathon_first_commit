<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Pilot Płynności (rules for every agent)

Read by Claude Code (through `CLAUDE.md`) and by Antigravity (workspace rule, plus `GEMINI.md`). Binding for every agent and every person.

## What we build
Pilot Płynności — an educational web game about a small company's cash flow, for the Commerzbank challenge at Collabothon 2026.
Specification: `docs/specification/` (index: `README.md`). The build order, the lanes and every task with its acceptance check: `docs/specification/BUILD-PLAN.md`.
Stack: Next.js 16 (App Router), React 19, TypeScript strict, Tailwind 4, Zustand, Zod, Vitest, Playwright, pnpm.

## How a task is done
1. Take the next open task of **your lane** from `BUILD-PLAN.md` §5 (E-xx, U-xx or N-xx). One task at a time.
2. Read only its inputs (the documents it names) and the engine contract `RUNTIME-ENGINE-CONTRACT.md`. Phase 1 tasks work without any assets: use the placeholder contracts of `BUILD-PLAN.md` §3.2.
3. Build the smallest complete change. Write the test named in the acceptance column.
4. Run `pnpm check` (typecheck, lint, tests, build). The task is done only when its acceptance check is green.
5. Commit on your lane branch with one topic: `feat: U-05 world route G10`, `test: E-03 action card cases`, `fix: …`.
6. Write a short handoff in `docs/team/handoffs/<task-id>.md`: what was built, which check proves it, what is open.

## Lanes (`lanes.json`)
| Lane | Branch | Paths it owns |
|---|---|---|
| engine | `lane/engine` | `engine/`, `data/` |
| ui | `lane/ui` | `app/`, `components/`, `public/`, `lib/ui/`, `lib/generated/`, `scripts/build-assets.ts`, `design/` |
| narrative | `lane/narrative` | `narrative/`, `components/narrative/`, `lib/ai/`, `lib/reminders/`, `app/api/`, `public/sw.js`, `e2e/`, `playwright.config.ts`, `design/voice/`, `design/audio/` |

- The longest matching path wins (`app/api/` is narrative, the rest of `app/` is ui; `components/narrative/` is narrative, the rest of `components/` is ui; `design/voice/` and `design/audio/` are narrative, the rest of `design/` is ui).
- Edit only your lane's paths and `docs/team/handoffs/`. Everything else (`package.json`, lockfile, configs, `AGENTS.md`, `docs/specification/`, `scripts/lane-check.mjs`) is shared and changes only through the coordinator.
- Need something from another lane? Write it in your handoff and tell its owner. Never edit their files.
- The git pre-commit hook (`scripts/lane-check.mjs`) rejects a commit that breaks these rules. Do not bypass it (`--no-verify` is forbidden).

## Interfaces between lanes (BUILD-PLAN.md §3.1)
1. **Engine API**: `engine/index.ts` with the signatures of `RUNTIME-ENGINE-CONTRACT.md`. UI and narrative code call only this API, never engine internals. Until a function is implemented it returns a fixture state.
2. **Copy keys**: every sentence through `getCopy(id, …)` from `narrative/` (seed copy first, full copy later). Narrative screens (intro, dialogue, negotiation, voice player, settings) live in `components/narrative/`; the ui lane mounts them in its pages.
3. **Asset registry**: every image through `lib/ui/assets.ts`, which returns the file in `public/media/` or a sized placeholder. Never a file path in a component, never `design/` at runtime.
4. **Engine events**: the typed event list of `ENGINE-DATA-AND-TESTS.md` §6.
A change to an interface is its own commit by its owner, announced to the team first.

## Hard rules
1. **Numbers come from the engine.** The UI and any generated text show only values computed by the engine; AI text passes the number guardrail.
2. **Synthetic data only.** No real person, company, account, IBAN, PESEL or NIP. The scenario of `SYNTHETIC-DATA.md` only.
3. **No bank-product bias.** Winning never requires a product; the factoring card is labelled as a scenario; the loan is a non-bank SMS.
4. **AI with a fallback.** Every AI call has a deterministic fallback (buttons, cached lines) and a 3 s timeout. With `PILOT_AI_OFFLINE=1` no AI call leaves the machine. Tests never call a real LLM or TTS API.
5. **Secrets.** Never read, print or commit `.env` / `.env.*`. Only `.env.example` with variable names and no values. Keys live only on the server side.
6. **Accessibility.** Body text ≥ 16 px, AA contrast, keyboard path, 44 px targets, captions for every voice line, reduced motion respected.
7. **Code quality.** TypeScript strict, no `any`, no `@ts-ignore`, no skipped tests, no TODO left in a commit. The engine is pure TypeScript with no React, Next or I/O imports.
8. **Only this repository.** Build from the specification and `design/`. Do not copy code from other repositories or earlier prototypes.
9. **Git.** Commit only on your lane branch. Never push to `main` or `develop`, never force-push, never rewrite history. The coordinator merges.
10. **Dependencies.** A new package goes through the coordinator (shared `package.json`). Check that it exists and is maintained.

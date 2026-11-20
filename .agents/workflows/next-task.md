---
description: Take the next task of my lane from BUILD-PLAN.md, build it, check it and prepare the commit.
---

1. Run `git branch --show-current`. It must be `lane/ui` or `lane/narrative`; that is your lane. Otherwise stop and ask.
2. Run `git pull origin develop` to get the latest merged work.
3. Open `docs/specification/BUILD-PLAN.md` §5, the table of your lane (U-xx for ui, N-xx for narrative). The next task is the first one without a handoff file in `docs/team/handoffs/`. If the person named a task id, take that one instead.
4. Read `AGENTS.md`, `GEMINI.md`, the task's inputs and `docs/specification/RUNTIME-ENGINE-CONTRACT.md`. For UI work also open the layout image in `design/layouts/` that the task names.
5. Tell the person in two lines what you will build and which check will prove it. Then build it, editing only your lane's paths (`lanes.json`).
6. Call the engine only through `engine/index.ts`. If you need an engine function that is missing, use the fixture it returns now and note it in the handoff for the engine lane.
7. Write the test named in the acceptance column (Vitest next to the code, or a Playwright spec in `e2e/` for the narrative lane).
8. Run `pnpm check`. Fix until green. For a screen, run `pnpm dev` and use `/browser-check` on it.
9. Run `/handoff`.

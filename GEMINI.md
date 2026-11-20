# GEMINI.md — Antigravity specifics

`AGENTS.md` holds the shared rules and is binding for you. This file adds only what is specific to Antigravity.

- You work for **Person B (lane ui)** or **Person C (lane narrative)**. The person tells you the lane; check it with `git branch --show-current` (`lane/ui` or `lane/narrative`). If the branch is not a lane branch, stop and ask.
- Workflows in `.agents/workflows/`:
  - `/next-task` — take, build and check the next task of your lane;
  - `/browser-check` — walk the demo path in the browser and report what breaks;
  - `/handoff` — write the task handoff and prepare the commit.
- Edit only your lane's paths (`lanes.json`). The git hook rejects other files; do not work around it.
- You may commit on your lane branch after `pnpm check` is green. You never push to `main` or `develop`, never merge, never force-push. The person pushes the lane branch and opens the pull request into `develop`.
- Use the browser to compare a screen with its layout image in `design/layouts/` at 1440×900 (and 844×390 when the task says so); attach what you saw to the handoff.
- Make no new design: use the layouts, tokens, UI kit and copy from `design/`. If the specification leaves a choice open, write the question in the handoff instead of choosing.

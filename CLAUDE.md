# CLAUDE.md — Pilot Płynności

@AGENTS.md

## Claude Code specifics
- Claude Code is used by the coordinator (Person A): lane **engine** plus review and merge of the other lanes.
- Subagents: `.claude/agents/engine-dev.md` builds one engine task; `.claude/agents/qa.md` reviews one task or one pull request and ends with `VERDICT: PASS` or `VERDICT: FAIL`.
- The edit hook `.claude/hooks/lane-guard.mjs` blocks Edit/Write outside the lane of the current branch. On a non-lane branch (for example `develop`, `agents/*`) the coordinator may edit shared files.
- Before merging a lane: `node scripts/lane-check.mjs --range develop...lane/<name>`, then the qa subagent, then merge.

## Commands
| Purpose | Command |
|---|---|
| Install (also enables the git lane hook) | `pnpm install` |
| Everything before a commit | `pnpm check` |
| Unit tests | `pnpm test` |
| Browser tests | `pnpm e2e` |
| Lane check of a branch | `node scripts/lane-check.mjs --range develop...lane/<name>` |

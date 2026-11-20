---
description: Finish the current task — write its handoff and commit it on the lane branch.
---

1. Confirm `pnpm check` is green. If not, do not hand off; go back and fix.
2. Write `docs/team/handoffs/<task-id>.md` with:
   - **Built:** one or two lines;
   - **Acceptance:** the check from BUILD-PLAN.md and how it passed (test name, command, screenshot);
   - **Needs from other lanes:** missing engine functions, copy keys or assets (or "none");
   - **Open:** anything left or any question for the coordinator.
3. Run `git status` and check that only your lane's files and the handoff changed.
4. Commit with one topic, for example `git add -A && git commit -m "feat: U-05 world route G10"`. If the lane hook rejects it, remove the foreign files from the commit; never use `--no-verify`.
5. Tell the person: "Task <id> committed. Push with `git push -u origin <lane branch>` and open a pull request into `develop`."

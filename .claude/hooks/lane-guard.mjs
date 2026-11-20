#!/usr/bin/env node
// Claude Code PreToolUse hook for Edit/Write: blocks an edit outside the lane of the current branch.
// The same rules as the git pre-commit hook (scripts/lane-check.mjs, lanes.json).
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const checker = fileURLToPath(new URL("../../scripts/lane-check.mjs", import.meta.url));

let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  let file;
  try {
    const data = JSON.parse(input);
    file = data.tool_input?.file_path ?? data.tool_input?.notebook_path;
  } catch {
    process.exit(0);
  }
  if (!file) process.exit(0);
  const r = spawnSync(process.execPath, [checker, "--file", file], { encoding: "utf8" });
  if (r.status === 0) process.exit(0);
  process.stderr.write(r.stderr || "lane-check: blocked\n");
  process.exit(2);
});

#!/usr/bin/env node
// Lane guard. Used three ways:
//   node scripts/lane-check.mjs                 -> checks staged files (git pre-commit hook)
//   node scripts/lane-check.mjs --range A...B   -> checks a branch range (coordinator, before a merge)
//   node scripts/lane-check.mjs --file <path>   -> checks one path (Claude Code edit hook)
// Exit 0 = allowed, 1 = blocked (message on stderr).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const cfg = JSON.parse(readFileSync(path.join(root, "lanes.json"), "utf8"));

export function laneOf(file) {
  let best = null;
  let bestLen = -1;
  for (const [name, lane] of Object.entries(cfg.lanes)) {
    for (const p of lane.paths) {
      const hit = p.endsWith("/") ? file.startsWith(p) : file === p;
      if (hit && p.length > bestLen) {
        best = name;
        bestLen = p.length;
      }
    }
  }
  return best;
}

function currentBranch() {
  try {
    return execFileSync("git", ["symbolic-ref", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function laneOfBranch(branch) {
  for (const [name, lane] of Object.entries(cfg.lanes)) if (lane.branch === branch) return name;
  return null;
}

export function violations(files, branchLane) {
  const out = [];
  for (const f of files) {
    const base = path.posix.basename(f);
    if (cfg.neverCommit.includes(base) || (/^\.env\./.test(base) && base !== ".env.example")) {
      out.push(`${f}: secrets file, never committed`);
      continue;
    }
    if (!branchLane) continue; // coordinator branch: everything else allowed
    if (cfg.everyLane.some((p) => f.startsWith(p))) continue;
    const owner = laneOf(f);
    if (owner === branchLane) continue;
    out.push(owner ? `${f}: belongs to lane "${owner}"` : `${f}: shared file, only the coordinator changes it`);
  }
  return out;
}

const args = process.argv.slice(2);
const norm = (p) => path.relative(root, path.resolve(p)).split(path.sep).join("/");
let files;
let branch = currentBranch();
if (args[0] === "--file") {
  files = [norm(args[1])];
} else if (args[0] === "--range") {
  files = execFileSync("git", ["diff", "--name-only", args[1]], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
  branch = args[1].split("...").pop().replace(/^(?:refs\/remotes\/)?origin\//, "");
} else {
  files = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMRD"], { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
}

const lane = laneOfBranch(branch);
const bad = violations(files, lane);
if (bad.length) {
  console.error(`lane-check: blocked on branch "${branch}"${lane ? ` (lane ${lane})` : ""}:`);
  for (const b of bad) console.error(`  - ${b}`);
  console.error("Ask the owner of that lane (lanes.json) or the coordinator instead of editing it.");
  process.exit(1);
}

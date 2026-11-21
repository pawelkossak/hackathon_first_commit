// U-12 round 1b (hard rule 6) for every ui-lane screen:
// - no body text below 16 px: text-xs, text-sm and text-[Npx] below 16 are gone;
// - every <button> and <Link> carries a 44 px minimum height (min-h-[44px] or more).
// Scans app/ (without app/api/, which is narrative), components/play, components/scenes and components/ui.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCAN = ["app", "components/play", "components/scenes", "components/ui"];
const EXCLUDE = [join(ROOT, "app", "api")];

function walk(dir: string): string[] {
  if (EXCLUDE.includes(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx$/.test(name) && !/\.test\.tsx$/.test(name) ? [full] : [];
  });
}

const SOURCES: Array<[string, string]> = SCAN.flatMap((d) => walk(join(ROOT, d))).map((f): [string, string] => [
  relative(ROOT, f).replace(/\\/g, "/"),
  readFileSync(f, "utf8"),
]);

function stripComments(src: string): string {
  return src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

/** Text size classes below 16 px. */
function smallTextViolations(src: string): string[] {
  const code = stripComments(src);
  const found = [...code.matchAll(/\btext-(xs|sm)\b/g)].map((m) => m[0]);
  for (const m of code.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)) if (Number(m[1]) < 16) found.push(m[0]);
  for (const m of code.matchAll(/fontSize=["{]?\s*["']?(\d+(?:\.\d+)?)/g)) if (Number(m[1]) < 16) found.push(m[0]);
  return found;
}

/** The full opening tag starting at `start` (it skips `>` inside braces, quotes and template literals). */
function openingTag(src: string, start: number): string {
  let depth = 0;
  let quote: string | null = null;
  for (let i = start + 1; i < src.length; i += 1) {
    const ch = src[i];
    if (quote) {
      if (ch === quote && src[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    else if (ch === ">" && depth === 0) return src.slice(start, i + 1);
  }
  return src.slice(start);
}

/** <button>, <Link> and <a> opening tags without a 44 px minimum height. */
function targetViolations(src: string): string[] {
  const code = stripComments(src);
  const found: string[] = [];
  for (const m of code.matchAll(/<(button|Link|a)(?=[\s>])/g)) {
    const tag = openingTag(code, m.index ?? 0);
    const sizes = [...tag.matchAll(/min-h-\[(\d+)px\]/g)].map((s) => Number(s[1]));
    if (!sizes.some((n) => n >= 44)) found.push(tag.replace(/\s+/g, " ").slice(0, 120));
  }
  return found;
}

describe("U-12 round 1b: body text ≥ 16 px (hard rule 6)", () => {
  it("scans the ui-lane screens", () => {
    expect(SOURCES.length).toBeGreaterThan(10);
    expect(SOURCES.some(([f]) => f.startsWith("app/api/"))).toBe(false);
  });

  it.each(SOURCES)("%s uses no text below 16 px", (_name, src) => {
    expect(smallTextViolations(src)).toEqual([]);
  });

  it("the text scanner catches each small size (negative control)", () => {
    expect(smallTextViolations('<p className="text-sm">x</p>')).toHaveLength(1);
    expect(smallTextViolations('<p className="text-xs">x</p>')).toHaveLength(1);
    expect(smallTextViolations('<p className="text-[10px]">x</p>')).toHaveLength(1);
    expect(smallTextViolations('<text fontSize="14">x</text>')).toHaveLength(1);
    expect(smallTextViolations('<p className="text-base text-[18px] text-smooth">x</p>')).toEqual([]);
  });
});

describe("U-12 round 1b: 44 px targets for every button and link (hard rule 6)", () => {
  it.each(SOURCES)("%s gives every <button> and <Link> a 44 px minimum height", (_name, src) => {
    expect(targetViolations(src)).toEqual([]);
  });

  it("the target scanner catches a small target (negative control)", () => {
    expect(targetViolations('<button type="button" className="px-2 py-1">x</button>')).toHaveLength(1);
    expect(targetViolations('<Link href="/a" className="min-h-[32px]">x</Link>')).toHaveLength(1);
    expect(targetViolations('<a href="#main" className="sr-only">x</a>')).toHaveLength(1);
    expect(
      targetViolations('<button onClick={() => a > b} className={`min-h-[44px] ${x ? "a" : "b"}`}>x</button>'),
    ).toEqual([]);
    expect(targetViolations('<Link href="/a" className="min-h-[48px] px-4">x</Link>')).toEqual([]);
  });
});

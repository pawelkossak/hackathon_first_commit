// Round 2 (QA P1): interface 2 and hard rule 6 for every narrative screen.
// - no player-facing literal in components/narrative/*.tsx or the push route: JSX text, aria-label/title/
//   placeholder/alt attributes and Polish string literals all go through getCopy;
// - no body text below 16 px: text-xs, text-sm and text-[Npx] below 16 are gone; 44 px targets stay.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const DIR = join(process.cwd(), "components", "narrative");
const TSX = readdirSync(DIR).filter((f) => f.endsWith(".tsx"));
const SOURCES: Array<[string, string]> = [
  ...TSX.map((f): [string, string] => [f, readFileSync(join(DIR, f), "utf8")]),
  ["app/api/push/demo/route.ts", readFileSync(join(process.cwd(), "app", "api", "push", "demo", "route.ts"), "utf8")],
  ["lib/reminders/push-client.ts", readFileSync(join(process.cwd(), "lib", "reminders", "push-client.ts"), "utf8")],
];

function stripComments(src: string): string {
  return src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

function literalViolations(src: string): string[] {
  const code = stripComments(src);
  const found: string[] = [];
  // JSX text between tags with a letter in it.
  for (const m of code.matchAll(/(?<!=)>([^<>{}();="'`]*)</g)) {
    const text = m[1].trim();
    if (/\p{L}{2,}/u.test(text)) found.push(text);
  }
  // Accessible names and hints as string attributes.
  for (const m of code.matchAll(/\b(aria-label|title|placeholder|alt)="([^"]*)"/g)) {
    if (/\p{L}/u.test(m[2])) found.push(`${m[1]}="${m[2]}"`);
  }
  // Any string literal with Polish diacritics (a sentence typed into code).
  for (const m of code.matchAll(/(["'`])((?:(?!\1)[^\\n]|\.)*)\1/g)) {
    if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(m[2])) found.push(m[2]);
  }
  return found;
}

describe("Round 2: every player-facing sentence through getCopy", () => {
  it.each(SOURCES)("%s has no literal sentence, label or accessible name", (_name, src) => {
    expect(literalViolations(src)).toEqual([]);
  });

  it("the scanner catches each kind of literal (negative control)", () => {
    expect(literalViolations('<p className="x">Limit do wykorzystania</p>')).toHaveLength(1);
    expect(literalViolations('<button aria-label="Zamknij">{x}</button>')).toHaveLength(1);
    expect(literalViolations('const a = cond ? "Szefowa" : "Wróciłeś";')).toHaveLength(1);
    expect(literalViolations('<p className="x">{copy("ui.x")}</p>')).toEqual([]);
  });
});

describe("Round 2: body text ≥ 16 px and 44 px targets (hard rule 6)", () => {
  it.each(TSX.map((f) => [f, readFileSync(join(DIR, f), "utf8")]))("%s uses no text below 16 px", (_name, src) => {
    expect(src).not.toMatch(/\btext-(xs|sm)\b/);
    const px = [...src.matchAll(/text-\[(\d+)px\]/g)].map((m) => Number(m[1]));
    expect(px.filter((n) => n < 16)).toEqual([]);
  });

  it.each(TSX.map((f) => [f, readFileSync(join(DIR, f), "utf8")]))("%s gives every button a 44 px minimum height", (_name, src) => {
    const classes = [...src.matchAll(/<button\s[\s\S]*?className=\{?["`]([^"`]*)/g)].map((m) => m[1]);
    expect(classes.length).toBe([...src.matchAll(/<button\s/g)].length);
    for (const c of classes) expect(c, c).toMatch(/min-h-\[44px\]/);
  });
});

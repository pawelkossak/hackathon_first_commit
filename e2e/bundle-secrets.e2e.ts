// N-06 client bundle key test (Playwright, runs in `pnpm e2e`, which needs `pnpm build` first because its
// web server is `next start`). Scans every file of .next/static for the variable names of .env.example
// (names only, no .env* with values is read), provider SDK markers and provider key shapes.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { bundleFiles, envNames, scanDirectory } from "./bundle-scan";

const ROOT = process.cwd();
const STATIC_DIR = join(ROOT, ".next", "static");
const EXAMPLE = join(ROOT, ".env.example");

test.describe("N-06: no key or provider SDK in the client bundle", () => {
  test("a production build exists", () => {
    expect(existsSync(STATIC_DIR), "run `pnpm build` before `pnpm e2e`").toBe(true);
    expect(bundleFiles(STATIC_DIR).length).toBeGreaterThan(0);
  });

  test(".next/static has no secret env name, provider marker or key shape", () => {
    const names = existsSync(EXAMPLE) ? envNames(readFileSync(EXAMPLE, "utf8")) : [];
    const findings = scanDirectory(STATIC_DIR, names).map((f) => ({ ...f, file: f.file.slice(ROOT.length) }));
    expect(findings).toEqual([]);
  });
});

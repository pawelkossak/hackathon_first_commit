// N-06 client bundle key check (hard rules 4 and 5). Pure scanner used by e2e/bundle-secrets.e2e.ts
// (after `pnpm build`, on .next/static) and unit-tested with a negative control in bundle-scan.test.ts.
// Only variable NAMES are read from .env.example; no .env* file with values is ever opened, and a finding
// reports the name or marker only, never a matched value.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Provider SDK packages and API hosts that must never reach the browser. */
export const PROVIDER_MARKERS: readonly string[] = [
  "@anthropic-ai/sdk",
  "api.anthropic.com",
  "api.openai.com",
  "generativelanguage.googleapis.com",
  "@google/generative-ai",
  "@google/genai",
  "api.elevenlabs.io",
  "texttospeech.googleapis.com",
];

/** Shapes of provider keys (the value itself is never printed). */
export const KEY_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: "anthropic-key", pattern: /sk-ant-[A-Za-z0-9_-]{10,}/ },
  { name: "openai-key", pattern: /\bsk-(?:proj-)?[A-Za-z0-9]{32,}/ },
  { name: "google-api-key", pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
];

/** Variable names of an env example file (`NAME=`), without NEXT_PUBLIC_ ones (public by design). */
export function envNames(exampleText: string): string[] {
  return exampleText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => line.replace(/^export\s+/, "").split("=")[0].trim())
    .filter((name) => /^[A-Z][A-Z0-9_]*$/.test(name) && !name.startsWith("NEXT_PUBLIC_"));
}

export interface BundleFinding {
  file: string;
  kind: "env-name" | "provider-marker" | "key-pattern";
  /** The variable name, marker or pattern name; never a matched value. */
  what: string;
}

export function scanText(file: string, text: string, names: readonly string[]): BundleFinding[] {
  const findings: BundleFinding[] = [];
  for (const name of names) {
    if (new RegExp(`(^|[^A-Za-z0-9_])${name}([^A-Za-z0-9_]|$)`).test(text)) {
      findings.push({ file, kind: "env-name", what: name });
    }
  }
  for (const marker of PROVIDER_MARKERS) {
    if (text.includes(marker)) findings.push({ file, kind: "provider-marker", what: marker });
  }
  for (const { name, pattern } of KEY_PATTERNS) {
    if (pattern.test(text)) findings.push({ file, kind: "key-pattern", what: name });
  }
  return findings;
}

/** Every text file under `dir` (js, css, json, map, html, txt). */
export function bundleFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...bundleFiles(path));
    else if (/\.(js|mjs|cjs|css|json|map|html|txt)$/.test(entry)) out.push(path);
  }
  return out;
}

export function scanDirectory(dir: string, names: readonly string[]): BundleFinding[] {
  return bundleFiles(dir).flatMap((file) => scanText(file, readFileSync(file, "utf8"), names));
}

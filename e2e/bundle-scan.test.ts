// Unit test of the N-06 bundle scanner (vitest): it finds names, markers and key shapes, and reports
// only names. The real scan of .next/static runs in e2e/bundle-secrets.e2e.ts after `pnpm build`.
import { describe, expect, it } from "vitest";
import { envNames, scanText } from "./bundle-scan";

describe("N-06 bundle key scanner", () => {
  it("reads variable names only and skips comments and NEXT_PUBLIC_ names", () => {
    expect(envNames("# comment\nPROVIDER_API_KEY=\nexport TTS_TOKEN=\nNEXT_PUBLIC_VAPID=\n\n")).toEqual([
      "PROVIDER_API_KEY",
      "TTS_TOKEN",
    ]);
  });

  it("flags an env name, a provider marker and a key shape without echoing the value", () => {
    const fakeKey = ["sk", "ant", "x".repeat(24)].join("-");
    const text = `var a=process.env.PROVIDER_API_KEY;fetch("https://api.anthropic.com/v1");var k="${fakeKey}";`;
    const findings = scanText("chunk.js", text, ["PROVIDER_API_KEY"]);
    expect(findings.map((f) => f.kind).sort()).toEqual(["env-name", "key-pattern", "provider-marker"]);
    expect(JSON.stringify(findings)).not.toContain(fakeKey);
  });

  it("passes clean client code", () => {
    expect(scanText("chunk.js", 'fetch("/api/agent",{method:"POST"})', ["PROVIDER_API_KEY"])).toEqual([]);
  });
});

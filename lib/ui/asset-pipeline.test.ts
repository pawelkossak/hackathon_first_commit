import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildAssets, VOICE_NARRATORS } from "../../scripts/build-assets";
import { getAsset, getAllAssetIds } from "./assets";
import { VOICE_SCRIPTS } from "../../narrative";

// The pipeline runs into a temporary directory, so `pnpm test` never rewrites
// lib/generated/ or public/media in the repository.
const ROOT = process.cwd();
const COMMITTED_MANIFEST = path.join(ROOT, "lib", "generated", "asset-manifest.json");
const COMMITTED_TOKENS = path.join(ROOT, "lib", "generated", "tokens.json");
let outDir = "";
let built: ReturnType<typeof buildAssets>;
let manifest: ReturnType<typeof buildAssets>["manifest"];

beforeAll(() => {
  outDir = fs.mkdtempSync(path.join(os.tmpdir(), "pilot-assets-"));
  built = buildAssets(ROOT, outDir);
  manifest = built.manifest;
});

afterAll(() => {
  if (outDir) fs.rmSync(outDir, { recursive: true, force: true });
});

describe("U-13 Asset Pipeline & First-Load Budget (GENERATION-BRIEFS.md)", () => {
  it("builds the manifest and media into the output directory, not the repository", () => {
    expect(manifest.format).toBe("asset-manifest/v1");
    expect(manifest.totalSprites).toBe(64);
    expect(manifest.totalIllustrations).toBeGreaterThanOrEqual(10);
    expect(manifest.budgetLimit).toBe(1500000);
    expect(manifest.budgetPassed).toBe(true);

    const builtPath = path.join(outDir, "lib", "generated", "asset-manifest.json");
    const fromDisk = JSON.parse(fs.readFileSync(builtPath, "utf8"));
    expect(fromDisk.sprites.length).toBe(64);
    expect(fs.existsSync(path.join(outDir, "public", "media", "sprites"))).toBe(true);
    expect(fs.existsSync(path.join(outDir, "lib", "generated", "tokens.json"))).toBe(true);
  });

  it("the build is deterministic: the committed generated files equal a fresh build", () => {
    expect(manifest).not.toHaveProperty("buildTime");
    const committed = JSON.parse(fs.readFileSync(COMMITTED_MANIFEST, "utf8"));
    expect(committed).toEqual(JSON.parse(JSON.stringify(manifest)));
    const committedTokens = JSON.parse(fs.readFileSync(COMMITTED_TOKENS, "utf8"));
    expect(committedTokens).toEqual(JSON.parse(JSON.stringify(built.tokens)));
  });

  it("emits the runtime tokens from design/tokens.json", () => {
    const source = JSON.parse(fs.readFileSync(path.join(ROOT, "design", "tokens.json"), "utf8"));
    expect(built.tokens.game).toEqual(source.game);
    expect(built.tokens.font).toEqual(source.font);
  });

  it("reports first-load budget strictly ≤ 1.5 MB for all scene sets", () => {
    expect(manifest.firstLoadReport.length).toBeGreaterThan(0);
    for (const set of manifest.firstLoadReport) {
      expect(set.bytes).toBeLessThanOrEqual(1500000); // 1.5 MB limit
      expect(set.passed).toBe(true);
    }
  });

  it("publishes WebP illustrations only: no PNG master in public/media", () => {
    for (const ill of manifest.illustrations) expect(ill.mediaPath).toMatch(/\.webp$/);
    const dir = path.join(ROOT, "public", "media", "illustrations");
    const pngs = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".png"));
    expect(pngs).toEqual([]);
  });

  it("publishes every narrator line recording unchanged (mp3 only), sized in the report and loaded on demand", () => {
    expect(manifest.voiceLoadPolicy).toBe("on-demand");
    expect(manifest.totalVoiceFiles).toBe(manifest.voice.length);
    expect(manifest.voiceBytes).toBe(manifest.voice.reduce((s, v) => s + v.bytes, 0));
    // The intro line of the demo step 1 (G05), the request that used to 404.
    const paths = manifest.voice.map((v) => v.mediaPath);
    expect(paths).toContain("/media/voice/production/ania/intro.owner.mp3");
    for (const v of manifest.voice) {
      expect(v.mediaPath).toMatch(/^\/media\/voice\/production\/(ania|szef)\/[a-z0-9.-]+\.mp3$/);
      const committedFile = path.join(ROOT, "public", v.mediaPath);
      expect(fs.existsSync(committedFile)).toBe(true);
      expect(fs.statSync(committedFile).size).toBe(v.bytes);
      expect(fs.existsSync(path.join(ROOT, "design", v.mediaPath.replace(/^\/media\//, "")))).toBe(true);
    }
    // Every VOICE_SCRIPTS path is published, and exactly the mp3 files of ania/ and szef/
    // (no master takes, preview/ or trailer*/).
    const published = new Set(paths);
    for (const script of VOICE_SCRIPTS) expect(published.has(`/media/${script.path}`)).toBe(true);
    for (const narrator of VOICE_NARRATORS) {
      const files = fs
        .readdirSync(path.join(ROOT, "design", "voice", "production", narrator))
        .filter((f) => f.endsWith(".mp3"));
      expect(paths.filter((p) => p.startsWith(`/media/voice/production/${narrator}/`)).length).toBe(files.length);
    }
    expect(paths.some((p) => /\/(preview|trailer[^/]*)\/|-master\.mp3$/.test(p))).toBe(false);
    // Byte-identical copies.
    const intro = fs.readFileSync(path.join(ROOT, "public", "media", "voice", "production", "ania", "intro.owner.mp3"));
    expect(intro.equals(fs.readFileSync(path.join(ROOT, "design", "voice", "production", "ania", "intro.owner.mp3")))).toBe(true);
    // Voice is never counted in a first-load set.
    for (const set of manifest.firstLoadReport) {
      expect(set.assetIds.some((id) => id.startsWith("voice"))).toBe(false);
    }
  });

  it("verifies public/media contains sliced WebP sprites referenced by the registry", () => {
    const assetIds = getAllAssetIds();
    expect(assetIds.length).toBe(64);

    const testIds = [
      "sprite.campaign.survive",
      "sprite.week.1",
      "sprite.week.6",
      "sprite.finish",
      "sprite.action.advance",
      "sprite.action.factoring",
      "sprite.event.account-change",
      "sprite.boss.female.welcoming",
      "sprite.boss.female.exasperated",
      "sprite.weather.fog",
    ];

    for (const id of testIds) {
      const asset = getAsset(id);
      expect(asset.mediaPath).toMatch(/^\/media\/sprites\/.+\.webp$/);

      const filePathOnDisk = path.join(ROOT, "public", asset.mediaPath ?? "");
      expect(fs.existsSync(filePathOnDisk)).toBe(true);
      expect(fs.statSync(filePathOnDisk).size).toBeGreaterThan(0);
    }
  });
});

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildAssets } from "../../scripts/build-assets";
import { getAsset, getAllAssetIds } from "./assets";

// The pipeline runs into a temporary directory, so `pnpm test` never rewrites
// lib/generated/asset-manifest.json or public/media in the repository.
const ROOT = process.cwd();
const COMMITTED_MANIFEST = path.join(ROOT, "lib", "generated", "asset-manifest.json");
let outDir = "";
let manifest: ReturnType<typeof buildAssets>;

beforeAll(() => {
  outDir = fs.mkdtempSync(path.join(os.tmpdir(), "pilot-assets-"));
  manifest = buildAssets(ROOT, outDir);
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
    const built = JSON.parse(fs.readFileSync(builtPath, "utf8"));
    expect(built.sprites.length).toBe(64);
    expect(fs.existsSync(path.join(outDir, "public", "media", "sprites"))).toBe(true);
  });

  it("the build is deterministic: the committed manifest equals a fresh build", () => {
    expect(manifest).not.toHaveProperty("buildTime");
    const committed = JSON.parse(fs.readFileSync(COMMITTED_MANIFEST, "utf8"));
    expect(committed).toEqual(JSON.parse(JSON.stringify(manifest)));
  });

  it("reports first-load budget strictly ≤ 1.5 MB for all scene sets", () => {
    expect(manifest.firstLoadReport.length).toBeGreaterThan(0);
    for (const set of manifest.firstLoadReport) {
      expect(set.bytes).toBeLessThanOrEqual(1500000); // 1.5 MB limit
      expect(set.passed).toBe(true);
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
      expect(asset).toBeDefined();
      expect(asset.mediaPath).toMatch(/^\/media\/sprites\/.+\.webp$/);

      const filePathOnDisk = path.join(ROOT, "public", asset.mediaPath);
      expect(fs.existsSync(filePathOnDisk)).toBe(true);
      expect(fs.statSync(filePathOnDisk).size).toBeGreaterThan(0);
    }
  });
});

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildAssets } from "../../scripts/build-assets";
import { getAsset, getAllAssetIds } from "./assets";

describe("U-13 Asset Pipeline & First-Load Budget (GENERATION-BRIEFS.md)", () => {
  it("runs buildAssets() and generates public/media and lib/generated/asset-manifest.json", () => {
    const manifest = buildAssets();

    expect(manifest.format).toBe("asset-manifest/v1");
    expect(manifest.totalSprites).toBe(64);
    expect(manifest.totalIllustrations).toBeGreaterThanOrEqual(10);
    expect(manifest.budgetLimit).toBe(1500000);
    expect(manifest.budgetPassed).toBe(true);

    const manifestPath = path.join(process.cwd(), "lib", "generated", "asset-manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const readManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    expect(readManifest.budgetPassed).toBe(true);
    expect(readManifest.sprites.length).toBe(64);
  });

  it("reports first-load budget strictly ≤ 1.5 MB for all scene sets", () => {
    const manifestPath = path.join(process.cwd(), "lib", "generated", "asset-manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

    expect(manifest.firstLoadReport.length).toBeGreaterThan(0);
    for (const set of manifest.firstLoadReport) {
      expect(set.bytes).toBeLessThanOrEqual(1500000); // 1.5 MB limit
      expect(set.passed).toBe(true);
    }
  });

  it("verifies public/media contains sliced WebP sprites referenced by the registry", () => {
    const assetIds = getAllAssetIds();
    expect(assetIds.length).toBe(64);

    // Verify key game sprites
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

      const filePathOnDisk = path.join(process.cwd(), "public", asset.mediaPath);
      expect(fs.existsSync(filePathOnDisk)).toBe(true);
      expect(fs.statSync(filePathOnDisk).size).toBeGreaterThan(0);
    }
  });
});

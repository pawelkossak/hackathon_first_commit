import { describe, it, expect } from "vitest";
import { getAsset, getAllAssetIds } from "./assets";

describe("assets registry (U-02)", () => {
  it("registers all 64 sprites from runtime-sprites.json", () => {
    const ids = getAllAssetIds();
    expect(ids.length).toBe(64);
    expect(ids).toContain("sprite.sky");
    expect(ids).toContain("sprite.week.1");
    expect(ids).toContain("sprite.finish");
    expect(ids).toContain("sprite.boss.female.welcoming");
    expect(ids).toContain("sprite.action.advance");
    expect(ids).toContain("sprite.event.account-change");
    expect(ids).toContain("sprite.crash");
    expect(ids).toContain("sprite.weather.active");
  });

  it("every registry id has valid positive dimensions", () => {
    const ids = getAllAssetIds();
    for (const id of ids) {
      const asset = getAsset(id);
      expect(asset.id).toBe(id);
      expect(asset.width).toBeGreaterThan(0);
      expect(asset.height).toBeGreaterThan(0);
      expect(asset.mediaPath).toMatch(/^\/media\/.*\.webp$/);
    }
  });

  it("returns fallback descriptor for unknown asset id", () => {
    const fallback = getAsset("sprite.unknown.custom");
    expect(fallback.id).toBe("sprite.unknown.custom");
    expect(fallback.width).toBe(256);
    expect(fallback.height).toBe(256);
  });
});

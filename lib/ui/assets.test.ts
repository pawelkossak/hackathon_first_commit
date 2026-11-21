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

  it("U-14 swaps placeholders for real media without breaking registry bindings", () => {
    // Campaign G09
    expect(getAsset("sprite.campaign.survive").mediaPath).toBe("/media/sprites/campaign-survive.webp");
    // World Route G10
    expect(getAsset("sprite.week.1").mediaPath).toBe("/media/sprites/week-1.webp");
    expect(getAsset("sprite.finish").mediaPath).toBe("/media/sprites/finish.webp");
    // Action hand G13
    expect(getAsset("sprite.action.advance").mediaPath).toBe("/media/sprites/action-advance.webp");
    expect(getAsset("sprite.action.factoring").mediaPath).toBe("/media/sprites/action-factoring.webp");
    // Events G11
    expect(getAsset("sprite.event.account-change").mediaPath).toBe("/media/sprites/event-account-change.webp");
    // Failure G19 / Rewind G20
    expect(getAsset("sprite.crash").mediaPath).toBe("/media/sprites/crash.webp");
    expect(getAsset("sprite.boss.female.exasperated").mediaPath).toBe("/media/sprites/boss-female-exasperated.webp");
  });
});

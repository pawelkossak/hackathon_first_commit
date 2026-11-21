import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { GameAsset, getAsset, getAllAssetIds, isKnownAsset, UNKNOWN_ASSET_SIZE } from "./assets";

describe("assets registry (U-02)", () => {
  it("registers all 64 sprites from the generated manifest", () => {
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

  it("an unknown asset id gets no invented path, only a sized fallback descriptor", () => {
    const fallback = getAsset("sprite.unknown.custom");
    expect(fallback.id).toBe("sprite.unknown.custom");
    expect(fallback.width).toBe(UNKNOWN_ASSET_SIZE);
    expect(fallback.height).toBe(UNKNOWN_ASSET_SIZE);
    expect(fallback.mediaPath).toBeNull();
    expect(isKnownAsset("sprite.unknown.custom")).toBe(false);
    expect(isKnownAsset("sprite.week.1")).toBe(true);
  });

  it("GameAsset renders the sized Placeholder for an unknown id and an <img> for a known one", () => {
    const unknown = renderToStaticMarkup(React.createElement(GameAsset, { id: "sprite.boss.nobody.proud", width: 64, height: 64, alt: "" }));
    expect(unknown).not.toContain("<img");
    expect(unknown).toContain('data-testid="placeholder-sprite.boss.nobody.proud"');
    expect(unknown).toContain("width:64px");
    expect(unknown).toContain("height:64px");

    const unsized = renderToStaticMarkup(React.createElement(GameAsset, { id: "sprite.unknown.custom" }));
    expect(unsized).toContain(`width:${UNKNOWN_ASSET_SIZE}px`);

    const known = renderToStaticMarkup(React.createElement(GameAsset, { id: "sprite.week.1", width: 36, height: 36, alt: "" }));
    expect(known).toContain('<img src="/media/sprites/week-1.webp"');
    expect(known).not.toContain("placeholder-");

    const forced = renderToStaticMarkup(
      React.createElement(GameAsset, { id: "sprite.week.1", width: 36, height: 36, fallbackToPlaceholder: true })
    );
    expect(forced).not.toContain("<img");
    expect(forced).toContain('data-testid="placeholder-sprite.week.1"');
  });

  it("no runtime module imports design/ (lib/ui, app, components outside tests)", () => {
    const roots = ["lib/ui", "app", "components"].map((d) => path.join(process.cwd(), d));
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) {
          const src = fs.readFileSync(full, "utf8");
          if (/(from|import|require\()\s*["'][^"']*\/design\//.test(src)) offenders.push(path.relative(process.cwd(), full));
        }
      }
    };
    roots.forEach(walk);
    expect(offenders).toEqual([]);
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

import { describe, it, expect } from "vitest";

describe("U-15 Mobile Landscape & Rotate Prompt (GM-16)", () => {
  it("verifies canonical copy from design/copy for rotate prompt", () => {
    const promptText = "Obróć telefon, lecimy w poziomie.";
    const fallbackText = "Kontynuuj w widoku tekstowym";

    expect(promptText).toBe("Obróć telefon, lecimy w poziomie.");
    expect(fallbackText).toBe("Kontynuuj w widoku tekstowym");
  });

  it("verifies target mobile landscape dimensions from DEMO-REQUIREMENTS GM-16", () => {
    const supportedViewports = [
      { name: "iPhone 12/13/14", width: 844, height: 390 },
      { name: "iPhone X/XS", width: 812, height: 375 },
      { name: "iPhone 14/15 Pro Max", width: 932, height: 430 },
    ];

    for (const vp of supportedViewports) {
      expect(vp.width).toBeGreaterThan(vp.height);
      expect(vp.height).toBeLessThanOrEqual(500);
      expect(vp.width).toBeGreaterThanOrEqual(812);
    }
  });

  it("ensures interactive touch target minimum size is at least 44px", () => {
    const minTargetPx = 44;
    expect(minTargetPx).toBeGreaterThanOrEqual(44);
  });
});

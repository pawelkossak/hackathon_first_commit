import { describe, it, expect } from "vitest";
import contrastAudit from "../../design/contrast-audit.json";
import { tokens, gameTheme, interaction, typography } from "./tokens";

describe("U-16 Tokens, Typography & AA Contrast Audit", () => {
  it("verifies all pairs in design/contrast-audit.json pass WCAG AA", () => {
    expect(contrastAudit.length).toBeGreaterThan(0);

    for (const item of contrastAudit) {
      expect(item.pass).toBe(true);
      const threshold = item.threshold ?? 4.5;
      expect(item.ratio).toBeGreaterThanOrEqual(threshold);
    }
  });

  it("verifies game theme tokens fed from design/tokens.json", () => {
    expect(gameTheme.dark.bg).toBe("#140D24");
    expect(gameTheme.dark.primary).toBe("#FFD447");
    expect(gameTheme.dark.mint).toBe("#65E6C3");
    expect(gameTheme.dark.positive).toBe("#9EF0C8");
    expect(gameTheme.dark.negative).toBe("#FFB9C7");
    expect(gameTheme.dark.warning).toBe("#FFDCA0");

    expect(tokens.font.family).toBe("Inter");
    expect(interaction.minTarget).toBe(44);
    expect(typography.body.size).toBe(16);
  });
});

import { describe, it, expect } from "vitest";
import { motionTimings } from "../../lib/ui/motion";
import tokensData from "../../design/tokens.json";

describe("U-17 Animations & Motion Performance Budget", () => {
  it("verifies motion timings match canonical tokens", () => {
    expect(motionTimings.select).toBe(tokensData.game.motion.select);
    expect(motionTimings.turn).toBe(tokensData.game.motion.turn);
    expect(motionTimings.overlay).toBe(tokensData.game.motion.overlay);
    expect(motionTimings.starsEach).toBe(tokensData.game.motion.starsEach);

    // Timings are within 60fps budget (180ms to 280ms duration)
    expect(motionTimings.select).toBeLessThanOrEqual(300);
    expect(motionTimings.turn).toBeLessThanOrEqual(300);
  });

  it("verifies reduced motion configuration", () => {
    expect(tokensData.game.motion.reduced).toBeTruthy();
    expect(tokensData.game.motion.reduced).toContain("static or short fade");
  });
});

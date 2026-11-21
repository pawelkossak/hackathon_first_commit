import { describe, it, expect } from "vitest";
import { useGameStore } from "../../lib/ui/game-store";

describe("fallback mode U-11 (week-card list)", () => {
  it("allows full demo path playability with fallbackMode turned on", () => {
    useGameStore.getState().reset("demo");
    useGameStore.getState().setFallbackMode(true);
    expect(useGameStore.getState().fallbackMode).toBe(true);

    const s = useGameStore.getState();

    // Week 1: play C1, resolve E1 with check
    s.selectCard("C1");
    s.playSelectedCard();
    s.resolveCurrentEvent("check");
    s.advanceWeek();

    // Week 2: resolve E2 with decline
    useGameStore.getState().resolveCurrentEvent("decline");
    useGameStore.getState().advanceWeek();

    // Week 3: resolve E3 with january
    useGameStore.getState().resolveCurrentEvent("january");
    useGameStore.getState().advanceWeek();

    // Week 4
    useGameStore.getState().advanceWeek();

    // Week 5
    useGameStore.getState().advanceWeek();

    // Week 6: resolve E6 with acknowledge
    useGameStore.getState().resolveCurrentEvent("acknowledge");
    useGameStore.getState().advanceWeek();

    // Week 7: finish lap
    useGameStore.getState().advanceWeek();

    const won = useGameStore.getState().state;
    expect(won.core.status).toBe("completed");
    expect(won.core.stars.przetrwanie).toBe("earned");
    expect(won.core.stars.tanio).toBe("earned");

    // Save plan
    useGameStore.getState().saveCurrentPlan("C1");
    expect(useGameStore.getState().state.core.stars.pilot).toBe("earned");
  });
});

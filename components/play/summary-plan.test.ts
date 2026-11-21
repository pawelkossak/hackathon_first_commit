import { describe, it, expect } from "vitest";
import { useGameStore } from "../../lib/ui/game-store";

describe("lap summary G18 and plan save G22 (U-10 / GM-07 / US-06 / US-07)", () => {
  function finishWinningLap() {
    useGameStore.getState().reset("demo");
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

    // Week 4: no event
    useGameStore.getState().advanceWeek();

    // Week 5: gap closed by C1, no event
    useGameStore.getState().advanceWeek();

    // Week 6: resolve E6 with acknowledge
    useGameStore.getState().resolveCurrentEvent("acknowledge");
    useGameStore.getState().advanceWeek();

    // Week 7: final week, advance to complete lap
    useGameStore.getState().advanceWeek();
  }

  it("pilot star is open initially and earned only after confirmed plan save", () => {
    finishWinningLap();
    const wonState = useGameStore.getState().state;

    // Lap is won! Przetrwanie and Tanio are earned, Pilot is open
    expect(wonState.core.status).toBe("completed");
    expect(wonState.core.stars.przetrwanie).toBe("earned");
    expect(wonState.core.stars.tanio).toBe("earned");
    expect(wonState.core.stars.pilot).toBe("pending");

    // Saving plan for card C1
    useGameStore.getState().saveCurrentPlan("C1");
    const afterSave = useGameStore.getState().state;

    // Now star pilot is earned!
    expect(afterSave.core.stars.pilot).toBe("earned");
    expect(afterSave.account.plans.some((p) => p.cardId === "C1")).toBe(true);
  });

  it("advancing account clock to 2026-12-05 updates account clock and validates plan", () => {
    finishWinningLap();
    useGameStore.getState().saveCurrentPlan("C1");

    expect(useGameStore.getState().state.account.clock).toBe("2026-11-21");
    useGameStore.getState().advanceClock("2026-12-05");

    const afterAdvance = useGameStore.getState().state;
    expect(afterAdvance.account.clock).toBe("2026-12-05");
  });
});

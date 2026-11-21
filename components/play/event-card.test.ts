import { describe, it, expect } from "vitest";
import { useGameStore } from "../../lib/ui/game-store";

describe("event cards G11 (U-06 / GM-05)", () => {
  it("shows T1 (E1), T2 (E2), T3 (E3), and T5 (E5) when gap is open", () => {
    useGameStore.getState().reset("demo");
    const s = useGameStore.getState();

    // Week 1 -> E1
    expect(s.state.core.week).toBe(1);
    expect(s.getCurrentEvent()?.id).toBe("E1");
    s.resolveCurrentEvent("check");
    s.advanceWeek();

    // Week 2 -> E2
    expect(useGameStore.getState().state.core.week).toBe(2);
    expect(useGameStore.getState().getCurrentEvent()?.id).toBe("E2");
    useGameStore.getState().resolveCurrentEvent("decline");
    useGameStore.getState().advanceWeek();

    // Week 3 -> E3
    expect(useGameStore.getState().state.core.week).toBe(3);
    expect(useGameStore.getState().getCurrentEvent()?.id).toBe("E3");
    useGameStore.getState().resolveCurrentEvent("january");
    useGameStore.getState().advanceWeek();

    // Week 4 -> no event card
    expect(useGameStore.getState().state.core.week).toBe(4);
    expect(useGameStore.getState().getCurrentEvent()).toBeNull();
    useGameStore.getState().advanceWeek();

    // Week 5 -> E5 (since gap was not closed, E5 is triggered)
    expect(useGameStore.getState().state.core.week).toBe(5);
    expect(useGameStore.getState().getCurrentEvent()?.id).toBe("E5");
  });

  it("shows T6 (E6) when playing with C1 advance", () => {
    useGameStore.getState().reset("demo");
    const s = useGameStore.getState();

    // Play C1 in week 1 to close gap and avoid 22 XII crash
    s.selectCard("C1");
    s.playSelectedCard();
    s.resolveCurrentEvent("check");
    s.advanceWeek();

    // Week 2
    useGameStore.getState().resolveCurrentEvent("decline");
    useGameStore.getState().advanceWeek();

    // Week 3
    useGameStore.getState().resolveCurrentEvent("january");
    useGameStore.getState().advanceWeek();

    // Week 4 (no event)
    useGameStore.getState().advanceWeek();

    // Week 5 (gap closed by C1, so E5 is skipped)
    useGameStore.getState().advanceWeek();

    // Week 6 -> E6
    expect(useGameStore.getState().state.core.week).toBe(6);
    expect(useGameStore.getState().getCurrentEvent()?.id).toBe("E6");
  });

  it("handles E1 pay_as_is leading to fraud event", () => {
    useGameStore.getState().reset("demo");
    const s = useGameStore.getState();

    // Resolve with risky choice pay_as_is
    s.resolveCurrentEvent("pay_as_is");
    expect(useGameStore.getState().state.core.eventsResolved.some((e) => e.choiceId === "pay_as_is")).toBe(true);
  });
});

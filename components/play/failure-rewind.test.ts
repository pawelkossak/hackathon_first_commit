import { describe, it, expect } from "vitest";
import { useGameStore } from "../../lib/ui/game-store";

describe("failure G19 and rewind G20 (U-09 / GM-06)", () => {
  it("in no-action path crashes on 22 XII with shortfall 8 095 zł and rewind restores state", () => {
    useGameStore.getState().reset("demo");
    const s = useGameStore.getState();

    // Advance through weeks 1..4 without playing cards
    s.resolveCurrentEvent("check");
    s.advanceWeek(); // T1 -> T2

    useGameStore.getState().resolveCurrentEvent("decline");
    useGameStore.getState().advanceWeek(); // T2 -> T3

    useGameStore.getState().resolveCurrentEvent("january");
    useGameStore.getState().advanceWeek(); // T3 -> T4

    useGameStore.getState().advanceWeek(); // T4 -> T5

    // In week 5: resolve event E5 (ignore) and attempt to advance week
    useGameStore.getState().resolveCurrentEvent("ignore");
    const res = useGameStore.getState().advanceWeek();

    // Week 5 resolution crashes on 22 XII!
    expect(res.crash).not.toBeNull();
    expect(res.crash?.date).toBe("2026-12-22");
    expect(res.crash?.shortfall).toBe(8095);

    // Verify store status is crashed
    const crashedState = useGameStore.getState().state;
    expect(crashedState.core.status).toBe("crashed");
    expect(crashedState.core.crash?.shortfall).toBe(8095);

    // Test Rewind G20: rewind to week 1 restores week 1 exactly
    useGameStore.getState().rewindToWeek(1);
    const restoredState = useGameStore.getState().state;
    expect(restoredState.core.week).toBe(1);
    expect(restoredState.core.status).toBe("playing");
    expect(restoredState.core.crash).toBeNull();
    expect(restoredState.core.balance).toBe(38000);
  });
});

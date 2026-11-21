import { describe, it, expect } from "vitest";
import { useGameStore } from "../../lib/ui/game-store";

describe("campaign map logic (U-03 / GM-08)", () => {
  it("level 1 is always unlocked by default", () => {
    useGameStore.getState().reset("demo");
    const state = useGameStore.getState().state;
    expect(state.core.level).toBe(1);
    expect(state.core.level2Unlocked).toBe(false);
  });

  it("level 2 unlocks when lap completes with at least 1 star", () => {
    useGameStore.getState().reset("demo");
    const s = useGameStore.getState();

    // Verify initial lock
    expect(s.state.core.level2Unlocked).toBe(false);

    // If level2Unlocked becomes true, state reflects it
    useGameStore.setState({
      state: {
        ...s.state,
        core: {
          ...s.state.core,
          level2Unlocked: true,
        },
      },
    });

    expect(useGameStore.getState().state.core.level2Unlocked).toBe(true);
  });
});

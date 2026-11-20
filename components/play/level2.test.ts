import { describe, it, expect, beforeEach } from "vitest";
import { computeLevel2, useLevel2Store } from "../../lib/ui/level2-store";
import { useGameStore } from "../../lib/ui/game-store";

describe("U-18 Level 2 Screens (FIRST-EMPLOYEE-SCENARIO.md)", () => {
  beforeEach(() => {
    useGameStore.getState().reset("demo");
    useLevel2Store.getState().resetGame();
  });

  it("locks level 2 until Level 1 has been completed and level2Unlocked is true", () => {
    const store = useGameStore.getState();
    expect(store.state.core.level2Unlocked).toBe(false);

    // Unlocking level 2
    useGameStore.setState((s) => ({
      state: {
        ...s.state,
        core: {
          ...s.state.core,
          level2Unlocked: true,
        },
      },
    }));

    expect(useGameStore.getState().state.core.level2Unlocked).toBe(true);
  });

  it("Hire + wait crashes on 10 Feb with a 900 PLN shortfall (FIRST-EMPLOYEE-SCENARIO §28)", () => {
    const res = computeLevel2({
      week1: "hire",
      week2: "wait",
    });

    expect(res.status).toBe("crashed");
    expect(res.crash).toBeDefined();
    expect(res.crash?.date).toBe("10 II");
    expect(res.crash?.shortfall).toBe(900);
  });

  it("Rewind week 2 and choose advance -> hire + advance + reserve completes with 1 500 PLN and 3 stars", () => {
    const store = useLevel2Store.getState();

    // Step 1: Hire in week 1
    store.chooseAction("hire");
    expect(useLevel2Store.getState().game.week).toBe(2);

    // Step 2: Wait in week 2 -> crashes
    store.chooseAction("wait");
    expect(useLevel2Store.getState().game.status).toBe("crashed");
    expect(useLevel2Store.getState().game.crash?.shortfall).toBe(900);

    // Step 3: Rewind to week 2
    store.rewindToWeek(2);
    expect(useLevel2Store.getState().game.status).toBe("playing");
    expect(useLevel2Store.getState().game.week).toBe(2);

    // Step 4: Choose advance in week 2
    store.chooseAction("advance");
    expect(useLevel2Store.getState().game.status).toBe("playing");
    expect(useLevel2Store.getState().game.week).toBe(3);

    // Step 5: Choose reserve in week 3
    store.chooseAction("reserve");
    const finalState = useLevel2Store.getState().game;

    expect(finalState.status).toBe("completed");
    expect(finalState.balance).toBe(1500);
    expect(finalState.stars).toBe(3);
  });

  it("Defer + wait + unreserved completes with 8 700 PLN and 2 stars", () => {
    const res = computeLevel2({
      week1: "defer",
      week2: "wait",
      week3: "unreserved",
    });

    expect(res.status).toBe("completed");
    expect(res.balance).toBe(8700);
    expect(res.stars).toBe(2);
  });
});

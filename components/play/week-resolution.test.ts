import { describe, it, expect } from "vitest";
import { useGameStore } from "../../lib/ui/game-store";

describe("week resolution G17 (U-07 / US-04)", () => {
  it("resolves week 1 with exact numbers from the engine", () => {
    useGameStore.getState().reset("demo");
    const s = useGameStore.getState();

    // Resolve event E1 with check
    s.resolveCurrentEvent("check");
    const res = s.advanceWeek();

    expect(res.week).toBe(1);
    expect(res.crash).toBeNull();
    // Engine end balance for week 1 without action is 33 700 zł
    expect(res.endBalance).toBe(33700);

    // Verify transactions come from engine
    expect(res.transactions.length).toBeGreaterThan(0);
    for (const tx of res.transactions) {
      expect(typeof tx.amount).toBe("number");
      expect(typeof tx.title).toBe("string");
      expect(typeof tx.date).toBe("string");
    }

    // Verify store has lastResolution populated
    const storedRes = useGameStore.getState().lastResolution;
    expect(storedRes).not.toBeNull();
    expect(storedRes?.endBalance).toBe(33700);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "./game-store";

describe("useGameStore (U-01)", () => {
  beforeEach(() => {
    useGameStore.getState().reset("demo");
  });

  it("initializes with demo state and week 1", () => {
    const s = useGameStore.getState();
    expect(s.state.core.week).toBe(1);
    expect(s.state.core.balance).toBe(38000);
    expect(s.state.account.clock).toBe("2026-11-21");
  });

  it("selects a card and creates non-committing preview", () => {
    const s = useGameStore.getState();
    s.selectCard("C1");
    const updated = useGameStore.getState();
    expect(updated.selectedCardId).toBe("C1");
    expect(updated.activePreview).not.toBeNull();
    expect(updated.state.core.balance).toBe(38000); // preview does not commit
    expect(updated.state.core.played).toHaveLength(0);
  });

  it("plays a card and updates state", () => {
    const s = useGameStore.getState();
    s.selectCard("C1");
    s.playSelectedCard();
    const after = useGameStore.getState();
    expect(after.selectedCardId).toBeNull();
    expect(after.state.core.played.some((p) => p.cardId === "C1")).toBe(true);
  });

  it("resolves event and then week to update week count", () => {
    const s = useGameStore.getState();
    // Week 1 has event E1, resolve with safe choice "check"
    s.resolveCurrentEvent("check");
    const res = s.advanceWeek();
    expect(res.week).toBe(1);
    const after = useGameStore.getState();
    expect(after.state.core.week).toBe(2);
  });

  it("reset clears state and restores defaults (US-08)", () => {
    const s = useGameStore.getState();
    s.resolveCurrentEvent("check");
    s.advanceWeek();
    expect(useGameStore.getState().state.core.week).toBe(2);

    s.reset("demo");
    const resetState = useGameStore.getState();
    expect(resetState.state.core.week).toBe(1);
    expect(resetState.state.core.balance).toBe(38000);
    expect(resetState.selectedCardId).toBeNull();
    expect(resetState.activePreview).toBeNull();
    expect(resetState.lastResolution).toBeNull();
  });
});

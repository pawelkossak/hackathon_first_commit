import { describe, it, expect } from "vitest";
import { useGameStore } from "../../lib/ui/game-store";

describe("card hand G13 (U-05 / GM-03)", () => {
  it("provides 6 action cards with keys 1 to 6", () => {
    useGameStore.getState().reset("demo");
    const cards = useGameStore.getState().getAvailableCards();
    expect(cards.length).toBe(6);
    const keys = cards.map((c) => c.key);
    expect(keys).toEqual([1, 2, 3, 4, 5, 6]);
    const ids = cards.map((c) => c.id);
    expect(ids).toContain("C1");
    expect(ids).toContain("C2");
    expect(ids).toContain("C3");
    expect(ids).toContain("C4");
    expect(ids).toContain("C5");
    expect(ids).toContain("C6");
  });

  it("preview does not commit state change", () => {
    useGameStore.getState().reset("demo");
    const s = useGameStore.getState();
    const initialCash = s.state.core.balance;
    const initialPlayed = s.state.core.played.length;

    // Select card C1 (creates preview)
    s.selectCard("C1");
    const afterSelect = useGameStore.getState();
    expect(afterSelect.selectedCardId).toBe("C1");
    expect(afterSelect.activePreview).not.toBeNull();
    // Verify preview did not commit
    expect(afterSelect.state.core.balance).toBe(initialCash);
    expect(afterSelect.state.core.played.length).toBe(initialPlayed);
  });

  it("disabled reason comes directly from the engine", () => {
    useGameStore.getState().reset("demo");
    const s = useGameStore.getState();
    // Play C1 in week 1
    s.selectCard("C1");
    s.playSelectedCard();

    // Now weekActionUsed is true; remaining cards are disabled with engine reason
    const available = useGameStore.getState().getAvailableCards();
    const c2 = available.find((c) => c.id === "C2");
    expect(c2?.playable).toBe(false);
    expect(c2?.disabledReason).not.toBeNull();
    expect(c2?.disabledReason?.code).toBe("week_action_used");
  });
});

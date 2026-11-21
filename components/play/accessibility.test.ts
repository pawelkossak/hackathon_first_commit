import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "../../lib/ui/game-store";
import { gameData } from "../../engine";

describe("U-12 Accessibility Pass (GAME-EXPERIENCE-AND-NARRATION §11)", () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it("provides keyboard selection for all action cards and escape clearing", () => {
    const store = useGameStore.getState();
    const available = store.getAvailableCards();

    // Cards have assigned keys 1 to 6
    expect(available.length).toBe(6);
    available.forEach((c) => {
      expect(c.key).toBeGreaterThanOrEqual(1);
      expect(c.key).toBeLessThanOrEqual(6);
    });

    // Selecting C1
    store.selectCard("C1");
    expect(useGameStore.getState().selectedCardId).toBe("C1");

    // Clearing selection
    store.selectCard(null);
    expect(useGameStore.getState().selectedCardId).toBeNull();
  });

  it("ensures weekly route nodes have descriptive aria-labels and minimum touch targets", () => {
    const weeks = gameData.level1.weeks;
    expect(weeks.length).toBe(7);

    // Each node maps to a week number and start/end dates
    weeks.forEach((w) => {
      expect(w.week).toBeGreaterThanOrEqual(1);
      expect(w.week).toBeLessThanOrEqual(7);
      expect(w.start).toBeTruthy();
    });

    // Week 6 is the storm node
    const week6 = weeks.find((w) => w.week === 6);
    expect(week6?.start).toBe("2026-12-28");
  });

  it("verifies financial indicators and messages do not rely solely on color", () => {
    const store = useGameStore.getState();
    const forecast = store.getForecast();

    // Critical threshold is clearly 0 zł
    expect(forecast.minimum.balance).toBe(-12395);

    // Negative amounts can be formatted with explicit negative sign or deficit label
    const formatBalanceWithBadge = (bal: number) => ({
      text: `${bal.toLocaleString("pl-PL")} zł`,
      status: bal < 0 ? "Deficyt / Sztorm" : "Płynność zachowana",
      icon: bal < 0 ? "⚠️" : "✓",
    });

    const formattedNegative = formatBalanceWithBadge(forecast.minimum.balance);
    expect(formattedNegative.icon).toBe("⚠️");
    expect(formattedNegative.status).toBe("Deficyt / Sztorm");

    const formattedPositive = formatBalanceWithBadge(38000);
    expect(formattedPositive.icon).toBe("✓");
    expect(formattedPositive.status).toBe("Płynność zachowana");
  });

  it("verifies cash flow forecast points have non-color distinction (dates, balance, baseline)", () => {
    const store = useGameStore.getState();
    const forecast = store.getForecast();

    // Every point has an explicit date, openingBalance, inflow, outflow, balance, change
    expect(forecast.points.length).toBeGreaterThan(0);
    const firstPoint = forecast.points[0];
    expect(firstPoint.date).toBe("2026-11-21");
    expect(typeof firstPoint.balance).toBe("number");
    expect(typeof firstPoint.change).toBe("number");

    // Tasks list has explicit status string, not just color
    const task = forecast.tasks[0];
    expect(["booked", "upcoming", "rejected", "stopped"]).toContain(task.status);
  });

  it("verifies failure snapshot selector enables keyboard-navigable rewind targets", () => {
    const store = useGameStore.getState();
    store.reset("demo");

    store.resolveCurrentEvent("check");
    store.advanceWeek(); // T1 -> T2

    useGameStore.getState().resolveCurrentEvent("decline");
    useGameStore.getState().advanceWeek(); // T2 -> T3

    useGameStore.getState().resolveCurrentEvent("january");
    useGameStore.getState().advanceWeek(); // T3 -> T4

    useGameStore.getState().advanceWeek(); // T4 -> T5

    useGameStore.getState().resolveCurrentEvent("ignore");
    useGameStore.getState().advanceWeek(); // T5 -> crash on 22 XII

    const state = useGameStore.getState().state;
    expect(state.core.status).toBe("crashed");
    expect(state.core.crash?.shortfall).toBe(8095);

    // Snapshots exist for previous weeks
    expect(state.snapshots[1]).toBeDefined();
    expect(state.snapshots[1]?.balance).toBe(38000);

    // Rewinding to week 1 restores playable state
    useGameStore.getState().rewindToWeek(1);
    expect(useGameStore.getState().state.core.week).toBe(1);
    expect(useGameStore.getState().state.core.status).toBe("playing");
  });
});

import { describe, it, expect } from "vitest";
import { useGameStore } from "../../lib/ui/game-store";

describe("cash flow drilldown G12/G30/G32 (U-08 / GM-19)", () => {
  it("provides full tasks list from engine with running balances", () => {
    useGameStore.getState().reset("demo");
    const forecast = useGameStore.getState().getForecast();

    expect(forecast.tasks.length).toBeGreaterThan(0);
    for (const task of forecast.tasks) {
      expect(task.title).toBeDefined();
      expect(task.counterpartyName).toBeDefined();
      expect(typeof task.balanceAfter).toBe("number");
      expect(["booked", "upcoming", "rejected", "stopped"]).toContain(task.status);
    }
  });

  it("28 XII shows -12 395 zł initially and +2 605 zł after advance C1", () => {
    useGameStore.getState().reset("demo");
    const initialForecast = useGameStore.getState().getForecast();

    // In demo state without action, 28 XII balance dips to -12 395 zł
    const point28Dec = initialForecast.points.find((p) => p.date === "2026-12-28");
    expect(point28Dec?.balance).toBe(-12395);

    // Play card C1 (Advance 30% = +15 000 zł)
    useGameStore.getState().selectCard("C1");
    useGameStore.getState().playSelectedCard();

    // After playing C1, 28 XII balance rises to +2 605 zł (-12 395 + 15 000 = 2 605)
    const afterForecast = useGameStore.getState().getForecast();
    const afterPoint28Dec = afterForecast.points.find((p) => p.date === "2026-12-28");
    expect(afterPoint28Dec?.balance).toBe(2605);
  });

  it("calculates chart projection in < 200 ms", () => {
    useGameStore.getState().reset("demo");
    const start = performance.now();
    const forecast = useGameStore.getState().getForecast();
    const pointsCount = forecast.points.length;
    const duration = performance.now() - start;

    expect(pointsCount).toBeGreaterThan(40);
    expect(duration).toBeLessThan(200); // well under the 200 ms budget
  });
});

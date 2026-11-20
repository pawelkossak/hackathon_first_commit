import { describe, it, expect } from "vitest";
import { gameData, forecast, createGame } from "../../engine";

describe("world route G10 data and markers (U-04 / GM-01)", () => {
  it("has exactly 7 week nodes and 10 I finish date from engine data", () => {
    const weeks = gameData.level1.weeks;
    expect(weeks.length).toBe(7);
    expect(weeks[0].start).toBe("2026-11-23");
    expect(weeks[1].start).toBe("2026-11-30");
    expect(weeks[2].start).toBe("2026-12-07");
    expect(weeks[3].start).toBe("2026-12-14");
    expect(weeks[4].start).toBe("2026-12-21");
    expect(weeks[5].start).toBe("2026-12-28");
    expect(weeks[6].start).toBe("2027-01-04");
    expect(gameData.level1.lap.end).toBe("2027-01-10");
  });

  it("contains required markers 25 XI, 21 XII, 28 XII", () => {
    const markers = gameData.level1.markers;
    const markerDates = markers.map((m) => m.date);
    expect(markerDates).toContain("2026-11-25"); // VAT
    expect(markerDates).toContain("2026-12-21"); // ZUS + PIT
    expect(markerDates).toContain("2026-12-28"); // VAT
  });

  it("storm on 28 XII has engine minimum balance -12 395 zł in demo state without action", () => {
    const state = createGame("demo");
    const f = forecast(state);
    expect(f.minimum.date).toBe("2026-12-28");
    expect(f.minimum.balance).toBe(-12395);
    expect(f.runwayDays).toBe(42);
    expect(state.core.balance).toBe(38000);
    expect(state.core.relations).toBe(5);
    expect(state.core.costOfMoney).toBe(0);
  });
});

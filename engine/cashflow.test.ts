// E-07 Cash Flow drilldown (G12/G30/G32). Expected values are copied from GAME-DESIGN.md §3, §6, §9, §10,
// ENGINE-DATA-AND-TESTS.md §1, §2, §7 and SYNTHETIC-DATA.md §3, never computed by the engine and pasted back.
import { describe, expect, it } from "vitest";
import type { CardId, EventChoiceId, EventId, Forecast, ForecastPoint, GameState } from "./index";
import { createGame, forecast, getCurrentEvent, playCard, previewCard, resolveEvent, resolveWeek } from "./index";

/** Safe event choices of §7 (E1 check, E2 decline, E3 january); E5 ignore, E6 acknowledge. */
const safe: Record<EventId, EventChoiceId> = {
  E1: "check",
  E2: "decline",
  E3: "january",
  E5: "ignore",
  E6: "acknowledge",
};

/** Demo seed at the start of `week`: earlier weeks resolve their event, play `plays[week]`, settle. */
function atWeek(
  week: number,
  plays: Partial<Record<number, CardId>> = {},
  choices: Partial<Record<EventId, EventChoiceId>> = {},
): GameState {
  let s = createGame("demo");
  while (s.core.week < week) {
    s = withEvent(s, choices);
    const card = plays[s.core.week];
    if (card) s = playCard(s, card);
    s = resolveWeek(s).state;
  }
  return s;
}

/** Resolve the current week's event, if any, with the safe or overridden choice. */
function withEvent(s: GameState, choices: Partial<Record<EventId, EventChoiceId>> = {}): GameState {
  const ev = getCurrentEvent(s);
  return ev ? resolveEvent(s, choices[ev.id] ?? safe[ev.id]) : s;
}

/** The whole lap with the given plays (safe choices unless overridden). */
function fullLap(plays: Partial<Record<number, CardId>>, choices: Partial<Record<EventId, EventChoiceId>> = {}): GameState {
  let s = createGame("demo");
  while (s.core.status === "playing") {
    s = withEvent(s, choices);
    const card = plays[s.core.week];
    if (card) s = playCard(s, card);
    s = resolveWeek(s).state;
  }
  return s;
}

function point(f: { points: ForecastPoint[] }, date: string): ForecastPoint {
  const p = f.points.find((pt) => pt.date === date);
  if (!p) throw new Error(`no point ${date}`);
  return p;
}

function day(f: Forecast, date: string) {
  const d = f.vsBaseline.days.find((x) => x.date === date);
  if (!d) throw new Error(`no comparison day ${date}`);
  return d;
}

function task(f: Forecast, id: string) {
  const t = f.tasks.find((x) => x.id === id);
  if (!t) throw new Error(`no task ${id}`);
  return t;
}

const storm = { date: "2026-12-28", balance: -12395, counterfactual: true };

describe("Cash Flow drilldown (E-07)", () => {
  it("E-07 series: daily dates 21 XI … 10 I, lap weeks, storm minimum −12 395 on 28 XII without action", () => {
    const f = forecast(createGame("demo"));
    expect(f.points[0].date).toBe("2026-11-21");
    expect(f.points[f.points.length - 1].date).toBe("2027-01-10");
    // One point per calendar day, no gaps.
    for (let i = 1; i < f.points.length; i += 1) {
      expect(f.points[i].date > f.points[i - 1].date).toBe(true);
    }
    expect(f.points).toHaveLength(51);
    // Week of each date (ENGINE-DATA §1): T1 23–29 XI … T6 28 XII–3 I, T7 4–10 I; 21–22 XI outside the lap.
    const weeks: [string, number | null][] = [
      ["2026-11-22", null],
      ["2026-11-23", 1],
      ["2026-11-29", 1],
      ["2026-11-30", 2],
      ["2026-12-07", 3],
      ["2026-12-14", 4],
      ["2026-12-21", 5],
      ["2026-12-27", 5],
      ["2026-12-28", 6],
      ["2027-01-03", 6],
      ["2027-01-04", 7],
      ["2027-01-10", 7],
    ];
    for (const [date, week] of weeks) expect(point(f, date).week, date).toBe(week);
    // GAME-DESIGN §3: the storm is the deepest dip, 28 XII −12 395 zł without action (after the 22 XII crash).
    expect(f.minimum).toEqual(storm);
    expect(f.crash).toEqual({ week: 5, date: "2026-12-22", transactionId: "L08", shortfall: 8095 });
    expect(f.committedCards).toEqual([]);
    expect(f.baseline.minimum).toEqual(storm);
    expect(f.vsBaseline.days.every((d) => d.delta === 0)).toBe(true);
    expect(f.vsBaseline.added).toEqual([]);
    expect(f.vsBaseline.removed).toEqual([]);
  });

  it("E-07 series: SYNTHETIC-DATA §3 days decompose into opening balance, outflow and closing balance", () => {
    const f = forecast(createGame("demo"));
    expect(point(f, "2026-11-21").openingBalance).toBe(38000);
    const crashDay = point(f, "2026-12-22");
    expect([crashDay.openingBalance, crashDay.inflow, crashDay.outflow, crashDay.balance]).toEqual([27605, 0, -35700, -8095]);
    const stormDay = point(f, "2026-12-28");
    expect([stormDay.openingBalance, stormDay.outflow, stormDay.change, stormDay.balance]).toEqual([-8095, -4300, -4300, -12395]);
    expect(stormDay.counterfactual).toBe(true);
  });

  it("E-07 minimum and dates per card match GAME-DESIGN §6.1 / ET-C, baseline stays the storm", () => {
    const rows: { setup: string; s: GameState; balance: number; date?: string }[] = [
      { setup: "C1 in T1", s: playCard(withEvent(atWeek(1)), "C1"), balance: 2605, date: "2026-12-28" },
      { setup: "C1 in T2", s: playCard(withEvent(atWeek(2)), "C1"), balance: 2605, date: "2026-12-28" },
      { setup: "C2 in T1", s: playCard(withEvent(atWeek(1)), "C2"), balance: 7494 },
      { setup: "C2 in T4", s: playCard(withEvent(atWeek(4)), "C2"), balance: 7494 },
      { setup: "C5 in T5", s: playCard(withEvent(atWeek(5)), "C5"), balance: 2605 },
      { setup: "C6 in T1", s: playCard(withEvent(atWeek(1)), "C6"), balance: 7596 },
      { setup: "C6 in T5", s: playCard(withEvent(atWeek(5)), "C6"), balance: 7596 },
    ];
    for (const { setup, s, balance, date } of rows) {
      const f = forecast(s);
      expect(f.crash, setup).toBeNull();
      expect(f.minimum.balance, setup).toBe(balance);
      expect(f.minimum.counterfactual, setup).toBe(false);
      if (date) expect(f.minimum.date, setup).toBe(date);
      expect(f.baseline.minimum, setup).toEqual(storm);
      expect(f.baseline.crash?.date, setup).toBe("2026-12-22");
    }
    // ET-C07: C3 with E6 off, low +15 280 on 8 I.
    const c3 = forecast(playCard(withEvent(atWeek(1)), "C3"), { includeFutureEvents: false });
    expect(c3.minimum).toEqual({ date: "2027-01-08", balance: 15280, counterfactual: false });
    // ET-C06: C3 in the demo seed crashes on 8 I, short 5 015.
    const c3demo = forecast(playCard(withEvent(atWeek(1)), "C3"));
    expect(c3demo.crash).toMatchObject({ date: "2027-01-08", shortfall: 5015 });
    // ET-C08: C4 keeps −12 395 inside the 15 000 limit; the baseline has no limit and crashes on 22 XII.
    const c4 = forecast(playCard(withEvent(atWeek(1)), "C4"));
    expect(c4.crash).toBeNull();
    expect(c4.minimum).toEqual({ date: "2026-12-28", balance: -12395, counterfactual: false });
    expect(c4.overdraftLimit).toBe(15000);
    expect(c4.baseline.overdraftLimit).toBe(0);
    expect(c4.baseline.crash).toEqual({ week: 5, date: "2026-12-22", transactionId: "L08", shortfall: 8095 });
  });

  it("E-07 demo path step 5 (GAME-DESIGN §9, G30): 28 XII node before −12 395, after +2 605, with the transactions", () => {
    // Step 3: E1 „Sprawdź i zadzwoń”. Step 4: the advance (C1) accepted in T1.
    const t1 = withEvent(createGame("demo"), { E1: "check" });
    const f = forecast(playCard(t1, "C1"));
    expect(f.committedCards).toEqual(["C1"]);
    expect(day(f, "2026-12-28")).toEqual({
      date: "2026-12-28",
      week: 6,
      before: -12395,
      after: 2605,
      delta: 15000,
      beforeCounterfactual: true,
      afterCounterfactual: false,
    });
    expect(f.vsBaseline.before.minimum).toEqual(storm);
    expect(f.vsBaseline.after.minimum).toEqual({ date: "2026-12-28", balance: 2605, counterfactual: false });
    expect(f.vsBaseline.before.crash).toMatchObject({ date: "2026-12-22", transactionId: "L08", shortfall: 8095 });
    expect(f.vsBaseline.after.crash).toBeNull();
    // The transactions of the 28 XII node: VAT for November −4 300 to the tax office.
    expect(point(f, "2026-12-28").transactions).toEqual([
      expect.objectContaining({ id: "L09", amount: -4300, counterpartyId: "US", title: "VAT za listopad", kind: "obligation" }),
    ]);
    expect(task(f, "L09")).toMatchObject({ counterpartyName: "Urząd skarbowy", balanceAfter: 2605, status: "upcoming" });
    // What the decision changed: +15 000 from Klient A on 3 XII.
    expect(f.vsBaseline.added).toEqual([
      expect.objectContaining({ id: "C1", date: "2026-12-03", amount: 15000, counterpartyId: "A", source: "card", cardId: "C1" }),
    ]);
    expect(f.vsBaseline.removed).toEqual([]);
    // The same numbers before committing, from the card preview (G32).
    const p = previewCard(t1, "C1");
    const d = p.comparison.days.find((x) => x.date === "2026-12-28");
    expect(d).toMatchObject({ before: -12395, after: 2605, delta: 15000 });
    expect(p.comparison.before.minimum).toEqual(storm);
    expect(p.comparison.after.minimum).toEqual({ date: "2026-12-28", balance: 2605, counterfactual: false });
  });

  it("E-07 G32 preview compares the previewed card, not the advance (factoring +7 596, discount +7 494)", () => {
    const t1 = withEvent(createGame("demo"));
    const c6 = previewCard(t1, "C6").comparison;
    expect(c6.after.minimum.balance).toBe(7596);
    expect(c6.before.minimum).toEqual(storm);
    // §6.1: +19 991 on the business day after the Monday request (T1: 24 XI); the receipt goes to the factor.
    // In the demo seed the receipt is the one E6 moves from 8 I to 22 I (§6.2).
    expect(c6.added).toEqual([expect.objectContaining({ id: "C6", date: "2026-11-24", amount: 19991 })]);
    expect(c6.removed).toEqual([expect.objectContaining({ id: "L11", date: "2027-01-22", amount: 20295 })]);
    // §4 fixture: discount offered 15 XII (T4) pays 18 XII, 20 295 → 19 889.
    const c2 = previewCard(withEvent(atWeek(4)), "C2").comparison;
    expect(c2.after.minimum.balance).toBe(7494);
    expect(c2.added).toEqual([expect.objectContaining({ id: "C2", date: "2026-12-18", amount: 19889 })]);
  });

  it("E-07 „Zadania”: booking order, running balance, counterparty, booked / upcoming / rejected / stopped", () => {
    // No action, start of T5 (T1–T4 settled).
    const f = forecast(withEvent(atWeek(5)));
    expect(f.tasks.map((t) => t.id)).toEqual(["L01", "L02", "L03", "L04", "L05", "L06", "L07", "L08", "L09", "L10"]);
    expect(f.tasks.map((t) => t.balanceAfter)).toEqual([33700, 41080, 28280, 25380, 34605, 31705, 27605, -8095, -12395, -5015]);
    expect(f.tasks.map((t) => t.status)).toEqual([
      "booked",
      "booked",
      "booked",
      "booked",
      "booked",
      "booked",
      "upcoming",
      "rejected",
      "stopped",
      "stopped",
    ]);
    expect(task(f, "L01")).toMatchObject({ counterpartyName: "Urząd skarbowy", week: 1, date: "2026-11-25" });
    expect(task(f, "L07")).toMatchObject({ counterpartyName: "ZUS", week: 5, date: "2026-12-21" });
    // At the lap start nothing is settled yet.
    expect(forecast(createGame("demo")).tasks.find((t) => t.id === "L01")?.status).toBe("upcoming");
    // ET-C01 completed lap: everything booked, lap end 9 985.
    const won = forecast(fullLap({ 1: "C1" }));
    expect(won.tasks.every((t) => t.status === "booked")).toBe(true);
    expect(won.tasks[won.tasks.length - 1].balanceAfter).toBe(9985);
  });

  it("E-07 afterLap: the loan repayment 20 I −17 400 and Klient A moved to 22 I stay outside the chart", () => {
    const f = forecast(playCard(withEvent(atWeek(5)), "C5"));
    expect(f.afterLap).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "C5-R", date: "2027-01-20", amount: -17400, cardId: "C5" }),
        expect.objectContaining({ id: "L11", date: "2027-01-22", amount: 20295, eventId: "E6" }),
      ]),
    );
    expect(f.afterLap).toHaveLength(2);
    expect(f.tasks.some((t) => t.date > "2027-01-10")).toBe(false);
    // ET-F01 view (E6 off): nothing after the lap.
    expect(forecast(createGame("demo"), { includeFutureEvents: false }).afterLap).toEqual([]);
  });

  it("E-07 hidden fraud: no E1 effect in the drilldown before T6, the true crash from T6 (E-06)", () => {
    const choices = { E1: "pay_as_is" as const };
    for (const week of [1, 2, 3, 4, 5]) {
      const s = week === 1 ? playCard(withEvent(createGame("demo"), choices), "C1") : withEvent(atWeek(week, { 1: "C1" }, choices), choices);
      const f = forecast(s);
      const all = [...f.tasks, ...f.afterLap, ...f.baseline.points.flatMap((p) => p.transactions), ...f.baseline.afterLap];
      expect(all.some((t) => t.eventId === "E1"), `T${week}`).toBe(false);
      expect(f.vsBaseline.added.map((t) => t.id), `T${week}`).toEqual(["C1"]);
      expect(f.vsBaseline.removed, `T${week}`).toEqual([]);
      expect(f.crash, `T${week}`).toBeNull();
    }
    // From T6 the fraud is known: ET-E02 crash 8 I at E1, short 25 715.
    const t6 = forecast(withEvent(atWeek(6, { 1: "C1" }, choices), choices));
    expect(t6.crash).toMatchObject({ date: "2027-01-08", transactionId: "E1", shortfall: 25715 });
    expect(task(t6, "L08").eventId).toBe("E1");
    expect(task(t6, "E1").status).toBe("rejected");
    // The no-card baseline of the same path crashes on 22 XII at L08 (ET-E01).
    expect(t6.baseline.crash).toMatchObject({ date: "2026-12-22", transactionId: "L08", shortfall: 8095 });
  });

  it("E-07 every point decomposes: opening + inflow + outflow = balance, inflows first (ET-F04 C6 in T5)", () => {
    const c6t5 = forecast(playCard(withEvent(atWeek(5)), "C6"));
    const d22 = point(c6t5, "2026-12-22");
    expect([d22.inflow, d22.outflow]).toEqual([19991, -35700]);
    expect(d22.transactions.map((t) => t.id)).toEqual(["C6", "L08"]);
    const forecasts = [forecast(createGame("demo")), c6t5, forecast(fullLap({ 1: "C1" })), forecast(playCard(withEvent(atWeek(1)), "C4"))];
    for (const f of forecasts) {
      for (const series of [f, f.baseline]) {
        series.points.forEach((p, i) => {
          const sum = p.transactions.reduce((acc, t) => acc + t.amount, 0);
          expect(p.change).toBe(sum);
          expect(p.inflow + p.outflow).toBe(sum);
          expect(p.openingBalance + p.change).toBe(p.balance);
          if (i > 0) expect(p.openingBalance).toBe(series.points[i - 1].balance);
        });
      }
    }
  });

  it("E-07 drilldown is read-only: forecast and preview never mutate the state", () => {
    const s = withEvent(createGame("demo"));
    const before = JSON.stringify(s);
    forecast(s);
    previewCard(s, "C1");
    previewCard(s, "C6");
    expect(JSON.stringify(s)).toBe(before);
  });

  it("E-07 Cash Flow recompute < 200 ms (GAME-DESIGN §10): forecast plus a card preview", () => {
    const s = withEvent(createGame("demo"));
    forecast(s);
    const t0 = performance.now();
    forecast(s);
    previewCard(s, "C6");
    expect(performance.now() - t0).toBeLessThan(200);
  });
});

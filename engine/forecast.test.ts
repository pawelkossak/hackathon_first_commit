// E-02 forecast cases. Expected values are copied from ENGINE-DATA-AND-TESTS.md §7.1
// and SYNTHETIC-DATA.md §3, never computed by the engine and pasted back.
import { describe, expect, it } from "vitest";
import { addDays, toBusinessDay } from "./calendar";
import { gameData } from "./data";
import type { CardId, EventChoiceId, Forecast, GameState } from "./index";
import { createGame, forecast, playCard, resolveEvent, resolveWeek } from "./index";

const holidays = gameData.level1.holidays;

/** Demo seed, safe event choices (E1 check, E2 decline, E3 january), no card, advanced to week `week`. */
function demoAtWeek(week: number): GameState {
  const safe: Record<number, EventChoiceId> = { 1: "check", 2: "decline", 3: "january" };
  let s = createGame("demo");
  while (s.core.week < week) {
    const choice = safe[s.core.week];
    if (choice) s = resolveEvent(s, choice);
    s = resolveWeek(s).state;
  }
  return s;
}

function cardInWeek(cardId: CardId, week: number): GameState {
  return playCard(demoAtWeek(week), cardId);
}

function weekEnds(f: Forecast): (number | null)[] {
  return f.weekEnds.map((w) => w.balance);
}

function point(f: Forecast, date: string) {
  const p = f.points.find((pt) => pt.date === date);
  if (!p) throw new Error(`no point ${date}`);
  return p;
}

describe("forecast (E-02)", () => {
  it("ET-F01 no action, E6 off: week-ends, crash 22 XII at L08, counterfactual low and end", () => {
    const f = forecast(createGame("demo"), { includeFutureEvents: false });
    expect(weekEnds(f)).toEqual([33700, 41080, 25380, 31705, null, null, null]);
    expect(f.crash).toEqual({ week: 5, date: "2026-12-22", transactionId: "L08", shortfall: 8095 });
    expect(f.low).toBeNull();
    expect(f.endBalance).toBeNull();
    expect(f.counterfactual).toEqual({ low: { date: "2026-12-28", balance: -12395 }, endBalance: 15280 });
  });

  it("ET-F01 reproduces the SYNTHETIC-DATA §3 baseline ledger to the złoty", () => {
    const f = forecast(createGame("demo"), { includeFutureEvents: false });
    const table: [string, number][] = [
      ["2026-11-25", 33700],
      ["2026-11-30", 41080],
      ["2026-12-07", 28280],
      ["2026-12-10", 25380],
      ["2026-12-14", 34605],
      ["2026-12-15", 31705],
      ["2026-12-21", 27605],
      ["2026-12-22", -8095],
      ["2026-12-28", -12395],
      ["2026-12-30", -5015],
      ["2027-01-08", 15280],
    ];
    for (const [date, balance] of table) expect(point(f, date).balance).toBe(balance);
    expect(point(f, "2026-11-21").balance).toBe(38000);
    expect(f.points.filter((p) => p.counterfactual).every((p) => p.date > "2026-12-22")).toBe(true);
    expect(point(f, "2026-12-22").counterfactual).toBe(false);
    expect(point(f, "2026-12-23").counterfactual).toBe(true);
  });

  it("ET-F01 no-action week-end balances are settled by resolveWeek, lap stops in T5", () => {
    const ends: (number | null)[] = [];
    const safe: Record<number, EventChoiceId> = { 1: "check", 2: "decline", 3: "january", 5: "ignore" };
    let s = createGame("demo");
    for (let i = 0; i < 5; i++) {
      const choice = safe[s.core.week];
      if (choice) s = resolveEvent(s, choice);
      const r = resolveWeek(s);
      ends.push(r.endBalance);
      s = r.state;
    }
    expect(ends).toEqual([33700, 41080, 25380, 31705, null]);
    expect(s.core.status).toBe("crashed");
    expect(s.core.crash).toEqual({ week: 5, date: "2026-12-22", transactionId: "L08", shortfall: 8095 });
  });

  it("ET-F02 no action, demo seed: crash 22 XII short 8 095, counterfactual end −5 015", () => {
    const f = forecast(createGame("demo"));
    expect(f.crash).toEqual({ week: 5, date: "2026-12-22", transactionId: "L08", shortfall: 8095 });
    expect(f.counterfactual?.endBalance).toBe(-5015);
    expect(weekEnds(f)).toEqual([33700, 41080, 25380, 31705, null, null, null]);
    expect(f.points.some((p) => p.transactions.some((t) => t.id === "L11"))).toBe(false);
  });

  it("ET-F02 known ledger only keeps 8 I until E6 is resolved", () => {
    const s = createGame("demo");
    expect(forecast(s, { includeFutureEvents: false }).counterfactual?.endBalance).toBe(15280);
    expect(forecast(s, { includeFutureEvents: true }).counterfactual?.endBalance).toBe(-5015);
  });

  it("ET-F03 runway at start is 42", () => {
    expect(forecast(createGame("demo")).runwayDays).toBe(42);
  });

  it("ET-F04 same-day order: C6 in T5, +19 991 and −35 700 on 22 XII, no crash, T5 end 11 896", () => {
    const f = forecast(cardInWeek("C6", 5));
    expect(f.crash).toBeNull();
    expect(f.weekEnds[4].balance).toBe(11896);
    const ids = point(f, "2026-12-22").transactions.map((t) => [t.id, t.amount]);
    expect(ids).toEqual([
      ["C6", 19991],
      ["L08", -35700],
    ]);
  });

  it("ET-F05 business-day shift: C2 offered in T5 pays 28 XII, crash still 22 XII short 8 095", () => {
    const f = forecast(cardInWeek("C2", 5));
    const c2 = f.points.flatMap((p) => p.transactions).filter((t) => t.id === "C2");
    expect(c2).toHaveLength(1);
    expect(c2[0].date).toBe("2026-12-28");
    expect(c2[0].amount).toBe(19889);
    expect(f.crash).toEqual({ week: 5, date: "2026-12-22", transactionId: "L08", shortfall: 8095 });
  });

  it("ET-F05 U-12: offer Tuesday + 3 calendar days lands on a business day (25 XII → 28 XII)", () => {
    expect(toBusinessDay("2026-12-25", holidays)).toBe("2026-12-28");
    expect(toBusinessDay("2026-12-20", holidays)).toBe("2026-12-21");
    expect(toBusinessDay("2026-12-22", holidays)).toBe("2026-12-22");
    const expected = ["2026-11-27", "2026-12-04", "2026-12-11", "2026-12-18", "2026-12-28"];
    const offers = gameData.level1.weeks.slice(0, 5).map((w) => toBusinessDay(addDays(addDays(w.start, 1), 3), holidays));
    expect(offers).toEqual(expected);
    const card = gameData.level1.cards.find((c) => c.id === "C2");
    expect(card?.effect.type === "discount" ? card.effect.payoutDates.map((d) => d.date) : []).toEqual(expected);
    for (const l of gameData.persona.ledger) expect(toBusinessDay(l.dueDate, holidays)).toBe(l.date);
  });

  it("ET-F06 every point decomposes into its transactions (28 XII and every day)", () => {
    for (const s of [createGame("demo"), cardInWeek("C2", 5), cardInWeek("C6", 5)]) {
      const f = forecast(s);
      let prev = gameData.persona.account.openingBalance;
      for (const p of f.points) {
        expect(p.transactions.reduce((sum, t) => sum + t.amount, 0)).toBe(p.balance - prev);
        prev = p.balance;
      }
    }
    const f = forecast(cardInWeek("C2", 5));
    const p28 = point(f, "2026-12-28");
    const p27 = point(f, "2026-12-27");
    expect(p28.transactions.map((t) => t.id)).toEqual(["C2", "L09"]);
    expect(p28.transactions.reduce((sum, t) => sum + t.amount, 0)).toBe(p28.balance - p27.balance);
  });

  it("forecast never mutates its input state", () => {
    const s = cardInWeek("C6", 5);
    const copy = JSON.parse(JSON.stringify(s)) as GameState;
    forecast(s);
    forecast(s, { includeFutureEvents: false });
    expect(s).toEqual(copy);
  });
});

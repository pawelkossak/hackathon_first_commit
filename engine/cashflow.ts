// Cash Flow drilldown (E-07, G12/G30/G32): the „Bez działania” baseline, before/after comparisons
// and the „Zadania” list. Pure helpers over forecast series; the booking pipeline stays in forecast.ts.
import { gameData } from "./data";
import { initialCore } from "./fixture";
import type {
  CashFlowComparison,
  CashFlowDay,
  CashFlowMinimum,
  CashFlowSummary,
  CashFlowTask,
  CashFlowTaskStatus,
  Crash,
  Forecast,
  ForecastPoint,
  GameCore,
  IsoDate,
  Transaction,
} from "./types";

const { persona, level1 } = gameData;

/** What a comparison needs from a series (a Forecast or a CashFlowSeries). */
export interface ComparableSeries extends CashFlowSummary {
  points: readonly ForecastPoint[];
  afterLap: readonly Transaction[];
}

/**
 * „Bez działania”: the same game with no card played. Events, choices, week and settled weeks stay;
 * everything a card changes (played list, invoice state, overdraft limit) returns to its lap-start value.
 */
export function baselineCore(core: GameCore): GameCore {
  const start = initialCore(core.seed);
  return { ...core, played: [], invoiceState: start.invoiceState, overdraftLimit: start.overdraftLimit };
}

/** Lowest end-of-day balance over the lap (from lap start), earliest date on a tie. */
export function seriesMinimum(points: readonly ForecastPoint[]): CashFlowMinimum {
  const lap = points.filter((p) => p.date >= level1.lap.start);
  const first = lap[0] ?? points[0];
  return lap.reduce<CashFlowMinimum>(
    (min, p) => (p.balance < min.balance ? { date: p.date, balance: p.balance, counterfactual: p.counterfactual } : min),
    { date: first.date, balance: first.balance, counterfactual: first.counterfactual },
  );
}

function txKey(t: Transaction): string {
  return `${t.id}|${t.date}|${t.amount}`;
}

function allTransactions(s: ComparableSeries): Transaction[] {
  return [...s.points.flatMap((p) => p.transactions), ...s.afterLap];
}

function summary(s: ComparableSeries): CashFlowSummary {
  return { minimum: { ...s.minimum }, crash: s.crash ? { ...s.crash } : null, endBalance: s.endBalance };
}

/** Day-by-day before/after over the same dates, plus the transactions that differ. */
export function compareSeries(before: ComparableSeries, after: ComparableSeries): CashFlowComparison {
  const days: CashFlowDay[] = after.points.map((a) => {
    const b = before.points.find((p) => p.date === a.date);
    if (!b) throw new Error(`comparison: no baseline point on ${a.date}`);
    return {
      date: a.date,
      week: a.week,
      before: b.balance,
      after: a.balance,
      delta: a.balance - b.balance,
      beforeCounterfactual: b.counterfactual,
      afterCounterfactual: a.counterfactual,
    };
  });
  const beforeTxs = allTransactions(before);
  const afterTxs = allTransactions(after);
  const beforeKeys = new Set(beforeTxs.map(txKey));
  const afterKeys = new Set(afterTxs.map(txKey));
  return {
    days,
    before: summary(before),
    after: summary(after),
    added: afterTxs.filter((t) => !beforeKeys.has(txKey(t))),
    removed: beforeTxs.filter((t) => !afterKeys.has(txKey(t))),
  };
}

/** Comparison of two public forecasts (card preview): the 10 I balance is the counterfactual one after a crash. */
export function compareForecasts(before: Forecast, after: Forecast): CashFlowComparison {
  return compareSeries(comparable(before), comparable(after));
}

function comparable(f: Forecast): ComparableSeries {
  const endBalance = f.endBalance ?? f.counterfactual?.endBalance;
  if (endBalance === undefined) throw new Error("forecast without an end balance");
  return { points: f.points, afterLap: f.afterLap, minimum: f.minimum, crash: f.crash, endBalance };
}

/** Last date of the weeks already settled by resolveWeek; null before the first settlement. */
export function settledThrough(core: GameCore): IsoDate | null {
  if (core.weeksResolved.length === 0) return null;
  const last = Math.max(...core.weeksResolved);
  return level1.weeks[last - 1].end;
}

function counterpartyName(id: string): string {
  const cp = persona.counterparties.find((c) => c.id === id);
  if (!cp) throw new Error(`unknown counterparty ${id}`);
  return cp.name;
}

/** „Zadania”: every transaction of the series in booking order with its running balance and status. */
export function buildTasks(points: readonly ForecastPoint[], crash: Crash | null, settled: IsoDate | null): CashFlowTask[] {
  const tasks: CashFlowTask[] = [];
  let afterCrash = false;
  for (const p of points) {
    let balance = p.openingBalance;
    for (const t of p.transactions) {
      balance += t.amount;
      let status: CashFlowTaskStatus;
      if (!afterCrash && crash !== null && p.date === crash.date && t.id === crash.transactionId) {
        status = "rejected";
        afterCrash = true;
      } else if (afterCrash) {
        status = "stopped";
      } else {
        status = settled !== null && p.date <= settled ? "booked" : "upcoming";
      }
      tasks.push({ ...t, counterpartyName: counterpartyName(t.counterpartyId), week: p.week, balanceAfter: balance, status });
    }
  }
  return tasks;
}

// Fixture builders used by the E-01 API surface until the real modules (E-02…E-09) replace them.
// Built only from data/*.json; no number here is invented.
import { dateRange } from "./calendar";
import { gameData } from "./data";
import type {
  AccountState,
  BalanceAt,
  CompetenceId,
  CompetenceLevel,
  Crash,
  Forecast,
  ForecastOptions,
  ForecastPoint,
  GameCore,
  GameState,
  Transaction,
  WeekEndBalance,
  WeekNumber,
} from "./types";

const { persona, level1, futureScript } = gameData;

export function initialCore(seed: string): GameCore {
  const competences = Object.fromEntries(level1.competences.map((c) => [c.id, 0])) as Record<
    CompetenceId,
    CompetenceLevel
  >;
  return {
    level: 1,
    seed,
    week: 1,
    status: "playing",
    hand: level1.cards.map((c) => c.id),
    played: [],
    weekActionUsed: false,
    eventsResolved: [],
    weeksResolved: [],
    invoiceState: persona.invoices[0].state,
    overdraftLimit: 0,
    balance: persona.account.openingBalance,
    relations: level1.rules.relationsStart,
    costOfMoney: 0,
    competences,
    stars: { przetrwanie: "open", tanio: "open", pilot: "open" },
    crash: null,
    lowestBalance: null,
    avoidedCost: null,
    level2Unlocked: false,
    loanTermsShown: false,
    negotiation: {
      klient_a: { messagesThisWeek: 0, counterPending: false },
      bank: { messagesThisWeek: 0, counterPending: false },
    },
  };
}

export function initialAccount(): AccountState {
  return {
    clock: futureScript.accountClock.start,
    balance: persona.account.openingBalance,
    plans: [],
    matchedTx: [],
  };
}

export function initialState(seed: string): GameState {
  const core = initialCore(seed);
  return {
    schemaVersion: 1,
    core,
    snapshots: { 1: core },
    account: initialAccount(),
    emitted: [{ type: "lapStart", week: 1 }],
  };
}

function ledgerTransactions(): Transaction[] {
  return persona.ledger.map((l) => ({
    id: l.id,
    date: l.date,
    amount: l.amount,
    counterpartyId: l.counterpartyId,
    title: l.title,
    source: l.kind === "recurring" ? "recurring" : "known",
    kind: l.kind,
    cardId: null,
    eventId: null,
  }));
}

export function weekOf(date: string): WeekNumber | null {
  const w = level1.weeks.find((wk) => date >= wk.start && date <= wk.end);
  return w ? w.week : null;
}

/**
 * Fixture forecast: the ledger as written (no card or event overlays, no E6),
 * daily end-of-day balance, inflows before outflows, crash below −overdraft limit.
 */
export function fixtureForecast(state: GameState, options: ForecastOptions = {}): Forecast {
  void options;
  const limit = state.core.overdraftLimit;
  const txs = ledgerTransactions();
  const from = level1.lap.forecastStart;
  const to = level1.lap.end;
  let balance = persona.account.openingBalance;
  let crash: Crash | null = null;
  let interestBase = 0;
  const points: ForecastPoint[] = [];

  for (const date of dateRange(from, to)) {
    const today = txs
      .filter((t) => t.date === date)
      .sort((a, b) => Number(b.amount > 0) - Number(a.amount > 0));
    for (const t of today) {
      balance += t.amount;
      if (crash === null && balance < -limit) {
        crash = { week: weekOf(date) ?? 1, date, transactionId: t.id, shortfall: -limit - balance };
      }
    }
    points.push({ date, balance, transactions: today, counterfactual: crash !== null && date > crash.date });
    interestBase += Math.max(0, -balance);
  }

  const lowest = (pts: ForecastPoint[]): BalanceAt =>
    pts.reduce<BalanceAt>(
      (min, p) => (p.balance < min.balance ? { date: p.date, balance: p.balance } : min),
      { date: pts[0].date, balance: pts[0].balance },
    );
  const lapPoints = points.filter((p) => p.date >= level1.lap.start);
  const endBalance = points[points.length - 1].balance;
  const weekEnds: WeekEndBalance[] = level1.weeks.map((w) => {
    const p = points.find((pt) => pt.date === w.end);
    const stopped = crash !== null && crash.date <= w.end;
    return { week: w.week, date: w.end, balance: stopped || !p ? null : p.balance };
  });

  return {
    from,
    to,
    points,
    weekEnds,
    crash,
    low: crash ? null : lowest(lapPoints),
    endBalance: crash ? null : endBalance,
    counterfactual: crash ? { low: lowest(lapPoints), endBalance } : null,
    overdraftLimit: limit,
    overdraftInterest:
      limit > 0
        ? Math.round((interestBase * level1.rules.overdraftInterestRatePerYear) / level1.rules.daysInYear)
        : 0,
    runwayDays: Math.floor(Math.max(0, state.core.balance) / level1.rules.runwayDailyCost),
  };
}

export function weekDates(week: WeekNumber): { start: string; end: string } {
  const w = level1.weeks[week - 1];
  return { start: w.start, end: w.end };
}

// Forecast (E-02): daily end-of-day balance over the lap, same-day order (U-10),
// business days (U-12) and crash detection (ENGINE-DATA-AND-TESTS §1).
//
// The transaction list is built in three steps:
//   1. the ledger of persona.json as written;
//   2. overlays, applied in order: played cards, then events (each a pure function);
//   3. the business-day shift on every transaction date.
// The daily run then books inflows before outflows and stops the lap at the first
// transaction that takes the balance below −(available overdraft).
import { dateRange, toBusinessDay } from "./calendar";
import { gameData } from "./data";
import { RuleError } from "./errors";
import type {
  BalanceAt,
  CardId,
  Crash,
  EventCard,
  Forecast,
  ForecastOptions,
  ForecastPoint,
  GameCore,
  GameState,
  Transaction,
  WeekEndBalance,
  WeekNumber,
} from "./types";

const { persona, level1 } = gameData;

export interface OverlayContext {
  core: GameCore;
  /** True: scripted future events (forced, not yet resolved) are included. */
  includeFutureEvents: boolean;
}

/** A pure transformation of the forecast transactions. Never mutates its input. */
export type ForecastOverlay = (txs: readonly Transaction[], ctx: OverlayContext) => Transaction[];

/** Week of a lap date, or null outside the lap (21–22 XI, after 10 I). */
export function weekOf(date: string): WeekNumber | null {
  const w = level1.weeks.find((wk) => date >= wk.start && date <= wk.end);
  return w ? w.week : null;
}

/** The ledger as written (persona.json §2.2). */
export function ledgerTransactions(): Transaction[] {
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

function invoiceLedgerId(invoiceId: string): string | null {
  return persona.invoices.find((i) => i.id === invoiceId)?.ledgerId ?? null;
}

function dateForWeek(dates: readonly { week: number; date: string }[], week: WeekNumber, cardId: CardId): string {
  const hit = dates.find((d) => d.week === week);
  if (!hit) throw new RuleError("invalid_week", `${cardId} has no date for week ${week}`);
  return hit.date;
}

function cardTx(cardId: CardId, id: string, date: string, amount: number, tx: Pick<Transaction, "counterpartyId" | "title">): Transaction {
  return { id, date, amount, counterpartyId: tx.counterpartyId, title: tx.title, source: "card", kind: null, cardId, eventId: null };
}

/**
 * Money effects of the played cards (level1.json `effect`), in play order.
 * Eligibility, windows and costs are decided by playCard; this overlay only moves money.
 * C4 has no transaction: its limit lives in `core.overdraftLimit`.
 */
export const cardOverlay: ForecastOverlay = (txs, { core }) => {
  let out = [...txs];
  for (const played of core.played) {
    const card = level1.cards.find((c) => c.id === played.cardId);
    if (!card) throw new RuleError("unknown_card", played.cardId);
    const e = card.effect;
    switch (e.type) {
      case "inflow":
        out = [...out, cardTx(card.id, card.id, e.date, e.amount, e)];
        break;
      case "discount":
      case "factoring": {
        const ledgerId = invoiceLedgerId(e.invoiceId);
        const date = dateForWeek(e.payoutDates, played.week, card.id);
        out = [...out.filter((t) => t.id !== ledgerId), cardTx(card.id, card.id, date, e.amount, e)];
        break;
      }
      case "move_ledger":
        out = out.map((t) => (t.id === e.ledgerId ? { ...t, date: e.newDate } : t));
        break;
      case "loan": {
        const date = dateForWeek(e.inflowDates, played.week, card.id);
        out = [
          ...out,
          cardTx(card.id, card.id, date, e.amount, e),
          cardTx(card.id, `${card.id}-R`, e.repayment.date, e.repayment.amount, {
            counterpartyId: e.counterpartyId,
            title: e.repayment.title,
          }),
        ];
        break;
      }
      case "overdraft":
        break;
    }
  }
  return out;
};

function applyEventChoice(txs: Transaction[], ev: EventCard, choiceId: string, core: GameCore): Transaction[] {
  const choice = ev.choices.find((c) => c.id === choiceId);
  if (!choice) return txs;
  let out = txs;
  for (const effect of choice.effects) {
    if (effect.type === "move_invoice") {
      if (core.invoiceState !== effect.requiresInvoiceState) continue;
      out = out.map((t) =>
        t.id === effect.ledgerId ? { ...t, date: effect.newDate, eventId: ev.id } : t,
      );
    }
    // Transaction, reveal and reveal_card effects are booked by the event module (E-04).
  }
  return out;
}

/**
 * Event effects. A resolved event applies its chosen effects. With `includeFutureEvents`,
 * a forced event of the seed deck that is not yet resolved (E6 in the demo seed) applies its
 * only choice as the scripted future. E6 has no effect unless INV-A1 is still `pending` (ET-E08).
 */
export const eventOverlay: ForecastOverlay = (txs, { core, includeFutureEvents }) => {
  let out = [...txs];
  for (const r of core.eventsResolved) {
    const ev = level1.events.find((e) => e.id === r.eventId);
    if (ev) out = applyEventChoice(out, ev, r.choiceId, core);
  }
  if (includeFutureEvents) {
    const deck = level1.seeds[core.seed] ?? level1.seeds.demo;
    for (const slot of deck) {
      if (core.eventsResolved.some((r) => r.eventId === slot.eventId)) continue;
      const ev = level1.events.find((e) => e.id === slot.eventId);
      if (!ev || ev.condition !== "forced" || ev.choices.length !== 1) continue;
      out = applyEventChoice(out, ev, ev.choices[0].id, core);
    }
  }
  return out;
};

/** Overlays in application order. E-03/E-04 extend the card and event overlays, not this pipeline. */
export const forecastOverlays: readonly ForecastOverlay[] = [cardOverlay, eventOverlay];

/** U-12 on every transaction: weekend or holiday dates move to the next business day. */
export function shiftToBusinessDays(txs: readonly Transaction[]): Transaction[] {
  return txs.map((t) => {
    const date = toBusinessDay(t.date, level1.holidays);
    return date === t.date ? t : { ...t, date };
  });
}

/** U-10: inflows before outflows on one date; otherwise the order of the list is kept. */
export function sameDayOrder(txs: readonly Transaction[]): Transaction[] {
  return [...txs.filter((t) => t.amount > 0), ...txs.filter((t) => t.amount <= 0)];
}

/** All forecast transactions of a state, after overlays and the business-day shift (any date). */
export function forecastTransactions(core: GameCore, options: ForecastOptions = {}): Transaction[] {
  const ctx: OverlayContext = { core, includeFutureEvents: options.includeFutureEvents ?? true };
  const overlaid = forecastOverlays.reduce<Transaction[]>((txs, overlay) => overlay(txs, ctx), ledgerTransactions());
  return shiftToBusinessDays(overlaid);
}

function lowest(points: readonly ForecastPoint[]): BalanceAt {
  return points.reduce<BalanceAt>(
    (min, p) => (p.balance < min.balance ? { date: p.date, balance: p.balance } : min),
    { date: points[0].date, balance: points[0].balance },
  );
}

/** Daily forecast 21 XI 2026 … 10 I 2027 from the opening balance. Post-crash points are counterfactual. */
export function computeForecast(state: GameState, options: ForecastOptions = {}): Forecast {
  const core = state.core;
  const limit = core.overdraftLimit;
  const from = level1.lap.forecastStart;
  const to = level1.lap.end;
  const txs = forecastTransactions(core, options);

  let balance = persona.account.openingBalance;
  let crash: Crash | null = null;
  let interestBase = 0;
  const points: ForecastPoint[] = [];

  for (const date of dateRange(from, to)) {
    const today = sameDayOrder(txs.filter((t) => t.date === date));
    for (const t of today) {
      balance += t.amount;
      if (crash === null && balance < -limit) {
        crash = { week: weekOf(date) ?? 1, date, transactionId: t.id, shortfall: -limit - balance };
      }
    }
    const counterfactual = crash !== null && date > crash.date;
    points.push({ date, balance, transactions: today, counterfactual });
    // The lap stops at a crash: interest counts real days only (through the crash date), never counterfactual ones.
    if (!counterfactual) interestBase += Math.max(0, -balance);
  }

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
    runwayDays: Math.floor(Math.max(0, core.balance) / level1.rules.runwayDailyCost),
  };
}

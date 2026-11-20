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
import { baselineCore, buildTasks, compareSeries, seriesMinimum, settledThrough } from "./cashflow";
import { deckFor, eventCard } from "./seed";
import type {
  BalanceAt,
  CardId,
  CashFlowSeries,
  Crash,
  EventCard,
  EventId,
  Forecast,
  ForecastOptions,
  ForecastPoint,
  GameCore,
  GameState,
  LedgerId,
  Pln,
  Transaction,
  WeekEndBalance,
  WeekNumber,
} from "./types";

const { persona, level1 } = gameData;

export interface OverlayContext {
  core: GameCore;
  /** True: scripted future events (forced, not yet resolved) are included. */
  includeFutureEvents: boolean;
  /**
   * True only for the settlement (resolveWeek): the true ledger, with every revealed effect booked
   * whatever the game time. False for every player-facing view (forecast, preview, hint, delegate).
   */
  groundTruth: boolean;
  /**
   * Player-facing views only: events whose fraud reveal has happened in game time (`revealedFrauds`).
   * Their `reveal` effect and the effects after it are shown; any other reveal stays hidden.
   */
  revealed: readonly EventId[];
}

/** Internal forecast mode. Not part of the public `ForecastOptions`. */
export interface ForecastMode {
  /** See `OverlayContext.groundTruth`. Default false. */
  groundTruth?: boolean;
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

function eventTx(ev: EventCard, e: { id: string; date: string; amount: number } & Pick<Transaction, "counterpartyId" | "title">): Transaction {
  return {
    id: e.id,
    date: e.date,
    amount: e.amount,
    counterpartyId: e.counterpartyId,
    title: e.title,
    source: "event",
    kind: null,
    cardId: null,
    eventId: ev.id,
  };
}

/**
 * The money effects of one event choice, in data order:
 * - `transaction` books a new row (E1 re-payment, E2 subcontractor and inflow, E3 tool);
 * - `reveal` marks the ledger payment that went to the changed account (E1: L08) with the event id.
 *   In every player-facing view (both `includeFutureEvents` settings) the reveal and the effects
 *   after it stay hidden until the reveal has happened in game time (`revealedFrauds`, the same rule
 *   that emits `fraudRevealed`): the player cannot know about the fraud earlier, so neither the
 *   forecast nor the CFO hint may show it. Only the settlement (`groundTruth`) books them from the
 *   moment of the choice;
 * - `move_invoice` moves the invoice receipt while the invoice is still in the required state (E6);
 * - `reveal_card` has no money effect (E5 only shows the C5 terms).
 */
function applyEventChoice(txs: Transaction[], ev: EventCard, choiceId: string, ctx: OverlayContext): Transaction[] {
  const choice = ev.choices.find((c) => c.id === choiceId);
  if (!choice) throw new RuleError("invalid_choice", `${ev.id}: ${choiceId}`);
  const { core, groundTruth, revealed } = ctx;
  let out = txs;
  for (const effect of choice.effects) {
    switch (effect.type) {
      case "transaction":
        out = [...out, eventTx(ev, effect)];
        break;
      case "reveal":
        if (!groundTruth && !revealed.includes(ev.id)) return out;
        out = out.map((t) => (t.id === effect.ledgerId ? { ...t, eventId: ev.id } : t));
        break;
      case "move_invoice":
        if (core.invoiceState !== effect.requiresInvoiceState) break;
        out = out.map((t) => (t.id === effect.ledgerId ? { ...t, date: effect.newDate, eventId: ev.id } : t));
        break;
      case "reveal_card":
        break;
    }
  }
  return out;
}

/**
 * Event effects. A resolved event applies its chosen effects (in resolve order). With
 * `includeFutureEvents`, a forced event of the seed deck that is not yet resolved (E6 in the demo
 * seed) applies its only choice as the scripted future. E6 has no effect unless INV-A1 is still
 * `pending` (ET-E08).
 */
export const eventOverlay: ForecastOverlay = (txs, ctx) => {
  const { core, includeFutureEvents } = ctx;
  let out = [...txs];
  for (const r of core.eventsResolved) {
    out = applyEventChoice(out, eventCard(r.eventId), r.choiceId, ctx);
  }
  if (includeFutureEvents) {
    for (const slot of deckFor(core.seed)) {
      if (core.eventsResolved.some((r) => r.eventId === slot.eventId)) continue;
      const ev = eventCard(slot.eventId);
      if (ev.condition !== "forced" || ev.choices.length !== 1) continue;
      out = applyEventChoice(out, ev, ev.choices[0].id, ctx);
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
export function forecastTransactions(core: GameCore, options: ForecastOptions = {}, mode: ForecastMode = {}): Transaction[] {
  const groundTruth = mode.groundTruth ?? false;
  const ctx: OverlayContext = {
    core,
    includeFutureEvents: options.includeFutureEvents ?? true,
    groundTruth,
    revealed: groundTruth ? [] : revealedFrauds(core).map((r) => r.eventId),
  };
  const overlaid = forecastOverlays.reduce<Transaction[]>((txs, overlay) => overlay(txs, ctx), ledgerTransactions());
  return shiftToBusinessDays(overlaid);
}

/** A fraud payment (E1 „Zapłać jak jest”) reported to the player, with the game date of the report. */
export interface FraudReveal {
  eventId: EventId;
  ledgerId: LedgerId;
  /** Signed amount of the payment that went to the changed account (an outflow, < 0). */
  amount: Pln;
  /** The report date: the data's reveal date, or the payment date when the payment goes out later (C3). */
  date: string;
  /** Lap week of `date`: the week resolution that reports it. */
  week: WeekNumber;
}

/**
 * The fraud reveals of a ground-truth series (the true ledger the settlement books). One rule for the
 * `fraudRevealed` signal and for the player-facing views: a resolved `reveal` choice is reported only
 * when its payment was really booked to the changed account (an own, non-counterfactual day, and not
 * the rejected crash transaction). The report date is the later of the data's reveal date and the
 * payment date; a lap that crashes before that date, or a date after the lap, reports nothing.
 */
export function fraudRevealsOf(core: GameCore, points: readonly ForecastPoint[], crash: Crash | null): FraudReveal[] {
  const out: FraudReveal[] = [];
  for (const r of core.eventsResolved) {
    const ev = eventCard(r.eventId);
    const choice = ev.choices.find((c) => c.id === r.choiceId);
    for (const effect of choice?.effects ?? []) {
      if (effect.type !== "reveal") continue;
      let paid: { date: string; amount: Pln } | null = null;
      for (const p of points) {
        if (p.counterfactual) continue;
        const t = p.transactions.find((tx) => tx.id === effect.ledgerId && tx.eventId === ev.id);
        const rejected = crash !== null && crash.date === p.date && crash.transactionId === effect.ledgerId;
        if (t && !rejected) paid = { date: p.date, amount: t.amount };
      }
      if (paid === null) continue;
      const date = paid.date > effect.date ? paid.date : effect.date;
      if (crash !== null && crash.date < date) continue;
      const week = weekOf(date);
      if (week === null) continue;
      out.push({ eventId: ev.id, ledgerId: effect.ledgerId, amount: paid.amount, date, week });
    }
  }
  return out;
}

/**
 * The fraud reveals that have happened in game time: their report week is already settled. This is
 * exactly the condition under which `resolveWeek` emitted `fraudRevealed`.
 */
export function revealedFrauds(core: GameCore): FraudReveal[] {
  if (!core.eventsResolved.some((r) => eventCard(r.eventId).choices.some((c) => c.id === r.choiceId && c.effects.some((e) => e.type === "reveal")))) {
    return [];
  }
  const { series } = runSeries(core, {}, { groundTruth: true });
  return fraudRevealsOf(core, series.points, series.crash).filter((r) => core.weeksResolved.includes(r.week));
}

function lowest(points: readonly ForecastPoint[]): BalanceAt {
  const { date, balance } = seriesMinimum(points);
  return { date, balance };
}

interface SeriesRun {
  series: CashFlowSeries;
  /** Σ max(0, −EOD balance) over the real (non-counterfactual) days. */
  interestBase: number;
}

/** The daily run of one core (no baseline, no comparison): points, week-ends, crash, minimum. */
function runSeries(core: GameCore, options: ForecastOptions, mode: ForecastMode): SeriesRun {
  const limit = core.overdraftLimit;
  const from = level1.lap.forecastStart;
  const to = level1.lap.end;
  const txs = forecastTransactions(core, options, mode);

  let balance = persona.account.openingBalance;
  let crash: Crash | null = null;
  let interestBase = 0;
  const points: ForecastPoint[] = [];

  for (const date of dateRange(from, to)) {
    const today = sameDayOrder(txs.filter((t) => t.date === date));
    const openingBalance = balance;
    for (const t of today) {
      balance += t.amount;
      if (crash === null && balance < -limit) {
        crash = { week: weekOf(date) ?? 1, date, transactionId: t.id, shortfall: -limit - balance };
      }
    }
    const counterfactual = crash !== null && date > crash.date;
    const inflow = today.reduce((sum, t) => (t.amount > 0 ? sum + t.amount : sum), 0);
    const outflow = today.reduce((sum, t) => (t.amount < 0 ? sum + t.amount : sum), 0);
    points.push({
      date,
      balance,
      transactions: today,
      counterfactual,
      week: weekOf(date),
      openingBalance,
      inflow,
      outflow,
      change: balance - openingBalance,
    });
    // The lap stops at a crash: interest counts real days only (through the crash date), never counterfactual ones.
    if (!counterfactual) interestBase += Math.max(0, -balance);
  }

  const weekEnds: WeekEndBalance[] = level1.weeks.map((w) => {
    const p = points.find((pt) => pt.date === w.end);
    const stopped = crash !== null && crash.date <= w.end;
    return { week: w.week, date: w.end, balance: stopped || !p ? null : p.balance };
  });

  const series: CashFlowSeries = {
    points,
    weekEnds,
    crash,
    minimum: seriesMinimum(points),
    endBalance: points[points.length - 1].balance,
    overdraftLimit: limit,
    afterLap: txs.filter((t) => t.date > to),
  };
  return { series, interestBase };
}

/**
 * Daily forecast 21 XI 2026 … 10 I 2027 from the opening balance. Post-crash points are counterfactual.
 * E-07 adds the Cash Flow drilldown: the „Bez działania” baseline (same state, no card), the comparison
 * against it, the „Zadania” list and the transactions after the lap.
 * `mode.groundTruth` is for the settlement only (see `OverlayContext`).
 */
export function computeForecast(state: GameState, options: ForecastOptions = {}, mode: ForecastMode = {}): Forecast {
  const core = state.core;
  const { series: committed, interestBase } = runSeries(core, options, mode);
  // Without a played card the forecast is its own baseline.
  const base = core.played.length === 0 ? committed : runSeries(baselineCore(core), options, mode).series;
  const { points, crash, endBalance } = committed;
  const limit = core.overdraftLimit;

  return {
    from: level1.lap.forecastStart,
    to: level1.lap.end,
    points,
    weekEnds: committed.weekEnds,
    crash,
    low: crash ? null : lowest(points),
    endBalance: crash ? null : endBalance,
    counterfactual: crash ? { low: lowest(points), endBalance } : null,
    overdraftLimit: limit,
    overdraftInterest:
      limit > 0
        ? Math.round((interestBase * level1.rules.overdraftInterestRatePerYear) / level1.rules.daysInYear)
        : 0,
    runwayDays: Math.floor(Math.max(0, core.balance) / level1.rules.runwayDailyCost),
    minimum: committed.minimum,
    committedCards: core.played.map((p) => p.cardId),
    baseline: base,
    vsBaseline: compareSeries(base, committed),
    tasks: buildTasks(points, crash, settledThrough(core)),
    afterLap: committed.afterLap,
  };
}

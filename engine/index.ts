// Public engine API (RUNTIME-ENGINE-CONTRACT.md). UI and narrative code import only from here.
// E-01: final signatures. E-02: real forecast (forecast.ts). E-03: action cards (cards.ts).
// E-04: seeded event deck (seed.ts, events.ts). Other bodies are fixtures until E-05…E-09.
import { isValidIsoDate } from "./calendar";
import { gameData } from "./data";
import { RuleError } from "./errors";
import { initialState } from "./fixture";
import { applyCard, cardCost, cardDef, disabledReason, safeCards } from "./cards";
import { computeForecast, weekOf } from "./forecast";
import { applyEventChoice, currentEventView, shownEvent, shownEventSignals } from "./events";
import { lapScore } from "./score";
import { assertSeed } from "./seed";
import type {
  AgentId,
  AgentIntent,
  CardId,
  CardPreview,
  CardView,
  CfoHint,
  CurrentEvent,
  EngineEvent,
  EventChoiceId,
  Forecast,
  ForecastOptions,
  GameCore,
  GameState,
  IsoDate,
  NegotiationResult,
  Plan,
  WeekNumber,
  WeekResolution,
} from "./types";

export * from "./types";
export { RuleError, isRuleError, type RuleErrorCode } from "./errors";
export { gameData, type GameData } from "./data";

const { level1, agents, futureScript } = gameData;

/** Default seed of the pitch (`/gra/1?seed=demo`). */
export const DEMO_SEED = "demo";
export const SCHEMA_VERSION = 1;

function withCore(state: GameState, core: GameCore, emitted: EngineEvent[] = []): GameState {
  return { ...state, core, emitted };
}

function eventPending(state: GameState): boolean {
  return shownEvent(state) !== null;
}

function newLap(seed: string): GameState {
  assertSeed(seed);
  const state = initialState(seed);
  return { ...state, emitted: [...state.emitted, ...shownEventSignals(state)] };
}

/**
 * Start a new lap with the seeded event deck. Level 1 defines only the demo seed; any other seed
 * throws RuleError("unknown_seed") (no silent fallback).
 */
export function createGame(seed: string = DEMO_SEED): GameState {
  return newLap(seed);
}

/** Reset: a fresh state with both clocks cleared. The caller also clears persisted application state. */
export function resetGame(seed: string = DEMO_SEED): GameState {
  return newLap(seed);
}

/**
 * Read-only daily forecast 21 XI … 10 I: ledger + played cards + events, business-day shift,
 * inflows before outflows, crash below −overdraft. Post-crash points are counterfactual.
 * Default includes the scripted E6 delay; `includeFutureEvents: false` applies E6 only once resolved.
 */
export function forecast(state: GameState, options: ForecastOptions = {}): Forecast {
  return computeForecast(state, options);
}

/** All six cards with engine-owned playability, disabled reasons and cost (C4 incl. the interest estimate). */
export function getAvailableCards(state: GameState): CardView[] {
  return level1.cards.map((card) => {
    const reason = disabledReason(state.core, card.id);
    return {
      id: card.id,
      key: card.key,
      title: card.title,
      labels: [...card.labels],
      window: { ...card.window },
      played: state.core.played.some((p) => p.cardId === card.id),
      playable: reason === null,
      disabledReason: reason,
      tooLate: card.tooLateFrom !== null && state.core.week >= card.tooLateFrom,
      cost: cardCost(state, card.id),
      costIsEstimate: card.cost.overdraftInterest,
      relationsDelta: card.relationsDelta,
      competenceId: card.competence?.id ?? null,
      isProduct: card.isProduct,
    };
  });
}

/**
 * Simulate a card without committing it. `after` is the forecast of the simulated state.
 * `simulated.emitted` carries the events the play would emit; previewing a playable C5 adds
 * `loanOffered` with `via: "C5_preview"`.
 */
export function previewCard(state: GameState, cardId: CardId): CardPreview {
  const card = cardDef(cardId);
  const reason = disabledReason(state.core, cardId);
  const played = reason === null ? applyCard(state, cardId, false) : { ...state, emitted: [] };
  const loanOffered: EngineEvent[] =
    reason === null && card.effect.type === "loan" ? [{ type: "loanOffered", week: state.core.week, via: "C5_preview" }] : [];
  const simulated: GameState = { ...played, emitted: [...played.emitted, ...loanOffered] };
  return {
    cardId,
    playable: reason === null,
    disabledReason: reason,
    before: forecast(state),
    after: forecast(simulated),
    simulated,
    cost: cardCost(state, cardId),
    relationsDelta: card.relationsDelta,
  };
}

/**
 * Play a card as the week's one action (once per lap, C2 ↔ C6 exclusive). Throws RuleError("card_unavailable")
 * when disabled. Its money effect is applied by the forecast overlay; no transaction is resolved here.
 */
export function playCard(state: GameState, cardId: CardId, delegated: boolean = false): GameState {
  return applyCard(state, cardId, delegated);
}

/**
 * The event card of the current week: dealt by the seed, its condition holds (E5: the known-ledger
 * forecast still crashes), not yet resolved. Null otherwise. No event consumes the card action.
 */
export function getCurrentEvent(state: GameState): CurrentEvent | null {
  return currentEventView(state);
}

/**
 * Resolve the current event (E6: `acknowledge`). Own or delegated competence milestone; the money
 * effect is applied by the forecast event overlay. Does not consume the week's card action.
 * Emits nothing: the event's narration signal was emitted when the card became current.
 */
export function resolveEvent(state: GameState, choiceId: EventChoiceId, delegated: boolean = false): GameState {
  return applyEventChoice(state, choiceId, delegated);
}

/** Settle the current week exactly once. Throws RuleError("event_unresolved") while the event is open. */
export function resolveWeek(state: GameState): WeekResolution {
  const core = state.core;
  if (core.status !== "playing") throw new RuleError("not_playing");
  if (eventPending(state)) throw new RuleError("event_unresolved");
  const f = forecast(state);
  const week = core.week;
  const { start, end } = level1.weeks[week - 1];
  const transactions = f.points.filter((p) => p.date >= start && p.date <= end).flatMap((p) => p.transactions);
  const crash = f.crash && weekOf(f.crash.date) === week ? f.crash : null;
  const endPoint = f.points.find((p) => p.date === end);
  const endBalance = crash || !endPoint ? null : endPoint.balance;
  const events: EngineEvent[] = [];
  let next: GameCore = { ...core, weeksResolved: [...core.weeksResolved, week] };

  if (crash) {
    const score = lapScore(next, f, false);
    next = { ...next, status: "crashed", crash, stars: score.stars, level2Unlocked: false };
    events.push({ type: "crash", week, crash });
  } else {
    const balance = endBalance ?? core.balance;
    if (week === 7) {
      const planSaved = state.account.plans.some((p) => p.savedAt !== null && core.played.some((c) => c.cardId === p.cardId));
      const score = lapScore(next, f, planSaved);
      next = {
        ...next,
        status: "completed",
        balance,
        stars: score.stars,
        costOfMoney: score.costOfMoney,
        avoidedCost: score.avoidedCost,
        lowestBalance: f.low,
        level2Unlocked: score.level2Unlocked,
      };
      const earned = level1.stars.map((st) => st.id).filter((id) => score.stars[id] === "earned");
      events.push({ type: "lapWon", week, stars: earned });
    } else {
      const nextWeek = (week + 1) as WeekNumber;
      next = {
        ...next,
        week: nextWeek,
        balance,
        weekActionUsed: false,
        negotiation: {
          klient_a: { ...next.negotiation.klient_a, messagesThisWeek: 0 },
          bank: { ...next.negotiation.bank, messagesThisWeek: 0 },
        },
      };
      if (transactions.length === 0 && !core.eventsResolved.some((r) => r.week === week)) {
        events.push({ type: "quietWeek", week });
      }
    }
  }
  const snapshots = next.status === "playing" ? { ...state.snapshots, [next.week]: next } : state.snapshots;
  const settled: GameState = { ...state, core: next, snapshots, emitted: [] };
  events.push(...shownEventSignals(settled));
  const newState: GameState = { ...settled, emitted: events };
  return { state: newState, week, transactions, endBalance, crash, events };
}

/**
 * Restore the snapshot of `week`. Keeps the account clock and saved plans. The restored week's
 * event card is current again, so its narration signal is emitted again.
 */
export function rewind(state: GameState, week: WeekNumber): GameState {
  const snap = state.snapshots[week];
  if (!snap) throw new RuleError("no_snapshot", `no snapshot for week ${week}`);
  const snapshots: GameState["snapshots"] = {};
  for (const w of [1, 2, 3, 4, 5, 6, 7] as const) {
    const s = state.snapshots[w];
    if (s && w <= week) snapshots[w] = s;
  }
  const restored: GameState = { ...state, core: snap, snapshots, emitted: [] };
  return { ...restored, emitted: shownEventSignals(restored) };
}

/** Draft the plan of a played decision (not yet saved). Fixture: C1 template, else built from the card. */
export function createPlan(state: GameState, cardId: CardId): Plan {
  const played = state.core.played.some((p) => p.cardId === cardId);
  if (!played) throw new RuleError("plan_not_allowed", `${cardId} not played`);
  const template = futureScript.planTemplates.find((t) => t.cardId === cardId);
  const card = cardDef(cardId);
  if (template) {
    return { id: `plan-${cardId}`, ...template, status: "open", savedAt: null };
  }
  return {
    id: `plan-${cardId}`,
    cardId,
    counterpartyId: "A",
    amount: 0,
    tolerancePct: futureScript.matcher.tolerancePct,
    deadline: level1.lap.end,
    direction: "inflow",
    title: card.title,
    status: "open",
    savedAt: null,
  };
}

/** Prospective state with the plan saved (Pilot finalised). The caller persists it before showing success. */
export function savePlan(state: GameState, cardId: CardId): GameState {
  const plan: Plan = { ...createPlan(state, cardId), savedAt: state.account.clock };
  const plans = [...state.account.plans.filter((p) => p.cardId !== cardId), plan];
  const stars =
    state.core.stars.pilot === "pending" ? { ...state.core.stars, pilot: "earned" as const } : state.core.stars;
  return { ...state, core: { ...state.core, stars }, account: { ...state.account, plans }, emitted: [] };
}

/** Move the synthetic account clock (default 5 XII). Never changes game week, stars or unlock. Fixture: clock only. */
export function advanceAccountClock(state: GameState, date: IsoDate = futureScript.accountClock.defaultTarget): GameState {
  if (!isValidIsoDate(date) || date < state.account.clock) throw new RuleError("invalid_date", date);
  return { ...state, account: { ...state.account, clock: date }, emitted: [] };
}

/** One message to an agent; the rules table decides. Fixture (E-08 pending): counts messages, answers with the fallback line. */
export function negotiate(state: GameState, agent: AgentId, intent: AgentIntent, percent?: number): NegotiationResult {
  void percent;
  const def = agents[agent];
  const thread = state.core.negotiation[agent];
  const fallback = agent === "klient_a" ? "a.fallback" : "bank.fallback";
  if (thread.messagesThisWeek >= def.maxMessagesPerWeek) {
    return {
      state: { ...state, emitted: [] },
      agent,
      intent,
      outcome: "blocked",
      lineId: fallback,
      appliedCardId: null,
      counterPercent: null,
      blocked: true,
      numbers: [],
    };
  }
  const core: GameCore = {
    ...state.core,
    negotiation: { ...state.core.negotiation, [agent]: { ...thread, messagesThisWeek: thread.messagesThisWeek + 1 } },
  };
  const emitted: EngineEvent[] =
    thread.messagesThisWeek === 0 ? [{ type: "negotiationOpen", week: core.week, agent }] : [];
  return {
    state: withCore(state, core, emitted),
    agent,
    intent,
    outcome: "quick_replies",
    lineId: fallback,
    appliedCardId: null,
    counterPercent: null,
    blocked: false,
    numbers: [],
  };
}

/** AI-CFO hint: earliest future crash and the two cheapest playable cards that remove it (none without risk). */
export function getCfoHint(state: GameState): CfoHint {
  const risk = forecast(state).crash;
  return { week: state.core.week, risk, options: risk ? safeCards(state).slice(0, 2) : [] };
}

/**
 * Play the cheapest safe card (playable, no crash after it) as a delegated decision: competence
 * milestone 1 for its competence, none for a product. Throws RuleError("no_safe_card") when none is safe.
 */
export function delegateBestCard(state: GameState): GameState {
  const best = safeCards(state)[0];
  if (!best) throw new RuleError("no_safe_card");
  return applyCard(state, best.cardId, true);
}

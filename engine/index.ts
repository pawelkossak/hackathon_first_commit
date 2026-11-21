// Public engine API (RUNTIME-ENGINE-CONTRACT.md). UI and narrative code import only from here.
// E-01: final signatures. E-02: real forecast (forecast.ts). E-03: action cards (cards.ts).
// E-04: seeded event deck (seed.ts, events.ts). E-05: turn state machine (turn.ts).
// E-06: score (score.ts), hidden fraud until its reveal, plans only from a winning lap.
// E-07: Cash Flow drilldown fields on Forecast and CardPreview (cashflow.ts).
// E-08: agent rules (agents.ts); the CFO hint and delegation offer a product last (D-17).
// E-09: plan matcher and the synthetic account clock replaying data/future-script.json (matcher.ts).
// E-10: one fraud-reveal rule for views and fraudRevealed; rewind keeps a validated plan's competence 3.
// E-11: level 2 „Pierwszy pracownik” (employee.ts, data/level2.json); additive exports only.
import { negotiateWith } from "./agents";
import { gameData } from "./data";
import { RuleError } from "./errors";
import { initialState } from "./fixture";
import { applyCard, cardCost, cardDef, disabledReason, safeCards } from "./cards";
import { compareForecasts } from "./cashflow";
import { computeForecast } from "./forecast";
import { applyEventChoice, currentEventView, shownEventSignals } from "./events";
import { coreAfterPlanSave, rewindTo, settleWeek } from "./turn";
import { replayAccount } from "./matcher";
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
export {
  EMPLOYEE_STORAGE_KEY,
  chooseEmployeeAction,
  createEmployeeGame,
  employeeForecast,
  employeeScore,
  resolveEmployeeWeek,
  restoreEmployeeGame,
  rewindEmployeeGame,
} from "./employee";

const { level1, agents, futureScript } = gameData;

/** Default seed of the pitch (`/gra/1?seed=demo`). */
export const DEMO_SEED = "demo";
export const SCHEMA_VERSION = 1;

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
 * E-07: also carries the Cash Flow drilldown — `minimum`, the no-card `baseline`, `vsBaseline`, `tasks`
 * („Zadania”) and `afterLap`.
 * Neither view shows a hidden fraud (E1 „Zapłać jak jest”) before its reveal has happened in game time,
 * i.e. before the week resolution that emitted `fraudRevealed` (23 XII, or the later day the payment
 * really goes out); resolveWeek still settles the true ledger.
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
 * Simulate a card without committing it. `after` is the forecast of the simulated state;
 * `comparison` is before → after day by day (G32 „Przed decyzją / Po decyzji”).
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
  const before = forecast(state);
  const after = forecast(simulated);
  return {
    cardId,
    playable: reason === null,
    disabledReason: reason,
    before,
    after,
    simulated,
    cost: cardCost(state, cardId),
    relationsDelta: card.relationsDelta,
    comparison: compareForecasts(before, after),
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

/**
 * Settle the current week exactly once (turn state machine in turn.ts). Throws
 * RuleError("event_unresolved") while the event is open and RuleError("not_playing") after the lap.
 * Week 7 completes the lap with Pilot "pending" (or "missed"); savePlan finalises it.
 */
export function resolveWeek(state: GameState): WeekResolution {
  return settleWeek(state);
}

/**
 * Restore the snapshot of `week` from any status. Keeps the account clock and saved plans; Pilot
 * lives in core.stars, so it is dropped. The restored week's event card is current again, so its
 * narration signal is emitted again. Throws RuleError("no_snapshot") for a week not reached yet.
 */
export function rewind(state: GameState, week: WeekNumber): GameState {
  return rewindTo(state, week);
}

/**
 * Draft the plan of a winning decision (not yet saved). Throws RuleError("plan_not_allowed") unless
 * the lap is completed (not crashed, not still running) and `cardId` was played in it (U-6, §6.3).
 * Fixture: C1 template, else built from the card.
 */
export function createPlan(state: GameState, cardId: CardId): Plan {
  if (state.core.status !== "completed") {
    throw new RuleError("plan_not_allowed", `lap is ${state.core.status}, not a winning lap`);
  }
  const played = state.core.played.some((p) => p.cardId === cardId);
  if (!played) throw new RuleError("plan_not_allowed", `${cardId} not played in the winning lap`);
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

/**
 * Prospective state with the plan saved. Only a winning decision can be saved (same rule and error
 * as createPlan). Pilot is finalised when it is "pending"; a "missed" Pilot stays missed. The caller
 * persists the returned state before showing success.
 */
export function savePlan(state: GameState, cardId: CardId): GameState {
  const plan: Plan = { ...createPlan(state, cardId), savedAt: state.account.clock };
  const plans = [...state.account.plans.filter((p) => p.cardId !== cardId), plan];
  return { ...state, core: coreAfterPlanSave(state.core), account: { ...state.account, plans }, emitted: [] };
}

/**
 * Move the synthetic account clock (default 5 XII) and replay data/future-script.json up to `date`
 * (matcher.ts): L01, L02 and, when C1 was played or its plan saved, the 3 XII advance. Every saved plan
 * is re-checked (met / open / ask / missed); a plan that becomes met raises its card's competence to 3
 * and emits `planValidated`. Never changes game week, status, stars, unlock or snapshots.
 * Throws RuleError("invalid_date") for an invalid date or one before the account clock.
 */
export function advanceAccountClock(state: GameState, date: IsoDate = futureScript.accountClock.defaultTarget): GameState {
  return replayAccount(state, date);
}

/**
 * One message to an agent (agents.ts); data/agents.json decides, first matching rule wins. The AI only
 * supplies the intent (and the percent for ask_advance). Max 3 messages per agent per week: the 4th is
 * `blocked` (quick replies only, no state change). An accepted deal (C1, C2, C4) is played through the
 * same path as playCard, as the player's own decision. Throws RuleError("not_playing") after the lap.
 * `numbers` lists every number the reply may mention (number guardrail).
 */
export function negotiate(state: GameState, agent: AgentId, intent: AgentIntent, percent?: number): NegotiationResult {
  return negotiateWith(state, agent, intent, percent);
}

/**
 * AI-CFO hint: earliest future crash and the two cheapest safe cards that remove it (none without
 * risk). D-17: a product card appears only when no card without a product removes the crash.
 */
export function getCfoHint(state: GameState): CfoHint {
  const risk = forecast(state).crash;
  return { week: state.core.week, risk, options: risk ? safeCards(state).slice(0, agents.cfo.optionCount) : [] };
}

/**
 * Play the cheapest safe card (playable, no crash after it) as a delegated decision: competence
 * milestone 1 for its competence, none for a product. Same product-last rule as the hint (D-17): a
 * product is delegated only when no card without a product is safe.
 * Throws RuleError("no_safe_card") when none is safe.
 */
export function delegateBestCard(state: GameState): GameState {
  const best = safeCards(state)[0];
  if (!best) throw new RuleError("no_safe_card");
  return applyCard(state, best.cardId, true);
}

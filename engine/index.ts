// Public engine API (RUNTIME-ENGINE-CONTRACT.md). UI and narrative code import only from here.
// E-01: final signatures. E-02: real forecast (forecast.ts). Other bodies are fixtures until E-03…E-09.
import { isValidIsoDate } from "./calendar";
import { gameData } from "./data";
import { RuleError } from "./errors";
import { initialState } from "./fixture";
import { computeForecast, weekOf } from "./forecast";
import type {
  AgentId,
  AgentIntent,
  CardId,
  CardPreview,
  CardView,
  CfoHint,
  CurrentEvent,
  DisabledReason,
  EngineEvent,
  EventChoiceId,
  Forecast,
  ForecastOptions,
  GameCore,
  GameState,
  IsoDate,
  NegotiationResult,
  Plan,
  StarId,
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

function cardDef(cardId: CardId) {
  const card = level1.cards.find((c) => c.id === cardId);
  if (!card) throw new RuleError("unknown_card", `unknown card ${cardId}`);
  return card;
}

function deckFor(seed: string) {
  return level1.seeds[seed] ?? level1.seeds[DEMO_SEED];
}

function eventForWeek(core: GameCore) {
  const slot = deckFor(core.seed).find((s) => s.week === core.week);
  if (!slot) return null;
  return level1.events.find((e) => e.id === slot.eventId) ?? null;
}

function eventPending(core: GameCore): boolean {
  const ev = eventForWeek(core);
  return ev !== null && !core.eventsResolved.some((r) => r.eventId === ev.id);
}

function disabledReasonFor(core: GameCore, cardId: CardId): DisabledReason | null {
  const card = cardDef(cardId);
  const text = (key: keyof typeof level1.disabledReasons) => level1.disabledReasons[key];
  if (core.status !== "playing") return { code: "not_playing", text: null };
  if (core.played.some((p) => p.cardId === cardId)) return { code: "already_played", text: text("already_played") };
  if (core.week > card.window.to) {
    if (card.afterWindowReason) return { code: card.afterWindowReason, text: text(card.afterWindowReason) };
    return { code: "outside_window", text: null };
  }
  if (core.week < card.window.from) return { code: "outside_window", text: null };
  if (cardId === "C2" && core.invoiceState === "factored") return { code: "invoice_financed", text: text("invoice_financed") };
  if (cardId === "C6" && core.invoiceState === "discounted") return { code: "invoice_paid", text: text("invoice_paid") };
  if (cardId === "C4" && core.overdraftLimit > 0) return { code: "overdraft_active", text: null };
  if (core.weekActionUsed) return { code: "week_action_used", text: null };
  return null;
}

/** Start a new lap. Fixture: the initial state from data (this is already the final initial state). */
export function createGame(seed: string = DEMO_SEED): GameState {
  return initialState(seed);
}

/** Reset: a fresh state with both clocks cleared. The caller also clears persisted application state. */
export function resetGame(seed: string = DEMO_SEED): GameState {
  return initialState(seed);
}

/**
 * Read-only daily forecast 21 XI … 10 I: ledger + played cards + events, business-day shift,
 * inflows before outflows, crash below −overdraft. Post-crash points are counterfactual.
 * Default includes the scripted E6 delay; `includeFutureEvents: false` applies E6 only once resolved.
 */
export function forecast(state: GameState, options: ForecastOptions = {}): Forecast {
  return computeForecast(state, options);
}

/** All six cards with engine-owned playability and disabled reasons. Fixture: window/played/exclusivity only. */
export function getAvailableCards(state: GameState): CardView[] {
  return level1.cards.map((card) => {
    const reason = disabledReasonFor(state.core, card.id);
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
      cost: card.cost.fixed,
      costIsEstimate: card.cost.overdraftInterest,
      relationsDelta: card.relationsDelta,
      competenceId: card.competence?.id ?? null,
      isProduct: card.isProduct,
    };
  });
}

/** Simulate a card without committing it. `after` is the forecast of the simulated state (card money overlay of E-02). */
export function previewCard(state: GameState, cardId: CardId): CardPreview {
  const card = cardDef(cardId);
  const reason = disabledReasonFor(state.core, cardId);
  const simulated = reason === null ? playCard(state, cardId, false) : state;
  return {
    cardId,
    playable: reason === null,
    disabledReason: reason,
    before: forecast(state),
    after: forecast(simulated),
    simulated,
    cost: card.cost.fixed,
    relationsDelta: card.relationsDelta,
  };
}

/** Play a card as the week's one action. Throws RuleError("card_unavailable") when disabled. Its money effect is applied by the forecast overlay. */
export function playCard(state: GameState, cardId: CardId, delegated: boolean = false): GameState {
  const card = cardDef(cardId);
  const reason = disabledReasonFor(state.core, cardId);
  if (reason) throw new RuleError("card_unavailable", `${cardId}: ${reason.code}`);
  const core = state.core;
  const competences = { ...core.competences };
  if (card.competence) {
    const level = delegated ? card.competence.delegated : card.competence.own;
    competences[card.competence.id] = Math.max(competences[card.competence.id], level) as typeof level;
  }
  let invoiceState = core.invoiceState;
  if (card.effect.type === "discount" || card.effect.type === "factoring") invoiceState = card.effect.invoiceStateAfter;
  return withCore(state, {
    ...core,
    hand: core.hand.filter((id) => id !== cardId),
    played: [...core.played, { cardId, week: core.week, delegated, cost: card.cost.fixed }],
    weekActionUsed: true,
    invoiceState,
    overdraftLimit: card.effect.type === "overdraft" ? card.effect.limit : core.overdraftLimit,
    relations: core.relations + card.relationsDelta,
    costOfMoney: core.costOfMoney + card.cost.fixed,
    competences,
  });
}

/** The event card of the current week, or null when none or already resolved. Fixture: E5 condition not yet checked. */
export function getCurrentEvent(state: GameState): CurrentEvent | null {
  if (state.core.status !== "playing" || !eventPending(state.core)) return null;
  const ev = eventForWeek(state.core);
  if (!ev) return null;
  return {
    id: ev.id,
    week: ev.week,
    title: ev.title,
    choices: ev.choices.map((c) => ({ id: c.id, label: c.label })),
  };
}

/** Resolve the current event. E6 uses `acknowledge`. Does not consume the week's card action. */
export function resolveEvent(state: GameState, choiceId: EventChoiceId, delegated: boolean = false): GameState {
  const core = state.core;
  if (core.status !== "playing") throw new RuleError("not_playing");
  const ev = eventForWeek(core);
  if (!ev || !eventPending(core)) throw new RuleError("no_event");
  const choice = ev.choices.find((c) => c.id === choiceId);
  if (!choice) throw new RuleError("invalid_choice", `${ev.id}: ${choiceId}`);
  const competences = { ...core.competences };
  if (choice.competence) {
    const level = delegated ? choice.competence.delegated : choice.competence.own;
    competences[choice.competence.id] = Math.max(competences[choice.competence.id], level) as typeof level;
  }
  const emitted: EngineEvent[] = [];
  if (ev.id === "E2") emitted.push({ type: "bigProject", week: core.week, eventId: "E2" });
  if (ev.id === "E5") emitted.push({ type: "loanOffered", week: core.week, via: "E5" });
  if (ev.id === "E6") emitted.push({ type: "lateClient", week: core.week, eventId: "E6", newDate: null });
  return withCore(
    state,
    {
      ...core,
      eventsResolved: [...core.eventsResolved, { eventId: ev.id, week: core.week, choiceId, delegated }],
      competences,
      loanTermsShown: core.loanTermsShown || choiceId === "show_cost",
    },
    emitted,
  );
}

/** Settle the current week exactly once. Throws RuleError("event_unresolved") while the event is open. */
export function resolveWeek(state: GameState): WeekResolution {
  const core = state.core;
  if (core.status !== "playing") throw new RuleError("not_playing");
  if (eventPending(core)) throw new RuleError("event_unresolved");
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
    next = { ...next, status: "crashed", crash };
    events.push({ type: "crash", week, crash });
  } else {
    const balance = endBalance ?? core.balance;
    if (week === 7) {
      const tanio = next.costOfMoney <= 500 && next.relations === level1.rules.relationsStart;
      const stars = { przetrwanie: "earned", tanio: tanio ? "earned" : "missed", pilot: "pending" } as const;
      const earned: StarId[] = (Object.keys(stars) as StarId[]).filter((k) => stars[k] === "earned");
      next = {
        ...next,
        status: "completed",
        balance,
        stars,
        avoidedCost: level1.rules.defaultCostOfMoney - next.costOfMoney,
        level2Unlocked: earned.length >= level1.unlock.minStars,
      };
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
      if (transactions.length === 0 && eventForWeek(core) === null) events.push({ type: "quietWeek", week });
    }
  }
  const snapshots = next.status === "playing" ? { ...state.snapshots, [next.week]: next } : state.snapshots;
  const newState: GameState = { ...state, core: next, snapshots, emitted: events };
  return { state: newState, week, transactions, endBalance, crash, events };
}

/** Restore the snapshot of `week`. Keeps the account clock and saved plans. */
export function rewind(state: GameState, week: WeekNumber): GameState {
  const snap = state.snapshots[week];
  if (!snap) throw new RuleError("no_snapshot", `no snapshot for week ${week}`);
  const snapshots: GameState["snapshots"] = {};
  for (const w of [1, 2, 3, 4, 5, 6, 7] as const) {
    const s = state.snapshots[w];
    if (s && w <= week) snapshots[w] = s;
  }
  return { ...state, core: snap, snapshots, emitted: [] };
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

/** AI-CFO hint: earliest future crash and the two cheapest playable safe cards. Fixture: risk only, no options yet. */
export function getCfoHint(state: GameState): CfoHint {
  return { week: state.core.week, risk: forecast(state).crash, options: [] };
}

/** Play the cheapest safe card as a delegated decision. Fixture: the cheapest playable card. */
export function delegateBestCard(state: GameState): GameState {
  const playable = getAvailableCards(state)
    .filter((c) => c.playable)
    .sort((a, b) => a.cost - b.cost);
  if (playable.length === 0) throw new RuleError("no_safe_card");
  return playCard(state, playable[0].id, true);
}

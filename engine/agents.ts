// Agent rules (E-08): Klient A and Doradca banku (ENGINE-DATA-AND-TESTS.md §4.1–§4.2).
// The AI only classifies free text into an intent; data/agents.json decides the outcome and the engine
// computes every number. A deal that applies a card goes through applyCard, the same path as playCard,
// so the card is played (the week's action), shows in forecast.committedCards and is booked once.
import { applyCard, cardCost, cardDef, disabledReason } from "./cards";
import { gameData } from "./data";
import { RuleError } from "./errors";
import { computeForecast } from "./forecast";
import type {
  AgentId,
  AgentIntent,
  AgentsFile,
  CardId,
  EngineEvent,
  GameCore,
  GameState,
  NegotiationResult,
  Pln,
} from "./types";

const { agents, level1, persona } = gameData;

type AgentDefinition = AgentsFile["klient_a"];
type AgentRule = AgentDefinition["rules"][number];

/** Threshold of the `percent_at_most_30` / `percent_above_30` conditions. */
const ADVANCE_PERCENT_LIMIT = 30;

/** A usable percent is a finite number above 0; anything else counts as „no percent named”. */
function usablePercent(percent: number | undefined): number | null {
  return percent !== undefined && Number.isFinite(percent) && percent > 0 ? percent : null;
}

function conditionHolds(state: GameState, rule: AgentRule, agentId: AgentId, percent: number | null): boolean {
  const core = state.core;
  switch (rule.condition) {
    case "none":
      return true;
    case "percent_at_most_30":
      return percent !== null && percent <= ADVANCE_PERCENT_LIMIT;
    case "percent_above_30":
      // No percent named: the client names her terms, the 30 % counter.
      return percent === null || percent > ADVANCE_PERCENT_LIMIT;
    case "counter_pending":
      return core.negotiation[agentId].counterPending;
    case "invoice_pending":
      return core.invoiceState === "pending";
    case "gap_closed":
      // Player-facing forecast (the hidden fraud stays hidden).
      return computeForecast(state).crash === null;
  }
}

/** First matching rule: intent, week window, condition, and its card (if any) playable now. */
function matchRule(state: GameState, agentId: AgentId, intent: AgentIntent, percent?: number): AgentRule {
  const def = agents[agentId];
  const p = usablePercent(percent);
  const week = state.core.week;
  const rule = def.rules.find(
    (r) =>
      r.intent === intent &&
      (r.weeks === null || (week >= r.weeks.from && week <= r.weeks.to)) &&
      conditionHolds(state, r, agentId, p) &&
      (r.cardId === null || (!def.neverOffers.includes(r.cardId) && disabledReason(state.core, r.cardId) === null)),
  );
  return rule ?? fallbackRule(def);
}

function fallbackRule(def: AgentDefinition): AgentRule {
  const rule = def.rules.find((r) => r.intent === "unknown" && r.weeks === null);
  // data.ts checks at load time that every agent has one.
  if (!rule) throw new Error(`${def.name}: no fallback rule`);
  return rule;
}

function dayOfMonth(date: string): number {
  return Number(date.slice(8, 10));
}

/** Every number a line about `cardId` may mention: amounts, percents, cost and the day of its date. */
function cardNumbers(state: GameState, cardId: CardId): number[] {
  const card = cardDef(cardId);
  const e = card.effect;
  const week = state.core.week;
  const cost = cardCost(state, cardId);
  switch (e.type) {
    case "inflow":
      return [e.amount, dayOfMonth(e.date), cost];
    case "discount": {
      const gross = persona.invoices.find((i) => i.id === e.invoiceId)?.gross;
      const payout = e.payoutDates.find((d) => d.week === week);
      return [
        e.discountPct,
        e.amount,
        cost,
        ...(gross === undefined ? [] : [gross]),
        ...(payout ? [dayOfMonth(payout.date)] : []),
      ];
    }
    case "overdraft":
      // „Show cost formula”: 150 + interest at 12 % a year (estimate).
      return [
        e.limit,
        card.cost.fixed,
        cost - card.cost.fixed,
        cost,
        Math.round(level1.rules.overdraftInterestRatePerYear * 100),
      ];
    case "move_ledger":
      return [dayOfMonth(e.newDate), cost];
    case "loan":
      return [e.amount, -e.repayment.amount, cost];
    case "factoring":
      return [e.amount, e.fee, cost];
  }
}

function unique(values: number[]): Pln[] {
  return [...new Set(values)];
}

/** Numbers of the reply: the counter percent of the agent's offer for this card plus the card's numbers. */
function outcomeNumbers(state: GameState, def: AgentDefinition, rule: AgentRule): Pln[] {
  if (rule.cardId === null) return [];
  const cardId = rule.cardId;
  const percents = def.rules
    .filter((r) => r.cardId === cardId && r.counterPercent !== null)
    .map((r) => r.counterPercent ?? 0);
  return unique([...percents, ...cardNumbers(state, cardId)]);
}

function clampRelations(value: number): number {
  return Math.max(0, Math.min(level1.rules.relationsMax, value));
}

function appliesCard(rule: AgentRule): rule is AgentRule & { cardId: CardId } {
  return rule.cardId !== null && (rule.outcome === "accept" || rule.outcome === "inform_allow");
}

/**
 * One message to an agent. Throws RuleError("not_playing") once the lap is over. The 4th message of
 * a week is blocked (quick replies only, no state change). Otherwise the first matching rule decides;
 * an accepted deal plays its card through applyCard as the player's own decision.
 */
export function negotiateWith(state: GameState, agentId: AgentId, intent: AgentIntent, percent?: number): NegotiationResult {
  if (state.core.status !== "playing") {
    throw new RuleError("not_playing", `negotiation after the lap (${state.core.status})`);
  }
  const def = agents[agentId];
  const thread = state.core.negotiation[agentId];
  if (thread.messagesThisWeek >= def.maxMessagesPerWeek) {
    return {
      state: { ...state, emitted: [] },
      agent: agentId,
      intent,
      outcome: "blocked",
      lineId: fallbackRule(def).lineId,
      appliedCardId: null,
      counterPercent: null,
      blocked: true,
      numbers: [],
    };
  }

  const rule = matchRule(state, agentId, intent, percent);
  const numbers = outcomeNumbers(state, def, rule);
  const applied = appliesCard(rule) ? applyCard(state, rule.cardId, false) : null;
  const base: GameCore = applied ? applied.core : state.core;
  const counterPending =
    rule.outcome === "counter" ? true : applied !== null ? false : thread.counterPending;
  const core: GameCore = {
    ...base,
    relations: clampRelations(base.relations + rule.relationsDelta),
    negotiation: {
      ...base.negotiation,
      [agentId]: { messagesThisWeek: thread.messagesThisWeek + 1, counterPending },
    },
  };
  const emitted: EngineEvent[] = [
    ...(thread.messagesThisWeek === 0 ? [{ type: "negotiationOpen" as const, week: core.week, agent: agentId }] : []),
    ...(applied ? applied.emitted : []),
  ];
  return {
    state: { ...state, core, emitted },
    agent: agentId,
    intent,
    outcome: rule.outcome,
    lineId: rule.lineId,
    appliedCardId: applied ? rule.cardId : null,
    counterPercent: rule.outcome === "counter" ? rule.counterPercent : null,
    blocked: false,
    numbers,
  };
}

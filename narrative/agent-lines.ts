// Agent lines (G14 Klient A, G16 Doradca banku) and card disabled reasons rendered from the copy deck.
// The engine decides (negotiate → lineId, numbers); this module only turns the result into text.
// Every bound number is read from the engine API: previewCard (deal transaction, overdraft limit),
// getAvailableCards (card cost) and NegotiationResult.counterPercent. ENGINE-DATA-AND-TESTS.md §4.1–§4.2.
import { gameData, getAvailableCards, previewCard } from "../engine";
import type { AgentId, AgentIntent, CardId, DisabledReason, GameState, NegotiationResult } from "../engine";
import { getCopy, getLocale } from "./copy/get-copy";
import { formatDayMonth, formatPercent, formatPln } from "./format";
import type { Locale, NarratorGender, PlayerGender } from "./types";

/** Every line id an agent can answer with (data/agents.json). */
export function agentLineIds(agent: AgentId): string[] {
  return [...new Set(gameData.agents[agent].rules.map((r) => r.lineId))];
}

/** The cached line of the agent's `unknown` rule: shown with the quick replies on any failure or timeout. */
export function fallbackLineId(agent: AgentId): string {
  const rule = gameData.agents[agent].rules.find((r) => r.intent === "unknown" && r.weeks === null);
  if (!rule) throw new Error(`${agent}: no fallback rule in data/agents.json`);
  return rule.lineId;
}

/** Display name of the agent from data/agents.json. */
export function agentName(agent: AgentId): string {
  return gameData.agents[agent].name;
}

/** Maximum messages per agent per week (data/agents.json). */
export function maxMessagesPerWeek(agent: AgentId): number {
  return gameData.agents[agent].maxMessagesPerWeek;
}

/** The card a line talks about: the card of the agents.json rule that answers with this line id. */
export function dealCardFor(agent: AgentId, lineId: string): CardId | null {
  const rule = gameData.agents[agent].rules.find((r) => r.lineId === lineId && r.cardId !== null);
  return rule?.cardId ?? null;
}

/**
 * Bindings of an agent line, all from the engine. `before` is the state the message was sent in
 * (the deal card is still playable there, so previewCard shows its transaction).
 * - `deal.amount`, `deal.date`: the inflow the deal card adds (previewCard comparison);
 * - `deal.cost`: the card cost of getAvailableCards (C4 incl. the interest estimate);
 * - `deal.limit`: the overdraft limit after the card, when the card changes it;
 * - `deal.percent`: the counter percent of the result.
 */
export function agentLineBindings(
  before: GameState,
  result: NegotiationResult,
  locale: Locale = getLocale()
): Record<string, string> {
  const bindings: Record<string, string> = {};
  if (result.counterPercent !== null) bindings["deal.percent"] = formatPercent(result.counterPercent);
  const cardId = dealCardFor(result.agent, result.lineId);
  if (cardId === null) return bindings;

  const view = getAvailableCards(before).find((c) => c.id === cardId);
  if (view) bindings["deal.cost"] = formatPln(view.cost, locale);

  const preview = previewCard(before, cardId);
  if (!preview.playable) return bindings;
  const inflow = preview.comparison.added.find((t) => t.cardId === cardId && t.amount > 0);
  if (inflow) {
    bindings["deal.amount"] = formatPln(inflow.amount, locale);
    bindings["deal.date"] = formatDayMonth(inflow.date, locale);
  }
  if (preview.after.overdraftLimit !== preview.before.overdraftLimit) {
    bindings["deal.limit"] = formatPln(preview.after.overdraftLimit, locale);
  }
  return bindings;
}

/** The cached text of a negotiation result (the line id the engine chose, bound to engine numbers). */
export function agentLineText(
  before: GameState,
  result: NegotiationResult,
  playerGender: PlayerGender = "female",
  narratorGender: NarratorGender = "female",
  locale: Locale = getLocale()
): string {
  return getCopy(result.lineId, before, playerGender, narratorGender, agentLineBindings(before, result, locale), locale);
}

export interface QuickReply {
  id: string;
  intent: AgentIntent;
  /** Copy key of the button label (no number in any label). */
  labelKey: string;
}

/**
 * Deterministic quick replies of an agent: each one sends its intent directly, without a classifier.
 * No percent is sent: Klient A then names her own terms (E-08: the 30 % counter).
 */
export function quickRepliesFor(state: GameState, agent: AgentId): QuickReply[] {
  if (agent === "bank") {
    return [{ id: "ask_overdraft", intent: "ask_overdraft", labelKey: "ui.negotiate.reply.ask_overdraft" }];
  }
  const discount: QuickReply = {
    id: "offer_discount",
    intent: "offer_discount",
    labelKey: "ui.negotiate.reply.offer_discount",
  };
  if (state.core.negotiation.klient_a.counterPending) {
    return [{ id: "accept_counter", intent: "accept_counter", labelKey: "ui.negotiate.accept_counter" }, discount];
  }
  return [{ id: "ask_advance", intent: "ask_advance", labelKey: "ui.negotiate.reply.ask_advance" }, discount];
}

/** Text of a disabled card: the engine text where the specification gives one, else `card.disabled.<code>`. */
export function disabledReasonText(
  reason: DisabledReason,
  playerGender: PlayerGender = "female",
  narratorGender: NarratorGender = "female",
  locale: Locale = getLocale()
): string {
  if (locale === "pl" && reason.text !== null) return reason.text;
  return getCopy(`card.disabled.${reason.code}`, undefined, playerGender, narratorGender, undefined, locale);
}

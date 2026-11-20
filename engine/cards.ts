// Action cards C1–C6 (E-03): windows, eligibility, exclusivity (C2 ↔ C6, U-11), disabled reasons,
// costs and the bookkeeping of a play (relations, competences, invoice state, overdraft limit).
// Money effects are not here: the forecast card overlay (forecast.ts) moves the money of every played card.
import { gameData } from "./data";
import { RuleError } from "./errors";
import { computeForecast, forecastTransactions } from "./forecast";
import { awardCompetence } from "./score";
import type {
  ActionCard,
  CardId,
  CfoOption,
  DisabledReason,
  DisabledReasonCode,
  EngineEvent,
  GameCore,
  GameState,
  InvoiceState,
  Pln,
} from "./types";

const { level1 } = gameData;

export function cardDef(cardId: CardId): ActionCard {
  const card = level1.cards.find((c) => c.id === cardId);
  if (!card) throw new RuleError("unknown_card", `unknown card ${cardId}`);
  return card;
}

const reasonTexts: Partial<Record<DisabledReasonCode, string>> = level1.disabledReasons;

function reason(code: DisabledReasonCode): DisabledReason {
  return { code, text: reasonTexts[code] ?? null };
}

/** U-11: a financed invoice is „już sfinansowana”, a discounted or paid one „już opłacona”. */
function invoiceReason(state: InvoiceState): DisabledReasonCode {
  return state === "factored" ? "invoice_financed" : "invoice_paid";
}

/** A ledger payment is booked once its forecast date (after overlays) lies before the current week. */
function ledgerBooked(core: GameCore, ledgerId: string): boolean {
  const tx = forecastTransactions(core).find((t) => t.id === ledgerId);
  if (!tx) return true;
  return tx.date < level1.weeks[core.week - 1].start;
}

/** Exclusivity and eligibility failures of a card in the current state (window not considered). */
function eligibilityFailure(core: GameCore, card: ActionCard): DisabledReasonCode | null {
  for (const otherId of card.exclusiveWith) {
    if (!core.played.some((p) => p.cardId === otherId)) continue;
    const other = cardDef(otherId);
    return other.effect.type === "factoring" ? "invoice_financed" : "invoice_paid";
  }
  for (const rule of card.eligibility) {
    switch (rule.type) {
      case "negotiation":
        // C1 is reached through Klient A or played directly; the agent rules (E-08) call playCard.
        break;
      case "invoice_state":
        if (core.invoiceState !== rule.state) return invoiceReason(core.invoiceState);
        break;
      case "ledger_not_booked":
        if (ledgerBooked(core, rule.ledgerId)) return "payment_already_booked";
        break;
      case "overdraft_inactive":
        if (core.overdraftLimit > 0) return "overdraft_active";
        break;
    }
  }
  return null;
}

/**
 * Engine-owned disabled reason, or null when the card is playable now.
 * Order: lap over · already played · before the window · after the window (named reason, else the
 * failing eligibility, else outside_window) · exclusivity and eligibility · the week's one action used.
 * An open event never blocks a card (no event consumes the optional card action).
 */
export function disabledReason(core: GameCore, cardId: CardId): DisabledReason | null {
  const card = cardDef(cardId);
  if (core.status !== "playing") return reason("not_playing");
  if (core.played.some((p) => p.cardId === cardId)) return reason("already_played");
  if (core.week < card.window.from) return reason("outside_window");
  const failure = eligibilityFailure(core, card);
  if (core.week > card.window.to) {
    return reason(card.afterWindowReason ?? failure ?? "outside_window");
  }
  if (failure) return reason(failure);
  if (core.weekActionUsed) return reason("week_action_used");
  return null;
}

function clampRelations(value: number): number {
  return Math.max(0, Math.min(level1.rules.relationsMax, value));
}

/**
 * Book a play: the week's action, hand, cost, relations, competence (own or delegated milestone,
 * never lowered, products none), invoice state and overdraft limit. Emits `goodMove` when an own
 * (not delegated) play removes the forecast crash. Throws RuleError("card_unavailable") when disabled.
 */
export function applyCard(state: GameState, cardId: CardId, delegated: boolean): GameState {
  const card = cardDef(cardId);
  const blocked = disabledReason(state.core, cardId);
  if (blocked) throw new RuleError("card_unavailable", `${cardId}: ${blocked.code}`);
  const core = state.core;
  const competences = card.competence
    ? awardCompetence(core.competences, card.competence.id, delegated ? card.competence.delegated : card.competence.own)
    : { ...core.competences };
  const e = card.effect;
  const invoiceState = e.type === "discount" || e.type === "factoring" ? e.invoiceStateAfter : core.invoiceState;
  const next: GameCore = {
    ...core,
    hand: core.hand.filter((id) => id !== cardId),
    played: [...core.played, { cardId, week: core.week, delegated, cost: card.cost.fixed }],
    weekActionUsed: true,
    invoiceState,
    overdraftLimit: e.type === "overdraft" ? e.limit : core.overdraftLimit,
    relations: clampRelations(core.relations + card.relationsDelta),
    costOfMoney: core.costOfMoney + card.cost.fixed,
    competences,
  };
  const played: GameState = { ...state, core: next, emitted: [] };
  const emitted: EngineEvent[] = [];
  if (!delegated && computeForecast(state).crash !== null && computeForecast(played).crash === null) {
    emitted.push({ type: "goodMove", week: core.week, cardId });
  }
  return { ...played, emitted };
}

/**
 * Cost of a card in PLN. Fixed for every card; for C4 the engine adds the overdraft interest
 * estimate (labelled „szacunek”) of the current forecast if active, else of the simulated play.
 */
export function cardCost(state: GameState, cardId: CardId): Pln {
  const card = cardDef(cardId);
  if (!card.cost.overdraftInterest) return card.cost.fixed;
  if (state.core.played.some((p) => p.cardId === cardId)) {
    return card.cost.fixed + computeForecast(state).overdraftInterest;
  }
  if (disabledReason(state.core, cardId) !== null) return card.cost.fixed;
  return card.cost.fixed + computeForecast(applyCard(state, cardId, false)).overdraftInterest;
}

/**
 * Safe cards: playable now and the forecast after the play has no crash. D-17 (hard rule 3, no
 * bank-product bias): a product (C4, C5, C6) is offered only as the last resort, so when any card
 * without a product is safe, only those are returned. Otherwise the safe products, always with their
 * engine cost. Cheapest first (cost incl. the C4 interest estimate), ties by keyboard key.
 */
export function safeCards(state: GameState): CfoOption[] {
  const safe = level1.cards
    .filter((c) => disabledReason(state.core, c.id) === null)
    .filter((c) => computeForecast(applyCard(state, c.id, true)).crash === null);
  const withoutProduct = safe.filter((c) => !c.isProduct);
  return (withoutProduct.length > 0 ? withoutProduct : safe)
    .map((c) => ({ cardId: c.id, cost: cardCost(state, c.id), key: c.key }))
    .sort((a, b) => a.cost - b.cost || a.key - b.key)
    .map(({ cardId, cost }) => ({ cardId, cost }));
}

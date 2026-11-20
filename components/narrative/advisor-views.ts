// View models of G15 (AI-CFO) and G16 (bank advisor and the SMS loan reveal). Every number is read from
// the engine API: getCfoHint (D-17 options and cost), getAvailableCards (cost, playability, reasons),
// previewCard (overdraft limit, loan transactions). Nothing here decides which card is offered.
import { gameData, getAvailableCards, getCfoHint, previewCard } from "../../engine";
import type { CardId, CardView, Crash, DisabledReason, GameState, IsoDate, Pln } from "../../engine";

export interface CfoOptionView {
  cardId: CardId;
  title: string;
  /** Engine cost of the option (getCfoHint). */
  cost: Pln;
  costIsEstimate: boolean;
  isProduct: boolean;
}

export interface CfoView {
  risk: Crash | null;
  /** Exactly getCfoHint(state).options, in the engine order, with the card title. */
  options: CfoOptionView[];
  /** Competence level of a delegated decision (data/agents.json cfo). */
  delegatedCompetenceLevel: number;
}

function cardView(state: GameState, cardId: CardId): CardView {
  const view = getAvailableCards(state).find((c) => c.id === cardId);
  if (!view) throw new Error(`card ${cardId} missing from getAvailableCards`);
  return view;
}

export function cfoView(state: GameState): CfoView {
  const hint = getCfoHint(state);
  return {
    risk: hint.risk,
    options: hint.options.map((option) => {
      const view = cardView(state, option.cardId);
      return {
        cardId: option.cardId,
        title: view.title,
        cost: option.cost,
        costIsEstimate: view.costIsEstimate,
        isProduct: view.isProduct,
      };
    }),
    delegatedCompetenceLevel: gameData.agents.cfo.delegatedCompetenceLevel,
  };
}

export interface OverdraftView {
  cardId: CardId;
  title: string;
  playable: boolean;
  disabledReason: DisabledReason | null;
  /** C4 cost incl. the interest estimate. */
  cost: Pln;
  costIsEstimate: boolean;
  /** Limit the card opens (the preview's overdraft limit); null when the card cannot be previewed. */
  limit: Pln | null;
}

export interface LoanView {
  cardId: CardId;
  title: string;
  playable: boolean;
  disabledReason: DisabledReason | null;
  cost: Pln;
  /** Payout and repayment as the engine books them; null when the card cannot be previewed. */
  payout: { amount: Pln; date: IsoDate } | null;
  repayment: { amount: Pln; date: IsoDate } | null;
}

/** The bank's overdraft card (C4) and the non-bank SMS loan (C5), from the engine. */
export function bankAdvisorView(state: GameState): { overdraft: OverdraftView; loan: LoanView } {
  const c4 = cardView(state, "C4");
  const c5 = cardView(state, "C5");

  const c4Preview = c4.playable ? previewCard(state, "C4") : null;
  const limit = c4Preview && c4Preview.after.overdraftLimit !== c4Preview.before.overdraftLimit ? c4Preview.after.overdraftLimit : null;

  const c5Preview = c5.playable ? previewCard(state, "C5") : null;
  const c5Rows = c5Preview ? c5Preview.comparison.added.filter((t) => t.cardId === "C5") : [];
  const payoutRow = c5Rows.find((t) => t.amount > 0);
  const repaymentRow = c5Rows.find((t) => t.amount < 0);

  return {
    overdraft: {
      cardId: c4.id,
      title: c4.title,
      playable: c4.playable,
      disabledReason: c4.disabledReason,
      cost: c4.cost,
      costIsEstimate: c4.costIsEstimate,
      limit,
    },
    loan: {
      cardId: c5.id,
      title: c5.title,
      playable: c5.playable,
      disabledReason: c5.disabledReason,
      cost: c5.cost,
      payout: payoutRow ? { amount: payoutRow.amount, date: payoutRow.date } : null,
      repayment: repaymentRow ? { amount: Math.abs(repaymentRow.amount), date: repaymentRow.date } : null,
    },
  };
}

// E-09: plan matcher and the synthetic account clock (ENGINE-DATA-AND-TESTS §5, ARCHITECTURE §4).
// The account clock is separate from the game clock: it replays data/future-script.json on the
// synthetic account and checks the saved plans against the replayed transactions. It never changes
// the game week, the stars or the unlock; a met plan only raises its card's competence to 3.
import { isValidIsoDate } from "./calendar";
import { gameData } from "./data";
import { RuleError } from "./errors";
import { coreAfterValidation } from "./score";
import type { EngineEvent, FutureScriptFile, GameState, IsoDate, Plan, PlanStatus, Transaction } from "./types";

const { persona, futureScript } = gameData;

type ReplayEntry = FutureScriptFile["replay"][number];

function directionOk(plan: Plan, tx: Transaction): boolean {
  return plan.direction === "inflow" ? tx.amount > 0 : tx.amount < 0;
}

/** |amount| within plan amount ± tolerancePct %, integer arithmetic (no float rounding). */
function amountOk(plan: Plan, tx: Transaction): boolean {
  return Math.abs(Math.abs(tx.amount) - plan.amount) * 100 <= plan.amount * plan.tolerancePct;
}

/**
 * Status of one plan against the transactions replayed on the account up to `clock` (ARCHITECTURE §4:
 * direction, amount ± tolerance, date ≤ deadline, counterparty; partial → „ask”).
 * - met: a transaction in the right direction, dated ≤ deadline and ≤ clock, from the plan's
 *   counterparty, with the amount inside the tolerance.
 * - open: no full match yet and the deadline is after the account clock (the plan can still be met).
 * - ask: deadline reached, no full match, but an in-time transaction in the right direction matches
 *   either the counterparty or the amount (the player confirms).
 * - missed: deadline reached and nothing in time matches (variant B is offered).
 */
export function matchPlan(plan: Plan, transactions: readonly Transaction[], clock: IsoDate): PlanStatus {
  const inTime = transactions.filter((tx) => tx.date <= plan.deadline && tx.date <= clock && directionOk(plan, tx));
  if (inTime.some((tx) => tx.counterpartyId === plan.counterpartyId && amountOk(plan, tx))) return "met";
  if (clock < plan.deadline) return "open";
  if (inTime.some((tx) => tx.counterpartyId === plan.counterpartyId || amountOk(plan, tx))) return "ask";
  return "missed";
}

function replayTransaction(entry: ReplayEntry): Transaction {
  if (entry.source === "ledger") {
    const ledger = persona.ledger.find((l) => l.id === entry.ledgerId);
    return {
      id: entry.ledgerId ?? "",
      date: entry.date,
      amount: entry.amount,
      counterpartyId: entry.counterpartyId,
      title: entry.title,
      source: ledger?.kind === "recurring" ? "recurring" : "known",
      kind: ledger?.kind ?? null,
      cardId: null,
      eventId: null,
    };
  }
  return {
    id: entry.cardId ?? "",
    date: entry.date,
    amount: entry.amount,
    counterpartyId: entry.counterpartyId,
    title: entry.title,
    source: "card",
    kind: null,
    cardId: entry.cardId,
    eventId: null,
  };
}

/**
 * A card row of the future script happens on the account when the player carries the decision out:
 * the card is played in the current lap or its plan is saved (a saved plan survives a rewind).
 */
function cardCarriedOut(state: GameState, entry: ReplayEntry): boolean {
  if (entry.source !== "card") return true;
  return (
    state.core.played.some((p) => p.cardId === entry.cardId) || state.account.plans.some((p) => p.cardId === entry.cardId)
  );
}

/**
 * Move the account clock to `date` (≥ the current account clock): replay the future-script rows dated
 * after the old clock and up to `date`, update the account balance, re-check every saved plan and
 * validate the ones that became met (competence 3, `planValidated`). The game week, status, stars,
 * unlock and snapshots are never changed.
 */
export function replayAccount(state: GameState, date: IsoDate): GameState {
  if (!isValidIsoDate(date) || date < state.account.clock) throw new RuleError("invalid_date", date);
  const from = state.account.clock;
  const replayed = futureScript.replay
    .filter((e) => e.date > from && e.date <= date && cardCarriedOut(state, e))
    .map(replayTransaction);
  const matchedTx = [...state.account.matchedTx, ...replayed];
  const balance = replayed.reduce((sum, tx) => sum + tx.amount, state.account.balance);

  let core = state.core;
  const emitted: EngineEvent[] = [];
  const plans = state.account.plans.map((plan): Plan => {
    const status = matchPlan(plan, matchedTx, date);
    if (status === "met" && plan.status !== "met") {
      core = coreAfterValidation(core, plan.cardId);
      emitted.push({ type: "planValidated", week: state.core.week, planId: plan.id });
    }
    return status === plan.status ? plan : { ...plan, status };
  });

  return { ...state, core, account: { clock: date, balance, plans, matchedTx }, emitted };
}

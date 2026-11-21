// Bindings of the story lines (event cards, card reveals, narrator confirmations) read from the engine API:
// the event and card definitions of gameData (data/level1.json, data/persona.json through engine/index.ts)
// and the engine card cost of getAvailableCards. Formatting only: no number is typed in here.
import { gameData, getAvailableCards } from "../engine";
import type { CardEffect, CardId, EventCard, EventId, GameState, LedgerId } from "../engine";
import { getLocale } from "./copy/get-copy";
import { formatDayMonth, formatPln } from "./format";
import type { Locale } from "./types";

type Effect = EventCard["choices"][number]["effects"][number];

function eventEffects(eventId: EventId): Effect[] {
  const event = gameData.level1.events.find((e) => e.id === eventId);
  if (!event) throw new Error(`event ${eventId} missing from level1.json`);
  return event.choices.flatMap((c) => c.effects);
}

function cardEffect(cardId: CardId): CardEffect {
  const card = gameData.level1.cards.find((c) => c.id === cardId);
  if (!card) throw new Error(`card ${cardId} missing from level1.json`);
  return card.effect;
}

function ledgerRow(ledgerId: LedgerId) {
  const row = gameData.persona.ledger.find((l) => l.id === ledgerId);
  if (!row) throw new Error(`ledger ${ledgerId} missing from persona.json`);
  return row;
}

/**
 * Every binding the story seed lines use (`event.account`, `advance.confirmed`, `event.order(.body)`,
 * `event.tool(.body)`, `event.late.body`, `loan.*`, `g16.*`, `factoring.*`, `card.overdraft.cost`).
 */
export function storyBindings(state: GameState, locale: Locale = getLocale()): Record<string, string> {
  const pln = (n: number) => formatPln(Math.abs(n), locale);
  const day = (d: string) => formatDayMonth(d, locale);
  const b: Record<string, string> = {};

  // E1: the payment to the changed account is the ledger row the fraud reveal names.
  for (const effect of eventEffects("E1")) {
    if (effect.type === "reveal") b["supplier.amount"] = pln(ledgerRow(effect.ledgerId).amount);
  }
  // E2: the new order's subcontractor outflow and client inflow.
  for (const effect of eventEffects("E2")) {
    if (effect.type !== "transaction") continue;
    if (effect.amount < 0) {
      b["newOrder.supplier"] = pln(effect.amount);
      b["newOrder.supplierDate"] = day(effect.date);
    } else {
      b["newOrder.amount"] = pln(effect.amount);
      b["newOrder.paymentDate"] = day(effect.date);
    }
  }
  // E3: the AI tool's monthly cost.
  for (const effect of eventEffects("E3")) {
    if (effect.type === "transaction") b["aiTool.cost"] = pln(effect.amount);
  }
  // E6: Klient A's invoice moves from its ledger date to the new date.
  for (const effect of eventEffects("E6")) {
    if (effect.type === "move_invoice") {
      b["late.from"] = day(ledgerRow(effect.ledgerId).date);
      b["late.to"] = day(effect.newDate);
    }
  }

  const c1 = cardEffect("C1");
  if (c1.type === "inflow") {
    b["advance.amount"] = pln(c1.amount);
    b["advance.date"] = day(c1.date);
  }
  const c5 = cardEffect("C5");
  if (c5.type === "loan") {
    b["loan.amount"] = pln(c5.amount);
    b["loan.repayment"] = pln(c5.repayment.amount);
    b["loan.dueDate"] = day(c5.repayment.date);
  }
  const c6 = cardEffect("C6");
  if (c6.type === "factoring") {
    b["factoring.fee"] = pln(c6.fee);
    b["factoring.receipt"] = pln(c6.amount);
  }

  const cards = getAvailableCards(state);
  const cost = (id: CardId) => cards.find((c) => c.id === id)?.cost;
  const c4Cost = cost("C4");
  if (c4Cost !== undefined) b["overdraft.costEstimate"] = pln(c4Cost);
  const c5Cost = cost("C5");
  if (c5Cost !== undefined) b["loan.cost"] = pln(c5Cost);
  return b;
}

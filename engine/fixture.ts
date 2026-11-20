// Initial state builders and fixture helpers of the E-01 API surface (E-02 moved the forecast to forecast.ts).
// Built only from data/*.json; no number here is invented.
import { gameData } from "./data";
import type { AccountState, CompetenceId, CompetenceLevel, GameCore, GameState, WeekNumber } from "./types";

const { persona, level1, futureScript } = gameData;

export function initialCore(seed: string): GameCore {
  const competences = Object.fromEntries(level1.competences.map((c) => [c.id, 0])) as Record<
    CompetenceId,
    CompetenceLevel
  >;
  return {
    level: 1,
    seed,
    week: 1,
    status: "playing",
    hand: level1.cards.map((c) => c.id),
    played: [],
    weekActionUsed: false,
    eventsResolved: [],
    weeksResolved: [],
    invoiceState: persona.invoices[0].state,
    overdraftLimit: 0,
    balance: persona.account.openingBalance,
    relations: level1.rules.relationsStart,
    costOfMoney: 0,
    competences,
    stars: { przetrwanie: "open", tanio: "open", pilot: "open" },
    crash: null,
    lowestBalance: null,
    avoidedCost: null,
    level2Unlocked: false,
    loanTermsShown: false,
    negotiation: {
      klient_a: { messagesThisWeek: 0, counterPending: false },
      bank: { messagesThisWeek: 0, counterPending: false },
    },
  };
}

export function initialAccount(): AccountState {
  return {
    clock: futureScript.accountClock.start,
    balance: persona.account.openingBalance,
    plans: [],
    matchedTx: [],
  };
}

export function initialState(seed: string): GameState {
  const core = initialCore(seed);
  return {
    schemaVersion: 1,
    core,
    snapshots: { 1: core },
    account: initialAccount(),
    emitted: [{ type: "lapStart", week: 1 }],
  };
}

export function weekDates(week: WeekNumber): { start: string; end: string } {
  const w = level1.weeks[week - 1];
  return { start: w.start, end: w.end };
}

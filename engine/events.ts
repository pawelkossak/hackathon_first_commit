// Event deck rules (E-04, GAME-DESIGN §6.2, ENGINE-DATA-AND-TESTS §3.3).
// The seed deals one event card per week (seed.ts). A dealt card is shown when its condition holds
// and it is not yet resolved. Resolving records the choice; the money effects live in the forecast
// event overlay (forecast.ts). No event consumes the week's optional card action.
//
// Narration (§6): the engine event of a card is emitted by the transition that makes the card
// current (createGame, resolveWeek into the next week, rewind), not by resolving it:
// E2 → bigProject, E5 → loanOffered (via E5), E6 → lateClient.
import { gameData } from "./data";
import { RuleError } from "./errors";
import { computeForecast } from "./forecast";
import { dealtEvent } from "./seed";
import type { CurrentEvent, EngineEvent, EventCard, EventChoiceId, GameCore, GameState } from "./types";

const { level1 } = gameData;

/**
 * E5 `gap_open`: the known-ledger forecast of the current state still crashes
 * (contract: the E5 condition checks the known ledger, so the scripted E6 is not counted).
 */
function conditionHolds(state: GameState, ev: EventCard): boolean {
  switch (ev.condition) {
    case "always":
    case "forced":
      return true;
    case "gap_open":
      return computeForecast(state, { includeFutureEvents: false }).crash !== null;
  }
}

function isResolved(core: GameCore, ev: EventCard): boolean {
  return core.eventsResolved.some((r) => r.eventId === ev.id);
}

/** The event card shown this week: dealt by the seed, condition holds, not resolved; else null. */
export function shownEvent(state: GameState): EventCard | null {
  const core = state.core;
  if (core.status !== "playing") return null;
  const ev = dealtEvent(core.seed, core.week);
  if (!ev || isResolved(core, ev) || !conditionHolds(state, ev)) return null;
  return ev;
}

export function currentEventView(state: GameState): CurrentEvent | null {
  const ev = shownEvent(state);
  if (!ev) return null;
  return {
    id: ev.id,
    week: ev.week,
    title: ev.title,
    choices: ev.choices.map((c) => ({ id: c.id, label: c.label })),
  };
}

/** Engine events of the card that is current in `state` (emitted once, by the transition that shows it). */
export function shownEventSignals(state: GameState): EngineEvent[] {
  const ev = shownEvent(state);
  if (!ev) return [];
  const week = state.core.week;
  switch (ev.id) {
    case "E2":
      return [{ type: "bigProject", week, eventId: "E2" }];
    case "E5":
      return [{ type: "loanOffered", week, via: "E5" }];
    case "E6": {
      const move = ev.choices.flatMap((c) => c.effects).find((e) => e.type === "move_invoice");
      const moves = move !== undefined && move.type === "move_invoice" && state.core.invoiceState === move.requiresInvoiceState;
      return [{ type: "lateClient", week, eventId: "E6", newDate: moves ? move.newDate : null }];
    }
    case "E1":
    case "E3":
      return [];
  }
}

/**
 * Record the choice of the shown event. Own choice: the `own` competence milestone, delegated:
 * the `delegated` one; milestones are never lowered and never above 3. E5 `show_cost` reveals the
 * C5 terms (the non-bank SMS loan); it never plays C5.
 */
export function applyEventChoice(state: GameState, choiceId: EventChoiceId, delegated: boolean): GameState {
  const core = state.core;
  if (core.status !== "playing") throw new RuleError("not_playing");
  const ev = shownEvent(state);
  if (!ev) throw new RuleError("no_event");
  const choice = ev.choices.find((c) => c.id === choiceId);
  if (!choice) throw new RuleError("invalid_choice", `${ev.id}: ${choiceId}`);
  const competences = { ...core.competences };
  if (choice.competence) {
    const { id, own, delegated: viaDelegate } = choice.competence;
    const level = Math.min(level1.rules.competenceMax, Math.max(competences[id], delegated ? viaDelegate : own));
    competences[id] = level as (typeof competences)[typeof id];
  }
  const revealsLoan = choice.effects.some((e) => e.type === "reveal_card" && e.cardId === "C5");
  return {
    ...state,
    core: {
      ...core,
      eventsResolved: [...core.eventsResolved, { eventId: ev.id, week: core.week, choiceId, delegated }],
      competences,
      loanTermsShown: core.loanTermsShown || revealsLoan,
    },
    emitted: [],
  };
}

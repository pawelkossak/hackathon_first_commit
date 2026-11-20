// Seeded event deck (E-04). A seed names a fixed deck in level1.json `seeds`: which event card
// comes in which week. Level 1 defines only the demo seed (ENGINE-DATA-AND-TESTS §1); a random
// seed is a COULD item (GM-14), so an unknown seed is a rule error, never a silent fallback.
import { gameData } from "./data";
import { RuleError } from "./errors";
import type { EventCard, EventId, WeekNumber } from "./types";

const { level1 } = gameData;

export interface DeckSlot {
  week: WeekNumber;
  eventId: EventId;
}

/** Seeds defined in data (level 1: `demo`). */
export function knownSeeds(): string[] {
  return Object.keys(level1.seeds);
}

/** Throws RuleError("unknown_seed") unless the seed has a deck in level1.json. */
export function assertSeed(seed: string): void {
  if (!Object.prototype.hasOwnProperty.call(level1.seeds, seed)) {
    throw new RuleError("unknown_seed", `unknown seed "${seed}"; known: ${knownSeeds().join(", ")}`);
  }
}

/** The deck of a seed, in week order. Throws RuleError("unknown_seed") for a seed without a deck. */
export function deckFor(seed: string): DeckSlot[] {
  assertSeed(seed);
  return [...level1.seeds[seed]].sort((a, b) => a.week - b.week);
}

export function eventCard(id: EventId): EventCard {
  const ev = level1.events.find((e) => e.id === id);
  if (!ev) throw new RuleError("no_event", id);
  return ev;
}

/** The event card the seed deals in `week`, before its condition is checked; null when none. */
export function dealtEvent(seed: string, week: WeekNumber): EventCard | null {
  const slot = deckFor(seed).find((s) => s.week === week);
  return slot ? eventCard(slot.eventId) : null;
}

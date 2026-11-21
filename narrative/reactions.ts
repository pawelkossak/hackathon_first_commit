// Narrator reactions based on engine events (ENGINE-DATA-AND-TESTS.md §6, GAME-EXPERIENCE-AND-NARRATION.md §5).
// Hard rule: Emotion is driven by an engine event, not an LLM. Reactions are rate-limited to at most one per week.
import type { EngineEvent, GameState, WeekNumber } from "../engine";
import { getCopy, getLocale } from "./copy/get-copy";
import { formatDayMonth, formatPln } from "./format";
import type { Emotion, NarratorGender, PlayerGender } from "./types";

export interface ReactionStep {
  emotion: Emotion;
  lineId: string;
  text: string;
}

export interface NarratorReaction {
  eventType: EngineEvent["type"];
  week: WeekNumber;
  emotion: Emotion;
  lineId: string;
  text: string;
  steps: ReactionStep[];
}

/**
 * Priority of engine events when multiple events occur in the same turn/week.
 * RUNTIME-ENGINE-CONTRACT.md: chooseReaction prioritises crash and success.
 * `satisfies Record<EngineEvent["type"], number>`: a new engine event fails `pnpm typecheck` until it is ranked here.
 */
const EVENT_PRIORITY = {
  crash: 100,
  lapWon: 90,
  planValidated: 85,
  fraudRevealed: 80,
  goodMove: 70,
  bigProject: 60,
  lateClient: 50,
  loanOffered: 40,
  negotiationOpen: 35,
  quietWeek: 20,
  lapStart: 10,
  playerReturns: 10,
} as const satisfies Record<EngineEvent["type"], number>;

export interface EventReactionConfig {
  readonly steps: ReadonlyArray<{
    readonly emotion: Emotion;
    readonly lineId: string;
  }>;
}

/**
 * Mapping table from engine event to emotion and lineId prefix per ENGINE-DATA-AND-TESTS.md §6.
 * `satisfies Record<EngineEvent["type"], …>` makes a new engine event fail `pnpm typecheck` until it is
 * mapped here; reactions.test.ts checks this table against data/reactions.json (`gameData.reactions`).
 */
export const REACTION_CONFIG = {
  lapStart: {
    steps: [{ emotion: "welcoming", lineId: "rx.welcome" }],
  },
  playerReturns: {
    steps: [{ emotion: "welcoming", lineId: "rx.welcome" }],
  },
  bigProject: {
    steps: [{ emotion: "excited", lineId: "rx.project" }],
  },
  negotiationOpen: {
    steps: [{ emotion: "confident", lineId: "rx.negotiate" }],
  },
  lateClient: {
    steps: [{ emotion: "suspicious", lineId: "rx.late" }],
  },
  loanOffered: {
    steps: [{ emotion: "suspicious", lineId: "rx.loan" }],
  },
  fraudRevealed: {
    steps: [{ emotion: "exasperated", lineId: "rx.fraud" }],
  },
  goodMove: {
    steps: [{ emotion: "proud", lineId: "rx.goodmove" }],
  },
  crash: {
    steps: [
      { emotion: "exasperated", lineId: "rx.crash" },
      { emotion: "supportive", lineId: "rx.rewind" },
    ],
  },
  quietWeek: {
    steps: [{ emotion: "relaxed", lineId: "rx.quiet" }],
  },
  lapWon: {
    steps: [{ emotion: "delighted", lineId: "rx.win" }],
  },
  planValidated: {
    steps: [{ emotion: "delighted", lineId: "rx.validated" }],
  },
} as const satisfies Record<EngineEvent["type"], EventReactionConfig>;

/**
 * Copy bindings taken from the event payload (D-18: the fraud line names the payload amount and date).
 * Events without numbers bind nothing.
 */
export function eventBindings(event: EngineEvent): Record<string, string> {
  const locale = getLocale();
  switch (event.type) {
    case "fraudRevealed":
      return {
        "fraud.amount": formatPln(Math.abs(event.amount), locale),
        "fraud.date": formatDayMonth(event.date, locale),
      };
    default:
      return {};
  }
}

/**
 * Build a NarratorReaction for a given engine event.
 */
export function reactionFor(
  event: EngineEvent,
  state?: GameState,
  playerGender: PlayerGender = "female",
  narratorGender: NarratorGender = "female"
): NarratorReaction {
  const config: EventReactionConfig = REACTION_CONFIG[event.type];
  const bindings = eventBindings(event);

  const steps: ReactionStep[] = config.steps.map((s) => ({
    emotion: s.emotion,
    lineId: s.lineId,
    text: getCopy(s.lineId, state, playerGender, narratorGender, bindings),
  }));

  const primary = steps[0];

  return {
    eventType: event.type,
    week: event.week,
    emotion: primary.emotion,
    lineId: primary.lineId,
    text: primary.text,
    steps,
  };
}

/**
 * Reaction state tracker with weekly cooldown and scene cancellation.
 */
export class ReactionTracker {
  private lastReactionWeek: number | null = null;
  private activeReaction: NarratorReaction | null = null;

  /**
   * Whether a reaction is allowed for the given week resolution (cooldown: at most 1 per week).
   */
  canReact(week: number): boolean {
    return this.lastReactionWeek !== week;
  }

  /**
   * Cancel currently active reaction when scene changes.
   */
  onSceneChange(): void {
    this.activeReaction = null;
  }

  /**
   * Get active reaction, if any.
   */
  getActiveReaction(): NarratorReaction | null {
    return this.activeReaction;
  }

  /**
   * Reset cooldown tracker (e.g. on new game or rewind).
   */
  reset(lastWeek: number | null = null): void {
    this.lastReactionWeek = lastWeek;
    this.activeReaction = null;
  }

  /**
   * Given a list of engine events, select the highest priority reaction respecting the 1-per-week cooldown.
   */
  chooseReaction(
    events: readonly EngineEvent[],
    state?: GameState,
    playerGender: PlayerGender = "female",
    narratorGender: NarratorGender = "female"
  ): NarratorReaction | undefined {
    if (events.length === 0) return undefined;

    // All events in a resolution belong to the same week
    const targetWeek = events[0].week;
    if (!this.canReact(targetWeek)) {
      return undefined;
    }

    // Sort events by priority descending (stable: equal priority keeps the engine order)
    const sorted = [...events].sort((a, b) => EVENT_PRIORITY[b.type] - EVENT_PRIORITY[a.type]);

    const chosenEvent = sorted[0];
    const reaction = reactionFor(chosenEvent, state, playerGender, narratorGender);

    this.lastReactionWeek = targetWeek;
    this.activeReaction = reaction;

    return reaction;
  }
}

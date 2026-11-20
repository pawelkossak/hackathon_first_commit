// Narrator reactions based on engine events (ENGINE-DATA-AND-TESTS.md §6, GAME-EXPERIENCE-AND-NARRATION.md §5).
// Hard rule: Emotion is driven by an engine event, not an LLM. Reactions are rate-limited to at most one per week.
import type { EngineEvent, GameState, WeekNumber } from "../engine";
import { getCopy } from "./copy/get-copy";
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
 */
const EVENT_PRIORITY: Record<EngineEvent["type"], number> = {
  crash: 100,
  lapWon: 90,
  planValidated: 85,
  goodMove: 70,
  bigProject: 60,
  lateClient: 50,
  loanOffered: 40,
  negotiationOpen: 35,
  quietWeek: 20,
  lapStart: 10,
  playerReturns: 10,
};

/**
 * Mapping table from engine event to emotion and lineId prefix per ENGINE-DATA-AND-TESTS.md §6.
 */
interface EventReactionConfig {
  steps: Array<{
    emotion: Emotion;
    lineId: string;
  }>;
}

const REACTION_CONFIG: Record<EngineEvent["type"], EventReactionConfig> = {
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
};

/**
 * Build a NarratorReaction for a given engine event.
 */
export function reactionFor(
  event: EngineEvent,
  state?: GameState,
  playerGender: PlayerGender = "female",
  narratorGender: NarratorGender = "female"
): NarratorReaction {
  const config = REACTION_CONFIG[event.type];
  if (!config) {
    throw new Error(`No reaction mapping for engine event type: "${event.type}"`);
  }

  const steps: ReactionStep[] = config.steps.map((s) => ({
    emotion: s.emotion,
    lineId: s.lineId,
    text: getCopy(s.lineId, state, playerGender, narratorGender),
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

    // Filter events for which we can react
    // All events in a resolution belong to the same week
    const targetWeek = events[0].week;
    if (!this.canReact(targetWeek)) {
      return undefined;
    }

    // Sort events by priority descending
    const sorted = [...events].sort(
      (a, b) => (EVENT_PRIORITY[b.type] ?? 0) - (EVENT_PRIORITY[a.type] ?? 0)
    );

    const chosenEvent = sorted[0];
    const reaction = reactionFor(chosenEvent, state, playerGender, narratorGender);

    this.lastReactionWeek = targetWeek;
    this.activeReaction = reaction;

    return reaction;
  }
}

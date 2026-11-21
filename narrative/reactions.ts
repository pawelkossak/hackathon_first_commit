// Narrator reactions based on engine events (ENGINE-DATA-AND-TESTS.md §6, GAME-EXPERIENCE-AND-NARRATION.md §5).
// Hard rule: Emotion is driven by an engine event, not an LLM. Reactions are rate-limited to at most one per week resolution;
// in-week signals (negotiation, good move, loan preview) never use that slot.
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
 * When a signal is narrated (ENGINE-DATA-AND-TESTS.md §6 cooldown: „at most one reaction per week resolution;
 * a new scene cancels the previous line”):
 * - `resolution`: emitted by a week resolution, a rewind or a new lap. It uses the week's one resolution slot.
 * - `inWeek`: an action inside the week (negotiation opened, a good move, the C5 loan preview). It never uses
 *   the slot; it replaces the line on screen when it outranks the week's last line (a new scene cancels the
 *   previous line), and each signal type speaks at most once per week.
 * - `scene`: the plan scene after the lap (account clock). It does not compete with the week's lines.
 */
export type SignalKind = "resolution" | "inWeek" | "scene";

export function signalKind(event: EngineEvent): SignalKind {
  switch (event.type) {
    case "negotiationOpen":
    case "goodMove":
      return "inWeek";
    case "loanOffered":
      return event.via === "C5_preview" ? "inWeek" : "resolution";
    case "planValidated":
      return "scene";
    default:
      return "resolution";
  }
}

function byPriority(events: readonly EngineEvent[]): EngineEvent[] {
  // Stable sort: equal priority keeps the engine order.
  return [...events].sort((a, b) => EVENT_PRIORITY[b.type] - EVENT_PRIORITY[a.type]);
}

/**
 * Reaction state tracker with the week-resolution cooldown and scene cancellation.
 */
export class ReactionTracker {
  private lastReactionWeek: number | null = null;
  private activeReaction: NarratorReaction | null = null;
  /** Week and priority of the last line shown, so an in-week signal only replaces a weaker line. */
  private weekLine: { week: number; priority: number } | null = null;
  /** In-week and scene signal types already narrated, per week. */
  private spoken = new Set<string>();

  /**
   * Whether the week resolution of the given week may still react (cooldown: at most 1 per week resolution).
   * In-week signals never use this slot.
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
    this.weekLine = null;
    this.spoken.clear();
  }

  /**
   * Given the events of one engine transition, select the reaction to show:
   * a transition with a resolution signal uses the week's resolution slot (highest priority of all its events);
   * otherwise the highest-priority in-week or scene signal not yet narrated this week, if it outranks the line
   * already shown this week (scene signals always may speak once).
   */
  chooseReaction(
    events: readonly EngineEvent[],
    state?: GameState,
    playerGender: PlayerGender = "female",
    narratorGender: NarratorGender = "female"
  ): NarratorReaction | undefined {
    if (events.length === 0) return undefined;

    // All events of one transition belong to the same week
    const targetWeek = events[0].week;
    const isResolution = events.some((e) => signalKind(e) === "resolution");

    let chosen: EngineEvent | undefined;
    if (isResolution) {
      if (!this.canReact(targetWeek)) return undefined;
      chosen = byPriority(events)[0];
      this.lastReactionWeek = targetWeek;
    } else {
      const fresh = byPriority(events).filter((e) => !this.spoken.has(`${e.week}:${e.type}`));
      const candidate = fresh[0];
      if (!candidate) return undefined;
      const current = this.weekLine && this.weekLine.week === targetWeek ? this.weekLine.priority : null;
      const outranks = current === null || EVENT_PRIORITY[candidate.type] > current;
      if (signalKind(candidate) === "inWeek" && !outranks) return undefined;
      chosen = candidate;
      this.spoken.add(`${chosen.week}:${chosen.type}`);
    }

    const reaction = reactionFor(chosen, state, playerGender, narratorGender);
    this.weekLine = { week: targetWeek, priority: EVENT_PRIORITY[chosen.type] };
    this.activeReaction = reaction;
    return reaction;
  }
}

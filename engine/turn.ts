// Turn state machine (E-05, ARCHITECTURE §5 "Turn", RUNTIME-ENGINE-CONTRACT).
//
// One week of the lap:
//   start of week w (snapshot w) → event shown? → resolveEvent → optional card (playCard)
//   → resolveWeek: settle the week's transactions, crash check (balance + available overdraft)
//     ├─ crash         → status "crashed", every star missed, lap stops (rewind is the way back)
//     ├─ week 7        → status "completed", lap score; Pilot "pending" (or "missed")
//     └─ otherwise     → week w+1, snapshot w+1, the shown event of w+1 emits its signal
// After the lap: savePlan finalises a "pending" Pilot. rewind(w) restores snapshot w from any status.
//
// Pilot (QA P2 from E-01): Pilot lives in core.stars and is only finalised by savePlan while it is
// "pending". It becomes "pending" only at lap end (week 7, own balance ≥ 0). A plan saved during the
// lap leaves Pilot "open"; lap end then sets it to "pending" regardless of that plan, so the player
// saves the winning decision after the lap (G18 → G22). Rewind restores the snapshot's core, which
// drops Pilot, while the saved plans in the account survive (they belong to the account clock).
import { gameData } from "./data";
import { RuleError } from "./errors";
import { computeForecast, weekOf } from "./forecast";
import { shownEvent, shownEventSignals } from "./events";
import { lapScore } from "./score";
import type {
  BalanceAt,
  EngineEvent,
  Forecast,
  GameCore,
  GameState,
  StarId,
  StarStatus,
  WeekNumber,
  WeekResolution,
} from "./types";

const { level1 } = gameData;

const WEEKS: readonly WeekNumber[] = [1, 2, 3, 4, 5, 6, 7];

function isWeekNumber(week: number): week is WeekNumber {
  return (WEEKS as readonly number[]).includes(week);
}

/** Lowest own end-of-day balance of the lap from its start through `until` (inclusive). */
function lowestThrough(f: Forecast, until: string): BalanceAt | null {
  let low: BalanceAt | null = null;
  for (const p of f.points) {
    if (p.date < level1.lap.start || p.date > until || p.counterfactual) continue;
    if (low === null || p.balance < low.balance) low = { date: p.date, balance: p.balance };
  }
  return low;
}

function earnedStars(stars: Record<StarId, StarStatus>): StarId[] {
  return level1.stars.map((s) => s.id).filter((id) => stars[id] === "earned");
}

/** Settle the current week exactly once. Throws RuleError("event_unresolved") while the event is open. */
export function settleWeek(state: GameState): WeekResolution {
  const core = state.core;
  if (core.status !== "playing") throw new RuleError("not_playing");
  if (core.weeksResolved.includes(core.week)) throw new RuleError("invalid_week", `week ${core.week} already settled`);
  if (shownEvent(state) !== null) throw new RuleError("event_unresolved");

  const f = computeForecast(state);
  const week = core.week;
  const { start, end } = level1.weeks[week - 1];
  const transactions = f.points.filter((p) => p.date >= start && p.date <= end).flatMap((p) => p.transactions);
  const crash = f.crash && weekOf(f.crash.date) === week ? f.crash : null;
  const endPoint = f.points.find((p) => p.date === end);
  const endBalance = crash || !endPoint ? null : endPoint.balance;
  const events: EngineEvent[] = [];
  let next: GameCore = { ...core, weeksResolved: [...core.weeksResolved, week] };

  if (crash) {
    const score = lapScore(next, f, false);
    next = { ...next, status: "crashed", crash, stars: score.stars, level2Unlocked: false };
    events.push({ type: "crash", week, crash });
  } else {
    const balance = endBalance ?? core.balance;
    const lowestBalance = lowestThrough(f, end) ?? core.lowestBalance;
    if (week === 7) {
      // Pilot is never earned here: a plan saved during the lap does not count (see the header).
      const score = lapScore(next, f, false);
      next = {
        ...next,
        status: "completed",
        balance,
        stars: score.stars,
        costOfMoney: score.costOfMoney,
        avoidedCost: score.avoidedCost,
        lowestBalance,
        level2Unlocked: score.level2Unlocked,
      };
      events.push({ type: "lapWon", week, stars: earnedStars(score.stars) });
    } else {
      next = {
        ...next,
        week: (week + 1) as WeekNumber,
        balance,
        lowestBalance,
        weekActionUsed: false,
        negotiation: {
          klient_a: { ...next.negotiation.klient_a, messagesThisWeek: 0 },
          bank: { ...next.negotiation.bank, messagesThisWeek: 0 },
        },
      };
      if (transactions.length === 0 && !core.eventsResolved.some((r) => r.week === week)) {
        events.push({ type: "quietWeek", week });
      }
    }
  }

  // Snapshot of the new week's start (GameCore only, no nested snapshots).
  const snapshots = next.status === "playing" ? { ...state.snapshots, [next.week]: next } : state.snapshots;
  const settled: GameState = { ...state, core: next, snapshots, emitted: [] };
  events.push(...shownEventSignals(settled));
  return { state: { ...settled, emitted: events }, week, transactions, endBalance, crash, events };
}

/**
 * Restore the start of `week` from its snapshot, from any status (playing, crashed, completed).
 * Restores hand, seed, costs, choices, stars and competences; keeps the account clock and saved
 * plans; drops the snapshots of later weeks. The restored week's event is current again, so its
 * narration signal is emitted again (E2 bigProject, E5 loanOffered, E6 lateClient).
 */
export function rewindTo(state: GameState, week: WeekNumber): GameState {
  if (!isWeekNumber(week)) throw new RuleError("invalid_week", `week ${String(week)}`);
  const snap = state.snapshots[week];
  if (!snap || snap.week !== week) throw new RuleError("no_snapshot", `no snapshot for week ${week}`);
  const snapshots: GameState["snapshots"] = {};
  for (const w of WEEKS) {
    const s = state.snapshots[w];
    if (s && w <= week) snapshots[w] = s;
  }
  const restored: GameState = { ...state, core: snap, snapshots, emitted: [] };
  return { ...restored, emitted: shownEventSignals(restored) };
}

/**
 * Pilot after a plan save: earned only when the lap is completed and Pilot is "pending";
 * otherwise unchanged ("open" during the lap, "missed" after a low below 0 or a crash).
 * Level 2 unlock follows the star count (≥ 1 star).
 */
export function coreAfterPlanSave(core: GameCore): GameCore {
  if (core.status !== "completed" || core.stars.pilot !== "pending") return core;
  const stars: Record<StarId, StarStatus> = { ...core.stars, pilot: "earned" };
  return {
    ...core,
    stars,
    level2Unlocked: core.level2Unlocked || earnedStars(stars).length >= level1.unlock.minStars,
  };
}

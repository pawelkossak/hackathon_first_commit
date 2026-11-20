// E-05 turn state machine, rewind and card combination cases. Expected values are copied from
// ENGINE-DATA-AND-TESTS.md §7.4 and §7.7 (and GAME-DESIGN.md §6.3, §6.5), never computed by the
// engine and pasted back.
import { describe, expect, it } from "vitest";
import type { CardId, EventChoiceId, EventId, GameState, StarStatus, WeekNumber } from "./index";
import {
  RuleError,
  advanceAccountClock,
  createGame,
  createPlan,
  delegateBestCard,
  forecast,
  getAvailableCards,
  getCfoHint,
  getCurrentEvent,
  negotiate,
  playCard,
  previewCard,
  resetGame,
  resolveEvent,
  resolveWeek,
  rewind,
  savePlan,
} from "./index";

/** Safe event choices of §7 (E1 check, E2 decline, E3 january); E5 ignore, E6 acknowledge. */
const safe: Record<EventId, EventChoiceId> = {
  E1: "check",
  E2: "decline",
  E3: "january",
  E5: "ignore",
  E6: "acknowledge",
};

type Choices = Partial<Record<EventId, EventChoiceId>>;
type Plays = Partial<Record<number, CardId>>;

interface Lap {
  state: GameState;
  weekEnds: (number | null)[];
  /** Ids of the events shown, in order. */
  shown: EventId[];
  /** The state at the start of each week reached (after resolveWeek into it). */
  starts: Partial<Record<WeekNumber, GameState>>;
}

function errorCode(fn: () => unknown): string | null {
  try {
    fn();
  } catch (e) {
    return e instanceof RuleError ? e.code : "not a RuleError";
  }
  return null;
}

/** Play from `from` (default a new demo lap) until the lap completes or crashes. */
function playLap(plays: Plays = {}, choices: Choices = {}, from: GameState = createGame("demo")): Lap {
  let s = from;
  const weekEnds: (number | null)[] = [];
  const shown: EventId[] = [];
  const starts: Partial<Record<WeekNumber, GameState>> = { [s.core.week]: s };
  while (s.core.status === "playing") {
    const ev = getCurrentEvent(s);
    if (ev) {
      shown.push(ev.id);
      s = resolveEvent(s, choices[ev.id] ?? safe[ev.id]);
    }
    const card = plays[s.core.week];
    if (card) s = playCard(s, card);
    const r = resolveWeek(s);
    weekEnds.push(r.endBalance);
    s = r.state;
    if (s.core.status === "playing") starts[s.core.week] = s;
  }
  return { state: s, weekEnds, shown, starts };
}

function stars(p: StarStatus, t: StarStatus, pi: StarStatus) {
  return { przetrwanie: p, tanio: t, pilot: pi };
}

/** Recursively freeze a value, so any mutation of an engine input throws in strict mode. */
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value)) deepFreeze(v);
  }
  return value;
}

const lapEnd = (lap: Lap) => forecast(lap.state);

describe("card combinations U-2 (E-05)", () => {
  it("ET-X01 C1 + C2 (T4): 33 700 · 56 080 · 40 380 · 66 594 · 26 794 · 29 874 · 29 874, low +22 494, cost 406, ★★★", () => {
    const lap = playLap({ 1: "C1", 4: "C2" });
    expect(lap.weekEnds).toEqual([33700, 56080, 40380, 66594, 26794, 29874, 29874]);
    expect(lapEnd(lap).low?.balance).toBe(22494);
    expect(lap.state.core.costOfMoney).toBe(406);
    expect(savePlan(lap.state, "C1").core.stars).toEqual(stars("earned", "earned", "earned"));
  });

  it("ET-X02 C1 + C6 (T4): 33 700 · 56 080 · 40 380 · 66 696 · 26 896 · 29 976 · 29 976, low +22 596, cost 304, ★★★", () => {
    const lap = playLap({ 1: "C1", 4: "C6" });
    expect(lap.weekEnds).toEqual([33700, 56080, 40380, 66696, 26896, 29976, 29976]);
    expect(lapEnd(lap).low?.balance).toBe(22596);
    expect(lap.state.core.costOfMoney).toBe(304);
    expect(savePlan(lap.state, "C1").core.stars).toEqual(stars("earned", "earned", "earned"));
  });

  it("ET-X03 C1 + E2 accept + C2 (T4): … 63 594 · 23 794 · 26 874 · 26 874, low +19 494, cost 406, ★★★", () => {
    const lap = playLap({ 1: "C1", 4: "C2" }, { E2: "accept" });
    expect(lap.weekEnds.slice(3)).toEqual([63594, 23794, 26874, 26874]);
    expect(lapEnd(lap).low?.balance).toBe(19494);
    expect(lap.state.core.costOfMoney).toBe(406);
    expect(savePlan(lap.state, "C2").core.stars).toEqual(stars("earned", "earned", "earned"));
  });

  it("ET-X04 C1 + E2 accept + C6 (T4): … 63 696 · 23 896 · 26 976 · 26 976, low +19 596, cost 304, ★★★", () => {
    const lap = playLap({ 1: "C1", 4: "C6" }, { E2: "accept" });
    expect(lap.weekEnds.slice(3)).toEqual([63696, 23896, 26976, 26976]);
    expect(lapEnd(lap).low?.balance).toBe(19596);
    expect(lap.state.core.costOfMoney).toBe(304);
    expect(savePlan(lap.state, "C6").core.stars).toEqual(stars("earned", "earned", "earned"));
  });

  it("ET-X05 C1 + E2 accept + C4: … 43 705 · 3 905 · 6 985 · 6 985, low −395 inside the limit, cost 150, ★★ (Przetrwanie, Tanio)", () => {
    const lap = playLap({ 1: "C1", 2: "C4" }, { E2: "accept" });
    expect(lap.weekEnds.slice(3)).toEqual([43705, 3905, 6985, 6985]);
    expect(lapEnd(lap).low?.balance).toBe(-395);
    expect(lap.state.core.crash).toBeNull();
    expect(lap.state.core.costOfMoney).toBe(150);
    expect(savePlan(lap.state, "C1").core.stars).toEqual(stars("earned", "earned", "missed"));
  });

  it("ET-X06 C1 + C3 (T3): … 46 705 · 42 605 · 45 685 · 9 985, low +9 985 (8 I), cost 0, Relacje 3, ★★ (Przetrwanie, Pilot)", () => {
    const lap = playLap({ 1: "C1", 3: "C3" });
    expect(lap.weekEnds.slice(3)).toEqual([46705, 42605, 45685, 9985]);
    expect(lapEnd(lap).low).toEqual({ date: "2027-01-08", balance: 9985 });
    expect(lap.state.core.costOfMoney).toBe(0);
    expect(lap.state.core.relations).toBe(3);
    expect(savePlan(lap.state, "C1").core.stars).toEqual(stars("earned", "missed", "earned"));
  });

  it("ET-X07 C1 + C5 (T5): … 46 705 · 21 905 · 24 985 · 24 985, low +17 605, cost 2 400, ★★ (Przetrwanie, Pilot)", () => {
    const lap = playLap({ 1: "C1", 5: "C5" });
    expect(lap.weekEnds.slice(3)).toEqual([46705, 21905, 24985, 24985]);
    expect(lapEnd(lap).low?.balance).toBe(17605);
    expect(lap.state.core.costOfMoney).toBe(2400);
    expect(savePlan(lap.state, "C5").core.stars).toEqual(stars("earned", "missed", "earned"));
  });
});

/** Paths that end in every status: completed, crashed in T5, T6 and T7, with and without a saved plan. */
function finishedPaths(): GameState[] {
  const c1 = playLap({ 1: "C1" }).state;
  return [
    playLap().state, // no action: crash 22 XII
    c1,
    savePlan(c1, "C1"),
    advanceAccountClock(savePlan(c1, "C1")),
    playLap({ 1: "C3" }).state, // crash 8 I
    playLap({ 1: "C1" }, { E2: "accept" }).state, // crash 28 XII
    playLap({ 1: "C1" }, { E1: "pay_as_is" }).state, // crash 8 I at E1
    playLap({ 1: "C1", 2: "C4" }, { E2: "accept", E3: "now" }).state,
    playLap({ 1: "C1", 3: "C3" }).state,
    playLap({ 5: "C5" }, { E5: "show_cost" }).state,
  ];
}

describe("rewind, seed and reset (E-05)", () => {
  it("ET-R01 rewind to T1 after any path restores 38 000, Relacje 5, cost 0, full hand, events unresolved", () => {
    const fresh = createGame("demo");
    for (const end of finishedPaths()) {
      const back = rewind(end, 1);
      expect(back.core.balance).toBe(38000);
      expect(back.core.relations).toBe(5);
      expect(back.core.costOfMoney).toBe(0);
      expect(back.core.hand).toEqual(["C1", "C2", "C3", "C4", "C5", "C6"]);
      expect(back.core.played).toEqual([]);
      expect(back.core.eventsResolved).toEqual([]);
      expect(getCurrentEvent(back)?.id).toBe("E1");
      expect(back.core).toEqual(fresh.core);
      expect(back.snapshots).toEqual({ 1: fresh.core });
      // The separate account clock and the saved plans survive the rewind.
      expect(back.account).toEqual(end.account);
    }
  });

  it("ET-R02 same seed → same event order and same results", () => {
    const a = playLap({ 1: "C1" }, { E2: "accept" });
    const b = playLap({ 1: "C1" }, { E2: "accept" });
    expect(b.shown).toEqual(a.shown);
    expect(b.weekEnds).toEqual(a.weekEnds);
    expect(b.state).toEqual(a.state);
    const c = playLap({ 1: "C4" });
    const d = playLap({ 1: "C4" });
    expect(d.shown).toEqual(c.shown);
    expect(d.state).toEqual(c.state);
    // Replaying from a rewind gives the same results as the first run.
    const again = playLap({ 1: "C1" }, { E2: "accept" }, rewind(a.state, 1));
    expect(again.shown).toEqual(a.shown);
    expect(again.weekEnds).toEqual(a.weekEnds);
    expect(again.state.core).toEqual(a.state.core);
  });

  it("ET-R03 reset clears both clocks and the stored state", () => {
    const played = advanceAccountClock(savePlan(playLap({ 1: "C1" }).state, "C1"));
    expect(played.account.clock).toBe("2026-12-05");
    expect(played.account.plans).toHaveLength(1);
    const reset = resetGame("demo");
    expect(reset).toEqual(createGame("demo"));
    expect(reset.core.week).toBe(1);
    expect(reset.core.status).toBe("playing");
    expect(reset.account.clock).toBe("2026-11-21");
    expect(reset.account.plans).toEqual([]);
    expect(reset.snapshots).toEqual({ 1: reset.core });
  });

  it("rewind to week w restores exactly the state at the start of w, with the shown event's signal", () => {
    const lap = playLap({ 3: "C4" });
    expect(lap.state.core.status).toBe("completed");
    for (const w of [1, 2, 3, 4, 5, 6, 7] as const) {
      const start = lap.starts[w];
      if (!start) throw new Error(`week ${w} not reached`);
      const back = rewind(lap.state, w);
      expect(back.core).toEqual(start.core);
      expect(back.snapshots).toEqual(start.snapshots);
      expect(getCurrentEvent(back)).toEqual(getCurrentEvent(start));
    }
    // Narration signals of the restored week's card (E-04): E2 bigProject, E5 loanOffered, E6 lateClient.
    expect(rewind(lap.state, 1).emitted).toEqual([]);
    expect(rewind(lap.state, 2).emitted).toEqual([{ type: "bigProject", week: 2, eventId: "E2" }]);
    expect(rewind(lap.state, 3).emitted).toEqual([]);
    const noCard = playLap();
    expect(rewind(noCard.state, 5).emitted).toEqual([{ type: "loanOffered", week: 5, via: "E5" }]);
    expect(rewind(lap.state, 6).emitted).toEqual([{ type: "lateClient", week: 6, eventId: "E6", newDate: "2027-01-22" }]);
    const factored = playLap({ 1: "C6" });
    expect(rewind(factored.state, 6).emitted).toEqual([{ type: "lateClient", week: 6, eventId: "E6", newDate: null }]);
  });

  it("rewind drops later snapshots, rejects weeks not reached and invalid weeks", () => {
    const lap = playLap({ 1: "C1" });
    const back = rewind(lap.state, 3);
    expect(Object.keys(back.snapshots)).toEqual(["1", "2", "3"]);
    expect(errorCode(() => rewind(back, 5))).toBe("no_snapshot");
    expect(errorCode(() => rewind(createGame(), 2))).toBe("no_snapshot");
    expect(errorCode(() => rewind(lap.state, 0 as WeekNumber))).toBe("invalid_week");
    expect(errorCode(() => rewind(lap.state, 8 as WeekNumber))).toBe("invalid_week");
    // Rewinding to the current week restarts it: the card action and the event are open again.
    const t1 = playCard(resolveEvent(createGame(), "check"), "C1");
    const restart = rewind(t1, 1);
    expect(restart.core.weekActionUsed).toBe(false);
    expect(getCurrentEvent(restart)?.id).toBe("E1");
  });
});

describe("turn state machine (E-05)", () => {
  it("each week settles once: event first, then the week; lap end and crash stop the lap", () => {
    const s0 = createGame();
    expect(errorCode(() => resolveWeek(s0))).toBe("event_unresolved");
    const r1 = resolveWeek(resolveEvent(s0, "check"));
    expect(r1.week).toBe(1);
    expect(r1.endBalance).toBe(33700);
    expect(r1.state.core.week).toBe(2);
    expect(r1.state.core.weeksResolved).toEqual([1]);
    expect(r1.state.core.weekActionUsed).toBe(false);
    expect(r1.state.core.lowestBalance?.balance).toBe(33700);
    expect(r1.state.snapshots[2]).toEqual(r1.state.core);

    const crashed = playLap().state;
    expect(crashed.core.status).toBe("crashed");
    expect(crashed.core.stars).toEqual(stars("missed", "missed", "missed"));
    expect(errorCode(() => resolveWeek(crashed))).toBe("not_playing");
    expect(errorCode(() => playCard(crashed, "C1"))).toBe("card_unavailable");
    expect(getCurrentEvent(crashed)).toBeNull();
    expect(getAvailableCards(crashed).every((c) => !c.playable)).toBe(true);

    const won = playLap({ 1: "C1" });
    expect(won.state.core.status).toBe("completed");
    expect(won.state.core.week).toBe(7);
    expect(won.state.core.weeksResolved).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(won.state.emitted).toEqual([{ type: "lapWon", week: 7, stars: ["przetrwanie", "tanio"] }]);
    expect(errorCode(() => resolveWeek(won.state))).toBe("not_playing");
  });

  it("Pilot: pending only at lap end, finalised by savePlan; no plan mid-lap or after a crash; rewind drops Pilot, the plan survives", () => {
    // A plan is a winning decision: not while the lap is running (E-06 QA fix 2).
    const t2 = resolveWeek(playCard(resolveEvent(createGame(), "check"), "C1")).state;
    expect(errorCode(() => savePlan(t2, "C1"))).toBe("plan_not_allowed");
    const lap = playLap({}, {}, t2);
    expect(lap.state.core.stars).toEqual(stars("earned", "earned", "pending"));
    // Saving after the lap finalises Pilot.
    const saved = savePlan(lap.state, "C1");
    expect(saved.core.stars).toEqual(stars("earned", "earned", "earned"));
    expect(saved.core.level2Unlocked).toBe(true);
    // Rewind drops Pilot (core) and keeps the saved plan (account); a replayed lap end is pending again.
    const back = rewind(saved, 7);
    expect(back.core.stars.pilot).toBe("open");
    expect(back.account.plans).toEqual(saved.account.plans);
    expect(resolveWeek(back).state.core.stars.pilot).toBe("pending");
    // No plan from a crashed lap; a low below 0 keeps Pilot missed after the save.
    const crashed = playLap({ 1: "C3" }).state;
    expect(errorCode(() => savePlan(crashed, "C3"))).toBe("plan_not_allowed");
    const overdraft = playLap({ 1: "C4" }).state;
    expect(savePlan(overdraft, "C4").core.stars.pilot).toBe("missed");
    // Only a played decision can become the plan.
    expect(errorCode(() => savePlan(lap.state, "C2"))).toBe("plan_not_allowed");
  });

  it("inputs are never mutated by any transition", () => {
    const states = [
      createGame(),
      resolveEvent(createGame(), "check"),
      playLap({ 1: "C1" }).starts[5],
      playLap().starts[5],
      playLap({ 1: "C1" }).state,
      playLap().state,
    ];
    for (const st of states) {
      if (!st) throw new Error("state missing");
      const s = deepFreeze(st);
      const copy = JSON.stringify(s);
      forecast(s);
      forecast(s, { includeFutureEvents: false });
      getAvailableCards(s);
      getCfoHint(s);
      getCurrentEvent(s);
      for (const id of ["C1", "C2", "C3", "C4", "C5", "C6"] as const) {
        previewCard(s, id);
        errorCode(() => playCard(s, id));
        errorCode(() => createPlan(s, id));
        errorCode(() => savePlan(s, id));
      }
      const ev = getCurrentEvent(s);
      if (ev) resolveEvent(s, ev.choices[0].id);
      errorCode(() => resolveWeek(s));
      errorCode(() => delegateBestCard(s));
      for (const w of [1, 2, 3, 4, 5, 6, 7] as const) errorCode(() => rewind(s, w));
      advanceAccountClock(s);
      negotiate(s, "klient_a", "unknown");
      expect(JSON.stringify(s)).toBe(copy);
    }
  });
});

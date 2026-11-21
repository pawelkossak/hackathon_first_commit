import { describe, expect, it } from "vitest";
import { createGame, gameData, negotiate, resolveEvent, resolveWeek, type EngineEvent } from "../engine";
import { getCopy, REACTION_CONFIG, reactionFor, ReactionTracker, signalKind } from "./index";

/** One sample per engine event type; the mapped type makes a missing or new event type a compile error. */
type EventSamples = { [K in EngineEvent["type"]]: Extract<EngineEvent, { type: K }> };

describe("N-03 Narrator reactions", () => {
  const samples: EventSamples = {
    lapStart: { type: "lapStart", week: 1 },
    playerReturns: { type: "playerReturns", week: 1 },
    bigProject: { type: "bigProject", week: 2, eventId: "E2" },
    negotiationOpen: { type: "negotiationOpen", week: 2, agent: "klient_a" },
    lateClient: { type: "lateClient", week: 3, eventId: "E6", newDate: "2027-01-20" },
    loanOffered: { type: "loanOffered", week: 3, via: "E5" },
    fraudRevealed: {
      type: "fraudRevealed",
      week: 5,
      eventId: "E1",
      ledgerId: "L08",
      amount: -35700,
      date: "2026-12-23",
    },
    goodMove: { type: "goodMove", week: 4, cardId: "C1" },
    crash: {
      type: "crash",
      week: 5,
      crash: {
        week: 5,
        date: "2026-12-22",
        shortfall: 8095,
        transactionId: "L08",
      },
    },
    quietWeek: { type: "quietWeek", week: 6 },
    lapWon: { type: "lapWon", week: 7, stars: ["przetrwanie"] },
    planValidated: { type: "planValidated", week: 7, planId: "P1" },
  };
  const sampleEvents: EngineEvent[] = Object.values(samples);

  it("covers all 12 engine event types of data/reactions.json", () => {
    const dataTypes = gameData.reactions.reactions.map((r) => r.event).sort();
    expect(dataTypes).toHaveLength(12);
    expect(Object.keys(samples).sort()).toEqual(dataTypes);
    expect(Object.keys(REACTION_CONFIG).sort()).toEqual(dataTypes);
  });

  it("the reaction table equals data/reactions.json (emotion and line prefix per step)", () => {
    for (const r of gameData.reactions.reactions) {
      const steps = REACTION_CONFIG[r.event].steps.map((s) => ({ emotion: s.emotion, lineIdPrefix: s.lineId }));
      expect(steps, r.event).toEqual(r.steps);
    }
  });

  it("fraudRevealed: exasperated rx.fraud with the payload amount and date, all 4 variants", () => {
    const rx = reactionFor(samples.fraudRevealed);
    expect(rx.emotion).toBe("exasperated");
    expect(rx.lineId).toBe("rx.fraud");
    expect(rx.text).toContain("35\u00a0700 zł");
    expect(rx.text).toContain("23 grudnia");
    const genders = ["female", "male"] as const;
    const texts = genders.flatMap((player) =>
      genders.map((narrator) => reactionFor(samples.fraudRevealed, undefined, player, narrator).text)
    );
    expect(new Set(texts).size).toBe(4);
    expect(() => getCopy("rx.fraud")).toThrow();
  });

  it("every engine event maps to a line and emotion", () => {
    expect(sampleEvents).toHaveLength(12);
    for (const event of sampleEvents) {
      const rx = reactionFor(event);
      expect(rx.eventType).toBe(event.type);
      expect(rx.week).toBe(event.week);
      expect(rx.emotion).toBeDefined();
      expect(rx.lineId).toMatch(/^rx\./);
      expect(typeof rx.text).toBe("string");
      expect(rx.text.length).toBeGreaterThan(0);
      expect(rx.steps.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("crash event has two sequential steps: exasperated then supportive", () => {
    const crashEvent = samples.crash;
    const rx = reactionFor(crashEvent);
    expect(rx.steps).toHaveLength(2);
    expect(rx.steps[0].emotion).toBe("exasperated");
    expect(rx.steps[0].lineId).toBe("rx.crash");
    expect(rx.steps[1].emotion).toBe("supportive");
    expect(rx.steps[1].lineId).toBe("rx.rewind");
  });

  it("chooseReaction prioritises crash and success over minor events", () => {
    const tracker = new ReactionTracker();

    // In a week with both goodMove and crash, crash wins
    const eventsWithCrash: EngineEvent[] = [
      { type: "goodMove", week: 5, cardId: "C1" },
      samples.crash,
    ];
    const rxCrash = tracker.chooseReaction(eventsWithCrash);
    expect(rxCrash?.eventType).toBe("crash");

    // In week 7 with quietWeek and lapWon, lapWon wins
    tracker.reset();
    const eventsWithWin: EngineEvent[] = [
      { type: "quietWeek", week: 7 },
      { type: "lapWon", week: 7, stars: ["przetrwanie"] },
    ];
    const rxWin = tracker.chooseReaction(eventsWithWin);
    expect(rxWin?.eventType).toBe("lapWon");
  });

  it("cooldown limits reactions to at most one reaction per week", () => {
    const tracker = new ReactionTracker();

    // First reaction in week 2 succeeds
    const rx1 = tracker.chooseReaction([
      { type: "bigProject", week: 2, eventId: "E2" },
    ]);
    expect(rx1).toBeDefined();
    expect(rx1?.eventType).toBe("bigProject");
    expect(tracker.canReact(2)).toBe(false);

    // Second reaction in week 2 is blocked by cooldown
    const rx2 = tracker.chooseReaction([
      { type: "negotiationOpen", week: 2, agent: "klient_a" },
    ]);
    expect(rx2).toBeUndefined();

    // Week 3 allows a new reaction
    expect(tracker.canReact(3)).toBe(true);
    const rx3 = tracker.chooseReaction([
      { type: "lateClient", week: 3, eventId: "E6", newDate: "2027-01-20" },
    ]);
    expect(rx3).toBeDefined();
    expect(rx3?.eventType).toBe("lateClient");
    expect(tracker.canReact(3)).toBe(false);
  });

  it("in-week signals do not use the week-resolution slot: lapStart → negotiationOpen → goodMove", () => {
    const tracker = new ReactionTracker();
    expect(tracker.chooseReaction([{ type: "lapStart", week: 1 }])?.eventType).toBe("lapStart");
    expect(tracker.canReact(1)).toBe(false);

    const open = tracker.chooseReaction([{ type: "negotiationOpen", week: 1, agent: "klient_a" }]);
    expect(open?.eventType).toBe("negotiationOpen");
    expect(open?.lineId).toBe("rx.negotiate");

    // The accepted deal: a new scene cancels the previous line
    const good = tracker.chooseReaction([{ type: "goodMove", week: 1, cardId: "C1" }]);
    expect(good?.eventType).toBe("goodMove");
    expect(good?.emotion).toBe("proud");
    expect(good?.lineId).toBe("rx.goodmove");
    expect(tracker.getActiveReaction()?.eventType).toBe("goodMove");

    // The same in-week signal speaks once per week, a weaker one does not replace the stronger line
    expect(tracker.chooseReaction([{ type: "goodMove", week: 1, cardId: "C2" }])).toBeUndefined();
    expect(tracker.chooseReaction([{ type: "loanOffered", week: 1, via: "C5_preview" }])).toBeUndefined();
    expect(tracker.getActiveReaction()?.eventType).toBe("goodMove");

    // The next week resolution still has its own slot
    expect(tracker.canReact(2)).toBe(true);
    expect(tracker.chooseReaction([{ type: "bigProject", week: 2, eventId: "E2" }])?.eventType).toBe("bigProject");
    expect(tracker.chooseReaction([{ type: "quietWeek", week: 2 }])).toBeUndefined();
  });

  it("first negotiation message with an immediate deal: goodMove wins over negotiationOpen", () => {
    const tracker = new ReactionTracker();
    tracker.chooseReaction([{ type: "lapStart", week: 1 }]);
    const rx = tracker.chooseReaction([
      { type: "negotiationOpen", week: 1, agent: "klient_a" },
      { type: "goodMove", week: 1, cardId: "C1" },
    ]);
    expect(rx?.eventType).toBe("goodMove");
  });

  it("demo sequence on the real engine: counter, accept, then the week-1 resolution", () => {
    const tracker = new ReactionTracker();
    const start = createGame("demo");
    expect(tracker.chooseReaction(start.emitted, start)?.eventType).toBe("lapStart");

    const counter = negotiate(start, "klient_a", "ask_advance", 50);
    expect(counter.outcome).toBe("counter");
    expect(tracker.chooseReaction(counter.state.emitted, counter.state)?.eventType).toBe("negotiationOpen");

    const accept = negotiate(counter.state, "klient_a", "accept_counter");
    expect(accept.appliedCardId).toBe("C1");
    expect(accept.state.emitted.map((e) => e.type)).toContain("goodMove");
    expect(tracker.chooseReaction(accept.state.emitted, accept.state)?.eventType).toBe("goodMove");

    // E1 checked (in-week, emits nothing), then the week-1 resolution narrates week 2 in its own slot
    const checked = resolveEvent(accept.state, "check");
    expect(tracker.chooseReaction(checked.emitted, checked)).toBeUndefined();
    const week = resolveWeek(checked);
    expect(week.state.emitted.length).toBeGreaterThan(0);
    const next = tracker.chooseReaction(week.state.emitted, week.state);
    expect(next).toBeDefined();
    expect(next?.week).toBe(week.state.core.week);
  });

  it("the plan scene speaks after lapWon used the week-7 slot", () => {
    const tracker = new ReactionTracker();
    expect(tracker.chooseReaction([{ type: "lapWon", week: 7, stars: ["przetrwanie"] }])?.eventType).toBe("lapWon");
    expect(tracker.chooseReaction([{ type: "planValidated", week: 7, planId: "P1" }])?.eventType).toBe("planValidated");
    expect(tracker.chooseReaction([{ type: "planValidated", week: 7, planId: "P1" }])).toBeUndefined();
  });

  it("signal kinds: resolution, in-week and scene", () => {
    expect(signalKind({ type: "negotiationOpen", week: 1, agent: "klient_a" })).toBe("inWeek");
    expect(signalKind({ type: "goodMove", week: 1, cardId: "C1" })).toBe("inWeek");
    expect(signalKind({ type: "loanOffered", week: 3, via: "C5_preview" })).toBe("inWeek");
    expect(signalKind({ type: "loanOffered", week: 3, via: "E5" })).toBe("resolution");
    expect(signalKind({ type: "planValidated", week: 7, planId: "P1" })).toBe("scene");
    expect(signalKind({ type: "crash", week: 5, crash: { week: 5, date: "2026-12-22", shortfall: 8095, transactionId: "L08" } })).toBe("resolution");
  });

  it("reset clears the in-week memory", () => {
    const tracker = new ReactionTracker();
    tracker.chooseReaction([{ type: "goodMove", week: 1, cardId: "C1" }]);
    tracker.reset();
    expect(tracker.chooseReaction([{ type: "goodMove", week: 1, cardId: "C1" }])?.eventType).toBe("goodMove");
  });

  it("scene change cancels the active reaction", () => {
    const tracker = new ReactionTracker();
    tracker.chooseReaction([{ type: "bigProject", week: 2, eventId: "E2" }]);
    expect(tracker.getActiveReaction()).not.toBeNull();

    tracker.onSceneChange();
    expect(tracker.getActiveReaction()).toBeNull();
  });
});

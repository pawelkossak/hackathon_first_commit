import { describe, expect, it } from "vitest";
import { gameData, type EngineEvent } from "../engine";
import { getCopy, REACTION_CONFIG, reactionFor, ReactionTracker } from "./index";

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

  it("scene change cancels the active reaction", () => {
    const tracker = new ReactionTracker();
    tracker.chooseReaction([{ type: "bigProject", week: 2, eventId: "E2" }]);
    expect(tracker.getActiveReaction()).not.toBeNull();

    tracker.onSceneChange();
    expect(tracker.getActiveReaction()).toBeNull();
  });
});

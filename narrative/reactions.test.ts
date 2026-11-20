import { describe, expect, it } from "vitest";
import type { EngineEvent } from "../engine";
import { reactionFor, ReactionTracker } from "./index";

describe("N-03 Narrator reactions", () => {
  const sampleEvents: EngineEvent[] = [
    { type: "lapStart", week: 1 },
    { type: "playerReturns", week: 1 },
    { type: "bigProject", week: 2, eventId: "E2" },
    { type: "negotiationOpen", week: 2, agent: "klient_a" },
    { type: "lateClient", week: 3, eventId: "E6", newDate: "2027-01-20" },
    { type: "loanOffered", week: 3, via: "E5" },
    { type: "goodMove", week: 4, cardId: "C1" },
    {
      type: "crash",
      week: 5,
      crash: {
        week: 5,
        date: "2026-12-22",
        shortfall: 8095,
        transactionId: "L08",
      },
    },
    { type: "quietWeek", week: 6 },
    { type: "lapWon", week: 7, stars: ["przetrwanie"] },
    { type: "planValidated", week: 7, planId: "P1" },
  ];

  it("every engine event maps to a line and emotion", () => {
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
    const crashEvent = sampleEvents.find((e) => e.type === "crash")!;
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
      sampleEvents.find((e) => e.type === "crash")!,
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

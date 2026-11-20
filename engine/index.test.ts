import { describe, expect, it } from "vitest";
import * as engine from "./index";
import { RuleError } from "./index";

const contractFunctions = [
  "createGame",
  "resetGame",
  "forecast",
  "getAvailableCards",
  "previewCard",
  "playCard",
  "getCurrentEvent",
  "resolveEvent",
  "resolveWeek",
  "rewind",
  "createPlan",
  "savePlan",
  "advanceAccountClock",
  "negotiate",
  "getCfoHint",
  "delegateBestCard",
] as const;

describe("engine API surface (E-01)", () => {
  it("exports every function of RUNTIME-ENGINE-CONTRACT.md", () => {
    for (const name of contractFunctions) expect(typeof engine[name]).toBe("function");
  });

  it("createGame returns a serializable level 1 state", () => {
    const s = engine.createGame("demo");
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
    expect(s.schemaVersion).toBe(1);
    expect(s.core.week).toBe(1);
    expect(s.core.status).toBe("playing");
    expect(s.core.balance).toBe(38000);
    expect(s.core.relations).toBe(5);
    expect(s.core.hand).toEqual(["C1", "C2", "C3", "C4", "C5", "C6"]);
    expect(s.account.clock).toBe("2026-11-21");
    expect(s.emitted).toEqual([{ type: "lapStart", week: 1 }]);
  });

  it("forecast covers 21 XI to 10 I with seven week ends", () => {
    const f = engine.forecast(engine.createGame());
    expect(f.from).toBe("2026-11-21");
    expect(f.to).toBe("2027-01-10");
    expect(f.points).toHaveLength(51);
    expect(f.weekEnds.map((w) => w.week)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("week flow: event, card, resolve, rewind; inputs are never mutated", () => {
    const s0 = engine.createGame();
    const frozen = JSON.stringify(s0);
    const ev = engine.getCurrentEvent(s0);
    expect(ev?.id).toBe("E1");
    expect(() => engine.resolveWeek(s0)).toThrow(RuleError);
    const s1 = engine.resolveEvent(s0, "check");
    const s2 = engine.playCard(s1, "C1", false);
    expect(engine.getAvailableCards(s2).find((c) => c.id === "C1")?.disabledReason?.code).toBe("already_played");
    expect(() => engine.playCard(s2, "C2")).toThrow(RuleError);
    const r = engine.resolveWeek(s2);
    expect(r.state.core.week).toBe(2);
    const back = engine.rewind(r.state, 1);
    expect(back.core).toEqual(s0.core);
    expect(JSON.stringify(s0)).toBe(frozen);
  });

  it("previewCard never commits", () => {
    const s = engine.createGame();
    const p = engine.previewCard(s, "C6");
    expect(p.simulated.core.played).toHaveLength(1);
    expect(s.core.played).toHaveLength(0);
  });

  it("RuleError exposes a stable code", () => {
    try {
      engine.rewind(engine.createGame(), 5);
      expect.unreachable();
    } catch (e) {
      expect(engine.isRuleError(e) && e.code).toBe("no_snapshot");
    }
  });

  it("negotiate blocks the fourth message of a week", () => {
    let s = engine.createGame();
    for (let i = 0; i < 3; i++) s = engine.negotiate(s, "klient_a", "unknown").state;
    expect(engine.negotiate(s, "klient_a", "unknown").blocked).toBe(true);
  });

  it("account clock moves independently of the game week", () => {
    const s = engine.advanceAccountClock(engine.createGame());
    expect(s.account.clock).toBe("2026-12-05");
    expect(s.core.week).toBe(1);
  });
});

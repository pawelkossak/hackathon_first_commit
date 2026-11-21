// N-06: /api/agent service. The engine decides through negotiate(); spec values (GAME-DESIGN §9 step 4,
// ENGINE-DATA-AND-TESTS.md §4) are literals here. No test calls a real LLM: providers are local fakes.
import { describe, expect, it } from "vitest";
import { createGame, forecast, getCurrentEvent, resolveEvent, type GameState } from "../../engine";
import { getAgentProvider, handleAgentTurn, isAiOffline, withTimeout, TimeoutError } from "./index";
import type { AgentAiProvider, AgentTurnResponse, AgentTurnSuccess } from "./index";

function t1(): GameState {
  const s = createGame("demo");
  const ev = getCurrentEvent(s);
  return ev ? resolveEvent(s, "check") : s;
}

function success(r: AgentTurnResponse): AgentTurnSuccess {
  if (!r.ok) throw new Error(`expected an engine answer, got fallback ${r.reason}`);
  return r;
}

describe("N-06 Negotiation G14 and /api/agent", () => {
  it("test: PILOT_AI_OFFLINE=1 returns buttons and deterministic replies (50% → counter 30%, accept → C1 once)", async () => {
    const s0 = t1();
    const counter = success(
      await handleAgentTurn({ state: s0, agent: "klient_a", message: "50% zaliczki?" }, { offline: true })
    );
    expect(counter.intent).toBe("ask_advance");
    expect(counter.percent).toBe(50);
    expect(counter.result.outcome).toBe("counter");
    expect(counter.result.counterPercent).toBe(30);
    expect(counter.lineId).toBe("a.advance.counter");
    expect(counter.text).toBe("Mogę dać 30% — 15\u00a0000 zł do 3 grudnia.");
    expect(counter.source).toBe("cache");
    expect(counter.quickReplies.map((q) => q.intent)).toEqual(["accept_counter", "offer_discount"]);
    expect(counter.result.state.core.played).toEqual([]);

    const accept = success(
      await handleAgentTurn({ state: counter.result.state, agent: "klient_a", intent: "accept_counter" }, { offline: true })
    );
    expect(accept.lineId).toBe("a.advance.accept");
    expect(accept.result.appliedCardId).toBe("C1");
    expect(accept.text).toContain("15\u00a0000 zł");
    expect(accept.text).toContain("3 grudnia");
    // The engine applied C1 once; the 28 XII low is +2 605 (GAME-DESIGN §9 step 5).
    expect(accept.result.state.core.played.map((p) => p.cardId)).toEqual(["C1"]);
    expect(forecast(accept.result.state).committedCards).toEqual(["C1"]);
    expect(forecast(accept.result.state).vsBaseline.days.find((d) => d.date === "2026-12-28")?.after).toBe(2605);
  });

  it("missing percent → the 30 % counter (E-08); a named percent ≤ 30 is accepted directly", async () => {
    const noPercent = success(
      await handleAgentTurn({ state: t1(), agent: "klient_a", message: "Czy mogę dostać zaliczkę?" }, { offline: true })
    );
    expect(noPercent.percent).toBeUndefined();
    expect(noPercent.result.outcome).toBe("counter");

    const direct = success(
      await handleAgentTurn({ state: t1(), agent: "klient_a", message: "Daj 20% z góry" }, { offline: true })
    );
    expect(direct.result.outcome).toBe("accept");
    expect(direct.result.appliedCardId).toBe("C1");
  });

  it("every cached reply passes the number guardrail with result.numbers", async () => {
    const cases: Array<[GameState, "klient_a" | "bank", string]> = [
      [t1(), "klient_a", "50% zaliczki?"],
      [t1(), "klient_a", "Zapłać wcześniej, dam 2% skonta"],
      [t1(), "klient_a", "Zapłać albo pozew"],
      [t1(), "klient_a", "Pogoda jest ładna"],
      [t1(), "bank", "Potrzebuję limitu w koncie"],
      [t1(), "bank", "Poproszę o kredyt"],
    ];
    const lineIds: string[] = [];
    for (const [state, agent, message] of cases) {
      const r = success(await handleAgentTurn({ state, agent, message }, { offline: true }));
      lineIds.push(r.lineId);
      const digits = r.text.match(/\d[\d\u00a0 ]*/g) ?? [];
      for (const d of digits) expect(r.result.numbers).toContain(Number(d.replace(/[\u00a0 ]/g, "")));
    }
    expect(lineIds).toEqual(["a.advance.counter", "a.discount.accept", "a.rude", "a.fallback", "bank.od.offer", "bank.fallback"]);
  });

  it("bank: overdraft offer names the engine limit 15 000 zł and cost 194 zł; a loan request is unknown", async () => {
    const offer = success(await handleAgentTurn({ state: t1(), agent: "bank", intent: "ask_overdraft" }, { offline: true }));
    expect(offer.text).toContain("15\u00a0000 zł");
    expect(offer.text).toContain("194 zł");
    expect(offer.result.appliedCardId).toBe("C4");

    const loan = success(await handleAgentTurn({ state: t1(), agent: "bank", message: "Chcę pożyczkę" }, { offline: true }));
    expect(loan.intent).toBe("unknown");
    expect(loan.result.appliedCardId).toBeNull();
  });

  it("a provider phrasing with a number outside result.numbers is replaced by the cached line", async () => {
    const provider: AgentAiProvider = {
      phrase: async () => "Mogę dać 40% — 99 999 zł jutro.",
    };
    const r = success(
      await handleAgentTurn({ state: t1(), agent: "klient_a", intent: "ask_advance" }, { provider, offline: false })
    );
    expect(r.source).toBe("cache");
    expect(r.text).toBe("Mogę dać 30% — 15\u00a0000 zł do 3 grudnia.");

    const good: AgentAiProvider = { phrase: async () => "Zaproponuję 30%, czyli 15 000 zł do 3 grudnia." };
    const ok = success(await handleAgentTurn({ state: t1(), agent: "klient_a", intent: "ask_advance" }, { provider: good }));
    expect(ok.source).toBe("provider");
  });

  it("offline: the provider is never called; a slow provider falls back after the timeout", async () => {
    let calls = 0;
    const provider: AgentAiProvider = {
      classify: async () => {
        calls += 1;
        return { intent: "rude" };
      },
      phrase: async () => {
        calls += 1;
        return "x";
      },
    };
    await handleAgentTurn({ state: t1(), agent: "klient_a", message: "50% zaliczki?" }, { provider, offline: true });
    expect(calls).toBe(0);

    const slow: AgentAiProvider = {
      classify: (_text, _agent, signal) =>
        new Promise((resolve) => signal.addEventListener("abort", () => resolve(null))),
    };
    const r = success(
      await handleAgentTurn({ state: t1(), agent: "klient_a", message: "50% zaliczki?" }, { provider: slow, timeoutMs: 20 })
    );
    expect(r.result.outcome).toBe("counter");
    await expect(withTimeout(() => new Promise<never>(() => undefined), 10)).rejects.toBeInstanceOf(TimeoutError);
  });

  it("PILOT_AI_OFFLINE=1 gives no provider; round 1 has none configured either", () => {
    expect(isAiOffline({ PILOT_AI_OFFLINE: "1" })).toBe(true);
    expect(getAgentProvider({ PILOT_AI_OFFLINE: "1" })).toBeUndefined();
    expect(getAgentProvider({})).toBeUndefined();
  });

  it("4th message of the week is blocked by the engine; after the lap the fallback has no quick replies", async () => {
    let s = t1();
    for (let i = 0; i < 3; i += 1) {
      s = success(await handleAgentTurn({ state: s, agent: "klient_a", message: "Pogoda" }, { offline: true })).result.state;
    }
    const blocked = success(await handleAgentTurn({ state: s, agent: "klient_a", message: "50% zaliczki?" }, { offline: true }));
    expect(blocked.result.blocked).toBe(true);
    expect(blocked.lineId).toBe("a.fallback");

    const finished: GameState = { ...s, core: { ...s.core, status: "completed" } };
    const after = await handleAgentTurn({ state: finished, agent: "klient_a", message: "50%" }, { offline: true });
    expect(after.ok).toBe(false);
    if (!after.ok) {
      expect(after.reason).toBe("not_playing");
      expect(after.quickReplies).toEqual([]);
    }
  });

  it("test: no key in response payload", async () => {
    const res = await handleAgentTurn({ state: t1(), agent: "klient_a", message: "Proszę o zaliczkę 30%" }, { offline: true });
    const resString = JSON.stringify(res);
    expect(resString).not.toContain("sk-");
    expect(resString).not.toContain("API_KEY");
    expect(resString).not.toContain("secret");
  });
});

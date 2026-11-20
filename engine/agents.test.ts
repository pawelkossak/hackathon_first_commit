// E-08 agent cases. Expected values are copied from ENGINE-DATA-AND-TESTS.md §4 and §7.6, GAME-DESIGN.md
// §9 (demo step 4–6), §1 card costs and DECISIONS.md D-17, never computed by the engine and pasted back.
import { describe, expect, it } from "vitest";
import { gameData } from "./data";
import type { AgentIntent, EventChoiceId, EventId, GameState, NegotiationResult } from "./index";
import {
  RuleError,
  createGame,
  delegateBestCard,
  forecast,
  getCfoHint,
  getCurrentEvent,
  negotiate,
  playCard,
  resolveEvent,
  resolveWeek,
} from "./index";

/** Safe event choices of §7 (E1 check, E2 decline, E3 january); E5 ignore, E6 acknowledge. */
const safe: Record<EventId, EventChoiceId> = {
  E1: "check",
  E2: "decline",
  E3: "january",
  E5: "ignore",
  E6: "acknowledge",
};

function resolveCurrentEvent(s: GameState): GameState {
  const ev = getCurrentEvent(s);
  return ev ? resolveEvent(s, safe[ev.id]) : s;
}

/** Demo seed at the start of `week`, the week's event resolved, no card. */
function atWeek(week: number): GameState {
  let s = resolveCurrentEvent(createGame("demo"));
  while (s.core.week < week) s = resolveCurrentEvent(resolveWeek(s).state);
  return s;
}

/** Resolve the remaining weeks with the safe choices and no further card. */
function finishLap(s: GameState): GameState {
  let st = s;
  while (st.core.status === "playing") st = resolveCurrentEvent(resolveWeek(st).state);
  return st;
}

function errorCode(fn: () => unknown): string | null {
  try {
    fn();
  } catch (e) {
    return e instanceof RuleError ? e.code : "not a RuleError";
  }
  return null;
}

/** The narrative lane's number guardrail in miniature: integers of a Polish sentence ("15 000" = 15000). */
function numbersIn(text: string): number[] {
  return (text.match(/\d{1,3}(?:[  ]\d{3})+|\d+/g) ?? []).map((n) => Number(n.replace(/[  ]/g, "")));
}

function replyFor(result: NegotiationResult, llmText: string | null, cachedText: string): string {
  if (llmText === null) return cachedText;
  return numbersIn(llmText).every((n) => result.numbers.includes(n)) ? llmText : cachedText;
}

const counterText = "Mogę dać 30% — 15 000 zł do 3 grudnia";

describe("agents (E-08)", () => {
  it("ET-A01 T1 „50% zaliczki?” → counter 30 %, no effect until accept", () => {
    const s = atWeek(1);
    const r = negotiate(s, "klient_a", "ask_advance", 50);
    expect(r.outcome).toBe("counter");
    expect(r.counterPercent).toBe(30);
    expect(r.lineId).toBe("a.advance.counter");
    expect(r.appliedCardId).toBeNull();
    expect(r.numbers).toEqual(expect.arrayContaining([30, 15000, 3]));
    expect(r.state.core.negotiation.klient_a.counterPending).toBe(true);
    // No effect: nothing played, the week's action is free, the forecast still crashes on 22 XII.
    expect(r.state.core.played).toEqual([]);
    expect(r.state.core.weekActionUsed).toBe(false);
    expect(r.state.core.hand).toContain("C1");
    expect(forecast(r.state).crash).toMatchObject({ date: "2026-12-22", shortfall: 8095 });
    expect(forecast(r.state).committedCards).toEqual([]);
  });

  it("ET-A02 accept counter → C1 effect, C1 marked played (counts as the week's action)", () => {
    const counter = negotiate(atWeek(1), "klient_a", "ask_advance", 50).state;
    const r = negotiate(counter, "klient_a", "accept_counter");
    expect(r.outcome).toBe("accept");
    expect(r.lineId).toBe("a.advance.accept");
    expect(r.appliedCardId).toBe("C1");
    expect(r.numbers).toEqual(expect.arrayContaining([15000, 3]));
    const core = r.state.core;
    expect(core.played).toEqual([{ cardId: "C1", week: 1, delegated: false, cost: 0 }]);
    expect(core.weekActionUsed).toBe(true);
    expect(core.hand).not.toContain("C1");
    expect(core.competences.luka_plynnosciowa).toBe(2);
    expect(core.negotiation.klient_a.counterPending).toBe(false);
    expect(r.state.emitted).toContainEqual({ type: "goodMove", week: 1, cardId: "C1" });
    // Same path as playCard: the forecast commits C1 once (+15 000 on 3 XII), demo step 5 node.
    const f = forecast(r.state);
    expect(f.committedCards).toEqual(["C1"]);
    expect(f.crash).toBeNull();
    const c1 = f.points.flatMap((p) => p.transactions).filter((t) => t.id === "C1");
    expect(c1).toEqual([expect.objectContaining({ date: "2026-12-03", amount: 15000 })]);
    const node = f.vsBaseline.days.find((d) => d.date === "2026-12-28");
    expect(node).toMatchObject({ before: -12395, after: 2605 });
    expect(forecast(r.state)).toEqual(forecast(playCard(atWeek(1), "C1")));
  });

  it("ET-A03 T3 any advance → refuse, no effect", () => {
    const s = atWeek(3);
    for (const percent of [10, 30, 50, undefined]) {
      const r = negotiate(s, "klient_a", "ask_advance", percent);
      expect(r.outcome).toBe("refuse");
      expect(r.lineId).toBe("a.advance.closed");
      expect(r.appliedCardId).toBeNull();
      expect(r.state.core.played).toEqual([]);
      expect(r.state.core.relations).toBe(5);
      expect(r.state.core.weekActionUsed).toBe(false);
    }
    expect(negotiate(s, "klient_a", "accept_counter").appliedCardId).toBeNull();
  });

  it("ET-A04 rude message → refuse, Relacje 4", () => {
    const r = negotiate(atWeek(1), "klient_a", "rude");
    expect(r.outcome).toBe("refuse");
    expect(r.lineId).toBe("a.rude");
    expect(r.state.core.relations).toBe(4);
    expect(r.state.core.played).toEqual([]);
  });

  it("ET-A05 4th message in a turn → blocked, quick replies only", () => {
    let s = atWeek(1);
    for (let i = 0; i < 3; i++) s = negotiate(s, "klient_a", "rude").state;
    expect(s.core.relations).toBe(2);
    const r = negotiate(s, "klient_a", "ask_advance", 30);
    expect(r.blocked).toBe(true);
    expect(r.outcome).toBe("blocked");
    expect(r.lineId).toBe("a.fallback");
    expect(r.appliedCardId).toBeNull();
    expect(r.numbers).toEqual([]);
    expect(r.state.core).toEqual(s.core);
    // The limit is per agent and per week.
    expect(negotiate(s, "bank", "unknown").blocked).toBe(false);
    const next = resolveCurrentEvent(resolveWeek(s).state);
    expect(negotiate(next, "klient_a", "unknown").blocked).toBe(false);
  });

  it("ET-A06 LLM reply with a number not in the engine result → cached line used", () => {
    const r = negotiate(atWeek(1), "klient_a", "ask_advance", 50);
    const rule = gameData.agents.klient_a.rules.find((x) => x.lineId === r.lineId);
    expect(rule?.text).toBe(counterText);
    expect(replyFor(r, "Mogę dać 40% — 20 000 zł do 3 grudnia", counterText)).toBe(counterText);
    expect(replyFor(r, "Dam 30%, czyli 15 000 zł, do 3 grudnia.", counterText)).toBe("Dam 30%, czyli 15 000 zł, do 3 grudnia.");
    // Every number of the cached line is in the engine result, so the cached line always passes.
    expect(numbersIn(counterText).every((n) => r.numbers.includes(n))).toBe(true);
    expect(replyFor(r, null, counterText)).toBe(counterText);
  });

  it("ET-A07 bank asked in T4 → refuse, C4 not applied", () => {
    const r = negotiate(atWeek(4), "bank", "ask_overdraft");
    expect(r.outcome).toBe("refuse");
    expect(r.lineId).toBe("bank.od.late");
    expect(r.appliedCardId).toBeNull();
    expect(r.state.core.overdraftLimit).toBe(0);
    expect(r.state.core.played).toEqual([]);
    expect(gameData.agents.bank.rules.find((x) => x.lineId === "bank.od.late")?.text).toBe("Na ten scenariusz jest już za późno.");
  });

  it("Klient A accepts p ≤ 30 directly; no percent named gets the 30 % counter", () => {
    const direct = negotiate(atWeek(2), "klient_a", "ask_advance", 30);
    expect(direct.outcome).toBe("accept");
    expect(direct.appliedCardId).toBe("C1");
    expect(direct.state.core.played).toEqual([{ cardId: "C1", week: 2, delegated: false, cost: 0 }]);
    expect(negotiate(atWeek(1), "klient_a", "ask_advance").outcome).toBe("counter");
    // accept_counter without a pending counter: quick replies.
    const none = negotiate(atWeek(1), "klient_a", "accept_counter");
    expect(none.outcome).toBe("quick_replies");
    expect(none.lineId).toBe("a.fallback");
    expect(none.state.core.played).toEqual([]);
  });

  it("Klient A deal needs the card playable: week action used or C1 played → quick replies, no second booking", () => {
    const afterC3 = playCard(atWeek(1), "C3");
    const r = negotiate(afterC3, "klient_a", "ask_advance", 30);
    expect(r.outcome).toBe("quick_replies");
    expect(r.state.core.played.map((p) => p.cardId)).toEqual(["C3"]);
    const c1 = negotiate(atWeek(1), "klient_a", "ask_advance", 30).state;
    const again = negotiate(resolveCurrentEvent(resolveWeek(c1).state), "klient_a", "ask_advance", 30);
    expect(again.outcome).toBe("quick_replies");
    expect(again.state.core.played.map((p) => p.cardId)).toEqual(["C1"]);
  });

  it("offer_discount (2 %) → C2 effect while INV-A1 is pending", () => {
    const r = negotiate(atWeek(1), "klient_a", "offer_discount", 2);
    expect(r.outcome).toBe("accept");
    expect(r.lineId).toBe("a.discount.accept");
    expect(r.appliedCardId).toBe("C2");
    expect(r.state.core.invoiceState).toBe("discounted");
    expect(r.state.core.costOfMoney).toBe(406);
    expect(r.numbers).toEqual(expect.arrayContaining([2, 19889, 406, 20295, 27]));
    expect(forecast(r.state).committedCards).toEqual(["C2"]);
    const factored = playCard(atWeek(1), "C6");
    expect(negotiate(factored, "klient_a", "offer_discount", 2).outcome).toBe("quick_replies");
  });

  it("demo path: C1 via negotiation in T1 books once, lap end 9 985 (GAME-DESIGN §9 step 6)", () => {
    const counter = negotiate(atWeek(1), "klient_a", "ask_advance", 50).state;
    const accepted = negotiate(counter, "klient_a", "accept_counter").state;
    const end = finishLap(accepted);
    expect(end.core.status).toBe("completed");
    expect(end.core.balance).toBe(9985);
    expect(end.core.played.map((p) => p.cardId)).toEqual(["C1"]);
    expect(end.core.avoidedCost).toBe(2400);
  });

  it("bank T1–T3: overdraft offer with the cost formula; gap closed → not needed, allowed anyway", () => {
    const offer = negotiate(atWeek(1), "bank", "ask_overdraft");
    expect(offer.outcome).toBe("accept");
    expect(offer.lineId).toBe("bank.od.offer");
    expect(offer.appliedCardId).toBe("C4");
    expect(offer.state.core.overdraftLimit).toBe(15000);
    expect(offer.numbers).toEqual(expect.arrayContaining([15000, 150, 44, 194, 12]));
    const c1 = negotiate(negotiate(atWeek(1), "klient_a", "ask_advance", 50).state, "klient_a", "accept_counter").state;
    const t2 = resolveCurrentEvent(resolveWeek(c1).state);
    const notNeeded = negotiate(t2, "bank", "ask_overdraft");
    expect(notNeeded.outcome).toBe("inform_allow");
    expect(notNeeded.lineId).toBe("bank.od.notneeded");
    expect(notNeeded.appliedCardId).toBe("C4");
  });

  it("the bank never offers C5 and answers unknown intents with bank.fallback", () => {
    expect(gameData.agents.bank.neverOffers).toContain("C5");
    expect(gameData.agents.bank.rules.some((r) => r.cardId === "C5")).toBe(false);
    const intents: AgentIntent[] = ["ask_advance", "accept_counter", "offer_discount", "rude", "ask_overdraft", "unknown"];
    for (const week of [1, 2, 3, 4, 5]) {
      for (const intent of intents) {
        const r = negotiate(atWeek(week), "bank", intent, 50);
        expect(r.appliedCardId).not.toBe("C5");
        expect(r.state.core.played.some((p) => p.cardId === "C5")).toBe(false);
        if (intent !== "ask_overdraft") expect(r.lineId).toBe("bank.fallback");
      }
    }
  });

  it("negotiate after the lap throws not_playing (completed and crashed)", () => {
    const completed = finishLap(playCard(atWeek(1), "C1"));
    const crashed = finishLap(atWeek(1));
    expect(completed.core.status).toBe("completed");
    expect(crashed.core.status).toBe("crashed");
    for (const s of [completed, crashed]) {
      expect(errorCode(() => negotiate(s, "klient_a", "ask_advance", 50))).toBe("not_playing");
      expect(errorCode(() => negotiate(s, "bank", "ask_overdraft"))).toBe("not_playing");
    }
  });

  it("negotiationOpen on the first message of the week only", () => {
    const first = negotiate(atWeek(1), "klient_a", "unknown");
    expect(first.state.emitted).toEqual([{ type: "negotiationOpen", week: 1, agent: "klient_a" }]);
    expect(negotiate(first.state, "klient_a", "unknown").state.emitted).toEqual([]);
  });

  it("D-17 T1 demo hint = [C1 (0), C2 (406)], no product", () => {
    const hint = getCfoHint(atWeek(1));
    expect(hint.options).toEqual([
      { cardId: "C1", cost: 0 },
      { cardId: "C2", cost: 406 },
    ]);
    expect(hint.options.some((o) => o.cardId === "C4")).toBe(false);
    expect(getCfoHint(atWeek(3)).options).toEqual([{ cardId: "C2", cost: 406 }]);
  });

  it("D-17 a product only as the last resort, with its engine cost; delegation follows the same rule", () => {
    // T5 without a card: C2 pays on 28 XII, after the 22 XII crash, so only products remove it.
    const t5 = atWeek(5);
    expect(getCfoHint(t5).options).toEqual([
      { cardId: "C6", cost: 304 },
      { cardId: "C5", cost: 2400 },
    ]);
    const d5 = delegateBestCard(t5);
    expect(d5.core.played).toEqual([{ cardId: "C6", week: 5, delegated: true, cost: 304 }]);
    const d1 = delegateBestCard(atWeek(1));
    expect(d1.core.played).toEqual([{ cardId: "C1", week: 1, delegated: true, cost: 0 }]);
  });

  it("inputs are never mutated by negotiate", () => {
    const s = negotiate(atWeek(1), "klient_a", "ask_advance", 50).state;
    const copy = JSON.stringify(s);
    negotiate(s, "klient_a", "accept_counter");
    negotiate(s, "klient_a", "rude");
    negotiate(s, "bank", "ask_overdraft");
    expect(JSON.stringify(s)).toBe(copy);
  });
});

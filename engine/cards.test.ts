// E-03 action card cases. Expected values are copied from ENGINE-DATA-AND-TESTS.md §7.2
// (and GAME-DESIGN.md §6.1, D-11), never computed by the engine and pasted back.
import { describe, expect, it } from "vitest";
import { gameData } from "./data";
import type { CardId, EventChoiceId, EventId, GameState, StarId, StarStatus } from "./index";
import {
  RuleError,
  createGame,
  delegateBestCard,
  forecast,
  getAvailableCards,
  getCfoHint,
  getCurrentEvent,
  playCard,
  previewCard,
  resolveEvent,
  resolveWeek,
  savePlan,
} from "./index";
import { lapScore } from "./score";

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

/** Demo seed at the start of `week` (events resolved, no card). */
function atWeek(week: number): GameState {
  let s = createGame("demo");
  while (s.core.week < week) s = resolveWeek(resolveCurrentEvent(s)).state;
  return s;
}

interface Lap {
  state: GameState;
  weekEnds: (number | null)[];
}

/** Play the demo lap with `plays[week]` as the week's card, until the lap completes or crashes. */
function playLap(plays: Partial<Record<number, CardId>>): Lap {
  let s = createGame("demo");
  const weekEnds: (number | null)[] = [];
  while (s.core.status === "playing") {
    s = resolveCurrentEvent(s);
    const card = plays[s.core.week];
    if (card) s = playCard(s, card);
    const r = resolveWeek(s);
    weekEnds.push(r.endBalance);
    s = r.state;
  }
  return { state: s, weekEnds };
}

function starsOf(s: GameState): Record<StarId, StarStatus> {
  return s.core.stars;
}

const allEarned = { przetrwanie: "earned", tanio: "earned", pilot: "earned" };
const card = (s: GameState, id: CardId) => {
  const c = getAvailableCards(s).find((v) => v.id === id);
  if (!c) throw new Error(`no card ${id}`);
  return c;
};

describe("action cards (E-03)", () => {
  it("ET-C01 C1 in T1: week-ends, low +2 605 on 28 XII, cost 0, Relacje 5, ★★★ after plan", () => {
    const lap = playLap({ 1: "C1" });
    expect(lap.weekEnds).toEqual([33700, 56080, 40380, 46705, 6905, 9985, 9985]);
    expect(forecast(lap.state).low).toEqual({ date: "2026-12-28", balance: 2605 });
    expect(lap.state.core.crash).toBeNull();
    expect(lap.state.core.costOfMoney).toBe(0);
    expect(lap.state.core.relations).toBe(5);
    expect(starsOf(savePlan(lap.state, "C1"))).toEqual(allEarned);
  });

  it("ET-C02 C1 in T2: same as ET-C01", () => {
    const lap = playLap({ 2: "C1" });
    expect(lap.weekEnds).toEqual([33700, 56080, 40380, 46705, 6905, 9985, 9985]);
    expect(forecast(lap.state).low?.balance).toBe(2605);
    expect(lap.state.core.costOfMoney).toBe(0);
    expect(lap.state.core.relations).toBe(5);
    expect(starsOf(savePlan(lap.state, "C1"))).toEqual(allEarned);
  });

  it("ET-C03 C2 in T1: low +7 494, cost 406, ★★★", () => {
    const lap = playLap({ 1: "C2" });
    expect(lap.weekEnds).toEqual([53589, 60969, 45269, 51594, 11794, 14874, 14874]);
    expect(forecast(lap.state).low?.balance).toBe(7494);
    expect(lap.state.core.costOfMoney).toBe(406);
    expect(lap.state.core.relations).toBe(5);
    expect(starsOf(savePlan(lap.state, "C2"))).toEqual(allEarned);
  });

  it("ET-C04 C2 in T4: low +7 494, cost 406, ★★★", () => {
    const lap = playLap({ 4: "C2" });
    expect(lap.weekEnds).toEqual([33700, 41080, 25380, 51594, 11794, 14874, 14874]);
    expect(forecast(lap.state).low?.balance).toBe(7494);
    expect(lap.state.core.costOfMoney).toBe(406);
    expect(starsOf(savePlan(lap.state, "C2"))).toEqual(allEarned);
  });

  it("ET-C05 C2 in T5 (too late, still playable): crash 22 XII short 8 095, cost 406, no star", () => {
    const s5 = atWeek(5);
    expect(card(s5, "C2")).toMatchObject({ playable: true, tooLate: true });
    const lap = playLap({ 5: "C2" });
    expect(lap.weekEnds).toEqual([33700, 41080, 25380, 31705, null]);
    expect(lap.state.core.status).toBe("crashed");
    expect(lap.state.core.crash).toMatchObject({ date: "2026-12-22", shortfall: 8095 });
    expect(forecast(lap.state).low).toBeNull();
    expect(lap.state.core.costOfMoney).toBe(406);
    expect(lap.state.core.relations).toBe(5);
    expect(Object.values(starsOf(lap.state)).includes("earned")).toBe(false);
  });

  it("ET-C06 C3 (demo seed): crash 8 I short 5 015, cost 0, Relacje 3", () => {
    const lap = playLap({ 1: "C3" });
    expect(lap.weekEnds).toEqual([33700, 41080, 25380, 31705, 27605, 30685, null]);
    expect(lap.state.core.crash).toMatchObject({ date: "2027-01-08", shortfall: 5015 });
    expect(lap.state.core.costOfMoney).toBe(0);
    expect(lap.state.core.relations).toBe(3);
    expect(Object.values(starsOf(lap.state)).includes("earned")).toBe(false);
  });

  it("ET-C07 C3, E6 off: lap end 15 280, low +15 280 on 8 I, Relacje 3, ★★ (Przetrwanie, Pilot)", () => {
    const s = playCard(atWeek(1), "C3");
    const f = forecast(s, { includeFutureEvents: false });
    expect(f.weekEnds.map((w) => w.balance)).toEqual([33700, 41080, 25380, 31705, 27605, 30685, 15280]);
    expect(f.low).toEqual({ date: "2027-01-08", balance: 15280 });
    expect(f.crash).toBeNull();
    expect(s.core.relations).toBe(3);
    const score = lapScore(s.core, f, true);
    expect(score.costOfMoney).toBe(0);
    expect(score.stars).toEqual({ przetrwanie: "earned", tanio: "missed", pilot: "earned" });
  });

  it("ET-C08 C4 (demo seed): −12 395 inside the limit, cost 194 (44 interest + 150), ★★ (Przetrwanie, Tanio)", () => {
    const played = playCard(atWeek(1), "C4");
    expect(card(played, "C4").cost).toBe(194);
    expect(forecast(played).overdraftInterest).toBe(44);
    const lap = playLap({ 1: "C4" });
    expect(lap.weekEnds).toEqual([33700, 41080, 25380, 31705, -8095, -5015, -5015]);
    expect(forecast(lap.state).low?.balance).toBe(-12395);
    expect(lap.state.core.crash).toBeNull();
    expect(lap.state.core.costOfMoney).toBe(194);
    expect(lap.state.core.relations).toBe(5);
    expect(starsOf(savePlan(lap.state, "C4"))).toEqual({ przetrwanie: "earned", tanio: "earned", pilot: "missed" });
  });

  it("ET-C09 C4, E6 off: −8 095 · −5 015 · 15 280, low −12 395, cost 189 (39 + 150), ★★", () => {
    const s = playCard(atWeek(1), "C4");
    const f = forecast(s, { includeFutureEvents: false });
    expect(f.weekEnds.slice(4).map((w) => w.balance)).toEqual([-8095, -5015, 15280]);
    expect(f.low?.balance).toBe(-12395);
    expect(f.crash).toBeNull();
    expect(f.overdraftInterest).toBe(39);
    const score = lapScore(s.core, f, true);
    expect(score.costOfMoney).toBe(189);
    expect(score.stars).toEqual({ przetrwanie: "earned", tanio: "earned", pilot: "missed" });
  });

  it("ET-C10 C5 in T5: low +2 605, cost 2 400, ★★ (Przetrwanie, Pilot) after plan, ★ without", () => {
    const lap = playLap({ 5: "C5" });
    expect(lap.weekEnds).toEqual([33700, 41080, 25380, 31705, 6905, 9985, 9985]);
    expect(forecast(lap.state).low?.balance).toBe(2605);
    expect(lap.state.core.costOfMoney).toBe(2400);
    expect(lap.state.core.relations).toBe(5);
    expect(starsOf(lap.state)).toEqual({ przetrwanie: "earned", tanio: "missed", pilot: "pending" });
    expect(starsOf(savePlan(lap.state, "C5"))).toEqual({ przetrwanie: "earned", tanio: "missed", pilot: "earned" });
  });

  it("ET-C11 C5 in T1: +15 000 on 23 XI, low +2 605, cost 2 400, ★★", () => {
    const lap = playLap({ 1: "C5" });
    expect(lap.weekEnds).toEqual([48700, 56080, 40380, 46705, 6905, 9985, 9985]);
    expect(forecast(lap.state).low?.balance).toBe(2605);
    expect(lap.state.core.costOfMoney).toBe(2400);
    expect(starsOf(savePlan(lap.state, "C5"))).toEqual({ przetrwanie: "earned", tanio: "missed", pilot: "earned" });
  });

  it("ET-C12 C6 in T1: low +7 596, lap end 14 976, cost 304, ★★★, no competence", () => {
    const before = atWeek(1);
    const played = playCard(before, "C6");
    expect(played.core.competences).toEqual(before.core.competences);
    expect(played.core.invoiceState).toBe("factored");
    const lap = playLap({ 1: "C6" });
    expect(lap.weekEnds).toEqual([53691, 61071, 45371, 51696, 11896, 14976, 14976]);
    expect(forecast(lap.state).low?.balance).toBe(7596);
    expect(lap.state.core.costOfMoney).toBe(304);
    expect(lap.state.core.relations).toBe(5);
    expect(starsOf(savePlan(lap.state, "C6"))).toEqual(allEarned);
  });

  it("ET-C13 C6 in T4: low +7 596, cost 304, ★★★", () => {
    const lap = playLap({ 4: "C6" });
    expect(lap.weekEnds).toEqual([33700, 41080, 25380, 51696, 11896, 14976, 14976]);
    expect(forecast(lap.state).low?.balance).toBe(7596);
    expect(lap.state.core.costOfMoney).toBe(304);
    expect(starsOf(savePlan(lap.state, "C6"))).toEqual(allEarned);
  });

  it("ET-C14 C6 in T5: payout 22 XII before L08, low +7 596, cost 304, ★★★", () => {
    const lap = playLap({ 5: "C6" });
    expect(lap.weekEnds).toEqual([33700, 41080, 25380, 31705, 11896, 14976, 14976]);
    expect(forecast(lap.state).low?.balance).toBe(7596);
    expect(lap.state.core.costOfMoney).toBe(304);
    expect(starsOf(savePlan(lap.state, "C6"))).toEqual(allEarned);
  });

  it("ET-C15 eligibility: windows, exclusivity, once per lap, one per week, C5 after 22 XII", () => {
    // C1 disabled from T3.
    expect(card(atWeek(2), "C1").playable).toBe(true);
    expect(card(atWeek(3), "C1").disabledReason).toEqual({ code: "budget_closed", text: "Za późno — budżet klienta zamknięty" });
    // C4 disabled from T4.
    expect(card(atWeek(3), "C4").playable).toBe(true);
    expect(card(atWeek(4), "C4").disabledReason).toEqual({ code: "bank_too_late", text: "Bank nie zdąży przed 22 grudnia" });
    // C2 disabled after C6 and vice versa (U-11), also in the following weeks.
    const afterC6 = playCard(atWeek(1), "C6");
    expect(card(afterC6, "C2").disabledReason).toEqual({ code: "invoice_financed", text: "Faktura już sfinansowana" });
    const nextWeekC6 = resolveWeek(resolveCurrentEvent(afterC6)).state;
    expect(card(nextWeekC6, "C2").disabledReason?.code).toBe("invoice_financed");
    const afterC2 = playCard(atWeek(1), "C2");
    expect(card(afterC2, "C6").disabledReason).toEqual({ code: "invoice_paid", text: "Faktura już opłacona" });
    expect(card(resolveWeek(resolveCurrentEvent(afterC2)).state, "C6").disabledReason?.code).toBe("invoice_paid");
    // Any card disabled after being played.
    const nextWeek = resolveWeek(resolveCurrentEvent(playCard(atWeek(1), "C3"))).state;
    expect(card(nextWeek, "C3").disabledReason).toEqual({ code: "already_played", text: "Już zagrana w tym okrążeniu" });
    expect(() => playCard(nextWeek, "C3")).toThrow(RuleError);
    // One action per week.
    expect(card(afterC6, "C1").disabledReason?.code).toBe("week_action_used");
    expect(() => playCard(afterC6, "C1")).toThrow(RuleError);
    // C5 playable in T5 (L08 on 22 XII not yet booked), disabled after 22 XII.
    expect(card(atWeek(5), "C5").playable).toBe(true);
    // Reaching T6 needs a rescue; C6 in T1 keeps L08 on 22 XII.
    let t6 = playCard(atWeek(1), "C6");
    while (t6.core.week < 6) t6 = resolveWeek(resolveCurrentEvent(t6)).state;
    expect(card(t6, "C5").disabledReason?.code).toBe("payment_already_booked");
    // C3 only before T5.
    expect(card(atWeek(4), "C3").playable).toBe(true);
    expect(card(atWeek(5), "C3").playable).toBe(false);
  });

  it("ET-C16 factoring fee: round(0.015 × 20 295) = 304, payout 19 991 (D-11)", () => {
    const c6 = gameData.level1.cards.find((c) => c.id === "C6");
    if (!c6 || c6.effect.type !== "factoring") throw new Error("C6 is not a factoring card");
    expect(Math.round(c6.effect.feeRate * gameData.persona.invoices[0].gross)).toBe(304);
    expect(c6.effect.fee).toBe(304);
    expect(c6.effect.amount).toBe(19991);
    expect(c6.cost.fixed).toBe(304);
    const s = playCard(atWeek(1), "C6");
    const txs = forecast(s).points.flatMap((p) => p.transactions);
    expect(txs.find((t) => t.id === "C6")).toMatchObject({ date: "2026-11-24", amount: 19991, counterpartyId: "BANK" });
    expect(txs.some((t) => t.id === "L11")).toBe(false);
    // D-11 / D-09: labelled as a scenario assumption on synthetic data; a product, no competence.
    expect(card(createGame(), "C6")).toMatchObject({
      labels: ["Koszt: 1,5%", "Założenie scenariusza", "Dane syntetyczne"],
      cost: 304,
      isProduct: true,
      competenceId: null,
    });
  });

  it("ET-C17 avoided cost: C1 2 400 · C2 1 994 · C6 2 096 · C4 2 206 (demo seed) · C5 0", () => {
    expect(playLap({ 1: "C1" }).state.core.avoidedCost).toBe(2400);
    expect(playLap({ 1: "C2" }).state.core.avoidedCost).toBe(1994);
    expect(playLap({ 1: "C6" }).state.core.avoidedCost).toBe(2096);
    expect(playLap({ 1: "C4" }).state.core.avoidedCost).toBe(2206);
    expect(playLap({ 1: "C5" }).state.core.avoidedCost).toBe(0);
  });
});

describe("card API behaviour (E-03)", () => {
  it("previewCard never commits; a C5 preview emits loanOffered via C5_preview", () => {
    const s = atWeek(1);
    const frozen = JSON.stringify(s);
    const p = previewCard(s, "C5");
    expect(p.playable).toBe(true);
    expect(p.before.crash).not.toBeNull();
    expect(p.after.crash).toBeNull();
    expect(p.cost).toBe(2400);
    expect(p.simulated.emitted).toContainEqual({ type: "loanOffered", week: 1, via: "C5_preview" });
    expect(JSON.stringify(s)).toBe(frozen);
    expect(previewCard(s, "C6").simulated.emitted.some((e) => e.type === "loanOffered")).toBe(false);
  });

  it("previewCard of a disabled card returns its reason and an unchanged simulation", () => {
    const p = previewCard(atWeek(3), "C1");
    expect(p.playable).toBe(false);
    expect(p.disabledReason?.code).toBe("budget_closed");
    expect(p.simulated.core).toEqual(atWeek(3).core);
    expect(p.after).toEqual(p.before);
  });

  it("playCard books competence own 2, delegated 1, and emits goodMove for an own rescue", () => {
    const own = playCard(atWeek(1), "C1");
    expect(own.core.competences.luka_plynnosciowa).toBe(2);
    expect(own.emitted).toEqual([{ type: "goodMove", week: 1, cardId: "C1" }]);
    const delegated = playCard(atWeek(1), "C1", true);
    expect(delegated.core.competences.luka_plynnosciowa).toBe(1);
    expect(delegated.emitted).toEqual([]);
    expect(playCard(atWeek(1), "C3").emitted).toEqual([]);
  });

  it("delegateBestCard plays the cheapest safe card delegated; the CFO hint lists two safe options", () => {
    const s = atWeek(1);
    const hint = getCfoHint(s);
    expect(hint.risk).toMatchObject({ date: "2026-12-22", shortfall: 8095 });
    expect(hint.options).toHaveLength(2);
    expect(hint.options[0]).toEqual({ cardId: "C1", cost: 0 });
    const d = delegateBestCard(s);
    expect(d.core.played).toEqual([{ cardId: "C1", week: 1, delegated: true, cost: 0 }]);
    expect(d.core.competences.luka_plynnosciowa).toBe(1);
    expect(() => delegateBestCard(d)).toThrow(RuleError);
  });
});

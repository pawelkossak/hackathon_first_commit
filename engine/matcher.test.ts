// E-09 plan matcher and account clock cases. Expected values are copied from
// ENGINE-DATA-AND-TESTS.md §5 and §7.7 (and DEMO-REQUIREMENTS US-06, US-07), never computed by the
// engine and pasted back.
import { describe, expect, it } from "vitest";
import type { CardId, EventChoiceId, EventId, GameState, Plan, Transaction } from "./index";
import {
  RuleError,
  advanceAccountClock,
  createGame,
  createPlan,
  getCurrentEvent,
  playCard,
  resolveEvent,
  resolveWeek,
  rewind,
  savePlan,
} from "./index";
import { matchPlan } from "./matcher";

const safe: Record<EventId, EventChoiceId> = {
  E1: "check",
  E2: "decline",
  E3: "january",
  E5: "ignore",
  E6: "acknowledge",
};

/** Play the demo seed with safe choices and `plays[week]`, stopping after `untilWeek` is settled (default the whole lap). */
function play(plays: Partial<Record<number, CardId>>, untilWeek = 7, from: GameState = createGame("demo")): GameState {
  let s = from;
  while (s.core.status === "playing" && s.core.weeksResolved.length < untilWeek) {
    const ev = getCurrentEvent(s);
    if (ev) s = resolveEvent(s, safe[ev.id]);
    const card = plays[s.core.week];
    if (card) s = playCard(s, card);
    s = resolveWeek(s).state;
  }
  return s;
}

/** The C1 plan of US-06: „Zaliczka 15 000 zł ±10 % od Klienta A do 4 grudnia”. */
const c1Plan: Plan = {
  id: "plan-C1",
  cardId: "C1",
  counterpartyId: "A",
  amount: 15000,
  tolerancePct: 10,
  deadline: "2026-12-04",
  direction: "inflow",
  title: "Zaliczka 15 000 zł ±10 % od Klienta A do 4 grudnia",
  status: "open",
  savedAt: "2026-11-21",
};

function tx(date: string, amount: number, counterpartyId: Transaction["counterpartyId"]): Transaction {
  return { id: "T", date, amount, counterpartyId, title: "test", source: "card", kind: null, cardId: null, eventId: null };
}

function errorCode(fn: () => unknown): string | null {
  try {
    fn();
  } catch (e) {
    return e instanceof RuleError ? e.code : "not a RuleError";
  }
  return null;
}

describe("plan matcher and account clock (E-09)", () => {
  it("ET-M01 C1 path, plan saved, account clock +2 weeks → 5 XII, balance 56 080, plan met, Luka płynnościowa 3", () => {
    const won = play({ 1: "C1" });
    const saved = savePlan(won, "C1");
    expect(saved.core.competences.luka_plynnosciowa).toBe(2);
    const after = advanceAccountClock(saved);
    expect(after.account.clock).toBe("2026-12-05");
    expect(after.account.balance).toBe(56080);
    expect(after.account.plans).toHaveLength(1);
    expect(after.account.plans[0].status).toBe("met");
    expect(after.account.plans[0].title).toBe("Zaliczka 15 000 zł ±10 % od Klienta A do 4 grudnia");
    // ET-S05 „3 after validation” through the account clock, not only the helper.
    expect(after.core.competences.luka_plynnosciowa).toBe(3);
    expect(after.core.competences.bezpieczne_platnosci).toBe(2);
    expect(after.emitted).toEqual([{ type: "planValidated", week: 7, planId: "plan-C1" }]);
    expect(after.account.matchedTx.map((t) => [t.date, t.amount, t.counterpartyId])).toEqual([
      ["2026-11-25", -4300, "US"],
      ["2026-11-30", 7380, "C"],
      ["2026-12-03", 15000, "A"],
    ]);
  });

  it("ET-M02 matcher: 13 600 from Klient A on 3 XII → met (±10 %); 13 000 → ask; 15 000 on 5 XII → missed; 15 000 from Klient B → ask", () => {
    const clock = "2026-12-05";
    expect(matchPlan(c1Plan, [tx("2026-12-03", 13600, "A")], clock)).toBe("met");
    expect(matchPlan(c1Plan, [tx("2026-12-03", 13000, "A")], clock)).toBe("ask");
    expect(matchPlan(c1Plan, [tx("2026-12-05", 15000, "A")], clock)).toBe("missed");
    expect(matchPlan(c1Plan, [tx("2026-12-03", 15000, "B")], clock)).toBe("ask");
  });

  it("ET-M03 account clock advance does not change game week, stars or unlock", () => {
    for (const s of [play({ 1: "C1" }, 2), play({ 1: "C1" }), savePlan(play({ 1: "C1" }), "C1"), play({})]) {
      const after = advanceAccountClock(s);
      expect(after.core.week).toBe(s.core.week);
      expect(after.core.status).toBe(s.core.status);
      expect(after.core.stars).toEqual(s.core.stars);
      expect(after.core.level2Unlocked).toBe(s.core.level2Unlocked);
      expect(after.snapshots).toEqual(s.snapshots);
      // Only the validated competence may differ in the core.
      expect({ ...after.core, competences: s.core.competences }).toEqual(s.core);
    }
    // The game clock never moves the account clock.
    let s = advanceAccountClock(play({ 1: "C1" }, 1), "2026-11-30");
    const account = s.account;
    s = play({}, 7, s);
    expect(s.core.status).toBe("completed");
    expect(s.account).toEqual(account);
  });

  it("§5 without C1 the account reaches 41 080 and the C1 plan is missed (variant B offered)", () => {
    const after = advanceAccountClock(play({}));
    expect(after.account.balance).toBe(41080);
    expect(after.account.matchedTx.map((t) => t.id)).toEqual(["L01", "L02"]);
    expect(matchPlan(c1Plan, after.account.matchedTx, after.account.clock)).toBe("missed");
  });

  it("§5 plans from other cards keep status open while their deadline is after 5 XII", () => {
    const won = play({ 1: "C1", 4: "C2" });
    const saved = savePlan(savePlan(won, "C1"), "C2");
    const after = advanceAccountClock(saved);
    expect(after.account.balance).toBe(56080);
    const byCard = Object.fromEntries(after.account.plans.map((p) => [p.cardId, p.status]));
    expect(byCard).toEqual({ C1: "met", C2: "open" });
    expect(after.core.competences.koszt_pieniadza).toBe(2);
  });

  it("the C1 plan stays open before its deadline and is met once 3 XII is replayed", () => {
    const saved = savePlan(play({ 1: "C1" }), "C1");
    const early = advanceAccountClock(saved, "2026-12-02");
    expect(early.account.balance).toBe(41080);
    expect(early.account.plans[0].status).toBe("open");
    expect(early.emitted).toEqual([]);
    expect(early.core.competences.luka_plynnosciowa).toBe(2);
    const late = advanceAccountClock(early, "2026-12-05");
    expect(late.account).toEqual(advanceAccountClock(saved).account);
    expect(late.core.competences.luka_plynnosciowa).toBe(3);
    // Advancing again to the same date validates nothing twice.
    const again = advanceAccountClock(late, "2026-12-05");
    expect(again.account).toEqual(late.account);
    expect(again.emitted).toEqual([]);
  });

  it("rewind keeps the account and the met plan; a plan saved after the advance is met on the next advance", () => {
    const after = advanceAccountClock(savePlan(play({ 1: "C1" }), "C1"));
    const back = rewind(after, 1);
    expect(back.account).toEqual(after.account);
    const replayedLap = play({ 1: "C1" }, 7, back);
    expect(replayedLap.account).toEqual(after.account);
    // Advanced first, saved later: the same-date advance re-checks the plan.
    const advancedFirst = advanceAccountClock(play({ 1: "C1" }));
    expect(advancedFirst.account.balance).toBe(56080);
    const savedLater = savePlan(advancedFirst, "C1");
    expect(savedLater.account.plans[0].status).toBe("open");
    const checked = advanceAccountClock(savedLater, "2026-12-05");
    expect(checked.account.plans[0].status).toBe("met");
    expect(checked.core.competences.luka_plynnosciowa).toBe(3);
  });

  it("rejects an invalid date or one before the account clock, and never mutates its input", () => {
    const s = advanceAccountClock(createGame("demo"));
    expect(errorCode(() => advanceAccountClock(s, "2026-12-04"))).toBe("invalid_date");
    expect(errorCode(() => advanceAccountClock(s, "2026-02-30"))).toBe("invalid_date");
    const won = savePlan(play({ 1: "C1" }), "C1");
    const copy = JSON.stringify(won);
    advanceAccountClock(won);
    expect(JSON.stringify(won)).toBe(copy);
    expect(createPlan(won, "C1").status).toBe("open");
  });
});

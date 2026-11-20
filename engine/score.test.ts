// E-06 score cases: stars, competences, cost of money, avoided cost, overdraft interest.
// Expected values are copied from ENGINE-DATA-AND-TESTS.md §7.2, §7.5 and GAME-DESIGN.md §6.1,
// §6.3, §6.5, never computed by the engine and pasted back.
import { describe, expect, it } from "vitest";
import type { CardId, CompetenceId, CompetenceLevel, EventChoiceId, EventId, GameState } from "./index";
import {
  RuleError,
  advanceAccountClock,
  createGame,
  createPlan,
  forecast,
  getCfoHint,
  getCurrentEvent,
  playCard,
  previewCard,
  resolveEvent,
  resolveWeek,
  savePlan,
} from "./index";
import { awardCompetence, coreAfterValidation } from "./score";

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

function errorCode(fn: () => unknown): string | null {
  try {
    fn();
  } catch (e) {
    return e instanceof RuleError ? e.code : "not a RuleError";
  }
  return null;
}

/** Demo lap until it completes or crashes: the week's event first, then `plays[week]`. */
function playLap(plays: Plays = {}, choices: Choices = {}): GameState {
  let s = createGame("demo");
  while (s.core.status === "playing") {
    const ev = getCurrentEvent(s);
    if (ev) s = resolveEvent(s, choices[ev.id] ?? safe[ev.id]);
    const card = plays[s.core.week];
    if (card) s = playCard(s, card);
    s = resolveWeek(s).state;
  }
  return s;
}

/** Demo seed at the start of `week` (its event already resolved), with `plays` before it. */
function atWeek(week: number, plays: Plays = {}, choices: Choices = {}): GameState {
  let s = createGame("demo");
  for (;;) {
    const ev = getCurrentEvent(s);
    if (ev) s = resolveEvent(s, choices[ev.id] ?? safe[ev.id]);
    if (s.core.week >= week) return s;
    const card = plays[s.core.week];
    if (card) s = playCard(s, card);
    s = resolveWeek(s).state;
  }
}

const zero: Record<CompetenceId, CompetenceLevel> = {
  luka_plynnosciowa: 0,
  koszt_pieniadza: 0,
  bezpieczne_platnosci: 0,
};

describe("score: stars, competences, unlock (E-06, ENGINE-DATA-AND-TESTS §7.5)", () => {
  it("ET-S01 after ET-C01 lap end: Przetrwanie ✓, Tanio ✓, Pilot pending; after plan save Pilot ✓", () => {
    const lap = playLap({ 1: "C1" });
    expect(lap.core.status).toBe("completed");
    expect(lap.core.stars).toEqual({ przetrwanie: "earned", tanio: "earned", pilot: "pending" });
    const saved = savePlan(lap, "C1");
    expect(saved.core.stars).toEqual({ przetrwanie: "earned", tanio: "earned", pilot: "earned" });
    // coreAfterPlanSave changes only Pilot (and keeps the unlock).
    expect({ ...saved.core, stars: lap.core.stars }).toEqual(lap.core);
    expect(saved.account.plans.map((p) => p.cardId)).toEqual(["C1"]);
  });

  it("ET-S02 level 2 unlocked at lap end in every non-crash path; not unlocked after a crash", () => {
    const wins: [Plays, Choices][] = [
      [{ 1: "C1" }, {}],
      [{ 2: "C1" }, {}],
      [{ 1: "C2" }, {}],
      [{ 4: "C2" }, {}],
      [{ 1: "C4" }, {}],
      [{ 1: "C5" }, {}],
      [{ 5: "C5" }, {}],
      [{ 1: "C6" }, {}],
      [{ 4: "C6" }, {}],
      [{ 5: "C6" }, {}],
      [{ 1: "C1", 4: "C2" }, {}],
      [{ 1: "C1", 4: "C6" }, {}],
      [{ 1: "C1", 4: "C2" }, { E2: "accept" }],
      [{ 1: "C1", 4: "C6" }, { E2: "accept" }],
      [{ 1: "C1", 3: "C4" }, { E2: "accept" }],
      [{ 1: "C1", 3: "C3" }, {}],
      [{ 1: "C1", 5: "C5" }, {}],
      [{ 1: "C1" }, { E3: "now" }],
    ];
    for (const [plays, choices] of wins) {
      const lap = playLap(plays, choices);
      expect(lap.core.status, JSON.stringify(plays)).toBe("completed");
      expect(lap.core.level2Unlocked, JSON.stringify(plays)).toBe(true);
    }
    const crashes: [Plays, Choices][] = [
      [{}, {}],
      [{ 1: "C3" }, {}],
      [{ 5: "C2" }, {}],
      [{ 1: "C1" }, { E1: "pay_as_is" }],
      [{ 1: "C1" }, { E2: "accept" }],
    ];
    for (const [plays, choices] of crashes) {
      const lap = playLap(plays, choices);
      expect(lap.core.status, JSON.stringify(plays)).toBe("crashed");
      expect(lap.core.level2Unlocked, JSON.stringify(plays)).toBe(false);
      expect(lap.core.stars).toEqual({ przetrwanie: "missed", tanio: "missed", pilot: "missed" });
    }
  });

  it("ET-S03 C4, C5, C6 never change any competence", () => {
    const windows: Record<"C4" | "C5" | "C6", number[]> = { C4: [1, 2, 3], C5: [1, 2, 3, 4, 5], C6: [1, 2, 3, 4, 5] };
    for (const [id, weeks] of Object.entries(windows) as ["C4" | "C5" | "C6", number[]][]) {
      for (const week of weeks) {
        const s = atWeek(week);
        for (const delegated of [false, true]) {
          expect(playCard(s, id, delegated).core.competences, `${id} T${week}`).toEqual(s.core.competences);
        }
      }
      // A whole lap with only the product: competences as with no card at all (E1 check only).
      expect(playLap({ 1: id }).core.competences).toEqual({ ...zero, bezpieczne_platnosci: 2 });
      expect(coreAfterValidation(playLap({ 1: id }).core, id).competences).toEqual({ ...zero, bezpieczne_platnosci: 2 });
    }
  });

  it("ET-S04 competence never exceeds 3; repeated awards keep the maximum", () => {
    expect(awardCompetence(zero, "luka_plynnosciowa", 5).luka_plynnosciowa).toBe(3);
    const two = awardCompetence(zero, "koszt_pieniadza", 2);
    expect(awardCompetence(two, "koszt_pieniadza", 1).koszt_pieniadza).toBe(2);
    const three = awardCompetence(two, "koszt_pieniadza", 3);
    expect(awardCompetence(three, "koszt_pieniadza", 2).koszt_pieniadza).toBe(3);
    expect(awardCompetence(three, "koszt_pieniadza", 3).koszt_pieniadza).toBe(3);
    expect(zero.koszt_pieniadza).toBe(0);
    // Through the engine: C1 and C3 both award Luka płynnościowa.
    const ownThenDelegated = playCard(resolveWeek(playCard(atWeek(1), "C1")).state, "C3", true);
    expect(ownThenDelegated.core.competences.luka_plynnosciowa).toBe(2);
    const delegatedThenOwn = playCard(resolveWeek(playCard(atWeek(1), "C1", true)).state, "C3");
    expect(delegatedThenOwn.core.competences.luka_plynnosciowa).toBe(2);
    // Validation is milestone 3; validating again keeps 3.
    const lap = playLap({ 1: "C1", 3: "C3" });
    const validated = coreAfterValidation(coreAfterValidation(lap.core, "C1"), "C3");
    expect(validated.competences.luka_plynnosciowa).toBe(3);
  });

  it("ET-S05 demo path: Bezpieczne płatności 2, Luka płynnościowa 2 at lap end, 3 after validation", () => {
    const lap = playLap({ 1: "C1" });
    expect(lap.core.competences).toEqual({ ...zero, bezpieczne_platnosci: 2, luka_plynnosciowa: 2 });
    const saved = savePlan(lap, "C1");
    expect(saved.core.competences).toEqual(lap.core.competences);
    const validated = coreAfterValidation(saved.core, "C1");
    expect(validated.competences).toEqual({ ...zero, bezpieczne_platnosci: 2, luka_plynnosciowa: 3 });
    // Validation only raises a competence: stars and unlock stay.
    expect(validated.stars).toEqual(saved.core.stars);
    expect(validated.level2Unlocked).toBe(true);
    // E-09: the same step through the account clock (plan met on 5 XII).
    const onAccount = advanceAccountClock(saved);
    expect(onAccount.core.competences).toEqual(validated.competences);
    expect(onAccount.core.stars).toEqual(saved.core.stars);
  });

  it("U-4 overdraft cost ≈ 194 zł in the demo seed (44 interest + 150), avoided 2 206, Tanio ✓, Pilot ✗", () => {
    const lap = playLap({ 1: "C4" });
    expect(forecast(lap).overdraftInterest).toBe(44);
    expect(lap.core.costOfMoney).toBe(194);
    expect(lap.core.avoidedCost).toBe(2206);
    expect(lap.core.stars).toEqual({ przetrwanie: "earned", tanio: "earned", pilot: "missed" });
  });

  it("cost of money and avoided cost at lap end: advance 0 / 2 400, discount 406 / 1 994, factoring 304 / 2 096, loan 2 400 / 0", () => {
    const cases: [CardId, number, number][] = [
      ["C1", 0, 2400],
      ["C2", 406, 1994],
      ["C6", 304, 2096],
      ["C5", 2400, 0],
    ];
    for (const [id, cost, avoided] of cases) {
      const lap = playLap({ 1: id });
      expect(lap.core.costOfMoney, id).toBe(cost);
      expect(lap.core.avoidedCost, id).toBe(avoided);
    }
    expect(playLap({ 1: "C5" }).core.stars).toEqual({ przetrwanie: "earned", tanio: "missed", pilot: "pending" });
  });
});

describe("QA fix: the fraud stays hidden until the 23 XII reveal (E-06)", () => {
  it("after „Zapłać jak jest” in T1 the default forecast, preview and CFO hint do not show the 8 I re-payment", () => {
    const s = resolveEvent(createGame("demo"), "pay_as_is");
    const ids = (st: GameState) => forecast(st).points.flatMap((p) => p.transactions).map((t) => t.id);
    expect(ids(s)).not.toContain("E1");
    expect(forecast(s).crash).toMatchObject({ date: "2026-12-22", transactionId: "L08", shortfall: 8095 });
    const withC1 = playCard(s, "C1");
    expect(forecast(withC1).crash).toBeNull();
    expect(ids(withC1)).not.toContain("E1");
    expect(previewCard(s, "C1").after.crash).toBeNull();
    expect(getCfoHint(withC1).risk).toBeNull();
    expect(getCfoHint(s).risk?.transactionId).toBe("L08");
    // Still hidden at the start of T5 (21 XII), the week of the reveal.
    const t5 = atWeek(5, { 1: "C1" }, { E1: "pay_as_is" });
    expect(ids(t5)).not.toContain("E1");
    expect(getCfoHint(t5).risk).toBeNull();
  });

  it("from T6 (after 23 XII) the forecast and the CFO hint name the 8 I crash at E1, short 25 715", () => {
    const t6 = atWeek(6, { 1: "C1" }, { E1: "pay_as_is" });
    expect(forecast(t6).crash).toMatchObject({ date: "2027-01-08", transactionId: "E1", shortfall: 25715 });
    expect(getCfoHint(t6).risk).toMatchObject({ date: "2027-01-08", transactionId: "E1", shortfall: 25715 });
  });

  it("resolveWeek still settles the true ledger: crash 8 I at E1, short 25 715 (ET-E02)", () => {
    const lap = playLap({ 1: "C1" }, { E1: "pay_as_is" });
    expect(lap.core.status).toBe("crashed");
    expect(lap.core.crash).toMatchObject({ date: "2027-01-08", transactionId: "E1", shortfall: 25715 });
  });
});

describe("QA fix: only a winning decision becomes the plan (E-06)", () => {
  it("createPlan and savePlan reject a running lap, a crashed lap and a card not played in the winning lap", () => {
    const running = playCard(atWeek(1), "C1");
    const crashed = playLap({ 1: "C3" });
    const crashedFraud = playLap({ 1: "C1" }, { E1: "pay_as_is" });
    const won = playLap({ 1: "C1" });
    for (const fn of [createPlan, savePlan]) {
      expect(errorCode(() => fn(running, "C1"))).toBe("plan_not_allowed");
      expect(errorCode(() => fn(crashed, "C3"))).toBe("plan_not_allowed");
      expect(errorCode(() => fn(crashedFraud, "C1"))).toBe("plan_not_allowed");
      expect(errorCode(() => fn(won, "C2"))).toBe("plan_not_allowed");
      expect(errorCode(() => fn(won, "C1"))).toBeNull();
    }
    expect(createPlan(won, "C1")).toMatchObject({ cardId: "C1", status: "open", savedAt: null });
  });
});

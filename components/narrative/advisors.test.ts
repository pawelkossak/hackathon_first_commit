// N-09: the advisors render only engine values. Spec values (DECISIONS.md D-17, GAME-DESIGN §1 card costs)
// are literals here and compared with what the view models built from the engine API return.
import { describe, expect, it } from "vitest";
import {
  createGame,
  gameData,
  getCurrentEvent,
  resolveEvent,
  resolveWeek,
  type EventChoiceId,
  type EventId,
  type GameState,
} from "../../engine";
import { bankAdvisorView, cfoView } from "./advisor-views";

const safe: Record<EventId, EventChoiceId> = { E1: "check", E2: "decline", E3: "january", E5: "ignore", E6: "acknowledge" };

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

describe("N-09 AI-CFO G15 and bank advisor G16", () => {
  it("test: hint shows 2 options with engine cost — T1 [C1 0 zł, C2 406 zł], no product", () => {
    const view = cfoView(atWeek(1));
    expect(view.risk).not.toBeNull();
    expect(view.options.map((o) => [o.cardId, o.cost])).toEqual([
      ["C1", 0],
      ["C2", 406],
    ]);
    expect(view.options.some((o) => o.isProduct)).toBe(false);
    expect(view.options.some((o) => o.cardId === "C3")).toBe(false);
    expect(view.options[0].title).toBe("Poproś o zaliczkę");
  });

  it("D-17: a product only as the last resort — T5 [C6 304 zł, C5 2 400 zł]", () => {
    const view = cfoView(atWeek(5));
    expect(view.options.map((o) => [o.cardId, o.cost])).toEqual([
      ["C6", 304],
      ["C5", 2400],
    ]);
    expect(view.options.every((o) => o.isProduct)).toBe(true);
  });

  it("delegation level comes from data/agents.json", () => {
    expect(cfoView(atWeek(1)).delegatedCompetenceLevel).toBe(1);
  });

  it("bank view: C4 limit 15 000 zł and cost 194 zł in T1, engine reason bank_too_late from T4", () => {
    const t1 = bankAdvisorView(atWeek(1)).overdraft;
    expect(t1.playable).toBe(true);
    expect(t1.limit).toBe(15000);
    expect(t1.cost).toBe(194);
    expect(t1.costIsEstimate).toBe(true);

    const t4 = bankAdvisorView(atWeek(4)).overdraft;
    expect(t4.playable).toBe(false);
    expect(t4.disabledReason?.code).toBe("bank_too_late");
    expect(t4.limit).toBeNull();
  });

  it("loan view: 15 000 zł now, 17 400 zł back on 20 I, cost 2 400 zł — all from the engine", () => {
    const loan = bankAdvisorView(atWeek(1)).loan;
    expect(loan.payout?.amount).toBe(15000);
    expect(loan.repayment).toEqual({ amount: 17400, date: "2027-01-20" });
    expect(loan.cost).toBe(2400);
  });

  it("test: loan is a non-bank SMS and never offered by the bank advisor", () => {
    expect(gameData.agents.bank.neverOffers).toContain("C5");
    const lender = gameData.persona.counterparties.find((cp) => cp.type === "non_bank_lender");
    expect(lender?.note).toContain("pożyczka SMS, nigdy bank");
    const loanCard = gameData.level1.cards.find((c) => c.id === "C5");
    expect(loanCard?.effect.type).toBe("loan");
    if (loanCard?.effect.type === "loan") expect(loanCard.effect.counterpartyId).toBe("N");
  });
});

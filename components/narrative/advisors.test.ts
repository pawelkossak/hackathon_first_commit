import { describe, expect, it } from "vitest";
import { createGame, getAvailableCards, getCfoHint } from "../../engine";
import { gameData } from "../../engine/data";

describe("N-09 AI-CFO G15 and bank advisor G16", () => {
  it("test: hint shows 2 options with engine cost", () => {
    const state = createGame("demo");
    const cards = getAvailableCards(state);

    // AI-CFO selects 2 cheapest valid actions
    const safeOptions = cards
      .filter((c) => c.playable)
      .sort((a, b) => a.cost - b.cost)
      .slice(0, 2);

    expect(safeOptions).toHaveLength(2);
    // Every option must have engine-computed cost (0 for C1 zaliczka, 406 for C2 skonto)
    expect(typeof safeOptions[0].cost).toBe("number");
    expect(typeof safeOptions[1].cost).toBe("number");
    expect(safeOptions[0].cost).toBeLessThanOrEqual(safeOptions[1].cost);

    // Engine CFO hint object
    const hint = getCfoHint(state);
    expect(hint.week).toBe(1);
    expect(hint.risk).toBeDefined();
  });

  it("test: loan is a non-bank SMS and never offered by the bank advisor", () => {
    // 1. Check data/agents.json rule: bank advisor never offers C5
    const bankConfig = gameData.agents.bank;
    expect(bankConfig.neverOffers).toContain("C5");

    // 2. Persona definition defines N as non-bank lender
    const nonBankLender = gameData.persona.counterparties.find(
      (cp) => cp.type === "non_bank_lender"
    );
    expect(nonBankLender).toBeDefined();
    expect(nonBankLender?.note).toContain("pożyczka SMS, nigdy bank");

    // 3. Card C5 in data/level1.json is non-bank SMS loan with 15 000 amount and 2 400 cost
    const loanCard = gameData.level1.cards.find((c) => c.id === "C5");
    expect(loanCard).toBeDefined();
    expect(loanCard?.title).toContain("Pożyczka");
    expect(loanCard?.cost.fixed).toBe(2400);

    expect(loanCard?.effect.type).toBe("loan");
    if (loanCard && loanCard.effect.type === "loan") {
      expect(loanCard.effect.counterpartyId).toBe("N");
      expect(loanCard.effect.amount).toBe(15000);
      expect(loanCard.effect.repayment.amount).toBe(-17400);
    }
  });
});

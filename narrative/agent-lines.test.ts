// N-01 / N-06: every line id and disabled-reason code the engine can return has seed copy in all 4 variants
// (PL and EN), and agent lines bind only engine numbers.
import { describe, expect, it } from "vitest";
import { createGame, gameData, negotiate, type DisabledReasonCode } from "../engine";
import {
  agentLineBindings,
  agentLineIds,
  agentLineText,
  disabledReasonText,
  fallbackLineId,
  SEED_COPY,
  SEED_COPY_EN,
  VARIANT_KEYS,
} from "./index";

/** Every DisabledReasonCode of engine/types.ts; `satisfies` fails the typecheck when the engine adds one. */
const REASON_CODES = {
  not_playing: true,
  event_unresolved: true,
  week_action_used: true,
  already_played: true,
  outside_window: true,
  budget_closed: true,
  bank_too_late: true,
  invoice_financed: true,
  invoice_paid: true,
  payment_already_booked: true,
  overdraft_active: true,
} as const satisfies Record<DisabledReasonCode, true>;

const ENGINE_LINE_IDS = [
  ...agentLineIds("klient_a"),
  ...agentLineIds("bank"),
  ...gameData.reactions.reactions.flatMap((r) => r.steps.map((s) => s.lineIdPrefix)),
  ...Object.keys(REASON_CODES).map((code) => `card.disabled.${code}`),
];

describe("N-01 seed copy covers every engine line id", () => {
  it("lists the line ids of E-08 and D-18", () => {
    for (const id of [
      "rx.fraud",
      "a.advance.accept",
      "a.advance.counter",
      "a.advance.closed",
      "a.discount.accept",
      "a.rude",
      "a.fallback",
      "bank.od.offer",
      "bank.od.late",
      "bank.od.notneeded",
      "bank.fallback",
    ]) {
      expect(ENGINE_LINE_IDS).toContain(id);
    }
    expect(Object.keys(REASON_CODES)).toHaveLength(11);
  });

  it("every engine line id exists in all 4 variants, PL and EN, without a typed-in digit", () => {
    for (const id of ENGINE_LINE_IDS) {
      for (const deck of [SEED_COPY, SEED_COPY_EN]) {
        const entry = deck[id];
        expect(entry, id).toBeDefined();
        for (const variant of VARIANT_KEYS) {
          expect(entry[variant].length, `${id} ${variant}`).toBeGreaterThan(0);
          // Numbers come in as bindings, never typed into the template.
          expect(entry[variant].replace(/\{[^{}]+\}/g, ""), `${id} ${variant}`).not.toMatch(/\d/);
        }
      }
    }
  });

  it("disabled reasons: the engine text where it has one, else card.disabled.<code>", () => {
    expect(disabledReasonText({ code: "invoice_paid", text: "Faktura już opłacona" })).toBe("Faktura już opłacona");
    expect(disabledReasonText({ code: "outside_window", text: null })).toBe(
      SEED_COPY["card.disabled.outside_window"]["player-female_narrator-female"]
    );
    for (const code of Object.keys(REASON_CODES)) {
      expect(disabledReasonText({ code: code as DisabledReasonCode, text: null }).length).toBeGreaterThan(0);
      expect(disabledReasonText({ code: code as DisabledReasonCode, text: null }, "male", "male", "en").length).toBeGreaterThan(0);
    }
  });
});

describe("N-06 agent lines bind engine numbers", () => {
  it("the counter binds percent, amount and date from the engine; each is in result.numbers", () => {
    const s = createGame("demo");
    const r = negotiate(s, "klient_a", "ask_advance", 50);
    expect(agentLineBindings(s, r)).toEqual({
      "deal.percent": "30%",
      "deal.cost": "0 zł",
      "deal.amount": "15\u00a0000 zł",
      "deal.date": "3 grudnia",
    });
    expect(r.numbers).toEqual(expect.arrayContaining([30, 15000, 3]));
    expect(agentLineText(s, r)).toBe("Mogę dać 30% — 15\u00a0000 zł do 3 grudnia.");
  });

  it("the bank offer binds the engine limit and C4 cost", () => {
    const s = createGame("demo");
    const r = negotiate(s, "bank", "ask_overdraft");
    const b = agentLineBindings(s, r);
    expect(b["deal.limit"]).toBe("15\u00a0000 zł");
    expect(b["deal.cost"]).toBe("194 zł");
    expect(r.numbers).toEqual(expect.arrayContaining([15000, 194]));
  });

  it("the fallback line of each agent comes from data/agents.json", () => {
    expect(fallbackLineId("klient_a")).toBe("a.fallback");
    expect(fallbackLineId("bank")).toBe("bank.fallback");
  });
});

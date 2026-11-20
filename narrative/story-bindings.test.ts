// Round 2: the older seed lines that spelled numbers out in words now bind engine values (storyBindings).
import { describe, expect, it } from "vitest";
import { createGame, gameData, getAvailableCards } from "../engine";
import { SEED_COPY, SEED_COPY_EN, VARIANT_KEYS, formatDayMonth, formatPln, getCopy, storyBindings } from "./index";

const STORY_KEYS = [
  "event.account",
  "advance.confirmed",
  "event.order",
  "event.order.body",
  "event.tool",
  "event.tool.body",
  "event.late.body",
  "loan.repayment",
  "loan.cost",
  "factoring.fee",
  "factoring.receipt",
  "card.overdraft.body",
  "card.overdraft.cost",
  "g11.body",
  "g16.repay",
  "g16.cost",
  "g29.fee",
  "g29.receipt",
] as const;

// Polish and English number words that the old lines typed out („trzydzieści pięć tysięcy”, „five”…).
const NUMBER_WORDS =
  /\b(jeden|dwa|trzy|cztery|pięć|sześć|siedem|osiem|dziewięć|dziesięć|naście|dzieści|sto|stu|set|tysiąc|tysiące|tysięcy|trzeciego|czternastego|dwudziestego|one|two|three|four|five|six|seven|eight|nine|hundred|thousand)\b/i;

describe("Round 2: story seed lines bind engine numbers", () => {
  it.each(STORY_KEYS)("%s has no digit and no number word in any variant or locale", (key) => {
    for (const registry of [SEED_COPY, SEED_COPY_EN]) {
      for (const variant of VARIANT_KEYS) {
        const text = registry[key][variant];
        expect(text, `${key} ${variant}`).not.toMatch(/\d/);
        expect(text, `${key} ${variant}`).not.toMatch(NUMBER_WORDS);
      }
    }
  });

  it.each(STORY_KEYS)("%s resolves with storyBindings in PL and EN, 4 variants", (key) => {
    const state = createGame("demo");
    for (const locale of ["pl", "en"] as const) {
      const bindings = storyBindings(state, locale);
      for (const p of ["female", "male"] as const) {
        for (const n of ["female", "male"] as const) {
          expect(() => getCopy(key, state, p, n, bindings, locale)).not.toThrow();
        }
      }
    }
  });

  it("the bound values are the engine's (data via engine/index.ts, costs via getAvailableCards)", () => {
    const state = createGame("demo");
    const b = storyBindings(state, "pl");
    const l08 = gameData.persona.ledger.find((l) => l.id === "L08");
    expect(l08).toBeDefined();
    expect(b["supplier.amount"]).toBe(formatPln(Math.abs(l08?.amount ?? 0)));
    const c4 = getAvailableCards(state).find((c) => c.id === "C4");
    expect(b["overdraft.costEstimate"]).toBe(formatPln(c4?.cost ?? -1));

    const text = (k: string) => getCopy(k, state, "female", "female", b, "pl").replace(/ /g, " ");
    expect(text("event.account")).toBe("Faktura na 35 700 zł ma inny numer konta niż zwykle.");
    expect(text("advance.confirmed")).toBe("Mamy zaliczkę! 15 000 zł do 3 grudnia. Teraz to jest kurs!");
    expect(text("loan.repayment")).toBe("15 000 zł teraz. 17 400 zł do oddania do 20 stycznia.");
    const c5 = getAvailableCards(state).find((c) => c.id === "C5");
    expect(text("loan.cost")).toContain(formatPln(c5?.cost ?? -1).replace(/ /g, " "));
    expect(text("event.late.body")).toContain(`z ${formatDayMonth("2027-01-08")} na ${formatDayMonth("2027-01-22")}`);
    expect(text("factoring.fee")).toBe("Koszt scenariusza: 304 zł");
    expect(text("factoring.receipt")).toBe("Wpływ: 19 991 zł");
  });
});

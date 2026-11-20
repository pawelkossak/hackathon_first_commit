import { describe, expect, it } from "vitest";
import {
  MissingBindingError,
  UnknownCopyKeyError,
  VARIANT_KEYS,
  getCopy,
  getVoiceScript,
  toVariantKey,
  SEED_COPY,
  SEED_COPY_EN,
  setLocale,
  getLocale,
} from "../index";
import { createGame } from "../../engine";

describe("N-01 Strings module and seed copy", () => {
  it("every seed key exists in all 4 variants as a non-empty string (PL)", () => {
    const keys = Object.keys(SEED_COPY);
    expect(keys.length).toBeGreaterThanOrEqual(100);

    for (const key of keys) {
      const entry = SEED_COPY[key];
      expect(entry, `Entry for key "${key}" must exist`).toBeDefined();

      for (const variant of VARIANT_KEYS) {
        const text = entry[variant];
        expect(
          typeof text === "string" && text.length > 0,
          `Key "${key}" must have a non-empty string for variant "${variant}"`
        ).toBe(true);
      }
    }
  });

  it("every seed key exists in all 4 variants as a non-empty string (EN)", () => {
    const keys = Object.keys(SEED_COPY_EN);
    expect(keys.length).toBe(Object.keys(SEED_COPY).length);

    for (const key of keys) {
      const entry = SEED_COPY_EN[key];
      expect(entry, `EN entry for key "${key}" must exist`).toBeDefined();

      for (const variant of VARIANT_KEYS) {
        const text = entry[variant];
        expect(
          typeof text === "string" && text.length > 0,
          `Key "${key}" must have a non-empty EN string for variant "${variant}"`
        ).toBe(true);
      }
    }
  });

  it("a missing binding fails explicitly with MissingBindingError", () => {
    // ui.hud.week requires {week}
    expect(() => getCopy("ui.hud.week")).toThrowError(MissingBindingError);

    // ui.hud.runway requires {days}
    expect(() => getCopy("ui.hud.runway")).toThrowError(MissingBindingError);

    try {
      getCopy("ui.hud.week");
    } catch (err) {
      expect(err).toBeInstanceOf(MissingBindingError);
      const bindingErr = err as MissingBindingError;
      expect(bindingErr.placeholder).toBe("week");
      expect(bindingErr.copyKey).toBe("ui.hud.week");
    }
  });

  it("an unknown copy key fails explicitly with UnknownCopyKeyError", () => {
    expect(() => getCopy("nonexistent.key.12345")).toThrowError(UnknownCopyKeyError);
  });

  it("resolves bindings successfully from state and extra", () => {
    const state = createGame("demo");
    const resolvedWeek = getCopy("ui.hud.week", state);
    expect(resolvedWeek).toBe(`Tydzień ${state.core.week}`);

    const resolvedRunway = getCopy("ui.hud.runway", state, "female", "female", {
      days: 42,
    });
    expect(resolvedRunway).toBe("Runway: 42 dni");
  });

  it("supports English locale with proper formatting and grammar tokens", () => {
    const state = createGame("demo");

    // Explicit locale parameter
    const enWeek = getCopy("ui.hud.week", state, "female", "female", undefined, "en");
    expect(enWeek).toBe(`Week ${state.core.week}`);

    const enRunway = getCopy("ui.hud.runway", state, "female", "female", { days: 42 }, "en");
    expect(enRunway).toBe("Runway: 42 days");

    const enIntro = getCopy("intro.owner", state, "female", "female", undefined, "en");
    expect(enIntro).toContain("I am Ania and I run this studio");

    // Global setLocale
    setLocale("en");
    expect(getLocale()).toBe("en");
    expect(getCopy("ui.intro.skip")).toBe("Skip intro");
    expect(getCopy("ui.character_select.play")).toBe("Play!");

    // Reset back to PL
    setLocale("pl");
    expect(getLocale()).toBe("pl");
    expect(getCopy("ui.intro.skip")).toBe("Pomiń intro");
  });

  it("differentiates player and narrator gender variants in copy and voice scripts", () => {
    // Check narrator gender difference
    const szefowaRole = getCopy("intro.role", undefined, "female", "female");
    const szefRole = getCopy("intro.role", undefined, "female", "male");
    expect(szefowaRole).toContain("Zaprosiłam");
    expect(szefRole).toContain("Zaprosiłem");

    // Check player gender difference
    const playerFemalePraise = getCopy("move.praise", undefined, "female", "female");
    const playerMalePraise = getCopy("move.praise", undefined, "male", "female");
    expect(playerFemalePraise).toContain("Poradziłaś");
    expect(playerMalePraise).toContain("Poradziłeś");

    // Check voice script lookup across 4 variants
    const scriptFF = getVoiceScript("intro.owner", "female", "female");
    const scriptFM = getVoiceScript("intro.owner", "female", "male");
    expect(scriptFF?.variant).toBe("player-female_narrator-female");
    expect(scriptFM?.variant).toBe("player-female_narrator-male");
    expect(scriptFF?.text).toContain("Jestem Ania");
    expect(scriptFM?.text).toContain("Jestem właścicielem");
  });

  it("toVariantKey covers all four valid permutations", () => {
    expect(toVariantKey("female", "female")).toBe("player-female_narrator-female");
    expect(toVariantKey("male", "female")).toBe("player-male_narrator-female");
    expect(toVariantKey("female", "male")).toBe("player-female_narrator-male");
    expect(toVariantKey("male", "male")).toBe("player-male_narrator-male");
  });
});

import { describe, expect, it } from "vitest";
import { createGame } from "../../engine";
import {
  applyGuardrailOrFallback,
  collectEngineNumbers,
  extractNumbers,
  validateNumberGuardrail,
} from "./index";

describe("N-02 Number guardrail for generated text", () => {
  it("extracts integers, formatted numbers, floats and percentages correctly", () => {
    const text = "Saldo to 38 000 zł, deficyt wynosi -8 095 zł, a prowizja to 1.5% przy 30% zaliczki.";
    const numbers = extractNumbers(text);
    expect(numbers).toContain(38000);
    expect(numbers).toContain(-8095);
    expect(numbers).toContain(1.5);
    expect(numbers).toContain(30);
  });

  it("test: a sentence with a number not from the engine is rejected", () => {
    const state = createGame("demo");
    const allowed = collectEngineNumbers(state);

    // 999 999 is definitely not in the engine scenario
    const hallucinatedText = "Proponuję zapłatę 999 999 zł za ten projekt.";
    const result = validateNumberGuardrail(hallucinatedText, allowed);

    expect(result.valid).toBe(false);
    expect(result.unauthorizedNumbers).toContain(999999);
  });

  it("accepts a sentence containing only engine-approved numbers", () => {
    const state = createGame("demo");
    const allowed = collectEngineNumbers(state);

    // Initial balance is 38 000 and major supplier is 35 700
    const validText = "Na koncie mamy 38 000 zł, a podwykonawcy czekają na 35 700 zł.";
    const result = validateNumberGuardrail(validText, allowed);

    expect(result.valid).toBe(true);
    expect(result.unauthorizedNumbers).toHaveLength(0);
  });

  it("accepts a text with no numbers", () => {
    const state = createGame("demo");
    const allowed = collectEngineNumbers(state);

    const textWithoutNumbers = "Dziękuję za współpracę. Przelew zostanie zrealizowany zgodnie z ustaleniami.";
    const result = validateNumberGuardrail(textWithoutNumbers, allowed);

    expect(result.valid).toBe(true);
    expect(result.extractedNumbers).toHaveLength(0);
  });

  it("applies fallback text when guardrail rejects unauthorized numbers", () => {
    const state = createGame("demo");
    const allowed = collectEngineNumbers(state);

    const candidate = "Zgadzam się na 123 456 zł zaliczki.";
    const fallback = "Zaproponuj 30% zaliczki albo skonto.";

    const output = applyGuardrailOrFallback(candidate, allowed, fallback);
    expect(output).toBe(fallback);

    // If candidate has valid engine numbers, it is accepted
    const validCandidate = "Proponuję zaliczkę 30% na poczet zlecenia.";
    const validOutput = applyGuardrailOrFallback(validCandidate, allowed, fallback, {
      // allow 30
    });
    // If 30 is in allowed (day 30 or extra), it is accepted
    expect(allowed.has(30)).toBe(true);
    expect(validOutput).toBe(validCandidate);
  });
});

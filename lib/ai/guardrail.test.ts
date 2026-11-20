import { describe, expect, it } from "vitest";
import { createGame, forecast, negotiate } from "../../engine";
import {
  applyGuardrailOrFallback,
  collectEngineNumbers,
  eventNumbers,
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
    const fallback = "Zaproponuj zaliczkę albo skonto.";

    expect(applyGuardrailOrFallback("Zgadzam się na 123 456 zł zaliczki.", allowed, fallback)).toBe(fallback);
    const valid = "Na koncie mamy 38 000 zł.";
    expect(applyGuardrailOrFallback(valid, allowed, fallback)).toBe(valid);
  });

  it("allows no number by default: no day range, no month or year constants", () => {
    const state = createGame("demo");
    const allowed = collectEngineNumbers(state);
    // Not stated by the engine for the demo start: no transaction, balance or cost uses them.
    for (const n of [2, 4, 5, 13, 16, 31, 2025]) expect(allowed.has(n), String(n)).toBe(false);
    expect(validateNumberGuardrail("Zapłać 5% do 13 grudnia.", allowed).valid).toBe(false);
  });

  it("a date part is allowed only when an engine date has it (28 XII is the forecast minimum)", () => {
    const state = createGame("demo");
    const fc = forecast(state);
    const allowed = collectEngineNumbers(state);
    const [, month, day] = fc.minimum.date.split("-").map(Number);
    expect(allowed.has(day)).toBe(true);
    expect(allowed.has(month)).toBe(true);
    expect(validateNumberGuardrail(`Burza ${day} grudnia.`, allowed).valid).toBe(true);
  });

  it('test: "28" not from the engine is rejected (negotiation numbers only)', () => {
    const result = negotiate(createGame("demo"), "klient_a", "ask_advance", 50);
    expect(result.counterPercent).toBe(30);
    const allowed = new Set(result.numbers);
    expect(validateNumberGuardrail("Mogę dać 30% — 15 000 zł do 3 grudnia.", allowed).valid).toBe(true);
    const wrong = validateNumberGuardrail("Mogę dać 30% — 15 000 zł do 28 grudnia.", allowed);
    expect(wrong.valid).toBe(false);
    expect(wrong.unauthorizedNumbers).toEqual([28]);
  });

  it('test: "30%" not from the engine is rejected (bank offer numbers only)', () => {
    const result = negotiate(createGame("demo"), "bank", "ask_overdraft");
    const allowed = new Set(result.numbers);
    expect(allowed.has(30)).toBe(false);
    const wrong = validateNumberGuardrail("Limit w koncie z prowizją 30%.", allowed);
    expect(wrong.valid).toBe(false);
    expect(wrong.unauthorizedNumbers).toEqual([30]);
  });

  it("event payload numbers: the fraud amount and reveal date, nothing else", () => {
    const allowed = eventNumbers({
      type: "fraudRevealed",
      week: 5,
      eventId: "E1",
      ledgerId: "L08",
      amount: -35700,
      date: "2026-12-23",
    });
    expect(validateNumberGuardrail("Przelew 35 700 zł z 23 grudnia był oszustwem.", allowed).valid).toBe(true);
    expect(validateNumberGuardrail("Przelew 35 700 zł z 28 grudnia.", allowed).valid).toBe(false);
  });
});

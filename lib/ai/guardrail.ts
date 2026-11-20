// Number guardrail for generated AI text (ARCHITECTURE.md §6, BUILD-PLAN.md §5 N-02).
// Hard rule: Numbers come from the engine. Any generated text with a number not from the engine is rejected.
import type { EngineEvent, GameState, IsoDate } from "../../engine";
import { forecast, getAvailableCards } from "../../engine";
import type { GuardrailOptions, GuardrailResult } from "./types";

/**
 * Extract all numeric values from text (integers, formatted numbers like 35 700,
 * decimals, negative numbers, percentages).
 */
export function extractNumbers(text: string): number[] {
  // Matches:
  // 1) formatted numbers with thousands separators: -?\d{1,3}(?:[ \u00A0]\d{3})+(?:[.,]\d+)?
  // 2) standard continuous numbers: -?\d+(?:[.,]\d+)?
  const pattern = /(?:^|[^\w,.-])(-?\d{1,3}(?:[ \u00A0]\d{3})+(?:[.,]\d+)?|-?\d+(?:[.,]\d+)?)(%?)/g;
  const numbers: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    let raw = match[1].trim();
    raw = raw.replace(/[ \u00A0]/g, "").replace(",", ".");
    const val = parseFloat(raw);
    if (!Number.isNaN(val)) {
      numbers.push(val);
    }
  }

  return numbers;
}

/** Day, month and year of an ISO date: a date the engine names may be written as „28 grudnia” or „28.12.2026”. */
function addDateParts(allowed: Set<number>, date: IsoDate | null | undefined): void {
  if (!date) return;
  const [year, month, day] = date.split("-").map(Number);
  for (const n of [year, month, day]) if (Number.isFinite(n)) allowed.add(n);
}

/**
 * Numbers of one engine event payload (ENGINE-DATA-AND-TESTS.md §6): its week, amounts and dates.
 */
export function eventNumbers(event: EngineEvent): Set<number> {
  const allowed = new Set<number>([event.week]);
  switch (event.type) {
    case "fraudRevealed":
      allowed.add(event.amount);
      allowed.add(Math.abs(event.amount));
      addDateParts(allowed, event.date);
      break;
    case "lateClient":
      addDateParts(allowed, event.newDate);
      break;
    case "crash":
      allowed.add(event.crash.shortfall);
      addDateParts(allowed, event.crash.date);
      break;
    default:
      break;
  }
  return allowed;
}

/**
 * Collect the numbers the engine states for `state`: week, balance, runway, overdraft, every forecast
 * balance and transaction amount, the crash, the minimum and every card cost, plus the day, month and year
 * of every dated engine value (transaction, crash, minimum, low). Nothing is allowed by default: no day
 * range, no month or year constants. `extraAllowed` adds caller numbers that themselves come from the
 * engine (NegotiationResult.numbers, eventNumbers()).
 */
export function collectEngineNumbers(
  state: GameState,
  extraAllowed?: Iterable<number>
): Set<number> {
  const allowed = new Set<number>();
  const addNum = (n: number | undefined | null) => {
    if (typeof n === "number" && !Number.isNaN(n)) {
      allowed.add(n);
      allowed.add(Math.abs(n));
    }
  };

  addNum(state.core.week);
  addNum(state.core.balance);
  addNum(state.core.overdraftLimit);

  const fc = forecast(state);
  addNum(fc.runwayDays);
  addNum(fc.overdraftLimit);
  addNum(fc.overdraftInterest);
  addNum(fc.endBalance);
  for (const pt of fc.points) {
    addNum(pt.balance);
    for (const tx of pt.transactions) {
      addNum(tx.amount);
      addDateParts(allowed, tx.date);
    }
  }
  addNum(fc.minimum.balance);
  addDateParts(allowed, fc.minimum.date);
  if (fc.low) {
    addNum(fc.low.balance);
    addDateParts(allowed, fc.low.date);
  }
  if (fc.crash) {
    addNum(fc.crash.shortfall);
    addDateParts(allowed, fc.crash.date);
  }
  if (fc.counterfactual) {
    addNum(fc.counterfactual.low.balance);
    addNum(fc.counterfactual.endBalance);
  }

  for (const card of getAvailableCards(state)) addNum(card.cost);

  if (extraAllowed) {
    for (const n of extraAllowed) addNum(n);
  }
  return allowed;
}

/**
 * Validate that every number present in candidateText is approved by the engine.
 * If any number is unauthorized, returns valid: false with the list of rejected numbers.
 */
export function validateNumberGuardrail(
  candidateText: string,
  allowedNumbers: Iterable<number>,
  options: GuardrailOptions = {}
): GuardrailResult {
  const tolerance = options.tolerance ?? 0.01;
  const allowAbsoluteMatch = options.allowAbsoluteMatch ?? true;

  const allowedArr = Array.from(allowedNumbers);
  const extractedNumbers = extractNumbers(candidateText);
  const unauthorizedNumbers: number[] = [];

  for (const num of extractedNumbers) {
    const isAllowed = allowedArr.some((allowed) => {
      const diff = Math.abs(num - allowed);
      if (diff <= tolerance) return true;
      if (allowAbsoluteMatch && Math.abs(Math.abs(num) - Math.abs(allowed)) <= tolerance) {
        return true;
      }
      return false;
    });

    if (!isAllowed) {
      unauthorizedNumbers.push(num);
    }
  }

  return {
    valid: unauthorizedNumbers.length === 0,
    extractedNumbers,
    unauthorizedNumbers,
  };
}

/**
 * Guardrail wrapper: returns candidateText if all numbers are authorized by the engine,
 * or fallbackText if any number is unauthorized.
 */
export function applyGuardrailOrFallback(
  candidateText: string,
  allowedNumbers: Iterable<number>,
  fallbackText: string,
  options: GuardrailOptions = {}
): string {
  const result = validateNumberGuardrail(candidateText, allowedNumbers, options);
  if (!result.valid) {
    return fallbackText;
  }
  return candidateText;
}

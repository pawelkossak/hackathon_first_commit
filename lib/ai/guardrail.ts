// Number guardrail for generated AI text (ARCHITECTURE.md §6, BUILD-PLAN.md §5 N-02).
// Hard rule: Numbers come from the engine. Any generated text with a number not from the engine is rejected.
import type { GameState } from "../../engine";
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

/**
 * Collect all permissible numbers from engine state, forecasts, available cards,
 * and ledger transactions.
 */
export function collectEngineNumbers(
  state: GameState,
  extraAllowed?: Iterable<number>
): Set<number> {
  const allowed = new Set<number>();

  // Helper to add number and optionally its absolute value
  const addNum = (n: number | undefined | null) => {
    if (typeof n === "number" && !Number.isNaN(n)) {
      allowed.add(n);
      allowed.add(Math.abs(n));
    }
  };

  // 1. Core game numbers
  addNum(state.core.week);
  addNum(state.core.balance);

  // 2. Forecast numbers (all daily balances and transaction amounts)
  try {
    const fc = forecast(state);
    for (const pt of fc.points) {
      addNum(pt.balance);
      for (const tx of pt.transactions) {
        addNum(tx.amount);
      }
    }
    if (fc.counterfactual) {
      addNum(fc.counterfactual.low.balance);
      addNum(fc.counterfactual.endBalance);
    }
  } catch {
    // Forecast might fail if state is crashed or invalid; continue with core numbers
  }

  // 3. Available card costs and parameters
  try {
    const cards = getAvailableCards(state);
    for (const card of cards) {
      addNum(card.cost);
    }
  } catch {
    // Continue
  }

  // 4. Common rule parameters and dates (e.g. day numbers in current month)
  for (let day = 1; day <= 31; day++) {
    allowed.add(day);
  }
  // Standard months
  allowed.add(11); // listopad
  allowed.add(12); // grudzień
  allowed.add(1);  // styczeń
  allowed.add(2026);
  allowed.add(2027);

  // 5. Extra allowed numbers passed by caller
  if (extraAllowed) {
    for (const n of extraAllowed) {
      addNum(n);
    }
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

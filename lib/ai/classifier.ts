// Deterministic intent classifier for negotiation (ARCHITECTURE.md §6, DEMO-REQUIREMENTS.md GM-04).
// It only maps free text to an engine intent (E-08 intent table); data/agents.json and the engine decide the outcome.
import type { AgentId, AgentIntent } from "../../engine";

export interface ClassifiedIntent {
  intent: AgentIntent;
  /** The percent the player named (ask_advance); omitted when none is named. */
  percent?: number;
}

/** Letter-boundary word match (Polish letters count as letters). */
function hasWord(text: string, stems: string): boolean {
  return new RegExp(`(?:^|[^\\p{L}])(?:${stems})(?:[^\\p{L}]|$)`, "iu").test(text);
}

const RUDE = "idiot\\p{L}*|oszust\\p{L}*|złodziej\\p{L}*|cham\\p{L}*|kretyn\\p{L}*|spierdal\\p{L}*|groż\\p{L}*|pozew|pozw\\p{L}*";
const ACCEPT = "ok|okej|zgoda|zgadzam\\p{L}*|przyjmuj\\p{L}*|przyjmij|akceptuj\\p{L}*|biorę|pasuje|niech będzie";
const ADVANCE = "zaliczk\\p{L}*|przedpłat\\p{L}*|z góry|wcześniej";
const DISCOUNT = "skont\\p{L}*|rabat\\p{L}*|upust\\p{L}*";
/** A loan request to the bank is never the overdraft (the bank never offers C5): `unknown`. */
const LOAN = "pożycz\\p{L}*|kredyt\\p{L}*|chwilówk\\p{L}*";
const OVERDRAFT = "limit\\p{L}*|debet\\p{L}*|overdraft|w koncie|w rachunku";

/** The first percent the player names („50%”, „20 %”); „połowę” counts as 50. */
function namedPercent(text: string): number | undefined {
  const match = text.match(/(\d{1,3})\s*%/);
  if (match) return Number.parseInt(match[1], 10);
  if (hasWord(text, "połow\\p{L}*")) return 50;
  return undefined;
}

/**
 * Classify a free-text message to one agent into an engine intent (E-08 table):
 * - Klient A: insults or threats → `rude`; „OK”, „Przyjmuję”, „Zgoda na 30%” → `accept_counter`;
 *   advance request → `ask_advance` with the named percent, else no percent (Klient A then counters);
 *   „skonto” → `offer_discount`.
 * - Bank: a loan request („pożyczka”, „kredyt”) → `unknown`; limit / debet → `ask_overdraft`.
 * - Anything unclear → `unknown` (quick replies).
 */
export function classifyIntent(text: string, agent: AgentId): ClassifiedIntent {
  const normalized = text.toLowerCase().trim();

  if (hasWord(normalized, RUDE)) return { intent: "rude" };

  if (agent === "bank") {
    if (hasWord(normalized, LOAN)) return { intent: "unknown" };
    if (hasWord(normalized, OVERDRAFT)) return { intent: "ask_overdraft" };
    return { intent: "unknown" };
  }

  if (hasWord(normalized, ACCEPT)) return { intent: "accept_counter" };
  if (hasWord(normalized, DISCOUNT)) return { intent: "offer_discount" };
  if (hasWord(normalized, ADVANCE)) {
    const percent = namedPercent(normalized);
    return percent === undefined ? { intent: "ask_advance" } : { intent: "ask_advance", percent };
  }
  return { intent: "unknown" };
}

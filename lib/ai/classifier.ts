// Deterministic intent classifier for negotiation (ARCHITECTURE.md §6, DEMO-REQUIREMENTS.md GM-04).
import type { AgentId, AgentIntent, WeekNumber } from "../../engine";
import type { QuickReplyOption } from "./types";

export interface ClassifiedIntent {
  intent: AgentIntent;
  percent?: number;
  confidence: number;
}

/**
 * Classify a free-text message from the player into an AgentIntent.
 */
export function classifyIntent(text: string): ClassifiedIntent {
  const normalized = text.toLowerCase().trim();

  // 1. Rude / aggressive behavior
  const rudePattern = /(?:^|[^\p{L}])(idiot\p{L}*|oszust\p{L}*|złodziej\p{L}*|cham\p{L}*|spierdal\p{L}*|groż\p{L}*|upadłoś\p{L}*|kretyn\p{L}*)(?:[^\p{L}]|$)/iu;
  if (rudePattern.test(normalized)) {
    return { intent: "rude", confidence: 0.95 };
  }

  // 2. Extract percentage if present (e.g. 50%, 30%)
  const percentMatch = normalized.match(/(\d+)\s*%/);
  const percent = percentMatch ? parseInt(percentMatch[1], 10) : undefined;

  // 3. Accept counter-offer
  const acceptPattern = /(?:^|[^\p{L}])(zgadzam\p{L}*|przyjmuj\p{L}*|akceptuj\p{L}*|biorę|niech będzie|pasuje|zgoda)(?:[^\p{L}]|$)/iu;
  if (acceptPattern.test(normalized)) {
    return { intent: "accept_counter", percent: percent ?? 30, confidence: 0.9 };
  }

  // 4. Ask for advance (zaliczka / przedpłata)
  const advancePattern = /(?:^|[^\p{L}])(zaliczk\p{L}*|przedpłat\p{L}*|wypłać wcześniej)(?:[^\p{L}]|$)/iu;
  if (advancePattern.test(normalized)) {
    return {
      intent: "ask_advance",
      percent: percent ?? (normalized.includes("połow") ? 50 : 30),
      confidence: 0.9,
    };
  }

  // 5. Offer discount (skonto / rabat)
  const discountPattern = /(?:^|[^\p{L}])(skont\p{L}*|rabat\p{L}*|upust\p{L}*|obniżk\p{L}*)(?:[^\p{L}]|$)/iu;
  if (discountPattern.test(normalized)) {
    return { intent: "offer_discount", percent: percent ?? 2, confidence: 0.9 };
  }

  // 6. Bank overdraft (kredyt w rachunku / debet / limit)
  const overdraftPattern = /(?:^|[^\p{L}])(kredyt\p{L}*|debet\p{L}*|limit\p{L}*|overdraft\p{L}*)(?:[^\p{L}]|$)/iu;
  if (overdraftPattern.test(normalized)) {
    return { intent: "ask_overdraft", confidence: 0.9 };
  }

  return { intent: "unknown", confidence: 0.3 };
}

/**
 * Return permissible quick-reply buttons for the current negotiation context.
 */
export function getQuickReplies(
  agent: AgentId,
  week: WeekNumber,
  counterPending = false
): QuickReplyOption[] {
  if (agent === "klient_a") {
    if (counterPending) {
      return [
        {
          id: "accept_counter_30",
          label: "Przyjmij kontrofertę 30% (15 000 zł do 3 XII)",
          intent: "accept_counter",
          percent: 30,
        },
        {
          id: "ask_advance_50",
          label: "Negocjuj dalej: Poproś o 50% zaliczki",
          intent: "ask_advance",
          percent: 50,
        },
      ];
    }

    if (week <= 2) {
      return [
        {
          id: "ask_advance_50",
          label: "Poproś o zaliczkę 50% na projekt",
          intent: "ask_advance",
          percent: 50,
        },
        {
          id: "ask_advance_30",
          label: "Zaproponuj 30% zaliczki (bezpieczna opcja)",
          intent: "ask_advance",
          percent: 30,
        },
        {
          id: "offer_discount_2",
          label: "Zaoferuj skonto 2% za płatność w 7 dni",
          intent: "offer_discount",
          percent: 2,
        },
      ];
    }

    // Week > 2: advance is closed per data/agents.json
    return [
      {
        id: "offer_discount_2",
        label: "Zaoferuj skonto 2% za płatność w 7 dni",
        intent: "offer_discount",
        percent: 2,
      },
    ];
  }

  if (agent === "bank") {
    return [
      {
        id: "ask_overdraft",
        label: "Zapytaj o kredyt w rachunku bieżącym",
        intent: "ask_overdraft",
      },
    ];
  }

  return [];
}

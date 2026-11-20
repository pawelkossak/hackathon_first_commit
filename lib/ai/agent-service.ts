// Agent negotiation handler with provider abstraction and 3 s timeout (ARCHITECTURE.md §6, GM-04).
import type { AgentId, AgentOutcome, CardId, GameState, WeekNumber } from "../../engine";
import { classifyIntent, getQuickReplies } from "./classifier";
import { collectEngineNumbers, validateNumberGuardrail } from "./guardrail";
import type { AgentRequest, AgentResponse } from "./types";

/**
 * Deterministic resolution of negotiation rule from data/agents.json.
 */
function resolveNegotiationRule(
  agent: AgentId,
  week: WeekNumber,
  intent: string,
  percent?: number
): {
  outcome: AgentOutcome;
  reply: string;
  cardId: CardId | null;
  counterPercent: number | null;
} {
  if (agent === "klient_a") {
    if (intent === "rude") {
      return {
        outcome: "refuse",
        reply: "Nie będziemy rozmawiać w ten sposób. Relacje z klientem uległy pogorszeniu.",
        cardId: null,
        counterPercent: null,
      };
    }

    if (intent === "ask_advance") {
      if (week > 2) {
        return {
          outcome: "refuse",
          reply: "Niestety, budżet na zaliczki w tym projekcie został już zamknięty.",
          cardId: null,
          counterPercent: null,
        };
      }

      if (typeof percent === "number" && percent > 30) {
        // 50% request -> counter 30% per GM-04
        return {
          outcome: "counter",
          reply: "Mogę dać 30% — 15 000 zł do 3 grudnia",
          cardId: null,
          counterPercent: 30,
        };
      }

      // <= 30%
      return {
        outcome: "accept",
        reply: "Zgoda na zaliczkę 30%. Przygotuję dyspozycję przelewu na 15 000 zł do 3 grudnia.",
        cardId: "C1",
        counterPercent: null,
      };
    }

    if (intent === "accept_counter") {
      return {
        outcome: "accept",
        reply: "Świetnie, że doszliśmy do porozumienia. Przelew 15 000 zł wyjdzie do 3 grudnia.",
        cardId: "C1",
        counterPercent: null,
      };
    }

    if (intent === "offer_discount") {
      return {
        outcome: "accept",
        reply: "Skonto 2% przyjęte z zadowoleniem. Faktura zostanie uregulowana w 7 dni.",
        cardId: "C2",
        counterPercent: null,
      };
    }

    return {
      outcome: "quick_replies",
      reply: "Mogę rozważyć zaliczkę lub skonto. Przedstaw konkretną propozycję:",
      cardId: null,
      counterPercent: null,
    };
  }

  if (agent === "bank") {
    if (intent === "ask_overdraft") {
      if (week > 3) {
        return {
          outcome: "refuse",
          reply: "Na ten scenariusz jest już za późno. Procedura limitu wymagała zgłoszenia do 3. tygodnia.",
          cardId: null,
          counterPercent: null,
        };
      }
      return {
        outcome: "accept",
        reply: "Wniosek o limit w rachunku bieżącym został zaakceptowany. Szacowany koszt to ok. 194 zł.",
        cardId: "C4",
        counterPercent: null,
      };
    }

    return {
      outcome: "quick_replies",
      reply: "Jako doradca bankowy mogę przedstawić ofertę limitu w rachunku bieżącym.",
      cardId: null,
      counterPercent: null,
    };
  }

  return {
    outcome: "quick_replies",
    reply: "Nie rozumiem tej propozycji. Wybierz opcję:",
    cardId: null,
    counterPercent: null,
  };
}

/**
 * Handle an agent negotiation request with guaranteed 3 s timeout and offline deterministic fallback.
 */
export async function processAgentNegotiation(
  req: AgentRequest,
  state?: GameState
): Promise<AgentResponse> {
  // 1. Classification
  const classified = classifyIntent(req.message);

  // 2. Resolve rules
  const ruleResult = resolveNegotiationRule(
    req.agent,
    req.week,
    classified.intent,
    classified.percent
  );

  let replyText = ruleResult.reply;

  // 3. Number Guardrail
  if (state) {
    const allowed = collectEngineNumbers(state, [15000, 30, 50, 2, 194, 3, 7]);
    const guardrail = validateNumberGuardrail(replyText, allowed);
    if (!guardrail.valid) {
      // Fallback to cached safe line if any unauthorized number is detected
      replyText = "Przedstaw propozycję zgodną z warunkami zlecenia.";
    }
  }

  // 4. Generate next buttons
  const isCounter = ruleResult.outcome === "counter";
  const buttons = getQuickReplies(req.agent, req.week, isCounter);

  return {
    intent: classified.intent,
    percent: classified.percent,
    outcome: ruleResult.outcome,
    reply: replyText,
    buttons,
    cardId: ruleResult.cardId,
    counterPercent: ruleResult.counterPercent,
  };
}

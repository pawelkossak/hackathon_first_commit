// Agent negotiation service behind /api/agent (ARCHITECTURE.md §6, ENGINE-DATA-AND-TESTS.md §4, E-08).
// Flow: classifier → engine intent → negotiate() from engine/index.ts → result.lineId → cached copy line
// with engine bindings → number guardrail against result.numbers. The engine owns every rule and applies
// an accepted deal itself; this service never decides an outcome and never plays a card.
import { isRuleError, negotiate } from "../../engine";
import type { AgentId, AgentIntent, GameState, NegotiationResult } from "../../engine";
import {
  agentLineText,
  fallbackLineId,
  getCopy,
  getLocale,
  quickRepliesFor,
  type Locale,
  type NarratorGender,
  type PlayerGender,
  type QuickReply,
} from "../../narrative";
import { classifyIntent, type ClassifiedIntent } from "./classifier";
import { validateNumberGuardrail } from "./guardrail";
import { AI_TIMEOUT_MS, withTimeout } from "./provider";
import type {
  AgentAiProvider,
  AgentFailureReason,
  AgentTurnFallback,
  AgentTurnRequest,
  AgentTurnResponse,
  ReplySource,
} from "./types";

export interface AgentServiceOptions {
  /** Optional AI provider; ignored when `offline`. */
  provider?: AgentAiProvider;
  /** PILOT_AI_OFFLINE=1: the provider is never called. */
  offline?: boolean;
  /** Budget of each provider call (default 3 s). */
  timeoutMs?: number;
}

/** Klient A quick replies for a missing state: the deterministic default set of a fresh thread. */
const KLIENT_A_DEFAULT_REPLIES: QuickReply[] = [
  { id: "ask_advance", intent: "ask_advance", labelKey: "ui.negotiate.reply.ask_advance" },
  { id: "offer_discount", intent: "offer_discount", labelKey: "ui.negotiate.reply.offer_discount" },
];
const BANK_DEFAULT_REPLIES: QuickReply[] = [
  { id: "ask_overdraft", intent: "ask_overdraft", labelKey: "ui.negotiate.reply.ask_overdraft" },
];

/** The deterministic fallback: the agent's cached fallback line and its quick replies, no state change. */
export function agentFallback(
  agent: AgentId,
  reason: AgentFailureReason,
  state: GameState | null = null,
  playerGender: PlayerGender = "female",
  narratorGender: NarratorGender = "female",
  locale: Locale = getLocale()
): AgentTurnFallback {
  const lineId = fallbackLineId(agent);
  const quickReplies =
    state && state.core.status === "playing"
      ? quickRepliesFor(state, agent)
      : reason === "not_playing"
        ? []
        : agent === "bank"
          ? BANK_DEFAULT_REPLIES
          : KLIENT_A_DEFAULT_REPLIES;
  return {
    ok: false,
    reason,
    lineId,
    text: getCopy(lineId, undefined, playerGender, narratorGender, undefined, locale),
    quickReplies,
  };
}

async function classify(
  request: AgentTurnRequest,
  options: AgentServiceOptions
): Promise<{ intent: AgentIntent; percent?: number }> {
  if (request.intent) {
    return request.percent === undefined ? { intent: request.intent } : { intent: request.intent, percent: request.percent };
  }
  const text = request.message ?? "";
  const provider = options.offline ? undefined : options.provider;
  if (provider?.classify) {
    const classifyWith = provider.classify.bind(provider);
    try {
      const ai: ClassifiedIntent | null = await withTimeout(
        (signal) => classifyWith(text, request.agent, signal),
        options.timeoutMs ?? AI_TIMEOUT_MS
      );
      if (ai) return ai;
    } catch {
      // Provider failure or timeout: the deterministic classifier decides.
    }
  }
  return classifyIntent(text, request.agent);
}

/** True when every number of `text` is in the engine's allowed set for this reply. */
export function passesGuardrail(text: string, result: NegotiationResult): boolean {
  return validateNumberGuardrail(text, result.numbers).valid;
}

async function phrase(
  request: AgentTurnRequest,
  result: NegotiationResult,
  cachedText: string,
  locale: Locale,
  options: AgentServiceOptions
): Promise<{ text: string; source: ReplySource }> {
  const provider = options.offline || result.blocked ? undefined : options.provider;
  if (provider?.phrase) {
    const phraseWith = provider.phrase.bind(provider);
    try {
      const candidate = await withTimeout(
        (signal) =>
          phraseWith({ agent: request.agent, lineId: result.lineId, cachedText, numbers: result.numbers, locale }, signal),
        options.timeoutMs ?? AI_TIMEOUT_MS
      );
      if (candidate && passesGuardrail(candidate, result)) return { text: candidate, source: "provider" };
    } catch {
      // Provider failure or timeout: the cached line is used.
    }
  }
  return { text: cachedText, source: "cache" };
}

/**
 * One player message to an agent. The engine decides through `negotiate`; the reply is the cached line
 * of `result.lineId` bound to engine numbers (or a provider phrasing that passes the guardrail).
 * Throws nothing: a finished lap or an engine error gives the deterministic fallback.
 */
export async function handleAgentTurn(
  request: AgentTurnRequest,
  options: AgentServiceOptions = {}
): Promise<AgentTurnResponse> {
  const playerGender = request.playerGender ?? "female";
  const narratorGender = request.narratorGender ?? "female";
  const locale = request.locale ?? getLocale();

  const { intent, percent } = await classify(request, options);

  let result: NegotiationResult;
  try {
    result = negotiate(request.state, request.agent, intent, percent);
  } catch (error) {
    const reason: AgentFailureReason = isRuleError(error) && error.code === "not_playing" ? "not_playing" : "error";
    return agentFallback(request.agent, reason, request.state, playerGender, narratorGender, locale);
  }

  let cachedText = agentLineText(request.state, result, playerGender, narratorGender, locale);
  if (!passesGuardrail(cachedText, result)) {
    // A cached line must never carry a number the engine did not allow; fall back to the number-free line.
    cachedText = getCopy(fallbackLineId(request.agent), undefined, playerGender, narratorGender, undefined, locale);
  }
  const reply = await phrase(request, result, cachedText, locale, options);

  return {
    ok: true,
    result,
    intent,
    ...(percent === undefined ? {} : { percent }),
    lineId: result.lineId,
    text: reply.text,
    source: reply.source,
    quickReplies: result.state.core.status === "playing" ? quickRepliesFor(result.state, request.agent) : [],
  };
}

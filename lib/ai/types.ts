// Types for AI integration, the number guardrail and /api/agent (ARCHITECTURE.md §6, BUILD-PLAN.md §5 N-02, N-06).
import type { AgentId, AgentIntent, GameState, NegotiationResult } from "../../engine";
import type { Locale, NarratorGender, PlayerGender, QuickReply } from "../../narrative";
import type { ClassifiedIntent } from "./classifier";

export interface GuardrailResult {
  valid: boolean;
  extractedNumbers: number[];
  unauthorizedNumbers: number[];
}

export interface GuardrailOptions {
  /** Tolerance for floating point differences (default: 0.01) */
  tolerance?: number;
  /** Whether to allow absolute values to match (e.g. 4300 matches -4300) */
  allowAbsoluteMatch?: boolean;
}

/** One player message to an agent: free text (classified) or a quick reply (its intent). */
export interface AgentTurnRequest {
  state: GameState;
  agent: AgentId;
  message?: string;
  intent?: AgentIntent;
  percent?: number;
  playerGender?: PlayerGender;
  narratorGender?: NarratorGender;
  locale?: Locale;
}

/** Where the reply text came from: the cached copy line, or a provider phrasing that passed the guardrail. */
export type ReplySource = "cache" | "provider";

/** The engine answered: `result.state` is the new game state (an accepted deal is already played). */
export interface AgentTurnSuccess {
  ok: true;
  result: NegotiationResult;
  intent: AgentIntent;
  percent?: number;
  lineId: string;
  text: string;
  source: ReplySource;
  quickReplies: QuickReply[];
}

export type AgentFailureReason = "invalid_request" | "not_playing" | "timeout" | "error";

/** Deterministic fallback: the agent's cached fallback line and quick replies; the state is unchanged. */
export interface AgentTurnFallback {
  ok: false;
  reason: AgentFailureReason;
  lineId: string;
  text: string;
  quickReplies: QuickReply[];
}

export type AgentTurnResponse = AgentTurnSuccess | AgentTurnFallback;

/** What a phrasing provider may use: the cached line and the only numbers it may mention. */
export interface PhrasingRequest {
  agent: AgentId;
  lineId: string;
  cachedText: string;
  numbers: readonly number[];
  locale: Locale;
}

/**
 * Optional AI provider (server only). Both methods may return null to fall back to the deterministic path.
 * The service calls them only when PILOT_AI_OFFLINE is not "1", always under the 3 s timeout.
 */
export interface AgentAiProvider {
  classify?(text: string, agent: AgentId, signal: AbortSignal): Promise<ClassifiedIntent | null>;
  phrase?(request: PhrasingRequest, signal: AbortSignal): Promise<string | null>;
}

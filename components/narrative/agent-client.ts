// Browser client of /api/agent. The browser never runs the negotiation itself: it posts the serialized
// state and renders what the server returns. Hard rule 4: 3 s timeout, then the caller shows the cached
// fallback line and the quick replies (null result).
import type { AgentId, AgentIntent, GameState } from "../../engine";
import type { AgentTurnResponse } from "../../lib/ai/types";
import type { Locale, NarratorGender, PlayerGender } from "../../narrative";

/** Client-side budget of one /api/agent call (the route has the same budget on the server). */
export const AGENT_CLIENT_TIMEOUT_MS = 3000;

export interface AgentTurnBody {
  state: GameState;
  agent: AgentId;
  message?: string;
  intent?: AgentIntent;
  percent?: number;
  playerGender?: PlayerGender;
  narratorGender?: NarratorGender;
  locale?: Locale;
}

/** Minimal shape check of a route reply before the UI trusts it. */
export function isAgentTurnResponse(value: unknown): value is AgentTurnResponse {
  if (typeof value !== "object" || value === null) return false;
  if (!("ok" in value) || !("text" in value) || !("lineId" in value) || !("quickReplies" in value)) return false;
  if (typeof value.text !== "string" || typeof value.lineId !== "string" || !Array.isArray(value.quickReplies)) {
    return false;
  }
  if (value.ok === true) {
    return "result" in value && typeof value.result === "object" && value.result !== null && "state" in value.result;
  }
  return value.ok === false;
}

/**
 * POST one turn to /api/agent. Returns the route reply (success or its deterministic fallback), or null
 * when the call fails, the reply is malformed or it takes longer than 3 s.
 */
export async function postAgentTurn(
  body: AgentTurnBody,
  fetchImpl: typeof fetch = fetch,
  timeoutMs: number = AGENT_CLIENT_TIMEOUT_MS
): Promise<AgentTurnResponse | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data: unknown = await res.json();
    return isAgentTurnResponse(data) ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

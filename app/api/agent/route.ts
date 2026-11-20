// Route handler POST /api/agent (ARCHITECTURE.md §6, BACKEND-SERVICES.md §3, DEMO-REQUIREMENTS.md GM-04).
// Body: the serialized game state, the agent and either the player's text or a quick-reply intent.
// Reply: { ok: true, result (engine NegotiationResult incl. the new state), lineId, text, quickReplies }
// or the deterministic fallback { ok: false, reason, lineId, text, quickReplies } (state unchanged).
// The whole turn has a 3 s budget; with PILOT_AI_OFFLINE=1 no provider is used, so nothing leaves the machine.
import { z } from "zod";
import {
  AGENT_INTENTS,
  AI_TIMEOUT_MS,
  TimeoutError,
  agentFallback,
  getAgentProvider,
  handleAgentTurn,
  isAiOffline,
  isGameState,
  withTimeout,
} from "../../../lib/ai";
import type { AgentTurnResponse } from "../../../lib/ai";

const AgentSchema = z.enum(["klient_a", "bank"]);

const RequestSchema = z
  .object({
    state: z.unknown(),
    agent: AgentSchema,
    message: z.string().trim().min(1).max(500).optional(),
    intent: z.enum(AGENT_INTENTS).optional(),
    percent: z.number().finite().optional(),
    playerGender: z.enum(["female", "male"]).optional(),
    narratorGender: z.enum(["female", "male"]).optional(),
    locale: z.enum(["pl", "en"]).optional(),
  })
  .refine((body) => body.message !== undefined || body.intent !== undefined, {
    message: "message or intent is required",
  });

function reply(body: AgentTurnResponse, status: number = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return reply(agentFallback("klient_a", "invalid_request"), 400);
  }

  const parsed = RequestSchema.safeParse(json);
  if (!parsed.success) {
    const rawAgent = typeof json === "object" && json !== null && "agent" in json ? json.agent : undefined;
    const agent = AgentSchema.safeParse(rawAgent);
    return reply(agentFallback(agent.success ? agent.data : "klient_a", "invalid_request"), 400);
  }
  const body = parsed.data;
  const { state } = body;
  if (!isGameState(state)) {
    return reply(agentFallback(body.agent, "invalid_request"), 400);
  }

  const genders = [body.playerGender ?? "female", body.narratorGender ?? "female"] as const;
  try {
    const response = await withTimeout(
      () =>
        handleAgentTurn(
          {
            state,
            agent: body.agent,
            message: body.message,
            intent: body.intent,
            percent: body.percent,
            playerGender: genders[0],
            narratorGender: genders[1],
            locale: body.locale,
          },
          { provider: getAgentProvider(), offline: isAiOffline() }
        ),
      AI_TIMEOUT_MS
    );
    return reply(response, response.ok || response.reason !== "not_playing" ? 200 : 409);
  } catch (error) {
    // Timeout or unexpected error: buttons and the cached fallback line, state unchanged.
    const reason = error instanceof TimeoutError ? "timeout" : "error";
    return reply(agentFallback(body.agent, reason, state, genders[0], genders[1], body.locale));
  }
}

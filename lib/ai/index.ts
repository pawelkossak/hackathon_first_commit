// AI module public API (ARCHITECTURE.md §6, BUILD-PLAN.md §5 N-02, N-06). Server side: /api/agent only.
export * from "./types";
export {
  extractNumbers,
  collectEngineNumbers,
  eventNumbers,
  validateNumberGuardrail,
  applyGuardrailOrFallback,
} from "./guardrail";
export { classifyIntent, type ClassifiedIntent } from "./classifier";
export { agentFallback, handleAgentTurn, passesGuardrail, type AgentServiceOptions } from "./agent-service";
export { AI_TIMEOUT_MS, TimeoutError, getAgentProvider, isAiOffline, withTimeout } from "./provider";
export { AGENT_INTENTS, isGameState } from "./state";

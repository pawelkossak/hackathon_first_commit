// AI module public API (ARCHITECTURE.md §6, BUILD-PLAN.md §5 N-02).
export * from "./types";
export {
  extractNumbers,
  collectEngineNumbers,
  validateNumberGuardrail,
  applyGuardrailOrFallback,
} from "./guardrail";

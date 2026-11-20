// Types for AI integration and Number Guardrail (ARCHITECTURE.md §6, BUILD-PLAN.md §5 N-02).

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

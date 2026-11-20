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

export interface QuickReplyOption {
  id: string;
  label: string;
  intent: string;
  percent?: number;
}

export interface AgentRequest {
  message: string;
  agent: "klient_a" | "bank";
  week: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  counterPending?: boolean;
}

export interface AgentResponse {
  intent: string;
  percent?: number;
  outcome: string;
  reply: string;
  buttons: QuickReplyOption[];
  cardId?: string | null;
  counterPercent?: number | null;
  blocked?: boolean;
}

// Rule violations raised by the engine. The code is stable; the message is for developers only.

export type RuleErrorCode =
  | "not_playing"
  | "unknown_card"
  | "card_unavailable"
  | "no_event"
  | "event_unresolved"
  | "invalid_choice"
  | "invalid_week"
  | "no_snapshot"
  | "plan_not_allowed"
  | "no_safe_card"
  | "invalid_date";

export class RuleError extends Error {
  readonly code: RuleErrorCode;

  constructor(code: RuleErrorCode, message?: string) {
    super(message ?? code);
    this.name = "RuleError";
    this.code = code;
  }
}

export function isRuleError(value: unknown): value is RuleError {
  return value instanceof RuleError;
}

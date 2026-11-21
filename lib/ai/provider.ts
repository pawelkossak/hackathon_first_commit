// AI provider selection (server only). Round 1 ships no provider: every reply is the cached copy line.
// A provider plugs in here; with PILOT_AI_OFFLINE=1 none is ever returned, so no call leaves the machine.
import type { AgentAiProvider } from "./types";

/** Every AI call (classification, phrasing) has this budget; the route has the same overall budget. */
export const AI_TIMEOUT_MS = 3000;

/** True when PILOT_AI_OFFLINE=1: no AI call leaves the machine. */
export function isAiOffline(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return env.PILOT_AI_OFFLINE === "1";
}

/** The provider wired into the server; none in round 1 (cached lines only). */
const CONFIGURED_PROVIDER: AgentAiProvider | undefined = undefined;

/** The configured provider, or undefined when offline or when none is configured. */
export function getAgentProvider(
  env: Readonly<Record<string, string | undefined>> = process.env
): AgentAiProvider | undefined {
  return isAiOffline(env) ? undefined : CONFIGURED_PROVIDER;
}

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`timed out after ${ms} ms`);
    this.name = "TimeoutError";
  }
}

/**
 * Run `task` with an abort signal and a timeout. The timer is always cleared; on timeout the signal
 * aborts and the promise rejects with TimeoutError.
 */
export async function withTimeout<T>(task: (signal: AbortSignal) => Promise<T>, ms: number = AI_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new TimeoutError(ms));
    }, ms);
  });
  try {
    return await Promise.race([task(controller.signal), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

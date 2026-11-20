// Return banner local state and persistence (NOTIFICATION-DESIGN.md, GM-27, BUILD-PLAN.md §5 N-08).
import type { WeekNumber } from "../../engine";

export interface ReturnSession {
  week: WeekNumber;
  lap: number;
  timestamp: number;
}

const STORAGE_KEY = "pilot_last_session";

export function saveLastActiveSession(session: ReturnSession): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // LocalStorage quota or access error handled gracefully
  }
}

export function getLastActiveSession(): ReturnSession | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.week === "number" && parsed.week >= 1 && parsed.week <= 7) {
      return parsed as ReturnSession;
    }
  } catch {
    // JSON parse error ignored
  }
  return null;
}

export function clearLastActiveSession(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignored
  }
}

/**
 * Check URL params for ?resume=TX or local storage session to determine return state.
 */
export function checkReturnParam(urlSearch: string): WeekNumber | null {
  const match = urlSearch.match(/[?&]resume=T?([1-7])/);
  if (match) {
    const parsed = parseInt(match[1], 10);
    if (parsed >= 1 && parsed <= 7) {
      return parsed as WeekNumber;
    }
  }
  return null;
}

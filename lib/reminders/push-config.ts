// Demo reminder configuration (D-14, NOTIFICATION-DESIGN.md): the stage trial fires after `delaySeconds`
// and deep-links to `targetWeek` unless the caller passes the engine week (state.core.week).
// These are reminder settings, not money values; every sentence that shows them binds them through getCopy.
import type { WeekNumber } from "../../engine";

export const DEMO_REMINDER: { readonly delaySeconds: number; readonly targetWeek: WeekNumber } = {
  delaySeconds: 30,
  targetWeek: 3,
};

/** Bounds of a demo request (route validation). */
export const DEMO_REMINDER_MAX_DELAY_SECONDS = 3600;

/** Deep link of the return banner for a week. */
export function resumeLink(week: number): string {
  return `/gra/1?resume=T${week}`;
}

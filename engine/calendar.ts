// UTC calendar helpers on ISO dates. No local time zone is ever used.
import type { IsoDate } from "./types";

const DAY_MS = 86_400_000;

function toUtcMs(date: IsoDate): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtcMs(ms: number): IsoDate {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return fromUtcMs(toUtcMs(date) + days * DAY_MS);
}

/** Inclusive list of dates from `from` to `to`. */
export function dateRange(from: IsoDate, to: IsoDate): IsoDate[] {
  const out: IsoDate[] = [];
  for (let ms = toUtcMs(from); ms <= toUtcMs(to); ms += DAY_MS) out.push(fromUtcMs(ms));
  return out;
}

export function isValidIsoDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  return fromUtcMs(toUtcMs(date)) === date;
}

/** Day of the week, 0 = Sunday … 6 = Saturday (UTC calendar). */
export function dayOfWeek(date: IsoDate): number {
  return new Date(toUtcMs(date)).getUTCDay();
}

/** A business day is neither Saturday, Sunday nor one of `holidays`. */
export function isBusinessDay(date: IsoDate, holidays: readonly IsoDate[]): boolean {
  const dow = dayOfWeek(date);
  return dow !== 0 && dow !== 6 && !holidays.includes(date);
}

/** U-12: a date on a weekend or holiday moves to the next business day; a business day stays. */
export function toBusinessDay(date: IsoDate, holidays: readonly IsoDate[]): IsoDate {
  let d = date;
  while (!isBusinessDay(d, holidays)) d = addDays(d, 1);
  return d;
}

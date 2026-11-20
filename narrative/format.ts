// Formatting of engine values for copy bindings. Formatting only: every number comes from the engine.
import type { IsoDate, Pln } from "../engine";
import type { Locale } from "./types";

const MONTHS_PL_GENITIVE = [
  "stycznia",
  "lutego",
  "marca",
  "kwietnia",
  "maja",
  "czerwca",
  "lipca",
  "sierpnia",
  "września",
  "października",
  "listopada",
  "grudnia",
] as const;

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Integer PLN as „15 000 zł” (PL) or „15,000 PLN” (EN); the sign is kept. */
export function formatPln(amount: Pln, locale: Locale = "pl"): string {
  return locale === "en" ? `${amount.toLocaleString("en-US")} PLN` : `${amount.toLocaleString("pl-PL")} zł`;
}

/** ISO date as „3 grudnia” (PL, genitive) or „3 December” (EN). */
export function formatDayMonth(date: IsoDate, locale: Locale = "pl"): string {
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day) || day < 1) {
    throw new Error(`Invalid ISO date: "${date}"`);
  }
  const names = locale === "en" ? MONTHS_EN : MONTHS_PL_GENITIVE;
  return `${day} ${names[month - 1]}`;
}

/** A percent as „30%”. */
export function formatPercent(value: number): string {
  return `${value}%`;
}

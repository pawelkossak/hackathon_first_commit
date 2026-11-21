// UI access to the narrative copy deck (BUILD-PLAN §3.1 interface 2): every sentence goes through getCopy.
// `label()` renders short UI labels the copy deck does not have yet: it asks getCopy for the wanted key
// first, so a key added by the narrative lane takes over without a UI change; until then it shows the
// interim label below. Each wanted key is listed in docs/team/handoffs/U-round1.md for the narrative lane.
import { useCallback } from "react";
import { getCopy, getLocale, formatDayMonth, formatPln, UnknownCopyKeyError } from "../../narrative";
import { useSettingsStore } from "../../narrative/settings-store";
import type { GameState, IsoDate, Pln } from "../../engine";
import type { NarratorGender, PlayerGender } from "../../narrative";
import { useGameStore } from "./game-store";

/** Interim labels (nouns and button captions, no sentences) for copy keys the deck does not have yet. */
export const MISSING_LABELS = {
  "ui.hud.relations": "Relacje",
  "ui.hud.cost_of_money": "Koszt pieniądza",
  "ui.hud.resilience": "Odporność",
  "ui.common.synthetic": "Dane syntetyczne",
  "ui.nav.summary": "Podsumowanie",
  "ui.nav.plan": "Plan",
  "ui.nav.settings": "Ustawienia",
  "ui.nav.reset": "Reset",
  "ui.nav.reset_confirm": "Tak, od nowa",
  "ui.route.view_list": "Lista tygodni",
  "ui.route.view_map": "Trasa",
  "ui.route.plane": "Twój samolot",
  "ui.route.finish": "Meta",
  "ui.card.cost_free": "Bez kosztu",
  "ui.card.product": "Produkt finansowy",
  "ui.card.window": "Tygodnie",
  "ui.preview.title": "Podgląd — nie zatwierdza ruchu",
  "ui.cashflow.before": "Bez działania",
  "ui.cashflow.after": "Po zatwierdzeniu",
  "ui.cashflow.preview": "Po decyzji",
  "ui.cashflow.delta": "Różnica",
  "ui.cashflow.day": "Dzień",
  "ui.cashflow.opening": "Otwarcie",
  "ui.cashflow.inflow": "Wpływy",
  "ui.cashflow.outflow": "Wypływy",
  "ui.cashflow.balance": "Saldo",
  "ui.cashflow.added": "Dodane przez decyzję",
  "ui.cashflow.removed": "Usunięte przez decyzję",
  "ui.cashflow.tasks": "Zadania",
  "ui.cashflow.chart": "Wykres",
  "ui.cashflow.counterfactual": "Prognoza bez działania",
  "ui.task.booked": "Zaksięgowane",
  "ui.task.upcoming": "Nadchodzące",
  "ui.task.rejected": "Odrzucone",
  "ui.task.stopped": "Prognoza bez działania",
  "ui.week.transactions": "Przepływy tygodnia",
  "ui.week.end_balance": "Saldo na koniec tygodnia",
  "ui.week.to_summary": "Podsumowanie okrążenia",
  "ui.event.choice.accept": "Przyjmij",
  "ui.event.choice.decline": "Odrzuć zlecenie",
  "ui.event.choice.now": "Kup teraz",
  "ui.event.choice.january": "Od stycznia",
  "ui.event.choice.show_cost": "Pokaż koszt",
  "ui.event.choice.ignore": "Zignoruj",
  "ui.event.choice.acknowledge": "Przyjmij do wiadomości",
  "ui.fraud.title": "Zgłoszono oszustwo",
  "ui.fraud.rewind": "Cofnij do tygodnia {week}",
  "ui.failure.shortfall": "Brakuje",
  "ui.failure.date": "Dzień",
  "ui.rewind.week": "Tydzień {week}",
  "ui.rewind.start_balance": "Saldo na start: {balance}",
  "ui.summary.end_balance": "Saldo na koniec okrążenia",
  "ui.summary.low": "Najniższe saldo",
  "ui.summary.stars": "Gwiazdki",
  "ui.star.earned": "Zdobyta",
  "ui.star.pending": "Czeka na zapis planu",
  "ui.star.missed": "Nie zdobyta",
  "ui.star.open": "W grze",
  "ui.summary.not_completed": "Okrążenie jeszcze trwa",
  "ui.summary.back_to_game": "Wróć do gry",
  "ui.plan.choose_card": "Decyzja do zapisu",
  "ui.plan.advance_clock": "Przewiń czas konta: {from} → {to}",
  "ui.plan.clock": "Zegar konta",
  "ui.plan.account_balance": "Saldo konta",
  "ui.plan.matched": "Transakcje na koncie",
  "ui.plan.competence": "{name}: poziom {level}",
  "ui.plan.status": "Status planu",
  "ui.plan.not_allowed": "Plan zapiszesz po wygranym okrążeniu",
  "ui.map.level": "Poziom {level}",
  "ui.map.locked": "We mgle",
  "ui.map.unlocked": "Odblokowany",
  "ui.map.coming": "Wkrótce",
  "ui.map.fly": "Lecimy",
  "ui.level2.title": "Pierwszy pracownik",
  "ui.home.start": "Zaczynamy",
  "ui.settings.reset_game": "Zacznij grę od nowa",
  "ui.settings.fallback": "Lista tygodni zamiast trasy",
  "ui.rotate.title": "Obróć telefon, lecimy w poziomie.",
} as const;

export type MissingLabelKey = keyof typeof MISSING_LABELS;

export type CopyExtra = Record<string, string | number>;

function fillInterim(template: string, extra?: CopyExtra): string {
  return template.replace(/\{([^{}]+)\}/g, (match, token: string) => {
    const value = extra?.[token.trim()];
    return value === undefined ? match : String(value);
  });
}

/** A UI label: the copy deck key when it exists, else the interim label of MISSING_LABELS. */
export function labelText(
  key: MissingLabelKey,
  extra?: CopyExtra,
  state?: GameState,
  playerGender: PlayerGender = "female",
  narratorGender: NarratorGender = "female"
): string {
  try {
    return getCopy(key, state, playerGender, narratorGender, extra);
  } catch (err) {
    if (err instanceof UnknownCopyKeyError) return fillInterim(MISSING_LABELS[key], extra);
    throw err;
  }
}

/** Locale-aware formatting of engine values for copy bindings (formatting only, no arithmetic). */
export function pln(amount: Pln): string {
  return formatPln(amount, getLocale());
}

export function dayMonth(date: IsoDate): string {
  return formatDayMonth(date, getLocale());
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"] as const;

/** Compact route date „28 XII” for node captions. */
export function shortDate(date: IsoDate): string {
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));
  return `${day} ${ROMAN[month - 1] ?? ""}`.trim();
}

export interface UiCopy {
  copy: (id: string, extra?: CopyExtra) => string;
  label: (key: MissingLabelKey, extra?: CopyExtra) => string;
  playerGender: PlayerGender;
  narratorGender: NarratorGender;
}

/** Copy bound to the live game state and the chosen player/narrator genders. */
export function useCopy(): UiCopy {
  const state = useGameStore((s) => s.state);
  const playerGender = useSettingsStore((s) => s.playerGender);
  const narratorGender = useSettingsStore((s) => s.narratorGender);
  const copy = useCallback(
    (id: string, extra?: CopyExtra) => getCopy(id, state, playerGender, narratorGender, extra),
    [state, playerGender, narratorGender]
  );
  const label = useCallback(
    (key: MissingLabelKey, extra?: CopyExtra) => labelText(key, extra, state, playerGender, narratorGender),
    [state, playerGender, narratorGender]
  );
  return { copy, label, playerGender, narratorGender };
}

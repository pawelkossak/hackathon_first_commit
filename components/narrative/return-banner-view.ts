// View model of the return banner (N-08, GM-27). The week total is data/level1.json `weeks` and the storm
// is the engine forecast minimum (date and balance); nothing is typed in.
import { forecast, gameData } from "../../engine";
import type { GameState, WeekNumber } from "../../engine";
import { formatDayMonth, formatPln, getCopy, getLocale } from "../../narrative";
import type { Locale, NarratorGender, PlayerGender } from "../../narrative";

export interface ReturnBannerView {
  aria: string;
  title: string;
  /** The narrator's line: the storm (minimum below zero) or the lowest balance. */
  line: string;
  resume: string;
  dismiss: string;
  dismissIcon: string;
}

export function returnBannerView(
  state: GameState,
  week: WeekNumber,
  playerGender: PlayerGender = "female",
  narratorGender: NarratorGender = "female",
  locale: Locale = getLocale()
): ReturnBannerView {
  const copy = (id: string, extra?: Record<string, string | number>) =>
    getCopy(id, state, playerGender, narratorGender, extra, locale);
  const minimum = forecast(state).minimum;
  const storm = {
    "storm.date": formatDayMonth(minimum.date, locale),
    "storm.balance": formatPln(minimum.balance, locale),
  };
  return {
    aria: copy("ui.return.aria"),
    title: copy("ui.return.title", { week, "weeks.total": gameData.level1.weeks.length }),
    line: copy(minimum.balance < 0 ? "ui.return.storm" : "ui.return.calm", storm),
    resume: copy("ui.return.resume"),
    dismiss: copy("ui.return.dismiss"),
    dismissIcon: copy("ui.return.dismiss_icon"),
  };
}

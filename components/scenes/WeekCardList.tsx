"use client";

import React from "react";
import { useGameStore } from "../../lib/ui/game-store";
import { selectForecast } from "../../lib/ui/game-views";
import { gameData, type IsoDate } from "../../engine";
import { dayMonth, pln, shortDate, useCopy } from "../../lib/ui/copy";

export interface WeekCardListProps {
  /** Open the Cash Flow drilldown on this date (week start, or the storm day). */
  onSelectDate?: (date: IsoDate) => void;
  className?: string;
}

/** U-11 fallback: the route as a list of week cards (same engine values as WorldRoute). */
export function WeekCardList({ onSelectDate, className = "" }: WeekCardListProps) {
  const currentWeek = useGameStore((s) => s.state.core.week);
  const forecast = useGameStore(selectForecast);
  const { copy, label } = useCopy();

  const weeks = gameData.level1.weeks;
  const markers = gameData.level1.markers;
  const storm = forecast.baseline.minimum;
  const stormDay = forecast.vsBaseline.days.find((d) => d.date === storm.date) ?? null;
  const stormActive = storm.balance < 0;

  return (
    <div
      role="region"
      aria-label={copy("ui.route.title")}
      data-testid="week-card-list-fallback"
      className={`w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 ${className}`}
    >
      <h2 className="text-xl font-black text-white border-b border-slate-800 pb-3">{gameData.level1.title}</h2>

      <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {weeks.map((w) => {
          const isCurrent = currentWeek === w.week;
          const isPast = currentWeek > w.week;
          const hasStorm = stormActive && storm.date >= w.start && storm.date <= w.end;
          const weekMarkers = markers.filter((m) => m.date >= w.start && m.date <= w.end);

          return (
            <li key={w.week}>
              <button
                type="button"
                data-testid={`fallback-week-card-${w.week}`}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onSelectDate?.(hasStorm ? storm.date : w.start)}
                className={`w-full min-h-[44px] text-left p-4 rounded-2xl border transition flex flex-col gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  isCurrent
                    ? "bg-slate-800 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg"
                    : isPast
                    ? "bg-slate-950/60 border-slate-800 text-slate-300"
                    : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                }`}
              >
                <span className="font-mono text-base font-bold text-amber-400">
                  {copy("ui.hud.week", { week: w.week })}
                  {isCurrent && ` · ${label("ui.route.plane")}`}
                </span>
                <span className="text-base font-bold text-white font-mono">
                  {shortDate(w.start)} – {shortDate(w.end)}
                </span>

                {hasStorm && (
                  <span
                    data-testid="fallback-storm-alert"
                    className="text-base text-purple-100 bg-purple-950/80 border border-purple-600/70 p-2 rounded-xl"
                  >
                    {copy("g10.storm", {
                      "forecast.lowDate": dayMonth(storm.date),
                      "forecast.baselineLow": pln(storm.balance),
                    })}
                    {stormDay && forecast.committedCards.length > 0 && (
                      <span className="block font-mono text-amber-300">
                        {label("ui.cashflow.after")}: {pln(stormDay.after)}
                      </span>
                    )}
                  </span>
                )}

                {weekMarkers.length > 0 && (
                  <span className="flex flex-wrap gap-1">
                    {weekMarkers.map((m) => (
                      <span
                        key={m.id}
                        className="text-base font-semibold bg-amber-950/60 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded"
                      >
                        {m.label} {shortDate(m.date)}
                      </span>
                    ))}
                  </span>
                )}
              </button>
            </li>
          );
        })}

        <li
          data-testid="fallback-week-card-finish"
          className="p-4 rounded-2xl border border-amber-500/40 bg-amber-950/20 flex flex-col gap-2"
        >
          <span className="font-mono text-base font-bold text-amber-400">{label("ui.route.finish")}</span>
          <span className="text-base font-bold text-white font-mono">{shortDate(forecast.to)}</span>
        </li>
      </ol>
    </div>
  );
}

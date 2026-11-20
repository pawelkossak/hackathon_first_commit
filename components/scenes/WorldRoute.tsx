"use client";

import React from "react";
import { useGameStore } from "../../lib/ui/game-store";
import { selectForecast } from "../../lib/ui/game-views";
import { gameData, type IsoDate } from "../../engine";
import { GameAsset } from "../../lib/ui/assets";
import { dayMonth, pln, shortDate, useCopy } from "../../lib/ui/copy";

export interface WorldRouteProps {
  /** Open the Cash Flow drilldown on this date (week start, or the storm day). */
  onSelectDate?: (date: IsoDate) => void;
  className?: string;
}

export function WorldRoute({ onSelectDate, className = "" }: WorldRouteProps) {
  const currentWeek = useGameStore((s) => s.state.core.week);
  const forecast = useGameStore(selectForecast);
  const { copy, label } = useCopy();

  const weeks = gameData.level1.weeks;
  const markers = gameData.level1.markers;
  // The storm is the lowest balance of the „Bez działania” forecast; its value today comes from vsBaseline.
  const storm = forecast.baseline.minimum;
  const stormDay = forecast.vsBaseline.days.find((d) => d.date === storm.date) ?? null;
  const stormActive = storm.balance < 0;

  return (
    <div
      role="region"
      aria-label={copy("ui.route.title")}
      data-testid="world-route-g10"
      className={`w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-black text-white">{gameData.level1.title}</h2>
        <div className="flex items-center gap-2 text-base text-slate-200 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
          <span>{copy("ui.hud.week", { week: currentWeek })}</span>
        </div>
      </div>

      <div className="relative pt-20 pb-4 px-2 overflow-x-auto">
        <div className="min-w-[860px] flex items-start justify-between relative">
          <div
            className="absolute top-8 left-8 right-8 h-1 bg-slate-800 rounded-full z-0 pointer-events-none"
            aria-hidden="true"
          />

          {weeks.map((w) => {
            const isCurrent = currentWeek === w.week;
            const isPast = currentWeek > w.week;
            const hasStorm = stormActive && storm.date >= w.start && storm.date <= w.end;
            const weekMarkers = markers.filter((m) => m.date >= w.start && m.date <= w.end);

            return (
              <div key={w.week} className="relative flex flex-col items-center z-10">
                {hasStorm && (
                  <button
                    type="button"
                    data-testid="route-storm-badge"
                    onClick={() => onSelectDate?.(storm.date)}
                    className="absolute -top-20 min-h-[44px] bg-purple-900 border border-purple-500 text-purple-100 text-sm font-bold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap flex flex-col items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <span>
                      {copy("g10.storm", {
                        "forecast.lowDate": dayMonth(storm.date),
                        "forecast.baselineLow": pln(storm.balance),
                      })}
                    </span>
                    {stormDay && forecast.committedCards.length > 0 && (
                      <span className="font-mono text-amber-300" data-testid="route-storm-after">
                        {label("ui.cashflow.after")}: {pln(stormDay.after)}
                      </span>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  data-testid={`route-node-w${w.week}`}
                  onClick={() => onSelectDate?.(hasStorm ? storm.date : w.start)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${copy("ui.hud.week", { week: w.week })}: ${dayMonth(w.start)}`}
                  className={`relative flex flex-col items-center cursor-pointer min-w-[44px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-2xl ${
                    isCurrent ? "scale-105" : ""
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center p-1 border shadow-lg ${
                      isCurrent
                        ? "bg-emerald-950/80 border-emerald-400 ring-4 ring-emerald-400/30 text-white"
                        : isPast
                        ? "bg-slate-800 border-slate-700 text-slate-300"
                        : "bg-slate-900 border-slate-800 text-slate-200"
                    }`}
                  >
                    <GameAsset id={`sprite.week.${w.week}`} width={36} height={36} alt="" />
                    <span className="text-sm font-bold font-mono">{w.week}</span>
                  </div>
                  {isCurrent && (
                    <span data-testid="plane-marker" className="mt-1 text-sm font-bold text-emerald-300">
                      {label("ui.route.plane")}
                    </span>
                  )}
                  <span className="text-base font-semibold text-slate-100 mt-1 font-mono">{shortDate(w.start)}</span>
                </button>

                <div className="flex flex-col items-center gap-1 mt-1">
                  {weekMarkers.map((m) => (
                    <span
                      key={m.id}
                      data-testid={`marker-${m.id}`}
                      className="text-sm font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-300"
                    >
                      {m.label} {shortDate(m.date)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          <div data-testid="route-node-finish" className="relative flex flex-col items-center z-10">
            <div className="w-16 h-16 rounded-2xl bg-amber-950/50 border border-amber-500/60 flex flex-col items-center justify-center p-1 shadow-lg">
              <GameAsset id="sprite.finish" width={36} height={36} alt="" />
              <span className="text-sm font-bold text-amber-300">{label("ui.route.finish")}</span>
            </div>
            <span className="text-base font-semibold text-amber-300 mt-2 font-mono">{shortDate(forecast.to)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

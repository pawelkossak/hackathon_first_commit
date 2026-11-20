"use client";

import React from "react";
import { useGameStore } from "@/lib/ui/game-store";
import { gameData } from "../../engine";
import { GameAsset } from "@/lib/ui/assets";

export interface WorldRouteProps {
  onSelectWeekNode?: (week: number) => void;
  className?: string;
}

export function WorldRoute({ onSelectWeekNode, className = "" }: WorldRouteProps) {
  const currentWeek = useGameStore((s) => s.state.core.week);
  const forecast = useGameStore((s) => s.getForecast());

  const weeks = gameData.level1.weeks;
  const markers = gameData.level1.markers;

  // Format dates: e.g. "2026-11-23" -> "23 XI"
  function formatDayMonth(iso: string): string {
    const [, month, day] = iso.split("-").map(Number);
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return `${day} ${romanMonths[month - 1]}`;
  }

  return (
    <div
      role="region"
      aria-label="Trasa wysp tygodniowych (G10)"
      data-testid="world-route-g10"
      className={`w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Route Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Trasa lotu · Grudzień 2026 (G10)
          </span>
          <h2 className="text-2xl font-black text-white mt-0.5">Archipelag 7 Tygodni</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Samolot na Tygodniu <strong>{currentWeek}</strong></span>
        </div>
      </div>

      {/* Islands Route Path */}
      <div className="relative py-8 px-2 overflow-x-auto">
        <div className="min-w-[860px] flex items-center justify-between relative">
          {/* Connecting Flight Track Line */}
          <div
            className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0 pointer-events-none"
            aria-hidden="true"
          />

          {weeks.map((w) => {
            const isCurrent = currentWeek === w.week;
            const isPast = currentWeek > w.week;
            const isWeek6 = w.week === 6; // 28 XII - Storm week
            const weekStartDateFormatted = formatDayMonth(w.start);

            // Markers on this week: 25 XI on w1, 21 XII on w5, 28 XII on w6
            const weekMarkers = markers.filter((m) => {
              return m.date >= w.start && m.date <= w.end;
            });

            return (
              <button
                type="button"
                key={w.week}
                data-testid={`route-node-w${w.week}`}
                onClick={() => onSelectWeekNode?.(w.week)}
                aria-label={`Tydzień ${w.week}: ${weekStartDateFormatted}${
                  isWeek6
                    ? `, ostrzeżenie o sztormie: minimalne saldo ${forecast.minimum.balance.toLocaleString("pl-PL")} zł`
                    : ""
                }`}
                className={`relative flex flex-col items-center group z-10 cursor-pointer transition transform hover:-translate-y-1 min-w-[44px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-2xl ${
                  isCurrent ? "scale-105" : ""
                }`}
              >
                {/* Plane location indicator above the current week node */}
                {isCurrent && (
                  <div
                    data-testid="plane-marker"
                    className="absolute -top-10 flex flex-col items-center animate-plane-float"
                  >
                    <div className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                      Twój samolot
                    </div>
                    <div className="w-2 h-2 bg-emerald-500 rotate-45 -mt-1" />
                  </div>
                )}

                {/* Storm Warning on 28 XII (Week 6) */}
                {isWeek6 && (
                  <div
                    data-testid="route-storm-badge"
                    className="absolute -top-12 flex flex-col items-center z-20 animate-storm-glow"
                  >
                    <div className="bg-purple-900 border border-purple-500 text-purple-100 text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl shadow-xl whitespace-nowrap flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>Sztorm 28 XII:</span>
                      <span className="text-amber-300">
                        {forecast.minimum.balance.toLocaleString("pl-PL")} zł
                      </span>
                    </div>
                    <div className="w-2 h-2 bg-purple-900 border-r border-b border-purple-500 rotate-45 -mt-1" />
                  </div>
                )}

                {/* Island Node Circle / Sprite */}
                <div
                  className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center p-1 border transition shadow-lg ${
                    isCurrent
                      ? "bg-emerald-950/80 border-emerald-400 ring-4 ring-emerald-400/30 text-white"
                      : isPast
                      ? "bg-slate-800 border-slate-700 text-slate-400"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <GameAsset
                    id={`sprite.week.${w.week}`}
                    width={36}
                    height={36}
                    alt={`Wyspa Tygodnia ${w.week}`}
                  />
                  <span className="text-[10px] font-bold font-mono mt-0.5">T{w.week}</span>
                </div>

                {/* Node Date */}
                <span className="text-xs font-semibold text-slate-200 mt-2 font-mono">
                  {weekStartDateFormatted}
                </span>

                {/* Marker tags under the date (VAT, ZUS+PIT) */}
                <div className="flex flex-col items-center gap-1 mt-1">
                  {weekMarkers.map((m) => (
                    <span
                      key={m.id}
                      data-testid={`marker-${m.id}`}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-300"
                    >
                      {m.label} ({formatDayMonth(m.date)})
                    </span>
                  ))}
                </div>
              </button>
            );
          })}

          {/* Finish Island: 10 I */}
          <div
            data-testid="route-node-finish"
            className="relative flex flex-col items-center z-10 opacity-90"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-950/50 border border-amber-500/60 flex flex-col items-center justify-center p-1 shadow-lg">
              <GameAsset id="sprite.finish" width={36} height={36} alt="Meta 10 I" />
              <span className="text-[10px] font-bold font-mono text-amber-400 mt-0.5">META</span>
            </div>
            <span className="text-xs font-semibold text-amber-300 mt-2 font-mono">10 I</span>
            <span className="text-[10px] text-slate-400">Finał etapu</span>
          </div>
        </div>
      </div>
    </div>
  );
}

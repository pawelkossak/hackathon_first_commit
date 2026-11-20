"use client";

import React from "react";
import { useGameStore } from "@/lib/ui/game-store";
import { gameData } from "../../engine";

export interface WeekCardListProps {
  onSelectWeekNode?: (week: number) => void;
  className?: string;
}

export function WeekCardList({ onSelectWeekNode, className = "" }: WeekCardListProps) {
  const currentWeek = useGameStore((s) => s.state.core.week);
  const forecast = useGameStore((s) => s.getForecast());

  const weeks = gameData.level1.weeks;
  const markers = gameData.level1.markers;

  function formatDayMonth(iso: string): string {
    const [, month, day] = iso.split("-").map(Number);
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return `${day} ${romanMonths[month - 1]}`;
  }

  return (
    <div
      role="region"
      aria-label="Alternatywna lista kart tygodni (Wariant awaryjny U-11)"
      data-testid="week-card-list-fallback"
      className={`w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Wariant awaryjny / Dostępny (U-11)
          </span>
          <h2 className="text-xl font-black text-white mt-0.5">
            Harmonogram Tygodni (Widok listowy)
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          Uproszczona prezentacja etapów z pełną obsługą klawiatury
        </span>
      </div>

      {/* List of week cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {weeks.map((w) => {
          const isCurrent = currentWeek === w.week;
          const isPast = currentWeek > w.week;
          const isWeek6 = w.week === 6;

          const weekMarkers = markers.filter((m) => m.date >= w.start && m.date <= w.end);

          return (
            <div
              key={w.week}
              data-testid={`fallback-week-card-${w.week}`}
              onClick={() => onSelectWeekNode?.(w.week)}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between cursor-pointer ${
                isCurrent
                  ? "bg-slate-800 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg"
                  : isPast
                  ? "bg-slate-950/60 border-slate-800 text-slate-400"
                  : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-amber-400">Tydzień {w.week}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCurrent
                        ? "bg-emerald-500 text-slate-950"
                        : isPast
                        ? "bg-slate-800 text-slate-400"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {isCurrent ? "Aktywny (Twój samolot)" : isPast ? "Ukończony" : "Nadchodzący"}
                  </span>
                </div>

                <div className="text-sm font-bold text-white font-mono">
                  {formatDayMonth(w.start)} – {formatDayMonth(w.end)}
                </div>

                {/* Storm alert badge on week 6 */}
                {isWeek6 && (
                  <div
                    data-testid="fallback-storm-alert"
                    className="mt-2 text-xs text-purple-300 bg-purple-950/80 border border-purple-600/70 p-2 rounded-xl"
                  >
                    <div className="font-bold flex items-center gap-1 text-purple-200">
                      <span>⚡</span> Sztorm 28 XII
                    </div>
                    <div className="text-[11px] font-mono mt-0.5">
                      Najniższe saldo: {forecast.minimum.balance.toLocaleString("pl-PL")} zł
                    </div>
                  </div>
                )}

                {/* Markers */}
                {weekMarkers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {weekMarkers.map((m) => (
                      <span
                        key={m.id}
                        className="text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded"
                      >
                        {m.label} ({formatDayMonth(m.date)})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Kliknij, aby zbadać Cash Flow</span>
                <span className="text-amber-400 font-bold">→</span>
              </div>
            </div>
          );
        })}

        {/* Finish Week Card */}
        <div
          data-testid="fallback-week-card-finish"
          className="p-4 rounded-2xl border border-amber-500/40 bg-amber-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-amber-400">Finał etapu</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Meta
              </span>
            </div>
            <div className="text-sm font-bold text-white font-mono">10 I 2027</div>
            <p className="text-xs text-slate-300 mt-2">
              Zamknięcie pierwszego etapu i rozliczenie gwiazdek przetrwania.
            </p>
          </div>
          <div className="text-[11px] text-amber-400 font-semibold mt-3 pt-2 border-t border-amber-900/40">
            Koniec poziomu
          </div>
        </div>
      </div>
    </div>
  );
}

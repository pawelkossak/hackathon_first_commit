"use client";

import React, { useState } from "react";
import { useGameStore } from "@/lib/ui/game-store";
import { GameAsset } from "@/lib/ui/assets";
import type { WeekNumber } from "../../engine";

export function FailureAndRewindModal() {
  const state = useGameStore((s) => s.state);
  const rewindToWeek = useGameStore((s) => s.rewindToWeek);
  const [showSelector, setShowSelector] = useState(false);

  const crash = state.core.crash;
  const isCrashed = state.core.status === "crashed" || crash !== null;

  if (!isCrashed || !crash) return null;

  const handleRewind = (week: WeekNumber) => {
    rewindToWeek(week);
    setShowSelector(false);
  };

  // Available snapshot weeks to rewind to
  const availableWeeks: WeekNumber[] = [];
  for (let w = 1; w <= state.core.week; w++) {
    availableWeeks.push(w as WeekNumber);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="failure-title"
      data-testid="failure-rewind-g19-g20"
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border-2 border-red-500 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
        {!showSelector ? (
          /* VIEW G19: Porażka — Przelew nie wystartował */
          <div className="space-y-6" data-testid="failure-view-g19">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950 px-2.5 py-1 rounded-full border border-red-800">
                  Sztorm finansowy (G19)
                </span>
                <h2 id="failure-title" className="text-2xl font-black text-white mt-2">
                  Przelew nie wystartował!
                </h2>
              </div>
              <span className="text-3xl">💥</span>
            </div>

            {/* Crash Details Box (GM-06: 22 XII, shortfall 8 095 zł) */}
            <div className="p-4 rounded-2xl bg-red-950/50 border border-red-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-red-200">
                <span>Data załamania płynności:</span>
                <strong className="font-mono text-sm text-white">{crash.date}</strong>
              </div>
              <div className="flex items-center justify-between text-xs text-red-200">
                <span>Brakująca kwota (deficyt):</span>
                <strong
                  data-testid="failure-shortfall"
                  className="font-mono text-lg text-red-300 font-extrabold"
                >
                  {crash.shortfall.toLocaleString("pl-PL")} zł
                </strong>
              </div>
              <div className="flex items-center justify-between text-xs text-red-200 border-t border-red-900/60 pt-2">
                <span>Zablokowana płatność:</span>
                <span className="font-mono text-xs text-slate-300">{crash.transactionId}</span>
              </div>
            </div>

            {/* Boss supportive reaction */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
              <div className="w-14 h-14 flex-shrink-0">
                <GameAsset
                  id="sprite.boss.female.exasperated"
                  width={56}
                  height={56}
                  alt="Szefowa"
                />
              </div>
              <div className="text-xs text-slate-300">
                <div className="font-bold text-white mb-0.5">Szefowa Ania mówi:</div>
                „Nie martw się, pilocie! Zatory płatnicze i grudniowe kumulacje podatków spotykają co drugą firmę. Właśnie po to mamy wehikuł czasu — cofnijmy czas i zagrajmy inny manewr!”
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSelector(true)}
                data-testid="open-rewind-selector-button"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                ⟲ Cofnij czas (G20) →
              </button>
            </div>
          </div>
        ) : (
          /* VIEW G20: Rewind Week Selector */
          <div className="space-y-6" data-testid="rewind-selector-g20">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Pokrętło Rewind (G20)
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  Wybierz tydzień do przywrócenia
                </h2>
              </div>
              <button
                onClick={() => setShowSelector(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                ← Wróć
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Przywrócenie wcześniejszego tygodnia odtwarza dokładny stan konta i rękę kart,
              umożliwiając przetestowanie alternatywnej strategii obrony płynności.
            </p>

            <div className="space-y-2.5">
              {availableWeeks.map((w) => {
                const snapshot = state.snapshots[w];
                return (
                  <button
                    key={w}
                    onClick={() => handleRewind(w)}
                    data-testid={`rewind-target-week-${w}`}
                    className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-400 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-white text-sm group-hover:text-amber-400 transition">
                        Tydzień {w} {w === 1 && "(Początek misji 23 XI)"}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">
                        {snapshot ? `Saldo na start: ${snapshot.balance.toLocaleString("pl-PL")} zł` : "Stan początkowy"}
                      </div>
                    </div>

                    <span className="text-xs font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition">
                      Przywróć →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import type { CardId, GameState } from "../../engine";
import { getAvailableCards, getCfoHint } from "../../engine";

export interface CfoAdvisorProps {
  state: GameState;
  onPlayCard?: (cardId: CardId) => void;
  onDelegate?: () => void;
  onClose?: () => void;
  className?: string;
}

export function CfoAdvisor({
  state,
  onPlayCard,
  onDelegate,
  onClose,
  className = "",
}: CfoAdvisorProps) {
  const hint = getCfoHint(state);
  const availableCards = getAvailableCards(state);

  // Get 2 cheapest currently valid safe actions with engine cost (GM-09)
  const safeOptions = availableCards
    .filter((c) => c.playable)
    .sort((a, b) => a.cost - b.cost)
    .slice(0, 2);

  const hasCrashRisk = Boolean(hint.risk);

  return (
    <section
      aria-label="Doradca AI-CFO (G15)"
      className={`w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-neutral-100 ${className}`}
    >
      <header className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-400 text-lg"
            aria-hidden="true"
          >
            AI
          </div>
          <div>
            <h2 className="text-lg font-bold text-cyan-400">Doradca AI-CFO</h2>
            <p className="text-xs text-neutral-400">Analiza ryzyka płynnościowego w czasie rzeczywistym</p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] text-xs px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 transition-colors"
          >
            Zamknij
          </button>
        )}
      </header>

      {/* Risk Alert */}
      <div
        className={`p-4 rounded-xl border mb-5 ${
          hasCrashRisk
            ? "bg-red-950/50 border-red-700/60 text-red-200"
            : "bg-emerald-950/40 border-emerald-700/60 text-emerald-200"
        }`}
      >
        <span className="font-semibold block text-sm mb-1">
          {hasCrashRisk ? "⚠️ Zagrożenie zatoru płatniczego" : "✅ Płynność w normie"}
        </span>
        <p className="text-xs leading-relaxed opacity-90">
          {hasCrashRisk && hint.risk
            ? `W prognozie wykryto niedobór ${hint.risk.shortfall.toLocaleString("pl-PL")} zł w dniu ${hint.risk.date}. Wymagany manewr ochronny.`
            : "Bieżące przepływy finansowe nie wykazują luki w tym tygodniu."}
        </p>
      </div>

      {/* 2 Cheapest Options with Engine Cost */}
      <div className="space-y-3 mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Rekomendowane opcje manewru (najtańsze i bezpieczne):
        </h3>

        {safeOptions.length === 0 && (
          <p className="text-xs text-neutral-400 italic">Brak dostępnych manewrów w tym tygodniu.</p>
        )}

        {safeOptions.map((opt) => (
          <div
            key={opt.id}
            className="p-3.5 bg-neutral-800/80 border border-neutral-700 rounded-xl flex items-center justify-between gap-4"
          >
            <div>
              <span className="font-semibold text-sm text-neutral-100 block">{opt.title}</span>
              <span className="text-xs text-amber-300/90">
                Koszt manewru: {opt.cost === 0 ? "0 zł (bez kosztów)" : `${opt.cost.toLocaleString("pl-PL")} zł`}
              </span>
            </div>
            {onPlayCard && (
              <button
                type="button"
                onClick={() => onPlayCard(opt.id)}
                className="min-h-[44px] px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                Wybierz
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Delegation Footer */}
      <footer className="pt-4 border-t border-neutral-800 flex items-center justify-between">
        <span className="text-xs text-neutral-400">
          Kompetencja delegowania: Poziom 1
        </span>
        {onDelegate && (
          <button
            type="button"
            onClick={onDelegate}
            disabled={safeOptions.length === 0}
            className="min-h-[44px] px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-amber-300 border border-amber-400/40 font-semibold text-xs rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            Deleguj najtańszy bezpieczny manewr
          </button>
        )}
      </footer>
    </section>
  );
}

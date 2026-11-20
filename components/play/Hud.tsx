"use client";

import React from "react";
import { useGameStore } from "@/lib/ui/game-store";

export interface HudProps {
  onOpenCashFlow?: () => void;
  className?: string;
}

export function Hud({ onOpenCashFlow, className = "" }: HudProps) {
  const state = useGameStore((s) => s.state);
  const forecast = useGameStore((s) => s.getForecast());
  const { core } = state;

  return (
    <div
      role="region"
      aria-label="Wskaźniki gry (HUD)"
      data-testid="game-hud"
      className={`w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm flex flex-wrap items-center justify-between gap-4 ${className}`}
    >
      {/* Metrics Row */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-8">
        {/* Gotówka */}
        <div data-testid="hud-cash">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Gotówka (konto)
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {core.balance.toLocaleString("pl-PL")} zł
          </div>
        </div>

        {/* Paliwo / Runway */}
        <div data-testid="hud-fuel">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Paliwo (rezerwa)
          </div>
          <div className="text-2xl font-extrabold text-sky-400 font-mono">
            {forecast.runwayDays} <span className="text-xs font-sans font-medium text-slate-400">dni</span>
          </div>
        </div>

        {/* Odporność */}
        <div data-testid="hud-resilience">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Odporność
          </div>
          <div className="text-2xl font-extrabold text-slate-300 font-mono">
            —
          </div>
        </div>

        {/* Relacje */}
        <div data-testid="hud-relations">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Relacje
          </div>
          <div className="text-xl font-extrabold text-amber-400 font-mono flex items-center gap-1">
            <span>{"♥".repeat(Math.max(0, Math.min(5, core.relations)))}</span>
            <span className="text-xs text-slate-400 font-sans ml-1">({core.relations}/5)</span>
          </div>
        </div>

        {/* Koszt pieniądza */}
        <div data-testid="hud-cost">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Koszt pieniądza
          </div>
          <div className="text-xl font-extrabold text-slate-200 font-mono">
            {core.costOfMoney.toLocaleString("pl-PL")} zł
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60"
          title="Zgodnie z wymaganiem GM-01: Dane syntetyczne"
        >
          Dane syntetyczne
        </span>

        {onOpenCashFlow && (
          <button
            onClick={onOpenCashFlow}
            data-testid="hud-open-cashflow"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            Pokaż przepływy (G12)
          </button>
        )}
      </div>
    </div>
  );
}

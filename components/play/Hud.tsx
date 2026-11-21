"use client";

import React from "react";
import { useGameStore } from "../../lib/ui/game-store";
import { selectForecast } from "../../lib/ui/game-views";
import { pln, useCopy } from "../../lib/ui/copy";

export interface HudProps {
  onOpenCashFlow?: () => void;
  className?: string;
}

export function Hud({ onOpenCashFlow, className = "" }: HudProps) {
  const core = useGameStore((s) => s.state.core);
  const forecast = useGameStore(selectForecast);
  const { copy, label } = useCopy();

  return (
    <div
      role="region"
      aria-label={copy("ui.hud.week", { week: core.week })}
      data-testid="game-hud"
      className={`w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-4 sm:gap-8">
        <div data-testid="hud-week" className="text-base font-bold text-white">
          {copy("ui.hud.week", { week: core.week })}
        </div>

        <div data-testid="hud-cash">
          <div className="text-base font-semibold text-slate-300">{copy("ui.hud.balance")}</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">{pln(core.balance)}</div>
        </div>

        <div data-testid="hud-fuel" className="text-base font-bold text-sky-300">
          {copy("ui.hud.runway", { days: forecast.runwayDays })}
        </div>

        <div data-testid="hud-relations">
          <div className="text-base font-semibold text-slate-300">{label("ui.hud.relations")}</div>
          <div className="text-xl font-extrabold text-amber-400 font-mono">{core.relations}/5</div>
        </div>

        <div data-testid="hud-cost">
          <div className="text-base font-semibold text-slate-300">{label("ui.hud.cost_of_money")}</div>
          <div className="text-xl font-extrabold text-slate-200 font-mono">{pln(core.costOfMoney)}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onOpenCashFlow && (
          <button
            type="button"
            onClick={onOpenCashFlow}
            data-testid="hud-open-cashflow"
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {copy("ui.route.cashflow")}
          </button>
        )}
      </div>
    </div>
  );
}

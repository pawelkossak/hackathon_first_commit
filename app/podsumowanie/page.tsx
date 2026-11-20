"use client";

import React from "react";
import Link from "next/link";
import { useGameStore } from "@/lib/ui/game-store";
import { GameAsset } from "@/lib/ui/assets";

export default function PodsumowaniePage() {
  const state = useGameStore((s) => s.state);
  const { core } = state;

  const avoidedCost = core.avoidedCost !== null ? core.avoidedCost : 2400 - core.costOfMoney;

  return (
    <div
      role="region"
      aria-label="Podsumowanie etapu (G18)"
      data-testid="lap-summary-g18"
      className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full flex flex-col justify-center"
    >
      <div className="bg-slate-900 border-2 border-amber-500/80 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-800">
                Podsumowanie etapu (G18)
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Misja ukończona
              </span>
            </div>
            <h1 className="text-3xl font-black text-white mt-2">
              Zwycięstwo! Grudniowy sztorm pokonany
            </h1>
          </div>
          <div className="w-16 h-16 flex-shrink-0">
            <GameAsset id="sprite.boss.female.proud" width={64} height={64} alt="Szefowa duma" />
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400">Końcowe saldo na 10 I</div>
            <div
              data-testid="summary-end-balance"
              className="text-2xl font-black text-emerald-400 font-mono mt-1"
            >
              {core.balance.toLocaleString("pl-PL")} zł
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400">Poniesiony koszt pieniądza</div>
            <div
              data-testid="summary-cost-of-money"
              className="text-2xl font-black text-slate-200 font-mono mt-1"
            >
              {core.costOfMoney.toLocaleString("pl-PL")} zł
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/60">
            <div className="text-xs font-semibold text-amber-300">
              Uniknięty koszt (vs pożyczka SMS)
            </div>
            <div
              data-testid="summary-avoided-cost"
              className="text-2xl font-black text-amber-400 font-mono mt-1"
            >
              +{avoidedCost.toLocaleString("pl-PL")} zł
            </div>
          </div>
        </div>

        {/* Stars Status Box (GM-07: Przetrwanie and Tanio final, Pilot pending until plan saved) */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Gwiazdki kompetencji (GM-07)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <span
                data-testid="star-survival"
                className={`text-2xl ${core.stars.przetrwanie === "earned" ? "text-amber-400" : "text-slate-600"}`}
              >
                ★
              </span>
              <div>
                <div className="font-bold text-white text-xs">Przetrwanie</div>
                <div className="text-[11px] text-slate-400">
                  {core.stars.przetrwanie === "earned" ? "Zdobyta (bez deficytu)" : "Zablokowana"}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <span
                data-testid="star-cheap"
                className={`text-2xl ${core.stars.tanio === "earned" ? "text-amber-400" : "text-slate-600"}`}
              >
                ★
              </span>
              <div>
                <div className="font-bold text-white text-xs">Tanio</div>
                <div className="text-[11px] text-slate-400">
                  {core.stars.tanio === "earned" ? "Zdobyta (tani manewr)" : "Zablokowana"}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <span
                data-testid="star-pilot"
                className={`text-2xl ${core.stars.pilot === "earned" ? "text-amber-400" : "text-amber-400/40"}`}
              >
                {core.stars.pilot === "earned" ? "★" : "☆"}
              </span>
              <div>
                <div className="font-bold text-white text-xs">Pilot</div>
                <div className="text-[11px] text-slate-400">
                  {core.stars.pilot === "earned"
                    ? "Zdobyta (plan zapisany)"
                    : "Oczekuje na zapis planu"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Boss conclusion */}
        <div className="text-xs text-slate-300 bg-slate-950/80 p-4 rounded-xl border border-slate-800 italic">
          „Świetna robota, pilocie! Obroniliśmy studio przed zatorami i uniknęliśmy lichwiarskich pożyczek. Teraz czas na utrwalenie tego sukcesu w realnym harmonogramie płatności.”
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-800">
          <Link
            href="/gra/1"
            className="text-xs text-slate-400 hover:text-white transition"
          >
            ← Wróć na planszę trasy
          </Link>
          <Link
            href="/plan"
            data-testid="goto-plan-button"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20"
          >
            Zapisz plan i zdobądź ★ Pilot (G22) →
          </Link>
        </div>
      </div>
    </div>
  );
}

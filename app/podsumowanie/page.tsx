"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/ui/game-store";

export default function PodsumowaniePage() {
  const state = useGameStore((s) => s.state);
  const { core } = state;

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Podsumowanie misji (G18)</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Wynik etapu: Poziom 1</h1>
          <p className="text-sm text-slate-300 mt-2">
            Sprawdź stan końcowy, zdobyte gwiazdki i zaoszczędzony koszt pieniądza.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-slate-400">Końcowe saldo gotówki</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {core.balance.toLocaleString("pl-PL")} zł
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-slate-400">Poniesiony koszt pieniądza</div>
            <div className="text-2xl font-bold text-slate-200 font-mono mt-1">
              {core.costOfMoney.toLocaleString("pl-PL")} zł
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-slate-400">Uniknięty koszt (vs pożyczka)</div>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
              {core.avoidedCost !== null ? `${core.avoidedCost.toLocaleString("pl-PL")} zł` : "2 400 zł"}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <h2 className="text-base font-bold text-white">Gwiazdki kompetencji</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-lg">★</span>
              <span>Przetrwanie: <strong>{core.stars.przetrwanie}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-lg">★</span>
              <span>Tanio: <strong>{core.stars.tanio}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-lg">☆</span>
              <span>Pilot: <strong>{core.stars.pilot}</strong> (wymaga zapisania planu)</span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-between items-center border-t border-slate-800">
          <Link href="/gra/1" className="text-sm text-slate-400 hover:text-white">
            ← Wróć do trasy
          </Link>
          <Link
            href="/plan"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition"
          >
            Przejdź do zapisu planu (G22) →
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useGameStore } from "@/lib/ui/game-store";

export default function PlanPage() {
  const state = useGameStore((s) => s.state);
  const saveCurrentPlan = useGameStore((s) => s.saveCurrentPlan);
  const advanceClock = useGameStore((s) => s.advanceClock);
  const [saved, setSaved] = useState(false);
  const [timeTraveled, setTimeTraveled] = useState(false);

  const handleSave = () => {
    saveCurrentPlan("C1");
    setSaved(true);
  };

  const handleTimeTravel = () => {
    advanceClock("2026-12-05");
    setTimeTraveled(true);
  };

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Zapis planu i weryfikacja (G22 / G23)
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Plan operacyjny na konto syntetyczne</h1>
          <p className="text-sm text-slate-300 mt-2">
            Zapisz wypracowany plan płynnościowy, przenieś się w czasie o 2 tygodnie (do 5 grudnia) i sprawdź
            czy zaliczka dotarła na konto bankowe.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="text-xs text-slate-400">Wynegocjowany warunek płatności:</div>
          <div className="text-lg font-bold text-white">
            Zaliczka 15 000 zł (30%) od Klienta A płatna do 3 grudnia 2026
          </div>
          <div className="text-xs text-emerald-400 font-mono">
            Zegar konta syntetycznego: {state.account.clock}
          </div>
        </div>

        <div className="space-y-4">
          {!saved ? (
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition cursor-pointer"
            >
              Zapisz plan (Odblokuj ★ Pilot)
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-700 text-emerald-200 space-y-3">
              <div className="font-bold flex items-center gap-2">
                <span>✓</span> Plan zapisany pomyślnie! Zdobywasz odznakę ★ Pilot.
              </div>
              {!timeTraveled ? (
                <button
                  onClick={handleTimeTravel}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition cursor-pointer"
                >
                  Przewiń czas o 2 tygodnie (21 XI → 5 XII)
                </button>
              ) : (
                <div className="text-sm text-emerald-300 font-medium">
                  ✓ Zegar konta przesunięty do 5 XII: Zaliczka dotarła! Luka 28 grudnia zamknięta.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-between items-center border-t border-slate-800">
          <Link href="/podsumowanie" className="text-sm text-slate-400 hover:text-white">
            ← Wróć do podsumowania
          </Link>
          <Link
            href="/mapa"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-base border border-slate-700 transition"
          >
            Wróć do mapy kampanii →
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGameStore } from "@/lib/ui/game-store";
import { GameAsset } from "@/lib/ui/assets";

export default function PlanPage() {
  const state = useGameStore((s) => s.state);
  const saveCurrentPlan = useGameStore((s) => s.saveCurrentPlan);
  const advanceClock = useGameStore((s) => s.advanceClock);

  const [saved, setSaved] = useState(state.core.stars.pilot === "earned");
  const [timeTraveled, setTimeTraveled] = useState(state.account.clock === "2026-12-05");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSavePlan = () => {
    try {
      setErrorMessage(null);
      saveCurrentPlan("C1");
      setSaved(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Plan operacyjny można zapisać po ukończeniu zwycięskiego etapu (Poziom 1)."
      );
    }
  };

  const handleAdvanceAccountClock = () => {
    advanceClock("2026-12-05");
    setTimeTraveled(true);
  };

  return (
    <div
      role="region"
      aria-label="Zapis planu i walidacja konta (G22 / G23)"
      data-testid="plan-validation-g22-g23"
      className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full flex flex-col justify-center"
    >
      <div className="bg-slate-900 border-2 border-indigo-500/80 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-800">
                Plan operacyjny & Konto (G22 / G23)
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                US-06 & US-07
              </span>
            </div>
            <h1 className="text-3xl font-black text-white mt-2">
              Utrwalenie planu na koncie syntetycznym
            </h1>
          </div>
          <div className="w-14 h-14 flex-shrink-0">
            <GameAsset id="sprite.cfo.happy" width={56} height={56} alt="AI CFO" />
          </div>
        </div>

        {/* Plan Proposal Card (US-06: Zaliczka 15 000 zł ±10% od Klienta A do 4 grudnia) */}
        <div
          data-testid="plan-proposal-card"
          className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Wypracowany warunek manewru C1:</span>
            <span className="font-mono text-emerald-400 font-bold">
              Zegar konta dzisiaj: {state.account.clock}
            </span>
          </div>

          <div className="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span>
            <span>Zaliczka 15 000 zł ±10% od Klienta A do 4 grudnia</span>
          </div>

          <p className="text-xs text-slate-300">
            Zapisanie planu przenosi ustalenia z gry do harmonogramu finansowego firmy na rachunku bankowym.
            Potwierdzenie zapisu odblokowuje trzecią gwiazdkę: <strong className="text-amber-400">★ Pilot</strong>.
          </p>

          <div className="pt-2">
            {errorMessage && (
              <div className="mb-3 text-xs text-amber-300 bg-amber-950/70 border border-amber-700/80 p-3 rounded-xl flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMessage} (Ukończ Tydzień 7 na trasie, aby zapisać zwycięski plan)</span>
              </div>
            )}
            {!saved ? (
              <button
                onClick={handleSavePlan}
                data-testid="save-plan-button"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Zapisz plan operacyjny (Odblokuj ★ Pilot)
              </button>
            ) : (
              <div
                data-testid="plan-saved-confirmation"
                className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-200 text-sm font-semibold flex items-center gap-2"
              >
                <span className="text-lg">★</span>
                <span>Plan zapisany! Odznaka <strong>★ Pilot</strong> została przyznana.</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Time travel validation (US-07: Przewiń czas o 2 tygodnie do 5 XII) */}
        {saved && (
          <div
            data-testid="account-clock-validation"
            className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-700/60 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Weryfikacja na koncie syntetycznym (G23 / US-07)
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Sprawdzenie realizacji planu w czasie
              </h2>
            </div>

            <p className="text-xs text-slate-300">
              Przesuń zegar rachunku bankowego o 2 tygodnie do przodu (z 21 XI do 5 XII),
              aby sprawdzić, czy kontrahent zrealizował obiecany przelew zaliczki.
            </p>

            {!timeTraveled ? (
              <button
                onClick={handleAdvanceAccountClock}
                data-testid="advance-account-clock-button"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                Przewiń czas o 2 tygodnie (21 XI → 5 XII) →
              </button>
            ) : (
              <div
                data-testid="validation-success-box"
                className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-100 space-y-2"
              >
                <div className="font-bold flex items-center gap-2 text-base text-white">
                  <span>✓</span>
                  <span>Zaliczka dotarła! Plan zrealizowany w 100%.</span>
                </div>
                <div className="text-xs text-emerald-200 space-y-1">
                  <div>• Zegar konta: <strong>2026-12-05</strong> (przelew 15 000 zł zaksięgowany).</div>
                  <div>• <strong>Luka 28 grudnia zamknięta:</strong> konto bezpieczne przed sztormem.</div>
                  <div>• Kompetencja <em>Luka płynnościowa</em> zaktualizowana na poziom 3!</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-800">
          <Link
            href="/podsumowanie"
            className="text-xs text-slate-400 hover:text-white transition"
          >
            ← Wróć do podsumowania
          </Link>
          <Link
            href="/mapa"
            data-testid="return-to-map-button"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition border border-slate-700"
          >
            Wróć do Mapy Kampanii (G09) →
          </Link>
        </div>
      </div>
    </div>
  );
}

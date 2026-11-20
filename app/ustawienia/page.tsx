"use client";

import Link from "next/link";
import { useState } from "react";
import { useGameStore } from "@/lib/ui/game-store";

export default function UstawieniaPage() {
  const reset = useGameStore((s) => s.reset);
  const fallbackMode = useGameStore((s) => s.fallbackMode);
  const setFallbackMode = useGameStore((s) => s.setFallbackMode);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [captionsOnly, setCaptionsOnly] = useState(true);
  const [resetDone, setResetDone] = useState(false);

  const handleFullReset = () => {
    reset("demo");
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Ustawienia i Pauza (G24)
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Preferencje gry</h1>
          <p className="text-sm text-slate-300 mt-2">
            Dostosuj dostępność, napisy i opcje symulacji.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">Ograniczenie ruchu (Reduced Motion)</div>
              <div className="text-xs text-slate-400">Wyłącza intensywne animacje lotu i burzy</div>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">Tryb tylko napisy (Captions Only)</div>
              <div className="text-xs text-slate-400">Wyświetla kwestie dialogowe bez konieczności odtwarzania głosu</div>
            </div>
            <input
              type="checkbox"
              checked={captionsOnly}
              onChange={(e) => setCaptionsOnly(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">Wariant awaryjny (U-11 Fallback)</div>
              <div className="text-xs text-slate-400">Lista kart tygodni zamiast trasy wysp</div>
            </div>
            <input
              type="checkbox"
              checked={fallbackMode}
              onChange={(e) => setFallbackMode(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-red-950/30 border border-red-900/60 space-y-3">
          <div className="font-bold text-red-300 text-sm">Reset stanu gry (US-08)</div>
          <p className="text-xs text-slate-400">
            Przywraca oba zegary (gry i konta), ziarno początkowe demo oraz czyści pamięć localStorage.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleFullReset}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer"
            >
              Wykonaj pełny reset (US-08)
            </button>
            {resetDone && <span className="text-xs text-emerald-400 font-semibold">Stan zresetowany!</span>}
          </div>
        </div>

        <div className="pt-4 flex justify-between items-center border-t border-slate-800">
          <Link href="/gra/1" className="text-sm text-slate-400 hover:text-white">
            ← Wróć do gry
          </Link>
          <Link
            href="/mapa"
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
          >
            Mapa kampanii
          </Link>
        </div>
      </div>
    </div>
  );
}

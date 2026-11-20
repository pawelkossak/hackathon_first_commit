"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/lib/ui/game-store";

export function AppHeader() {
  const pathname = usePathname();
  const reset = useGameStore((s) => s.reset);
  const week = useGameStore((s) => s.state.core.week);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    reset("demo");
    setShowConfirm(false);
  };

  return (
    <header className="w-full bg-slate-900 text-white border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Link href="/" className="font-bold text-lg tracking-tight text-amber-400 hover:text-amber-300">
          Pilot Płynności
        </Link>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700"
          title="Zgodnie z wymaganiem GM-01 wszystkie liczby i podmioty w grze są syntetyczne"
        >
          Dane syntetyczne
        </span>
      </div>

      <nav className="flex items-center gap-2 sm:gap-4 text-sm" aria-label="Nawigacja główna">
        <Link
          href="/mapa"
          className={`px-3 py-1.5 rounded transition ${
            pathname === "/mapa" || pathname === "/"
              ? "bg-slate-800 text-white font-medium"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          Mapa
        </Link>
        <Link
          href="/gra/1"
          className={`px-3 py-1.5 rounded transition ${
            pathname?.startsWith("/gra")
              ? "bg-amber-500 text-slate-950 font-bold"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          Trasa (Tydzień {week})
        </Link>
        <Link
          href="/podsumowanie"
          className={`px-3 py-1.5 rounded transition ${
            pathname === "/podsumowanie"
              ? "bg-slate-800 text-white font-medium"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          Podsumowanie
        </Link>
        <Link
          href="/plan"
          className={`px-3 py-1.5 rounded transition ${
            pathname === "/plan"
              ? "bg-slate-800 text-white font-medium"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          Plan
        </Link>
        <Link
          href="/ustawienia"
          className={`px-3 py-1.5 rounded transition ${
            pathname === "/ustawienia"
              ? "bg-slate-800 text-white font-medium"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          Ustawienia
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        {showConfirm ? (
          <div className="flex items-center gap-2 bg-red-950/80 p-1 rounded border border-red-800">
            <span className="text-xs text-red-200">Zresetować grę?</span>
            <button
              onClick={handleReset}
              className="text-xs font-bold bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded cursor-pointer"
            >
              Tak, reset
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-xs text-slate-300 hover:text-white px-1 cursor-pointer"
            >
              Anuluj
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            data-testid="reset-game-button"
            className="text-xs font-medium text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-600 px-2.5 py-1.5 rounded transition cursor-pointer"
            title="Resetuje stan gry do punktu wyjścia (US-08)"
          >
            Reset (US-08)
          </button>
        )}
      </div>
    </header>
  );
}

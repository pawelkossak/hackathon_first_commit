"use client";

import React from "react";
import { useSettingsStore } from "../../narrative/settings-store";

export interface GameSettingsProps {
  onResume?: () => void;
  className?: string;
}

export function GameSettings({ onResume, className = "" }: GameSettingsProps) {
  const {
    playerGender,
    narratorGender,
    volume,
    muted,
    captionsOnly,
    reducedMotion,
    chattiness,
    saveFailed,
    setPlayerGender,
    setNarratorGender,
    setVolume,
    setMuted,
    setCaptionsOnly,
    setReducedMotion,
    setChattiness,
  } = useSettingsStore();

  return (
    <section
      aria-label="Ustawienia gry i dostępność (G24)"
      className={`w-full max-w-xl bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-neutral-100 ${className}`}
    >
      <header className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-5">
        <h2 className="text-xl font-bold text-amber-400">Ustawienia gry i dostępności</h2>
        {onResume && (
          <button
            type="button"
            onClick={onResume}
            className="min-h-[44px] min-w-[44px] px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            Wznów grę
          </button>
        )}
      </header>

      {/* Honest Save Failure Alert if storage fails */}
      {saveFailed && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-950/80 border border-red-600/80 rounded-xl text-xs text-red-200"
        >
          ⚠️ <strong>Błąd zapisu w przeglądarce:</strong> Ustawienia mogą nie zostać zachowane po odświeżeniu strony (brak miejsca w pamięci lub tryb prywatny).
        </div>
      )}

      <div className="space-y-5">
        {/* Postacie - bez resetowania postępu gry! */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Postacie (zmiana bez utraty postępu)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-neutral-300 block mb-1">Twoja postać:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerGender("female")}
                  className={`flex-1 min-h-[44px] py-1.5 px-3 rounded-lg text-xs font-medium border ${
                    playerGender === "female"
                      ? "bg-amber-400 text-neutral-950 border-amber-400 font-semibold"
                      : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
                  }`}
                >
                  Kobieta
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerGender("male")}
                  className={`flex-1 min-h-[44px] py-1.5 px-3 rounded-lg text-xs font-medium border ${
                    playerGender === "male"
                      ? "bg-amber-400 text-neutral-950 border-amber-400 font-semibold"
                      : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
                  }`}
                >
                  Mężczyzna
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs text-neutral-300 block mb-1">Przewodnik (głos):</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNarratorGender("female")}
                  className={`flex-1 min-h-[44px] py-1.5 px-3 rounded-lg text-xs font-medium border ${
                    narratorGender === "female"
                      ? "bg-amber-400 text-neutral-950 border-amber-400 font-semibold"
                      : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
                  }`}
                >
                  Szefowa (Ania)
                </button>
                <button
                  type="button"
                  onClick={() => setNarratorGender("male")}
                  className={`flex-1 min-h-[44px] py-1.5 px-3 rounded-lg text-xs font-medium border ${
                    narratorGender === "male"
                      ? "bg-amber-400 text-neutral-950 border-amber-400 font-semibold"
                      : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
                  }`}
                >
                  Szef
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Audio i Dźwięk */}
        <div className="space-y-3 pt-3 border-t border-neutral-800">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Dźwięk i narracja
          </h3>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="volume-slider" className="text-xs text-neutral-300">
              Głośność głosu: {Math.round(volume * 100)}%
            </label>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-40 accent-amber-400"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMuted(!muted)}
              className={`flex-1 min-h-[44px] py-2 px-3 text-xs rounded-lg border font-medium transition-colors ${
                muted
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 font-semibold"
                  : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              {muted ? "🔇 Dźwięk wyciszony" : "🔊 Dźwięk włączony"}
            </button>

            <button
              type="button"
              onClick={() => setCaptionsOnly(!captionsOnly)}
              className={`flex-1 min-h-[44px] py-2 px-3 text-xs rounded-lg border font-medium transition-colors ${
                captionsOnly
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 font-semibold"
                  : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              {captionsOnly ? "Tylko napisy (bez głosu)" : "Głos + napisy"}
            </button>
          </div>
        </div>

        {/* Dostępność i animacje */}
        <div className="space-y-3 pt-3 border-t border-neutral-800">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Dostępność i styl narracji
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-neutral-200 block">
                Ograniczenie ruchu (Reduced Motion)
              </span>
              <span className="text-[11px] text-neutral-400">
                Wyłącza intensywne animacje chmur, samolotu i przewracania kart
              </span>
            </div>
            <button
              type="button"
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`min-h-[44px] px-3.5 py-1.5 text-xs rounded-lg border font-medium ${
                reducedMotion
                  ? "bg-amber-400 text-neutral-950 border-amber-400 font-semibold"
                  : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
              }`}
            >
              {reducedMotion ? "Włączone" : "Wyłączone"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-neutral-200 block">
                Częstość komentarzy Szefowej/Szefa
              </span>
              <span className="text-[11px] text-neutral-400">
                Standardowa (żarty i reakcje) lub zredukowana (tylko kluczowe finanse)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setChattiness(chattiness === "normal" ? "reduced" : "normal")}
              className={`min-h-[44px] px-3.5 py-1.5 text-xs rounded-lg border font-medium ${
                chattiness === "reduced"
                  ? "bg-amber-400 text-neutral-950 border-amber-400 font-semibold"
                  : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
              }`}
            >
              {chattiness === "reduced" ? "Zredukowana" : "Normalna"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

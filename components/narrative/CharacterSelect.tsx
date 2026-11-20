"use client";

import React from "react";
import type { NarratorGender, PlayerGender } from "../../narrative/types";
import { getCopy } from "../../narrative/copy/get-copy";

export interface CharacterSelectProps {
  playerGender: PlayerGender;
  narratorGender: NarratorGender;
  onPlayerGenderChange: (gender: PlayerGender) => void;
  onNarratorGenderChange: (gender: NarratorGender) => void;
  onConfirm: () => void;
  onBack?: () => void;
  className?: string;
}

export function CharacterSelect({
  playerGender,
  narratorGender,
  onPlayerGenderChange,
  onNarratorGenderChange,
  onConfirm,
  onBack,
  className = "",
}: CharacterSelectProps) {
  const narratorName = narratorGender === "female" ? "Szefowa (Ania)" : "Szef";
  const previewGreeting = getCopy("intro.role", undefined, playerGender, narratorGender);

  return (
    <section
      aria-label="Wybór postaci i przewodnika"
      className={`w-full max-w-2xl bg-neutral-900/95 border border-neutral-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-neutral-100 ${className}`}
    >
      <header className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-400 tracking-tight">
          {getCopy("ui.character_select.title", undefined, playerGender, narratorGender)}
        </h2>
        <p className="text-sm text-neutral-400 mt-1">
          {getCopy("ui.character_select.later", undefined, playerGender, narratorGender)}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* Choice 1: Twoja postać */}
        <fieldset className="bg-neutral-800/70 border border-neutral-700/80 rounded-xl p-4">
          <legend className="text-sm font-semibold text-neutral-200 px-2 uppercase tracking-wide">
            {getCopy("ui.character_select.player", undefined, playerGender, narratorGender)}
          </legend>
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={() => onPlayerGenderChange("female")}
              className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-lg font-medium text-sm transition-all border ${
                playerGender === "female"
                  ? "bg-amber-400 text-neutral-950 border-amber-400 shadow-md font-semibold"
                  : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
              }`}
              aria-pressed={playerGender === "female"}
            >
              {getCopy("ui.player.woman", undefined, playerGender, narratorGender)}
            </button>
            <button
              type="button"
              onClick={() => onPlayerGenderChange("male")}
              className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-lg font-medium text-sm transition-all border ${
                playerGender === "male"
                  ? "bg-amber-400 text-neutral-950 border-amber-400 shadow-md font-semibold"
                  : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
              }`}
              aria-pressed={playerGender === "male"}
            >
              {getCopy("ui.player.man", undefined, playerGender, narratorGender)}
            </button>
          </div>
          <p className="text-xs text-neutral-400 mt-3">
            Wpływa na formy gramatyczne zwrotów do Ciebie.
          </p>
        </fieldset>

        {/* Choice 2: Twój przewodnik */}
        <fieldset className="bg-neutral-800/70 border border-neutral-700/80 rounded-xl p-4">
          <legend className="text-sm font-semibold text-neutral-200 px-2 uppercase tracking-wide">
            {getCopy("ui.character_select.guide", undefined, playerGender, narratorGender)}
          </legend>
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={() => onNarratorGenderChange("female")}
              className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-lg font-medium text-sm transition-all border ${
                narratorGender === "female"
                  ? "bg-amber-400 text-neutral-950 border-amber-400 shadow-md font-semibold"
                  : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
              }`}
              aria-pressed={narratorGender === "female"}
            >
              {getCopy("ui.narrator.szefowa", undefined, playerGender, narratorGender)}
            </button>
            <button
              type="button"
              onClick={() => onNarratorGenderChange("male")}
              className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-lg font-medium text-sm transition-all border ${
                narratorGender === "male"
                  ? "bg-amber-400 text-neutral-950 border-amber-400 shadow-md font-semibold"
                  : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
              }`}
              aria-pressed={narratorGender === "male"}
            >
              {getCopy("ui.narrator.szef", undefined, playerGender, narratorGender)}
            </button>
          </div>
          <p className="text-xs text-neutral-400 mt-3">
            Wpływa na postać właściciela studia i nagrany głos.
          </p>
        </fieldset>
      </div>

      {/* Live Preview Box */}
      <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 my-4">
        <span className="text-xs font-semibold text-amber-400/90 uppercase tracking-wider block mb-1">
          Podgląd zwrotu ({narratorName}):
        </span>
        <blockquote className="text-sm italic text-neutral-300">
          „{previewGreeting}”
        </blockquote>
      </div>

      <footer className="flex items-center justify-between pt-4 mt-6 border-t border-neutral-800">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Wstecz
            </button>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] min-w-[44px] px-6 py-2.5 text-base font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {getCopy("ui.character_select.play", undefined, playerGender, narratorGender)}
          </button>
        </div>
      </footer>
    </section>
  );
}

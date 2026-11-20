"use client";

import React, { useState } from "react";
import type { WeekNumber } from "../../engine";
import { checkReturnParam, getLastActiveSession } from "../../lib/reminders/return-state";
import type { NarratorGender, PlayerGender } from "../../narrative/types";

export interface ReturnBannerProps {
  initialWeek?: WeekNumber;
  playerGender?: PlayerGender;
  narratorGender?: NarratorGender;
  onResume: (week: WeekNumber) => void;
  onDismiss?: () => void;
  className?: string;
}

export function ReturnBanner({
  initialWeek,
  playerGender = "female",
  narratorGender = "female",
  onResume,
  onDismiss,
  className = "",
}: ReturnBannerProps) {
  const [returnWeek] = useState<WeekNumber | null>(() => {
    if (initialWeek) return initialWeek;
    if (typeof window === "undefined") return null;
    const urlWeek = checkReturnParam(window.location.search);
    if (urlWeek) return urlWeek;
    const session = getLastActiveSession();
    if (session && session.week > 1) return session.week;
    return null;
  });
  const [dismissed, setDismissed] = useState(false);

  if (!returnWeek || dismissed) {
    return null;
  }

  const welcomeWord = playerGender === "female" ? "Wróciłaś" : "Wróciłeś";
  const bossTitle = narratorGender === "female" ? "Szefowa Ania" : "Szef";

  const handleResume = () => {
    onResume(returnWeek);
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="Baner powrotu do gry"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-2xl bg-amber-950/95 border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-amber-50 flex items-center justify-between gap-4 transition-all ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center font-bold text-amber-300 text-lg shrink-0"
          aria-hidden="true"
        >
          {returnWeek}
        </div>
        <div>
          <h2 className="text-sm font-bold text-amber-300 tracking-wide">
            {welcomeWord}! Tydzień {returnWeek} z 7 czeka na Twoją decyzję.
          </h2>
          <p className="text-xs text-amber-200/80">
            {bossTitle}: „Burza 28 grudnia jest coraz bliżej — wracasz za stery?”
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleResume}
          className="min-h-[44px] min-w-[44px] px-4 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-neutral-950 font-bold text-xs sm:text-sm rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          Wróć do gry
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="min-h-[44px] min-w-[44px] px-2.5 py-1 text-xs text-amber-300/70 hover:text-amber-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300"
          aria-label="Ukryj baner powrotu"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}

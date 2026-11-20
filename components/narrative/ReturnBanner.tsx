"use client";

// Return banner (N-08, GM-27): every sentence from getCopy; the week total and the storm (forecast minimum)
// come from the engine through returnBannerView. The parent passes the current game state.
import React, { useState } from "react";
import type { GameState, WeekNumber } from "../../engine";
import { checkReturnParam, getLastActiveSession } from "../../lib/reminders/return-state";
import type { NarratorGender, PlayerGender } from "../../narrative/types";
import { returnBannerView } from "./return-banner-view";

export interface ReturnBannerProps {
  /** The game state the player returns to (its forecast gives the storm). */
  state: GameState;
  initialWeek?: WeekNumber;
  playerGender?: PlayerGender;
  narratorGender?: NarratorGender;
  onResume: (week: WeekNumber) => void;
  onDismiss?: () => void;
  className?: string;
}

export function ReturnBanner({
  state,
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

  const view = returnBannerView(state, returnWeek, playerGender, narratorGender);

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
      aria-label={view.aria}
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
          <h2 className="text-base font-bold text-amber-300 tracking-wide">
            {view.title}
          </h2>
          <p className="text-base text-amber-200/80">
            {view.line}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleResume}
          className="min-h-[44px] min-w-[44px] px-4 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-neutral-950 font-bold text-base rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          {view.resume}
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="min-h-[44px] min-w-[44px] px-2.5 py-1 text-base text-amber-300/70 hover:text-amber-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300"
          aria-label={view.dismiss}
        >
          {view.dismissIcon}
        </button>
      </div>
    </aside>
  );
}

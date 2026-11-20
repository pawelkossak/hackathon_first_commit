"use client";

import React from "react";
import { useVoicePlayerStore } from "../../narrative/voice-player-store";

export interface VoicePlayerProps {
  className?: string;
}

export function VoicePlayer({ className = "" }: VoicePlayerProps) {
  const {
    currentLine,
    muted,
    captionsOnly,
    isPlaying,
    hasAudioFailed,
    skip,
    replay,
    toggleMute,
    toggleCaptionsOnly,
  } = useVoicePlayerStore();

  if (!currentLine) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Kwestia narratora i napisy"
      aria-live="polite"
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-neutral-900/95 text-neutral-100 rounded-xl shadow-2xl border border-neutral-700/80 p-4 backdrop-blur-md transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-neutral-700/60 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-400 text-sm tracking-wide uppercase">
            {currentLine.speaker || "Narrator"}
          </span>
          {isPlaying && (
            <span
              className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"
              aria-label="Głos jest odtwarzany"
            />
          )}
          {(captionsOnly || hasAudioFailed || muted) && (
            <span className="text-xs text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
              {captionsOnly ? "Tylko napisy" : muted ? "Wyciszony" : "Napisy (brak audio)"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleCaptionsOnly}
            className="min-h-[44px] min-w-[44px] px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label={captionsOnly ? "Włącz tryb głosu" : "Włącz tryb tylko napisów"}
            title={captionsOnly ? "Wyłącz tryb tylko napisów" : "Włącz tryb tylko napisów"}
          >
            {captionsOnly ? "Głos" : "CC"}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="min-h-[44px] min-w-[44px] px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label={muted ? "Włącz dźwięk" : "Wycisz dźwięk"}
            title={muted ? "Włącz dźwięk" : "Wycisz"}
          >
            {muted ? "Unmute" : "Mute"}
          </button>

          <button
            type="button"
            onClick={replay}
            className="min-h-[44px] min-w-[44px] px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Posłuchaj ponownie"
            title="Powtórz kwestię"
          >
            Replay
          </button>

          <button
            type="button"
            onClick={skip}
            className="min-h-[44px] min-w-[44px] px-2.5 py-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Pomiń kwestię"
            title="Pomiń"
          >
            Skip
          </button>
        </div>
      </div>

      <p className="text-base sm:text-lg leading-relaxed text-neutral-100 font-normal select-text">
        {currentLine.text}
      </p>
    </aside>
  );
}

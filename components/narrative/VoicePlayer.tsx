"use client";

import React from "react";
import { getCopy } from "../../narrative";
import { useSettingsStore } from "../../narrative/settings-store";
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
  const { playerGender, narratorGender } = useSettingsStore();
  const copy = (id: string) => getCopy(id, undefined, playerGender, narratorGender);

  if (!currentLine) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label={copy("ui.voice.aria")}
      aria-live="polite"
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-neutral-900/95 text-neutral-100 rounded-xl shadow-2xl border border-neutral-700/80 p-4 backdrop-blur-md transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-neutral-700/60 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-400 text-base tracking-wide uppercase">
            {currentLine.speaker || copy("ui.voice.speaker_fallback")}
          </span>
          {isPlaying && (
            <span
              className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"
              aria-label={copy("ui.voice.playing")}
            />
          )}
          {(captionsOnly || hasAudioFailed || muted) && (
            <span className="text-base text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
              {copy(captionsOnly ? "ui.voice.badge.captions_only" : muted ? "ui.voice.badge.muted" : "ui.voice.badge.no_audio")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleCaptionsOnly}
            className="min-h-[44px] min-w-[44px] px-2.5 py-1 text-base font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label={copy(captionsOnly ? "ui.voice.voice_mode" : "ui.voice.captions_mode")}
            title={copy(captionsOnly ? "ui.voice.voice_mode" : "ui.voice.captions_mode")}
          >
            {copy(captionsOnly ? "ui.voice.voice" : "ui.voice.cc")}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="min-h-[44px] min-w-[44px] px-2.5 py-1 text-base font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label={copy(muted ? "ui.voice.unmute" : "ui.voice.mute.aria")}
            title={copy(muted ? "ui.voice.unmute" : "ui.voice.mute")}
          >
            {copy(muted ? "ui.voice.unmute" : "ui.voice.mute")}
          </button>

          <button
            type="button"
            onClick={replay}
            className="min-h-[44px] min-w-[44px] px-2.5 py-1 text-base font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label={copy("ui.voice.replay.aria")}
            title={copy("ui.voice.replay")}
          >
            {copy("ui.voice.replay")}
          </button>

          <button
            type="button"
            onClick={skip}
            className="min-h-[44px] min-w-[44px] px-2.5 py-1 text-base font-medium text-amber-400 hover:text-amber-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label={copy("ui.voice.skip.aria")}
            title={copy("ui.voice.skip")}
          >
            {copy("ui.voice.skip")}
          </button>
        </div>
      </div>

      <p className="text-base sm:text-lg leading-relaxed text-neutral-100 font-normal select-text">
        {currentLine.text}
      </p>
    </aside>
  );
}

"use client";

import React, { useEffect } from "react";
import type { Emotion, NarratorGender, PlayerGender } from "../../narrative/types";
import { getCopy } from "../../narrative/copy/get-copy";
import { getVoiceScript } from "../../narrative/copy/voice-scripts";
import { useVoicePlayerStore } from "../../narrative/voice-player-store";

export interface NarratorDialogueProps {
  speaker: string;
  emotion?: Emotion | string;
  text: string;
  audioLineId?: string;
  playerGender?: PlayerGender;
  narratorGender?: NarratorGender;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  canBack?: boolean;
  canSkip?: boolean;
  className?: string;
}

export function NarratorDialogue({
  speaker,
  emotion = "welcoming",
  text,
  audioLineId,
  playerGender = "female",
  narratorGender = "female",
  onNext,
  onBack,
  onSkip,
  nextLabel,
  backLabel,
  skipLabel,
  canBack = true,
  canSkip = true,
  className = "",
}: NarratorDialogueProps) {
  const playVoice = useVoicePlayerStore((s) => s.play);
  const copy = (id: string, extra?: Record<string, string | number>) =>
    getCopy(id, undefined, playerGender, narratorGender, extra);

  // Play corresponding audio line if available
  useEffect(() => {
    if (audioLineId) {
      const script = getVoiceScript(audioLineId, playerGender, narratorGender);
      playVoice({
        id: audioLineId,
        speaker,
        text,
        audioUrl: script?.path ? `/media/${script.path}` : undefined,
        durationMs: script?.durationMs,
      });
    }
  }, [audioLineId, playerGender, narratorGender, speaker, text, playVoice]);

  return (
    <section
      aria-label={copy("ui.narrator_dialogue.aria")}
      className={`w-full max-w-2xl bg-neutral-900/95 border border-neutral-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-neutral-100 ${className}`}
    >
      <header className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-lg"
            aria-hidden="true"
          >
            {speaker.slice(0, 1)}
          </div>
          <div>
            <h2 className="text-base font-semibold text-amber-400 tracking-wide uppercase">
              {speaker}
            </h2>
            <p className="text-base text-neutral-400 capitalize">{copy("ui.narrator_dialogue.mood", { emotion })}</p>
          </div>
        </div>

        {canSkip && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="min-h-[44px] min-w-[44px] px-3 py-1.5 text-base text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 rounded-lg border border-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {skipLabel ?? copy("ui.intro.skip")}
          </button>
        )}
      </header>

      <div className="my-4">
        <p className="text-lg leading-relaxed text-neutral-100 font-normal select-text">
          {text}
        </p>
      </div>

      <footer className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-800">
        <div>
          {canBack && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] min-w-[44px] px-4 py-2 text-base font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {backLabel ?? copy("ui.intro.back")}
            </button>
          )}
        </div>

        <div>
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="min-h-[44px] min-w-[44px] px-5 py-2 text-base font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {nextLabel ?? copy("ui.intro.next")}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}

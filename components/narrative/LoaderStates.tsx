"use client";

// G25–G28 loaders and the honest save failure notice. Every sentence comes from getCopy; the AI wait
// shows the client AI timeout budget (hard rule 4), not a typed-in number.
import React from "react";
import type { WeekNumber } from "../../engine";
import { getCopy, type NarratorGender, type PlayerGender } from "../../narrative";
import { AGENT_CLIENT_TIMEOUT_MS } from "./agent-client";

interface GenderProps {
  playerGender?: PlayerGender;
  narratorGender?: NarratorGender;
}

/**
 * G25 Initial load: loading assets honestly without fake percentages.
 */
export function InitialLoader({
  messageKey = "ui.loader.initial",
  playerGender = "female",
  narratorGender = "female",
}: GenderProps & {
  /** Copy key of the main message. */
  messageKey?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-8 bg-neutral-900/90 border border-neutral-700/80 rounded-2xl max-w-sm mx-auto shadow-2xl text-center"
    >
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-base font-semibold text-neutral-100">
        {getCopy(messageKey, undefined, playerGender, narratorGender)}
      </span>
      <span className="text-base text-neutral-400 mt-1">
        {getCopy("ui.loader.engine", undefined, playerGender, narratorGender)}
      </span>
    </div>
  );
}

/**
 * G26 Between-week transition. `week` is the engine week (state.core.week).
 */
export function WeekTransitionLoader({
  week,
  messageKey = "ui.loader.week_summary",
  playerGender = "female",
  narratorGender = "female",
}: GenderProps & {
  week: WeekNumber;
  /** Copy key of the message under the week. */
  messageKey?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-6 bg-neutral-900/90 border border-neutral-700/80 rounded-2xl max-w-sm mx-auto shadow-2xl text-center"
    >
      <div className="text-amber-400 text-2xl font-bold mb-2">
        {getCopy("ui.hud.week", undefined, playerGender, narratorGender, { week })}
      </div>
      <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-base text-neutral-300">{getCopy(messageKey, undefined, playerGender, narratorGender)}</span>
    </div>
  );
}

/**
 * G27 Waiting for AI reply or audio with "Czytaj dalej bez głosu" bypass (GM-22).
 * The shown budget is the client AI budget AGENT_CLIENT_TIMEOUT_MS (agent-client.ts).
 */
export function AiWaitingLoader({
  onSkipVoice,
  playerGender = "female",
  narratorGender = "female",
}: GenderProps & {
  onSkipVoice?: () => void;
}) {
  const seconds = Math.round(AGENT_CLIENT_TIMEOUT_MS / 1000);
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-4 p-4 bg-neutral-900/95 border border-neutral-700 rounded-xl max-w-md mx-auto shadow-lg text-neutral-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-base">
          {getCopy("ui.loader.ai_wait", undefined, playerGender, narratorGender, { seconds })}
        </span>
      </div>

      {onSkipVoice && (
        <button
          type="button"
          onClick={onSkipVoice}
          className="min-h-[44px] px-3 py-1.5 text-base text-amber-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {getCopy("ui.loader.skip_voice", undefined, playerGender, narratorGender)}
        </button>
      )}
    </div>
  );
}

/**
 * G28 Offline / unconfirmed save failure notice (GM-22).
 * Rule: Save failure is shown honestly.
 */
export function SaveFailureNotice({
  onRetry,
  onContinueOffline,
  playerGender = "female",
  narratorGender = "female",
}: GenderProps & {
  onRetry?: () => void;
  onContinueOffline?: () => void;
}) {
  const copy = (id: string) => getCopy(id, undefined, playerGender, narratorGender);
  return (
    <aside
      role="alert"
      className="p-5 bg-red-950/90 border-2 border-red-600 rounded-2xl max-w-md mx-auto shadow-2xl text-neutral-100"
    >
      <h3 className="mb-2 text-red-400 font-bold text-lg">{copy("ui.save_failure.title")}</h3>

      <p className="text-base text-neutral-300 leading-relaxed mb-4">{copy("ui.save_failure.body")}</p>

      <div className="flex gap-2 justify-end">
        {onContinueOffline && (
          <button
            type="button"
            onClick={onContinueOffline}
            className="min-h-[44px] px-3.5 py-1.5 text-base text-neutral-300 hover:text-white bg-neutral-800 rounded-lg border border-neutral-700 transition-colors"
          >
            {copy("ui.save_failure.continue")}
          </button>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[44px] px-4 py-1.5 text-base font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors"
          >
            {copy("ui.save_failure.retry")}
          </button>
        )}
      </div>
    </aside>
  );
}

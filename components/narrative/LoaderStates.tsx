"use client";

import React from "react";

/**
 * G25 Initial load: loading assets honestly without fake percentages.
 */
export function InitialLoader({
  message = "Przygotowywanie studia graficznego...",
}: {
  message?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-8 bg-neutral-900/90 border border-neutral-700/80 rounded-2xl max-w-sm mx-auto shadow-2xl text-center"
    >
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-sm font-semibold text-neutral-100">{message}</span>
      <span className="text-xs text-neutral-400 mt-1">Uruchamianie silnika finansowego</span>
    </div>
  );
}

/**
 * G26 Between-week transition.
 */
export function WeekTransitionLoader({
  week,
  message = "Podsumowywanie transakcji tygodnia...",
}: {
  week: number;
  message?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-6 bg-neutral-900/90 border border-neutral-700/80 rounded-2xl max-w-sm mx-auto shadow-2xl text-center"
    >
      <div className="text-amber-400 text-2xl font-bold mb-2">Tydzień {week}</div>
      <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-xs text-neutral-300">{message}</span>
    </div>
  );
}

/**
 * G27 Waiting for AI reply or audio with "Czytaj dalej bez głosu" bypass (GM-22).
 */
export function AiWaitingLoader({
  onSkipVoice,
  timeoutSeconds = 3,
}: {
  onSkipVoice?: () => void;
  timeoutSeconds?: number;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-4 p-4 bg-neutral-900/95 border border-neutral-700 rounded-xl max-w-md mx-auto shadow-lg text-neutral-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">
          Oczekiwanie na odpowiedź (maks. {timeoutSeconds} s)...
        </span>
      </div>

      {onSkipVoice && (
        <button
          type="button"
          onClick={onSkipVoice}
          className="min-h-[44px] px-3 py-1.5 text-xs text-amber-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          Czytaj dalej bez głosu
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
}: {
  onRetry?: () => void;
  onContinueOffline?: () => void;
}) {
  return (
    <aside
      role="alert"
      className="p-5 bg-red-950/90 border-2 border-red-600 rounded-2xl max-w-md mx-auto shadow-2xl text-neutral-100"
    >
      <div className="flex items-center gap-2 mb-2 text-red-400 font-bold text-sm">
        <span>⚠️</span>
        <h3>Błąd zapisu stanu gry (G28)</h3>
      </div>

      <p className="text-xs text-neutral-300 leading-relaxed mb-4">
        Nie udało się potwierdzić zapisu stanu gry w pamięci podręcznej przeglądarki.
        Twój aktualny postęp jest aktywny w tej sesji, ale może nie zostać przywrócony po zamknięciu karty.
      </p>

      <div className="flex gap-2 justify-end">
        {onContinueOffline && (
          <button
            type="button"
            onClick={onContinueOffline}
            className="min-h-[44px] px-3.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 rounded-lg border border-neutral-700 transition-colors"
          >
            Kontynuuj bez zapisu
          </button>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[44px] px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors"
          >
            Spróbuj zapisać ponownie
          </button>
        )}
      </div>
    </aside>
  );
}

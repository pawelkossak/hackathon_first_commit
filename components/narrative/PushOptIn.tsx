'use client';

import React, { useState, useEffect } from 'react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  scheduleDemoReminder,
} from '../../lib/reminders/push-client';
import { useSettingsStore } from '../../narrative/settings-store';

export interface PushOptInProps {
  onDismiss: () => void;
  onAccepted?: (channel: 'browser' | 'email') => void;
  onDemoTriggered?: (delaySeconds: number) => void;
  className?: string;
}

export function PushOptIn({
  onDismiss,
  onAccepted,
  onDemoTriggered,
  className = '',
}: PushOptInProps) {
  const { narratorGender } = useSettingsStore();
  const [browserChannel, setBrowserChannel] = useState(true);
  const [emailChannel, setEmailChannel] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>(() => getNotificationPermission());
  const [demoStatus, setDemoStatus] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (isNotificationSupported()) {
      registerServiceWorker();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  const isCountingDown = countdown !== null;
  useEffect(() => {
    if (!isCountingDown) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          setDemoStatus('Przypomnienie dotarło!');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCountingDown]);

  const handleSavePreferences = async () => {
    if (!browserChannel && !emailChannel) {
      setDemoStatus('Wybierz kanał albo wróć do gry.');
      return;
    }

    if (browserChannel) {
      const perm = await requestNotificationPermission();
      setPermissionState(perm);
      if (perm === 'granted') {
        onAccepted?.('browser');
        onDismiss();
        return;
      }
      if (perm === 'denied') {
        setDemoStatus('Przeglądarka blokuje powiadomienia. Baner powrotu nadal działa w grze.');
        return;
      }
    }

    onDismiss();
  };

  const handleTriggerDemo = async () => {
    setIsScheduling(true);
    setDemoStatus('Planujemy próbne przypomnienie…');

    let perm = getNotificationPermission();
    if (perm === 'default') {
      perm = await requestNotificationPermission();
      setPermissionState(perm);
    }

    try {
      const res = await scheduleDemoReminder({
        delaySeconds: 30,
        targetWeek: 3,
        onFallbackTrigger: () => {
          setDemoStatus('Tydzień 3 czeka. Baner powrotu został aktywowany w grze!');
        },
      });

      setIsScheduling(false);
      setCountdown(res.delaySeconds);
      setDemoStatus(res.message);
      onDemoTriggered?.(res.delaySeconds);
    } catch {
      setIsScheduling(false);
      setDemoStatus('Nie udało się zaplanować próby. Baner powrotu nadal działa w grze.');
    }
  };

  const narratorTitle = narratorGender === 'female' ? 'Ania · Szefowa studia' : 'Szef studia';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="optin-title"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm ${className}`}
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-indigo-900/60 bg-slate-900 p-6 text-slate-100 shadow-2xl md:p-8">
        {/* Header with Narrator Avatar badge */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold shadow-md">
            {narratorGender === 'female' ? '👩‍💼' : '👨‍💼'}
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-indigo-400">
              {narratorTitle}
            </div>
            <h2 id="optin-title" className="text-2xl font-bold text-white">
              Kiedy wracamy za stery?
            </h2>
          </div>
        </div>

        {/* Body content */}
        <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-300">
          <p>
            Możemy przypomnieć Ci o kolejnym ruchu, gdy gra będzie wymagała Twojej decyzji. Bez spamu, bez reklam produktów finansowych.
          </p>

          {/* Channels Selection */}
          <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Dostępne kanały powiadomień
            </h3>

            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-slate-800">
              <input
                type="checkbox"
                checked={browserChannel}
                onChange={(e) => setBrowserChannel(e.target.checked)}
                className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <span className="font-medium text-white">Przeglądarka (Web Push)</span>
                <span className="ml-2 text-xs text-slate-400">
                  {permissionState === 'denied'
                    ? '— blokowane w ustawieniach przeglądarki'
                    : permissionState === 'granted'
                    ? '— zgoda udzielona'
                    : '— wymaga akceptacji'}
                </span>
              </div>
            </label>

            <label className="flex min-h-[44px] cursor-not-allowed items-center gap-3 rounded-lg p-2 opacity-60">
              <input
                type="checkbox"
                checked={emailChannel}
                disabled
                onChange={(e) => setEmailChannel(e.target.checked)}
                className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <span className="font-medium text-white">E-mail</span>
                <span className="ml-2 text-xs text-amber-400/90">
                  (Dostępne po zalogowaniu na konto — tryb gościa)
                </span>
              </div>
            </label>
          </div>

          {/* Demo stage trigger (D-14 requirement) */}
          <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/30 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-indigo-300">
                  Test na żywo (Demo pitch 30 s)
                </div>
                <div className="text-xs text-slate-400">
                  Wyślij próbne powiadomienie z odliczaniem 30 sekund na prezentację.
                </div>
              </div>
              <button
                type="button"
                onClick={handleTriggerDemo}
                disabled={isScheduling}
                className="min-h-[44px] rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {isScheduling
                  ? 'Planowanie…'
                  : countdown !== null
                  ? `Przypomnienie za ${countdown} s`
                  : 'Wyślij próbę (30 s)'}
              </button>
            </div>

            {demoStatus && (
              <div
                role="status"
                aria-live="polite"
                className="mt-3 rounded-lg border border-indigo-800/60 bg-indigo-900/40 p-2.5 text-xs text-indigo-200"
              >
                {demoStatus}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onDismiss}
            className="min-h-[44px] min-w-[120px] rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-base font-semibold text-slate-300 transition hover:bg-slate-700 focus:ring-2 focus:ring-slate-500"
          >
            Może później
          </button>
          <button
            type="button"
            onClick={handleSavePreferences}
            className="min-h-[44px] min-w-[160px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-base font-bold text-white shadow-lg transition hover:from-emerald-500 hover:to-teal-500 focus:ring-2 focus:ring-emerald-400"
          >
            Ustaw przypomnienia
          </button>
        </div>
      </div>
    </div>
  );
}

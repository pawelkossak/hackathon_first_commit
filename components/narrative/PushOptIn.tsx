'use client';

import React, { useState, useEffect } from 'react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  scheduleDemoReminder,
} from '../../lib/reminders/push-client';
import type { WeekNumber } from '../../engine';
import { DEMO_REMINDER } from '../../lib/reminders/push-config';
import { getCopy } from '../../narrative';
import { useSettingsStore } from '../../narrative/settings-store';

export interface PushOptInProps {
  onDismiss: () => void;
  onAccepted?: (channel: 'browser' | 'email') => void;
  onDemoTriggered?: (delaySeconds: number) => void;
  /** Week the reminder returns to: the engine week (state.core.week); the push config otherwise. */
  targetWeek?: WeekNumber;
  className?: string;
}

export function PushOptIn({
  onDismiss,
  onAccepted,
  onDemoTriggered,
  targetWeek = DEMO_REMINDER.targetWeek,
  className = '',
}: PushOptInProps) {
  const { playerGender, narratorGender } = useSettingsStore();
  const copy = (id: string, extra?: Record<string, string | number>) =>
    getCopy(id, undefined, playerGender, narratorGender, extra);
  const delaySeconds = DEMO_REMINDER.delaySeconds;
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
  const arrivedText = copy('ui.push.status.arrived');
  useEffect(() => {
    if (!isCountingDown) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          setDemoStatus(arrivedText);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCountingDown, arrivedText]);

  const handleSavePreferences = async () => {
    if (!browserChannel && !emailChannel) {
      setDemoStatus(copy('ui.push.status.choose_channel'));
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
        setDemoStatus(copy('ui.push.status.denied'));
        return;
      }
    }

    onDismiss();
  };

  const handleTriggerDemo = async () => {
    setIsScheduling(true);
    setDemoStatus(copy('ui.push.status.planning'));

    let perm = getNotificationPermission();
    if (perm === 'default') {
      perm = await requestNotificationPermission();
      setPermissionState(perm);
    }

    try {
      const res = await scheduleDemoReminder({
        delaySeconds,
        targetWeek,
        onFallbackTrigger: () => {
          setDemoStatus(copy('ui.push.status.fallback', { week: targetWeek }));
        },
      });

      setIsScheduling(false);
      setCountdown(res.delaySeconds);
      setDemoStatus(res.message);
      onDemoTriggered?.(res.delaySeconds);
    } catch {
      setIsScheduling(false);
      setDemoStatus(copy('ui.push.status.failed'));
    }
  };

  const narratorTitle = copy('ui.push.narrator');

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
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold shadow-md" aria-hidden="true">
            {narratorGender === 'female' ? '👩‍💼' : '👨‍💼'}
          </div>
          <div>
            <div className="text-base font-semibold tracking-wide text-indigo-400">
              {narratorTitle}
            </div>
            <h2 id="optin-title" className="text-2xl font-bold text-white">
              {copy('ui.push.title')}
            </h2>
          </div>
        </div>

        {/* Body content */}
        <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-300">
          <p>
            {copy('ui.push.body')}
          </p>

          {/* Channels Selection */}
          <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4 space-y-3">
            <h3 className="text-base font-semibold uppercase tracking-wider text-slate-400">
              {copy('ui.push.channels')}
            </h3>

            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-slate-800">
              <input
                type="checkbox"
                checked={browserChannel}
                onChange={(e) => setBrowserChannel(e.target.checked)}
                className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <span className="font-medium text-white">{copy('ui.push.browser')}</span>
                <span className="ml-2 text-base text-slate-400">
                  {copy(
                    permissionState === 'denied'
                      ? 'ui.push.permission.denied'
                      : permissionState === 'granted'
                      ? 'ui.push.permission.granted'
                      : 'ui.push.permission.default'
                  )}
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
                <span className="font-medium text-white">{copy('ui.push.email')}</span>
                <span className="ml-2 text-base text-amber-400/90">
                  {copy('ui.push.email.guest')}
                </span>
              </div>
            </label>
          </div>

          {/* Demo stage trigger (D-14 requirement) */}
          <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/30 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-indigo-300">
                  {copy('ui.push.demo.title', { seconds: delaySeconds })}
                </div>
                <div className="text-base text-slate-400">
                  {copy('ui.push.demo.body', { seconds: delaySeconds })}
                </div>
              </div>
              <button
                type="button"
                onClick={handleTriggerDemo}
                disabled={isScheduling}
                className="min-h-[44px] rounded-lg bg-indigo-600 px-4 py-2 text-base font-semibold text-white shadow-md transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {isScheduling
                  ? copy('ui.push.demo.scheduling')
                  : countdown !== null
                  ? copy('ui.push.demo.countdown', { seconds: countdown })
                  : copy('ui.push.demo.send', { seconds: delaySeconds })}
              </button>
            </div>

            {demoStatus && (
              <div
                role="status"
                aria-live="polite"
                className="mt-3 rounded-lg border border-indigo-800/60 bg-indigo-900/40 p-2.5 text-base text-indigo-200"
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
            {copy('ui.push.later')}
          </button>
          <button
            type="button"
            onClick={handleSavePreferences}
            className="min-h-[44px] min-w-[160px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-base font-bold text-white shadow-lg transition hover:from-emerald-500 hover:to-teal-500 focus:ring-2 focus:ring-emerald-400"
          >
            {copy('ui.push.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

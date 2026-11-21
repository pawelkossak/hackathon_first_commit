"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PushOptIn, ReturnBanner } from "../narrative";
import { getNotificationPermission } from "../../lib/reminders/push-client";
import { resumeLink } from "../../lib/reminders/push-config";
import { useGameStore } from "../../lib/ui/game-store";
import { useCopy } from "../../lib/ui/copy";
import type { WeekNumber } from "../../engine";

/**
 * D-14 comeback loop on the lap summary (G34): „Przypomnij mi” opens the narrative PushOptIn with the
 * engine week. When the demo reminder is due and browser push is not granted, the narrative
 * ReturnBanner is shown here as the in-app fallback; its button goes to the resume link of that week.
 */
export function LapReminder() {
  const state = useGameStore((s) => s.state);
  const week = useGameStore((s) => s.state.core.week);
  const { copy, playerGender, narratorGender } = useCopy();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dueInSeconds, setDueInSeconds] = useState<number | null>(null);
  const [fallbackWeek, setFallbackWeek] = useState<WeekNumber | null>(null);

  useEffect(() => {
    if (dueInSeconds === null) return;
    const timer = setTimeout(() => {
      if (getNotificationPermission() !== "granted") setFallbackWeek(week);
      setDueInSeconds(null);
    }, dueInSeconds * 1000);
    return () => clearTimeout(timer);
  }, [dueInSeconds, week]);

  const close = useCallback(() => setOpen(false), []);
  const onDemoTriggered = useCallback((delaySeconds: number) => setDueInSeconds(delaySeconds), []);

  return (
    <div data-testid="lap-reminder" className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <p className="text-base text-indigo-100">{copy("reminder.optin")}</p>
      <button
        type="button"
        data-testid="open-reminder-optin"
        onClick={() => setOpen(true)}
        className="min-h-[44px] shrink-0 inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base"
      >
        {copy("ui.banner.remind_me")}
      </button>
      {open && <PushOptIn targetWeek={week} onDismiss={close} onDemoTriggered={onDemoTriggered} />}
      {fallbackWeek !== null && (
        <ReturnBanner
          state={state}
          initialWeek={fallbackWeek}
          playerGender={playerGender}
          narratorGender={narratorGender}
          onResume={(w) => router.push(resumeLink(w))}
          onDismiss={() => setFallbackWeek(null)}
        />
      )}
    </div>
  );
}

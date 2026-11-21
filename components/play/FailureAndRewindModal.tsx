"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGameStore } from "../../lib/ui/game-store";
import { selectForecast } from "../../lib/ui/game-views";
import { GameAsset } from "../../lib/ui/assets";
import { dayMonth, pln, useCopy } from "../../lib/ui/copy";
import { reactionFor } from "../../narrative";
import type { WeekNumber } from "../../engine";

/** G19 failure and G20 rewind: the only dialog while the lap is crashed. */
export function FailureAndRewindModal() {
  const state = useGameStore((s) => s.state);
  const forecast = useGameStore(selectForecast);
  const rewindToWeek = useGameStore((s) => s.rewindToWeek);
  const [showSelector, setShowSelector] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { copy, label, playerGender, narratorGender } = useCopy();

  const crash = state.core.crash;
  const isCrashed = state.core.status === "crashed" && crash !== null;

  useEffect(() => {
    if (!isCrashed) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showSelector) {
        e.preventDefault();
        setShowSelector(false);
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    modalRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [isCrashed, showSelector]);

  if (!isCrashed || !crash) return null;

  const handleRewind = (week: WeekNumber) => {
    rewindToWeek(week);
    setShowSelector(false);
  };

  // The engine reaction to the crash (rx.crash, then rx.rewind) and the rejected payment from „Zadania”.
  const reaction = reactionFor({ type: "crash", week: crash.week, crash }, state, playerGender, narratorGender);
  const rejected = forecast.tasks.find((t) => t.status === "rejected" && t.id === crash.transactionId) ?? null;
  // Weeks the engine can restore: the snapshots it keeps.
  const rewindWeeks = (Object.keys(state.snapshots).map(Number) as WeekNumber[]).sort((a, b) => a - b);
  const bossSprite = narratorGender === "female" ? "sprite.boss.female.exasperated" : "sprite.boss.male.exasperated";

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="failure-title"
      data-testid="failure-rewind-g19-g20"
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border-2 border-red-500 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
        {!showSelector ? (
          <div className="space-y-6" data-testid="failure-view-g19">
            <h2 id="failure-title" className="text-2xl font-black text-white border-b border-slate-800 pb-4">
              {copy("ui.failure.title")}
            </h2>

            <div className="p-4 rounded-2xl bg-red-950/50 border border-red-700/80 space-y-2 text-base text-red-100">
              <p>
                {copy("g19.cause", {
                  "failure.date": dayMonth(crash.date),
                  "failure.shortfall": pln(crash.shortfall),
                  "supplier.amount": rejected ? pln(Math.abs(rejected.amount)) : crash.transactionId,
                })}
              </p>
              <div className="flex items-center justify-between">
                <span>{label("ui.failure.shortfall")}</span>
                <strong data-testid="failure-shortfall" className="font-mono text-lg text-red-200 font-extrabold">
                  {pln(crash.shortfall)}
                </strong>
              </div>
              {rejected && (
                <div className="flex items-center justify-between border-t border-red-900/60 pt-2">
                  <span>{rejected.title}</span>
                  <span className="font-mono">{pln(rejected.amount)}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
              <div className="w-14 h-14 flex-shrink-0">
                <GameAsset id={bossSprite} width={56} height={56} alt="" />
              </div>
              <div className="text-base text-slate-100 space-y-1" data-testid="failure-reaction">
                {reaction.steps.map((step) => (
                  <p key={step.lineId}>{step.text}</p>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSelector(true)}
                data-testid="open-rewind-selector-button"
                className="min-h-[44px] w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base transition cursor-pointer"
              >
                {copy("ui.failure.rewind")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6" data-testid="rewind-selector-g20">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <h2 id="failure-title" className="text-xl font-black text-white">
                {copy("ui.rewind.select_week")}
              </h2>
              <button
                type="button"
                onClick={() => setShowSelector(false)}
                className="min-h-[44px] min-w-[44px] text-base text-slate-300 hover:text-white px-3"
              >
                {copy("ui.intro.back")}
              </button>
            </div>

            <p className="text-base text-slate-200">{copy("rewind.help")}</p>

            <div className="space-y-2.5">
              {rewindWeeks.map((w) => {
                const snapshot = state.snapshots[w];
                return (
                  <button
                    type="button"
                    key={w}
                    onClick={() => handleRewind(w)}
                    data-testid={`rewind-target-week-${w}`}
                    className="min-h-[44px] w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-400 text-left transition cursor-pointer"
                  >
                    <span className="block font-bold text-white text-base">{label("ui.rewind.week", { week: w })}</span>
                    {snapshot && (
                      <span className="block text-base text-slate-300 mt-0.5 font-mono">
                        {label("ui.rewind.start_balance", { balance: pln(snapshot.balance) })}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

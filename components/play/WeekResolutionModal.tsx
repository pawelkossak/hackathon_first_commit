"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../lib/ui/game-store";
import { pln, shortDate, useCopy } from "../../lib/ui/copy";
import type { WeekNumber } from "../../engine";

/** Lesson line of the copy deck per settled week (G17). Week 7 ends the lap: the summary takes over. */
const LESSON_KEYS: Record<WeekNumber, string> = {
  1: "g17.lesson",
  2: "week.report.2",
  3: "week.report.3",
  4: "week.report.4",
  5: "week.report.5",
  6: "week.report.6",
  7: "success.pending",
};

/** G17. Not shown for a crash: FailureAndRewindModal is then the only dialog (G19). */
export function WeekResolutionModal() {
  const lastResolution = useGameStore((s) => s.lastResolution);
  const status = useGameStore((s) => s.state.core.status);
  const dismissResolution = useGameStore((s) => s.dismissResolution);
  const router = useRouter();
  const { copy, label } = useCopy();
  const modalRef = useRef<HTMLDivElement>(null);

  const visible = lastResolution !== null && lastResolution.crash === null && status !== "crashed";
  const lapDone = status === "completed";

  useEffect(() => {
    if (!visible) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismissResolution();
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
    modalRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [visible, dismissResolution]);

  if (!visible || lastResolution === null) return null;

  const handleContinue = () => {
    dismissResolution();
    if (lapDone) router.push("/podsumowanie");
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolution-title"
      data-testid="week-resolution-g17"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 id="resolution-title" className="text-2xl font-black text-white">
            {copy("ui.week.title")} · {copy("ui.hud.week", { week: lastResolution.week })}
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-base text-slate-300">{label("ui.week.end_balance")}</div>
          <div data-testid="resolution-end-balance" className="text-2xl font-extrabold font-mono mt-1 text-emerald-400">
            {lastResolution.endBalance !== null ? pln(lastResolution.endBalance) : "—"}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-base font-bold text-slate-200">
            {label("ui.week.transactions")} ({lastResolution.transactions.length})
          </div>
          <ul className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {lastResolution.transactions.map((tx) => (
              <li
                key={`${tx.id}-${tx.date}`}
                data-testid={`tx-${tx.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-base"
              >
                <span>
                  <span className="block font-semibold text-white">{tx.title}</span>
                  <span className="block text-sm text-slate-300 font-mono">{shortDate(tx.date)}</span>
                </span>
                <span
                  className={`font-mono font-bold px-2.5 py-1 rounded-lg ${
                    tx.amount > 0 ? "text-emerald-300 bg-emerald-950/60" : "text-rose-200 bg-rose-950/60"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {pln(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p data-testid="resolution-lesson" className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/50 text-base text-slate-100">
          {copy(LESSON_KEYS[lastResolution.week])}
        </p>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            data-autofocus
            onClick={handleContinue}
            data-testid="close-resolution-modal-button"
            className="min-h-[44px] px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base transition cursor-pointer"
          >
            {lapDone ? label("ui.week.to_summary") : copy("ui.week.next")}
          </button>
        </div>
      </div>
    </div>
  );
}

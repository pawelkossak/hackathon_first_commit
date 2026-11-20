"use client";

import React from "react";
import { useGameStore } from "@/lib/ui/game-store";

const LESSONS: Record<number, string> = {
  1: "Weryfikacja numeru konta to tarcza przed zatorami. Zawsze potwierdzaj nagłą zmianę rachunku niezależnym kanałem telefonicznym.",
  2: "Każde nowe zlecenie cieszy, ale sprawdź zapotrzebowanie na kapitał obrotowy (materiały, podwykonawcy) przed terminem płatności zaliczki.",
  3: "W dołku płynnościowym jednorazowy wydatek (nawet z rabatem) może zatopić firmę. Elastyczne koszty miesięczne chronią poduszkę finansową.",
  4: "Środek kwartału to czas na przegląd należności. Przypomnienia wysłane przed terminem zmniejszają ryzyko opóźnień o 40%.",
  5: "Szybkie pożyczki pozabankowe obiecują ratunek w 15 minut, lecz ich ukryty koszt (RRSO) prowadzi do spirali zadłużenia.",
  6: "Opóźnienia płatności od kluczowych klientów wymagają natychmiastowych manewrów — skonto, zaliczka lub limit w rachunku ratują płynność.",
  7: "Finał etapu! Świadome planowanie przepływów pieniężnych (Cash Flow) pozwala przetrwać każdy sztorm gospodarczy.",
};

export function WeekResolutionModal() {
  const lastResolution = useGameStore((s) => s.lastResolution);
  const rewindToWeek = useGameStore((s) => s.rewindToWeek);

  if (!lastResolution) return null;

  const handleClose = () => {
    useGameStore.setState({ lastResolution: null });
  };

  const isCrashed = lastResolution.crash !== null;
  const lesson = LESSONS[lastResolution.week] ?? "Zarządzanie płynnością wymaga codziennej kontroli salda.";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolution-title"
      data-testid="week-resolution-g17"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Rozliczenie tygodnia (G17)
            </span>
            <h2 id="resolution-title" className="text-2xl font-black text-white mt-1">
              {isCrashed ? "⚠️ Przelew nie wystartował!" : `Tydzień ${lastResolution.week} zakończony`}
            </h2>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              isCrashed
                ? "bg-red-950 text-red-300 border border-red-700"
                : "bg-emerald-950 text-emerald-300 border border-emerald-700"
            }`}
          >
            {isCrashed ? "Sztorm / Deficyt" : "Płynność utrzymana"}
          </span>
        </div>

        {/* End balance & crash details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-slate-400">Saldo na koniec tygodnia</div>
            <div
              className={`text-2xl font-extrabold font-mono mt-1 ${
                lastResolution.endBalance !== null && lastResolution.endBalance >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {lastResolution.endBalance !== null
                ? `${lastResolution.endBalance.toLocaleString("pl-PL")} zł`
                : "Brak środków (deficyt)"}
            </div>
          </div>

          {isCrashed && lastResolution.crash && (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-200">
              <div className="text-xs text-red-300">Deficyt w dniu {lastResolution.crash.date}</div>
              <div className="text-xl font-bold font-mono mt-1">
                Brakuje: {lastResolution.crash.shortfall.toLocaleString("pl-PL")} zł
              </div>
            </div>
          )}
        </div>

        {/* Transactions list with floating amounts (US-04) */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Przepływy tygodnia ({lastResolution.transactions.length})
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {lastResolution.transactions.map((tx) => {
              const isInflow = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  data-testid={`tx-${tx.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{tx.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {tx.date} · {tx.counterpartyId}
                    </div>
                  </div>

                  <div
                    className={`font-mono font-bold text-base px-2.5 py-1 rounded-lg ${
                      isInflow
                        ? "text-emerald-400 bg-emerald-950/60 border border-emerald-800/60"
                        : "text-rose-300 bg-rose-950/60 border border-rose-900/60"
                    }`}
                  >
                    {isInflow ? "+" : ""}
                    {tx.amount.toLocaleString("pl-PL")} zł
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lesson box (US-04) */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/50 text-amber-200 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span>💡</span> Lekcja pilota płynności
          </div>
          <p className="text-xs sm:text-sm text-slate-200">{lesson}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {isCrashed ? (
            <button
              onClick={() => {
                rewindToWeek(lastResolution.week);
                handleClose();
              }}
              data-testid="rewind-crash-button"
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition shadow-lg shadow-red-600/30 cursor-pointer"
            >
              ⟲ Cofnij czas do początku Tygodnia {lastResolution.week} (Rewind)
            </button>
          ) : (
            <button
              onClick={handleClose}
              data-testid="close-resolution-modal-button"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Kontynuuj lot →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

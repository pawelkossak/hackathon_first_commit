"use client";

import React from "react";
import { useGameStore } from "@/lib/ui/game-store";
import { GameAsset } from "@/lib/ui/assets";
import type { EventChoiceId, EventId } from "../../engine";

const EVENT_SPRITES: Record<EventId, string> = {
  E1: "sprite.event.account-change",
  E2: "sprite.event.new-order",
  E3: "sprite.event.ai-tool",
  E5: "sprite.action.nonbank-loan",
  E6: "sprite.event.late-customer",
};

export function EventCard() {
  const currentEvent = useGameStore((s) => s.getCurrentEvent());
  const resolveCurrentEvent = useGameStore((s) => s.resolveCurrentEvent);
  const state = useGameStore((s) => s.state);
  const rewindToWeek = useGameStore((s) => s.rewindToWeek);

  // Check if fraudRevealed occurred in emitted events
  const fraudEvent = state.emitted.find((e) => e.type === "fraudRevealed");

  if (fraudEvent) {
    return (
      <div
        role="alert"
        data-testid="fraud-revealed-banner"
        className="w-full bg-red-950/90 border-2 border-red-500 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚨</span>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              Ujawniono oszustwo finansowe (D-18 / GM-05)
            </span>
            <h2 className="text-2xl font-black text-white">Fałszywy numer konta!</h2>
          </div>
        </div>

        <p className="text-sm text-red-200 max-w-2xl">
          Przelew 12 000 zł z Tygodnia 1 („Zapłać jak jest”) trafił na konto oszusta podszywającego się pod podwykonawcę.
          Prawdziwy podwykonawca domaga się zapłaty, co doprowadziło do załamania płynności!
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => rewindToWeek(1)}
            data-testid="rewind-fraud-button"
            className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-black text-sm transition shadow-lg shadow-red-500/30 cursor-pointer"
          >
            ⟲ Cofnij do Tygodnia 1 i zweryfikuj konto (Rewind)
          </button>
        </div>
      </div>
    );
  }

  if (!currentEvent) return null;

  const spriteId = EVENT_SPRITES[currentEvent.id] ?? "sprite.event.account-change";

  const handleChoice = (choiceId: EventChoiceId) => {
    resolveCurrentEvent(choiceId);
  };

  return (
    <section
      role="region"
      aria-label="Bieżące wydarzenie losowe (G11)"
      data-testid="event-card-g11"
      className="w-full bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-6 shadow-2xl space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-full">
            Wydarzenie {currentEvent.id} · Tydzień {currentEvent.week}
          </span>
          {currentEvent.id === "E1" && (
            <span className="text-xs text-rose-400 font-semibold">Weryfikacja kontrahenta</span>
          )}
          {currentEvent.id === "E5" && (
            <span className="text-xs text-orange-400 font-semibold">Pułapka pożyczki SMS</span>
          )}
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Wymaga podjęcia decyzji przed wylotem do kolejnego tygodnia
        </span>
      </div>

      {/* Body: Graphic & Context */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 p-2">
          <GameAsset id={spriteId} width={64} height={64} alt={currentEvent.title} />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black text-white">{currentEvent.title}</h2>
          <p className="text-sm text-slate-300 max-w-3xl">
            {currentEvent.id === "E1" &&
              "Podwykonawca nadesłał maila z nagłą informacją o zmianie numeru konta bankowego do faktury na 12 000 zł. Czy potwierdzasz zmianę telefonicznie, czy opłacasz bez weryfikacji?"}
            {currentEvent.id === "E2" &&
              "Klient C proponuje nowe pilne zlecenie graficzne. Wpłaci zaliczkę 20 000 zł, ale musisz natychmiast kupić materiały za 15 000 zł."}
            {currentEvent.id === "E3" &&
              "Pojawiła się możliwość zakupu rocznej subskrypcji narzędzia AI do grafiki ze zniżką (-3 600 zł jednorazowo) lub odłożenia wydatku na styczeń."}
            {currentEvent.id === "E5" &&
              "W obliczu trudności z gotówką otrzymujesz ofertę SMS: „Pożyczka w 15 minut bez formalności!”. Zanim klikniesz, możesz sprawdzić rzeczywisty koszt i RRSO."}
            {currentEvent.id === "E6" &&
              "Klient A prosi o przesunięcie terminu płatności głównej faktury na styczeń ze względu na zamknięcie roku budżetowego."}
          </p>
        </div>
      </div>

      {/* Choices */}
      <div className="pt-2 flex flex-wrap gap-3">
        {currentEvent.choices.map((choice) => {
          const isCheck = choice.id === "check";
          const isRisky = choice.id === "pay_as_is";
          const isShowCost = choice.id === "show_cost";

          return (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice.id)}
              data-testid={`event-choice-${choice.id}`}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition shadow-md cursor-pointer flex items-center gap-2 ${
                isCheck
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                  : isRisky
                  ? "bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-600"
                  : isShowCost
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                  : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              }`}
            >
              {isCheck && <span>🛡️</span>}
              {isRisky && <span>⚠️</span>}
              {isShowCost && <span>🔍</span>}
              <span>{choice.label ?? choice.id}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

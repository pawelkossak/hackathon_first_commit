"use client";

import React, { useEffect } from "react";
import { useGameStore } from "@/lib/ui/game-store";
import { Card } from "./Card";
import type { CardId } from "../../engine";

export interface CardHandProps {
  className?: string;
}

export function CardHand({ className = "" }: CardHandProps) {
  const cards = useGameStore((s) => s.getAvailableCards());
  const selectedCardId = useGameStore((s) => s.selectedCardId);
  const activePreview = useGameStore((s) => s.activePreview);
  const selectCard = useGameStore((s) => s.selectCard);
  const playSelectedCard = useGameStore((s) => s.playSelectedCard);

  // Keyboard shortcut listener: keys 1–6 select corresponding card
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.isComposing
      ) {
        return;
      }

      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 6) {
        const targetCard = cards.find((c) => c.key === keyNum);
        if (targetCard) {
          e.preventDefault();
          selectCard(selectedCardId === targetCard.id ? null : targetCard.id);
        }
      } else if (e.key === "Escape" && selectedCardId) {
        e.preventDefault();
        selectCard(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cards, selectedCardId, selectCard]);

  const handleCardClick = (id: CardId) => {
    selectCard(selectedCardId === id ? null : id);
  };

  const selectedCard = cards.find((c) => c.id === selectedCardId);

  return (
    <section
      role="region"
      aria-label="Karty manewrów finansowych (G13)"
      data-testid="card-hand-g13"
      className={`w-full flex flex-col gap-4 ${className}`}
    >
      {/* Hand header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Ręka kart manewrów (G13)
          </span>
          <h2 className="text-xl font-black text-white mt-0.5">Wybierz manewr na ten tydzień</h2>
        </div>
        <div className="text-xs text-slate-400">
          Użyj klawiszy <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono">1</kbd>–<kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono">6</kbd> lub kliknij kartę
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            isSelected={selectedCardId === card.id}
            onSelect={handleCardClick}
          />
        ))}
      </div>

      {/* Non-committing Preview Panel (GM-03 / G13 / G29) */}
      {selectedCard && activePreview && (
        <div
          data-testid="card-preview-panel"
          className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
        >
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Podgląd symulacji (nie zatwierdza ruchu)
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {selectedCard.id}: {selectedCard.title}
              </span>
            </div>

            <div className="text-base font-bold text-white flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                Przed decyzją:{" "}
                <span className="font-mono text-purple-300">
                  {activePreview.before.minimum.balance.toLocaleString("pl-PL")} zł
                </span>
              </span>
              <span className="text-slate-500">→</span>
              <span>
                Po zagraniu:{" "}
                <span className="font-mono text-emerald-400">
                  {activePreview.after.minimum.balance.toLocaleString("pl-PL")} zł
                </span>
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-xs font-normal text-slate-300">
                Koszt manewru: <strong className="text-amber-300">{activePreview.cost.toLocaleString("pl-PL")} zł</strong>
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {activePreview.after.crash
                ? `Uwaga: Ten manewr nadal nie chroni w pełni przed sztormem (deficyt ${activePreview.after.crash.shortfall.toLocaleString("pl-PL")} zł).`
                : "Świetny ruch! Ten manewr skutecznie likwiduje grudniowy deficyt gotówkowy."}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => playSelectedCard(false)}
              disabled={!selectedCard.playable}
              data-testid="confirm-play-card-button"
              className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg ${
                selectedCard.playable
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              Zatwierdź manewr ({selectedCard.id})
            </button>
            <button
              onClick={() => selectCard(null)}
              data-testid="cancel-card-preview-button"
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition cursor-pointer"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import React, { useEffect } from "react";
import { useGameStore } from "../../lib/ui/game-store";
import { selectCards } from "../../lib/ui/game-views";
import { dayMonth, pln, useCopy } from "../../lib/ui/copy";
import { Card } from "./Card";
import type { CardId } from "../../engine";

export interface CardHandProps {
  className?: string;
}

export function CardHand({ className = "" }: CardHandProps) {
  const cards = useGameStore(selectCards);
  const selectedCardId = useGameStore((s) => s.selectedCardId);
  const activePreview = useGameStore((s) => s.activePreview);
  const selectCard = useGameStore((s) => s.selectCard);
  const playSelectedCard = useGameStore((s) => s.playSelectedCard);
  const { copy, label } = useCopy();

  // Keys 1–6 select a card outside text fields; Escape clears the preview.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable) ||
        e.isComposing ||
        document.querySelector('[aria-modal="true"]') !== null
      ) {
        return;
      }

      const keyNum = Number.parseInt(e.key, 10);
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
      aria-label={copy("ui.route.choose_action")}
      data-testid="card-hand-g13"
      className={`w-full flex flex-col gap-4 ${className}`}
    >
      <h2 className="text-xl font-black text-white">{copy("ui.route.choose_action")}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((card) => (
          <Card key={card.id} card={card} isSelected={selectedCardId === card.id} onSelect={handleCardClick} />
        ))}
      </div>

      {selectedCard && activePreview && (
        <div
          data-testid="card-preview-panel"
          className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
        >
          <div className="space-y-2 max-w-3xl">
            <div className="text-base font-bold uppercase tracking-wider text-amber-300">
              {label("ui.preview.title")} · {selectedCard.title}
            </div>

            <p className="text-base text-white" data-testid="card-preview-summary">
              {copy("g30.summary", {
                "forecast.baselineLow": pln(activePreview.before.minimum.balance),
                "forecast.scenarioName": selectedCard.title,
                "forecast.currentLow": pln(activePreview.after.minimum.balance),
              })}
            </p>

            <p className="text-base text-slate-200">
              {label("ui.hud.cost_of_money")}: <strong className="text-amber-300">{pln(activePreview.cost)}</strong>
            </p>

            {activePreview.after.crash && (
              <p className="text-base text-red-200" data-testid="card-preview-crash">
                {copy("g15.risk", { "forecast.lowDate": dayMonth(activePreview.after.crash.date) })}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => playSelectedCard(false)}
              disabled={!selectedCard.playable}
              data-testid="confirm-play-card-button"
              className={`min-h-[44px] flex-1 lg:flex-none px-6 py-3 rounded-xl font-bold text-base transition shadow-lg ${
                selectedCard.playable
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
                  : "bg-slate-800 text-slate-400 cursor-not-allowed"
              }`}
            >
              {copy("ui.btn.confirm_action")}
            </button>
            <button
              type="button"
              onClick={() => selectCard(null)}
              data-testid="cancel-card-preview-button"
              className="min-h-[44px] px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-base font-semibold transition cursor-pointer"
            >
              {copy("ui.btn.close")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

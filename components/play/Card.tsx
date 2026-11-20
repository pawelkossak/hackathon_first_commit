"use client";

import React from "react";
import type { CardView } from "../../engine";
import { GameAsset } from "@/lib/ui/assets";

export interface CardProps {
  card: CardView;
  isSelected: boolean;
  onSelect: (cardId: CardView["id"]) => void;
  className?: string;
}

const SPRITE_MAP: Record<string, string> = {
  C1: "sprite.action.advance",
  C2: "sprite.action.discount",
  C3: "sprite.action.postpone",
  C4: "sprite.action.overdraft",
  C5: "sprite.action.nonbank-loan",
  C6: "sprite.action.factoring",
};

export function Card({ card, isSelected, onSelect, className = "" }: CardProps) {
  const spriteId = SPRITE_MAP[card.id] ?? "sprite.action.advance";

  return (
    <div
      role="button"
      tabIndex={card.playable ? 0 : -1}
      aria-pressed={isSelected}
      aria-disabled={!card.playable}
      data-testid={`card-${card.id}`}
      onClick={() => onSelect(card.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(card.id);
        }
      }}
      className={`rounded-2xl p-4 border transition-all flex flex-col justify-between select-none min-h-[220px] ${
        isSelected
          ? "bg-slate-800 border-amber-400 ring-4 ring-amber-400/40 shadow-xl shadow-amber-500/10 -translate-y-1"
          : card.playable
          ? "bg-slate-900/90 border-slate-700/80 hover:border-slate-500 hover:-translate-y-0.5 cursor-pointer shadow-md"
          : "bg-slate-950/60 border-slate-800/80 opacity-55 cursor-not-allowed"
      } ${className}`}
    >
      {/* Header: Key shortcut and Cost */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-[11px] text-white">
              {card.key}
            </kbd>
            <span>{card.id}</span>
          </span>

          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              card.cost === 0
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : "bg-amber-950 text-amber-300 border border-amber-800"
            }`}
          >
            {card.cost === 0 ? "Bezkosztowa" : `${card.cost.toLocaleString("pl-PL")} zł`}
            {card.costIsEstimate && "*"}
          </span>
        </div>

        {/* Card Graphic & Title */}
        <div className="flex items-center gap-3 my-2">
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <GameAsset id={spriteId} width={48} height={48} alt={card.title} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{card.title}</h3>
            {card.isProduct && (
              <span className="inline-block mt-0.5 text-[10px] uppercase font-semibold text-sky-400">
                Produkt finansowy
              </span>
            )}
          </div>
        </div>

        {/* Labels / Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {card.labels.map((lbl) => (
            <span
              key={lbl}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
            >
              {lbl}
            </span>
          ))}
        </div>
      </div>

      {/* Footer / Disabled reason */}
      <div className="mt-3 pt-2 border-t border-slate-800">
        {!card.playable && card.disabledReason ? (
          <div
            data-testid={`card-disabled-${card.id}`}
            className="text-[11px] text-red-300 bg-red-950/60 border border-red-900/60 p-1.5 rounded-lg flex items-center gap-1.5"
          >
            <span className="text-xs">⚠️</span>
            <span className="truncate">{card.disabledReason.text ?? card.disabledReason.code}</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Dostępne: T{card.window.from}–T{card.window.to}</span>
            {isSelected && <span className="text-amber-400 font-bold">Wybrana</span>}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import type { CardView } from "../../engine";
import { disabledReasonText } from "../../narrative";
import { GameAsset } from "../../lib/ui/assets";
import { pln, useCopy } from "../../lib/ui/copy";

export interface CardProps {
  card: CardView;
  isSelected: boolean;
  onSelect: (cardId: CardView["id"]) => void;
  className?: string;
}

const SPRITE_MAP: Record<CardView["id"], string> = {
  C1: "sprite.action.advance",
  C2: "sprite.action.discount",
  C3: "sprite.action.postpone",
  C4: "sprite.action.overdraft",
  C5: "sprite.action.nonbank-loan",
  C6: "sprite.action.factoring",
};

export function Card({ card, isSelected, onSelect, className = "" }: CardProps) {
  const { label, playerGender, narratorGender } = useCopy();
  const reason = card.disabledReason ? disabledReasonText(card.disabledReason, playerGender, narratorGender) : null;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-disabled={!card.playable}
      data-testid={`card-${card.id}`}
      onClick={() => onSelect(card.id)}
      className={`text-left rounded-2xl p-4 border transition-all flex flex-col justify-between select-none min-h-[220px] focus:outline-none focus:ring-2 focus:ring-amber-400 ${
        isSelected
          ? "bg-slate-800 border-amber-400 ring-4 ring-amber-400/40 shadow-xl -translate-y-1"
          : card.playable
          ? "bg-slate-900/90 border-slate-700/80 hover:border-slate-500 cursor-pointer shadow-md"
          : "bg-slate-950/60 border-slate-800/80 cursor-pointer"
      } ${className}`}
    >
      <span className="block">
        <span className="flex items-center justify-between gap-2 mb-2">
          <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-base text-white font-mono">
            {card.key}
          </kbd>
          <span
            className={`text-base font-mono font-bold px-2 py-0.5 rounded-full ${
              card.cost === 0
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : "bg-amber-950 text-amber-300 border border-amber-800"
            }`}
          >
            {card.cost === 0 ? label("ui.card.cost_free") : pln(card.cost)}
            {card.costIsEstimate && " *"}
          </span>
        </span>

        <span className="flex items-center gap-3 my-2">
          <span className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <GameAsset id={SPRITE_MAP[card.id]} width={48} height={48} alt="" />
          </span>
          <span className="block">
            <span className="block text-base font-bold text-white leading-tight">{card.title}</span>
            {card.isProduct && (
              <span className="block mt-0.5 text-base font-semibold text-sky-300">{label("ui.card.product")}</span>
            )}
          </span>
        </span>

        <span className="flex flex-wrap gap-1 mt-2">
          {card.labels.map((lbl) => (
            <span
              key={lbl}
              className="text-base font-medium px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-200 border border-slate-700/60"
            >
              {lbl}
            </span>
          ))}
        </span>
      </span>

      <span className="block mt-3 pt-2 border-t border-slate-800">
        {reason ? (
          <span
            data-testid={`card-disabled-${card.id}`}
            className="block text-base text-red-200 bg-red-950/60 border border-red-900/60 p-1.5 rounded-lg"
          >
            {reason}
          </span>
        ) : (
          <span className="block text-base text-slate-300">
            {label("ui.card.window")} {card.window.from}–{card.window.to}
          </span>
        )}
      </span>
    </button>
  );
}

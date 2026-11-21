"use client";

// G15 AI-CFO hint: the options are exactly getCfoHint(state).options with their engine cost (D-17:
// a product only as the last resort). The component never builds its own list.
import React from "react";
import type { CardId, GameState } from "../../engine";
import {
  formatDayMonth,
  formatPln,
  getCopy,
  getLocale,
  type NarratorGender,
  type PlayerGender,
} from "../../narrative";
import { cfoView } from "./advisor-views";

export interface CfoAdvisorProps {
  state: GameState;
  playerGender?: PlayerGender;
  narratorGender?: NarratorGender;
  onPlayCard?: (cardId: CardId) => void;
  onDelegate?: () => void;
  onClose?: () => void;
  className?: string;
}

export function CfoAdvisor({
  state,
  playerGender = "female",
  narratorGender = "female",
  onPlayCard,
  onDelegate,
  onClose,
  className = "",
}: CfoAdvisorProps) {
  const view = cfoView(state);
  const locale = getLocale();
  const copy = (id: string, extra?: Record<string, string | number>) =>
    getCopy(id, state, playerGender, narratorGender, extra);
  const risk = view.risk;

  return (
    <section
      aria-label={copy("ui.ai_cfo.title")}
      className={`w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-neutral-100 ${className}`}
    >
      <header className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-400 text-lg"
            aria-hidden="true"
          >
            {copy("ui.ai_cfo.badge")}
          </div>
          <div>
            <h2 className="text-lg font-bold text-cyan-400">{copy("ui.ai_cfo.title")}</h2>
            <p className="text-base text-neutral-400">{copy("ui.ai_cfo.subtitle")}</p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] text-base px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            {copy("ui.btn.close")}
          </button>
        )}
      </header>

      <div
        role="status"
        className={`p-4 rounded-xl border mb-5 ${
          risk ? "bg-red-950/50 border-red-700/60 text-red-200" : "bg-emerald-950/40 border-emerald-700/60 text-emerald-200"
        }`}
      >
        <span className="font-semibold block text-base mb-1">
          {copy(risk ? "ui.ai_cfo.risk.title" : "ui.ai_cfo.ok.title")}
        </span>
        <p className="text-base leading-relaxed opacity-90">
          {risk
            ? copy("ui.ai_cfo.risk.body", {
                "risk.shortfall": formatPln(risk.shortfall, locale),
                "risk.date": formatDayMonth(risk.date, locale),
              })
            : copy("ui.ai_cfo.ok.body")}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <h3 className="text-base font-semibold uppercase tracking-wider text-neutral-400">
          {copy("ui.ai_cfo.options")}
        </h3>

        {view.options.length === 0 && (
          <p className="text-base text-neutral-400 italic">{copy("ui.ai_cfo.none")}</p>
        )}

        {view.options.map((opt) => (
          <div
            key={opt.cardId}
            data-card-id={opt.cardId}
            className="p-3.5 bg-neutral-800/80 border border-neutral-700 rounded-xl flex items-center justify-between gap-4"
          >
            <div>
              <span className="font-semibold text-base text-neutral-100 block">{opt.title}</span>
              <span className="text-base text-amber-300/90">
                {copy(opt.costIsEstimate ? "ui.ai_cfo.cost_estimate" : "ui.ai_cfo.cost", {
                  "option.cost": formatPln(opt.cost, locale),
                })}
              </span>
            </div>
            {onPlayCard && (
              <button
                type="button"
                onClick={() => onPlayCard(opt.cardId)}
                className="min-h-[44px] px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-base rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {copy("ui.ai_cfo.choose")}
              </button>
            )}
          </div>
        ))}
      </div>

      <footer className="pt-4 border-t border-neutral-800 flex items-center justify-between">
        <span className="text-base text-neutral-400">
          {copy("ui.ai_cfo.delegation", { "competence.level": view.delegatedCompetenceLevel })}
        </span>
        {onDelegate && (
          <button
            type="button"
            onClick={onDelegate}
            disabled={view.options.length === 0}
            className="min-h-[44px] px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-amber-300 border border-amber-400/40 font-semibold text-base rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {copy("ui.ai_cfo.delegate")}
          </button>
        )}
      </footer>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGameStore } from "../../lib/ui/game-store";
import { selectCards, selectForecast } from "../../lib/ui/game-views";
import { GameAsset } from "../../lib/ui/assets";
import { dayMonth, pln, shortDate, useCopy } from "../../lib/ui/copy";
import { InitialLoader } from "../../components/narrative";
import { createPlan, gameData, isRuleError, type CardId, type GameState, type Plan, type PlanStatus } from "../../engine";

const PLAN_STATUS_KEY: Record<PlanStatus, string> = {
  met: "g23.received",
  missed: "g23.missed",
  ask: "plan.ask",
  open: "plan.open",
};

/** Cards of the winning lap the engine accepts as a plan (createPlan throws for any other). */
function planCandidates(state: GameState): Plan[] {
  if (state.core.status !== "completed") return [];
  const plans: Plan[] = [];
  for (const played of state.core.played) {
    try {
      plans.push(createPlan(state, played.cardId));
    } catch (err) {
      if (!isRuleError(err)) throw err;
    }
  }
  return plans;
}

/** G22 plan save and G23 account validation. Status, matched transactions and competence come from the engine. */
export default function PlanPage() {
  const hydrated = useGameStore((s) => s.hydrated);
  const state = useGameStore((s) => s.state);
  const forecast = useGameStore(selectForecast);
  const cards = useGameStore(selectCards);
  const saveCurrentPlan = useGameStore((s) => s.saveCurrentPlan);
  const advanceClock = useGameStore((s) => s.advanceClock);
  const { copy, label } = useCopy();
  const [chosen, setChosen] = useState<CardId | null>(null);

  if (!hydrated) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <InitialLoader message={copy("loader.start")} />
      </div>
    );
  }

  const candidates = planCandidates(state);
  const savedPlan = state.account.plans.find((p) => p.savedAt !== null) ?? null;
  const draft = savedPlan ?? candidates.find((p) => p.cardId === chosen) ?? candidates[0] ?? null;

  if (!draft) {
    return (
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col justify-center" data-testid="plan-not-allowed">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-4">
          <h1 className="text-2xl font-black text-white">{label("ui.plan.not_allowed")}</h1>
          <p className="text-base text-slate-200">{copy("plan.goal")}</p>
          <Link
            href="/gra/1"
            className="inline-flex min-h-[44px] items-center px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base"
          >
            {label("ui.summary.back_to_game")}
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = savedPlan !== null;
  const pilotEarned = state.core.stars.pilot === "earned";
  const clockStart = gameData.futureScript.accountClock.start;
  const clockTarget = gameData.futureScript.accountClock.defaultTarget;
  const clockAdvanced = state.account.clock > clockStart;
  const cardTitle = cards.find((c) => c.id === draft.cardId)?.title ?? draft.title;
  const competence = gameData.level1.competences.find((c) => c.id === cards.find((x) => x.id === draft.cardId)?.competenceId);
  const planText =
    draft.cardId === "C1"
      ? copy("g22.plan", {
          "advance.amount": pln(draft.amount),
          "advance.tolerance": `±${draft.tolerancePct}%`,
          "advance.deadline": dayMonth(draft.deadline),
        })
      : draft.title;

  return (
    <div
      role="region"
      aria-label={copy("ui.btn.save_plan")}
      data-testid="plan-validation-g22-g23"
      className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full flex flex-col justify-center"
    >
      <div className="bg-slate-900 border-2 border-indigo-500/80 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-black text-white">{copy("ui.btn.save_plan")}</h1>
          <div className="w-14 h-14 flex-shrink-0">
            <GameAsset id="sprite.cfo.happy" width={56} height={56} alt="" />
          </div>
        </div>

        {!isSaved && candidates.length > 1 && (
          <fieldset className="space-y-2">
            <legend className="text-base font-bold text-slate-200">{label("ui.plan.choose_card")}</legend>
            <div className="flex flex-wrap gap-2">
              {candidates.map((p) => (
                <button
                  type="button"
                  key={p.cardId}
                  aria-pressed={draft.cardId === p.cardId}
                  onClick={() => setChosen(p.cardId)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-base font-semibold border ${
                    draft.cardId === p.cardId ? "bg-amber-500 text-slate-950 border-amber-400" : "bg-slate-950 text-slate-100 border-slate-700"
                  }`}
                >
                  {cards.find((c) => c.id === p.cardId)?.title ?? p.title}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div data-testid="plan-proposal-card" className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="text-base text-slate-300">{cardTitle}</div>
          <div data-testid="plan-text" className="text-xl font-bold text-white">
            {planText}
          </div>

          {!isSaved ? (
            <button
              type="button"
              onClick={() => saveCurrentPlan(draft.cardId)}
              data-testid="save-plan-button"
              className="min-h-[44px] px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base transition cursor-pointer"
            >
              {copy("ui.btn.save_plan")}
            </button>
          ) : (
            <p data-testid="plan-saved-confirmation" className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-100 text-base font-semibold">
              {pilotEarned ? copy("g22.saved") : copy("plan.saved")}
            </p>
          )}
        </div>

        {isSaved && (
          <div data-testid="account-clock-validation" className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-700/60 space-y-4">
            <p className="text-base text-slate-100">{copy("plan.goal")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-base">
              <div>
                {label("ui.plan.clock")}: <strong data-testid="account-clock" className="font-mono">{dayMonth(state.account.clock)}</strong>
              </div>
              <div>
                {label("ui.plan.account_balance")}: <strong data-testid="account-balance" className="font-mono">{pln(state.account.balance)}</strong>
              </div>
            </div>

            {!clockAdvanced ? (
              <button
                type="button"
                onClick={() => advanceClock(clockTarget)}
                data-testid="advance-account-clock-button"
                className="min-h-[44px] px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition cursor-pointer"
              >
                {label("ui.plan.advance_clock", { from: shortDate(state.account.clock), to: shortDate(clockTarget) })}
              </button>
            ) : (
              <div data-testid="validation-result" data-status={draft.status} className="space-y-3">
                <p
                  data-testid="validation-status"
                  className={`p-4 rounded-xl text-base font-bold ${
                    draft.status === "met" ? "bg-emerald-950/80 border border-emerald-600 text-emerald-50" : "bg-amber-950/70 border border-amber-600 text-amber-50"
                  }`}
                >
                  {draft.status === "met"
                    ? copy(PLAN_STATUS_KEY.met, { "forecast.lowDate": dayMonth(forecast.baseline.minimum.date) })
                    : copy(PLAN_STATUS_KEY[draft.status])}
                </p>

                {state.account.matchedTx.length > 0 && (
                  <div>
                    <div className="text-base font-bold text-slate-200">{label("ui.plan.matched")}</div>
                    <ul className="space-y-1.5 mt-1" data-testid="matched-transactions">
                      {state.account.matchedTx.map((tx) => (
                        <li key={`${tx.id}-${tx.date}`} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 text-base">
                          <span className="text-white">
                            {shortDate(tx.date)} · {tx.title}
                          </span>
                          <span className={`font-mono font-bold ${tx.amount > 0 ? "text-emerald-300" : "text-rose-200"}`}>
                            {tx.amount > 0 ? "+" : ""}
                            {pln(tx.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {competence && (
                  <p data-testid="plan-competence" className="text-base font-semibold text-emerald-200">
                    {label("ui.plan.competence", { name: competence.title, level: state.core.competences[competence.id] })}
                  </p>
                )}

                {draft.status === "met" && <p className="text-base italic text-slate-100">{copy("reaction.close")}</p>}
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-800">
          <Link href="/podsumowanie" className="min-h-[44px] inline-flex items-center text-base text-slate-300 hover:text-white">
            {label("ui.nav.summary")}
          </Link>
          <Link
            href="/mapa"
            data-testid="return-to-map-button"
            className="min-h-[44px] inline-flex items-center px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700"
          >
            {copy("ui.map.title")}
          </Link>
        </div>
      </div>
    </div>
  );
}

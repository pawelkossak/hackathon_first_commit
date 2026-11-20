"use client";

import React from "react";
import Link from "next/link";
import { useGameStore } from "../../lib/ui/game-store";
import { GameAsset } from "../../lib/ui/assets";
import { dayMonth, pln, useCopy, type MissingLabelKey } from "../../lib/ui/copy";
import { InitialLoader } from "../../components/narrative";
import { gameData, type StarStatus } from "../../engine";

const STAR_STATUS_LABEL: Record<StarStatus, MissingLabelKey> = {
  earned: "ui.star.earned",
  pending: "ui.star.pending",
  missed: "ui.star.missed",
  open: "ui.star.open",
};

/** G18 lap summary: the engine's final core of the lap (balance, low, stars, cost, avoided cost). */
export default function PodsumowaniePage() {
  const hydrated = useGameStore((s) => s.hydrated);
  const core = useGameStore((s) => s.state.core);
  const { copy, label, narratorGender } = useCopy();

  if (!hydrated) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <InitialLoader message={copy("loader.start")} />
      </div>
    );
  }

  if (core.status !== "completed") {
    return (
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col justify-center" data-testid="lap-summary-not-completed">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-4">
          <h1 className="text-2xl font-black text-white">{label("ui.summary.not_completed")}</h1>
          <p className="text-base text-slate-200">{copy("ui.hud.week", { week: core.week })}</p>
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

  return (
    <div
      role="region"
      aria-label={copy("ui.success.title")}
      data-testid="lap-summary-g18"
      className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full flex flex-col justify-center"
    >
      <div className="bg-slate-900 border-2 border-amber-500/80 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-black text-white">{copy("ui.success.title")}</h1>
          <div className="w-16 h-16 flex-shrink-0">
            <GameAsset id={`sprite.boss.${narratorGender}.proud`} width={64} height={64} alt="" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-base font-semibold text-slate-300">{label("ui.summary.end_balance")}</div>
            <div data-testid="summary-end-balance" className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {pln(core.balance)}
            </div>
          </div>
          {core.lowestBalance && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-base font-semibold text-slate-300">
                {label("ui.summary.low")} · {dayMonth(core.lowestBalance.date)}
              </div>
              <div data-testid="summary-low" className="text-2xl font-black text-slate-100 font-mono mt-1">
                {pln(core.lowestBalance.balance)}
              </div>
            </div>
          )}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-base font-semibold text-slate-300">{label("ui.hud.cost_of_money")}</div>
            <div data-testid="summary-cost-of-money" className="text-2xl font-black text-slate-100 font-mono mt-1">
              {pln(core.costOfMoney)}
            </div>
          </div>
        </div>

        {core.avoidedCost !== null && (
          <p data-testid="summary-avoided-cost" className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/60 text-lg font-bold text-amber-200">
            {copy("g18.avoided", { "advance.avoided": pln(core.avoidedCost) })}
          </p>
        )}

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-slate-200">{label("ui.summary.stars")}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {gameData.level1.stars.map((star) => {
              const status = core.stars[star.id];
              return (
                <li
                  key={star.id}
                  data-testid={`star-${star.id}`}
                  data-status={status}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3"
                >
                  <span aria-hidden="true" className={`text-2xl ${status === "earned" ? "text-amber-400" : "text-slate-500"}`}>
                    {status === "earned" ? "★" : "☆"}
                  </span>
                  <span>
                    <span className="block font-bold text-white text-base">{star.title}</span>
                    <span className="block text-base text-slate-300">
                      {star.id === "pilot" && status === "pending" ? copy("g18.pilotPending") : label(STAR_STATUS_LABEL[status])}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-base text-slate-200 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          {copy("success.pending")} {copy("g18.joke")}
        </p>

        <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-800">
          <Link href="/gra/1" className="min-h-[44px] inline-flex items-center text-base text-slate-300 hover:text-white">
            {label("ui.summary.back_to_game")}
          </Link>
          <Link
            href="/plan"
            data-testid="goto-plan-button"
            className="min-h-[44px] inline-flex items-center px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base transition"
          >
            {copy("ui.success.save_plan")}
          </Link>
        </div>
      </div>
    </div>
  );
}

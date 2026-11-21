"use client";

import React, { useCallback, useEffect, use, Suspense, useState } from "react";
import Link from "next/link";
import { useGameStore } from "../../../lib/ui/game-store";
import { selectCurrentEvent, selectForecast } from "../../../lib/ui/game-views";
import { dayMonth, useCopy } from "../../../lib/ui/copy";
import { Hud } from "../../../components/play/Hud";
import { WorldRoute } from "../../../components/scenes/WorldRoute";
import { WeekCardList } from "../../../components/scenes/WeekCardList";
import { CardHand } from "../../../components/play/CardHand";
import { EventCard } from "../../../components/play/EventCard";
import { WeekResolutionModal } from "../../../components/play/WeekResolutionModal";
import { CashFlowPanel } from "../../../components/play/CashFlowPanel";
import { FailureAndRewindModal } from "../../../components/play/FailureAndRewindModal";
import { BoardNarrator } from "../../../components/play/BoardNarrator";
import { AdvisorDock } from "../../../components/play/AdvisorDock";
import { InitialLoader, ReturnBanner, VoicePlayer } from "../../../components/narrative";
import type { IsoDate, WeekNumber } from "../../../engine";

interface PageProps {
  searchParams?: Promise<{ seed?: string; resume?: string; fallback?: string }>;
}

function GameLevel1Content(props: PageProps) {
  const searchParams = props.searchParams ? use(props.searchParams) : undefined;
  const hydrated = useGameStore((s) => s.hydrated);
  const gameState = useGameStore((s) => s.state);
  const core = useGameStore((s) => s.state.core);
  const snapshots = useGameStore((s) => s.state.snapshots);
  const fallbackMode = useGameStore((s) => s.fallbackMode);
  const setFallbackMode = useGameStore((s) => s.setFallbackMode);
  const advanceWeek = useGameStore((s) => s.advanceWeek);
  const rewindToWeek = useGameStore((s) => s.rewindToWeek);
  const init = useGameStore((s) => s.init);
  const currentEvent = useGameStore(selectCurrentEvent);
  const forecast = useGameStore(selectForecast);
  const { copy, label, playerGender, narratorGender } = useCopy();

  const [cashFlowOpen, setCashFlowOpen] = useState(false);
  const [drilldownDate, setDrilldownDate] = useState<IsoDate | null>(null);
  const closeCashFlow = useCallback(() => setCashFlowOpen(false), []);

  const seed = searchParams?.seed;
  const fallback = searchParams?.fallback;
  useEffect(() => {
    if (seed) init(seed);
    if (fallback === "1") setFallbackMode(true);
  }, [seed, fallback, init, setFallbackMode]);

  if (!hydrated) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <InitialLoader messageKey="loader.start" playerGender={playerGender} narratorGender={narratorGender} />
      </div>
    );
  }

  const openCashFlow = (date: IsoDate | null) => {
    setDrilldownDate(date);
    setCashFlowOpen(true);
  };

  const previousWeek = core.week > 1 ? ((core.week - 1) as WeekNumber) : null;
  const canRewindOne = previousWeek !== null && snapshots[previousWeek] !== undefined;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl mx-auto w-full gap-6" data-testid="game-board-g10">
      {searchParams?.resume && (
        <ReturnBanner
          state={gameState}
          initialWeek={core.week}
          playerGender={playerGender}
          narratorGender={narratorGender}
          onResume={() => undefined}
        />
      )}

      <Hud onOpenCashFlow={() => openCashFlow(null)} />

      <div className="flex items-center justify-end gap-2" role="group" aria-label={copy("ui.route.title")}>
        <button
          type="button"
          onClick={() => setFallbackMode(false)}
          aria-pressed={!fallbackMode}
          data-testid="view-toggle-route"
          className={`min-h-[44px] px-4 py-2 rounded-xl text-base font-semibold transition ${
            !fallbackMode ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-200 border border-slate-700"
          }`}
        >
          {label("ui.route.view_map")}
        </button>
        <button
          type="button"
          onClick={() => setFallbackMode(true)}
          aria-pressed={fallbackMode}
          data-testid="view-toggle-fallback"
          className={`min-h-[44px] px-4 py-2 rounded-xl text-base font-semibold transition ${
            fallbackMode ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-200 border border-slate-700"
          }`}
        >
          {label("ui.route.view_list")}
        </button>
      </div>

      {fallbackMode ? <WeekCardList onSelectDate={openCashFlow} /> : <WorldRoute onSelectDate={openCashFlow} />}

      {forecast.crash && core.status === "playing" && (
        <div
          data-testid="storm-warning"
          role="status"
          className="p-4 rounded-xl bg-purple-950/60 border border-purple-700/80 text-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <span className="text-base font-bold">{copy("g15.risk", { "forecast.lowDate": dayMonth(forecast.crash.date) })}</span>
        </div>
      )}

      <BoardNarrator />

      <EventCard />

      {core.status === "playing" && <AdvisorDock />}

      {core.status === "playing" && <CardHand />}

      <section className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div>
          {core.status === "playing" && canRewindOne && previousWeek !== null && (
            <button
              type="button"
              onClick={() => rewindToWeek(previousWeek)}
              data-testid="rewind-button"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 text-base font-semibold border border-slate-700 transition cursor-pointer"
            >
              {copy("ui.btn.rewind_week")}
            </button>
          )}
        </div>

        {core.status === "playing" && (
          <button
            type="button"
            onClick={() => advanceWeek()}
            disabled={currentEvent !== null}
            data-testid="advance-week-button"
            className={`min-h-[44px] px-6 py-2.5 rounded-xl font-bold text-base transition cursor-pointer ${
              currentEvent !== null
                ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
            }`}
          >
            {copy("ui.btn.finish_week")} · {copy("ui.hud.week", { week: core.week })}
          </button>
        )}

        {core.status === "completed" && (
          <Link
            href="/podsumowanie"
            data-testid="goto-summary-button"
            className="min-h-[44px] px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base transition"
          >
            {label("ui.week.to_summary")}
          </Link>
        )}
      </section>

      <WeekResolutionModal />
      {cashFlowOpen && (
        <CashFlowPanel key={drilldownDate ?? "today"} isOpen onClose={closeCashFlow} initialDate={drilldownDate} />
      )}
      <FailureAndRewindModal />
      <VoicePlayer />
    </div>
  );
}

export default function GameLevel1Page(props: PageProps) {
  return (
    <Suspense fallback={<div className="p-8" />}>
      <GameLevel1Content {...props} />
    </Suspense>
  );
}

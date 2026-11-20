"use client";

import React, { useEffect, use, Suspense } from "react";
import { useGameStore } from "@/lib/ui/game-store";
import { Hud } from "@/components/play/Hud";
import { WorldRoute } from "@/components/scenes/WorldRoute";
import { CardHand } from "@/components/play/CardHand";

interface PageProps {
  searchParams?: Promise<{ seed?: string; resume?: string }>;
}

function GameLevel1Content(props: PageProps) {
  const searchParams = props.searchParams ? use(props.searchParams) : undefined;
  const state = useGameStore((s) => s.state);
  const resolveCurrentEvent = useGameStore((s) => s.resolveCurrentEvent);
  const advanceWeek = useGameStore((s) => s.advanceWeek);
  const rewindToWeek = useGameStore((s) => s.rewindToWeek);
  const getCurrentEvent = useGameStore((s) => s.getCurrentEvent);
  const forecast = useGameStore((s) => s.getForecast());
  const init = useGameStore((s) => s.init);

  useEffect(() => {
    if (searchParams?.seed) {
      init(searchParams.seed);
    }
  }, [searchParams?.seed, init]);

  const currentEvent = getCurrentEvent();
  const { core } = state;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl mx-auto w-full gap-6" data-testid="game-board-g10">
      {/* Return banner if resuming from push/notification (N-08 / GM-16) */}
      {searchParams?.resume && (
        <div
          role="status"
          className="bg-indigo-950/80 border border-indigo-700 text-indigo-200 px-4 py-2.5 rounded-xl text-sm flex items-center justify-between"
        >
          <span>Powrót do gry: Wznowiono {searchParams.resume === "T3" ? "Tydzień 3" : searchParams.resume}</span>
          <span className="text-xs text-indigo-400">Stan zsynchronizowany</span>
        </div>
      )}

      {/* HUD (G10): Gotówka 38 000 zł, Paliwo 42 dni, Odporność —, Relacje 5/5, Koszt pieniądza 0 zł, Dane syntetyczne */}
      <Hud />

      {/* World Route Board (G10): 7 week nodes + finish 10 I, markers 25 XI, 21 XII, 28 XII, storm on 28 XII, plane */}
      <WorldRoute />

      {/* Storm warning / Forecast insight (GM-01: Storm 28 XII -12 395 zł) */}
      {forecast.crash && (
        <div
          data-testid="storm-warning"
          className="p-4 rounded-xl bg-purple-950/60 border border-purple-700/80 text-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div>
            <div className="font-bold text-purple-100 flex items-center gap-2">
              <span className="text-lg">⚡</span>
              Sztorm płynnościowy na trasie: {forecast.crash.date} (deficyt gotówki: {forecast.crash.shortfall.toLocaleString("pl-PL")} zł)
            </div>
            <div className="text-xs text-purple-300 mt-0.5">
              Najniższe prognozowane saldo: {forecast.minimum.balance.toLocaleString("pl-PL")} zł. Zagranie odpowiedniej karty może uratować płynność!
            </div>
          </div>
          <div className="text-xs font-mono font-bold bg-purple-900/90 text-purple-200 px-3 py-1.5 rounded-lg border border-purple-600">
            {forecast.minimum.balance.toLocaleString("pl-PL")} zł
          </div>
        </div>
      )}

      {/* Active Event (G11) */}
      {currentEvent && (
        <section
          data-testid="event-card-g11"
          aria-label="Bieżące wydarzenie tygodnia"
          className="p-5 rounded-2xl bg-amber-950/30 border border-amber-600/60 text-slate-100"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Wydarzenie losowe: {currentEvent.id} (Tydzień {currentEvent.week})
            </span>
            <span className="text-xs text-amber-300/80">Wymaga decyzji przed zakończeniem tygodnia</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-4">{currentEvent.title}</h2>

          <div className="flex flex-wrap gap-3">
            {currentEvent.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => resolveCurrentEvent(choice.id)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition cursor-pointer"
              >
                {choice.label ?? choice.id}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Six Action Cards Hand (G13) with preview & keyboard 1–6 */}
      <CardHand />

      {/* Week End Action / Rewind */}
      <section className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          {core.week > 1 && (
            <button
              onClick={() => rewindToWeek((core.week - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
              data-testid="rewind-button"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-sm font-semibold border border-slate-700 transition cursor-pointer"
            >
              ⟲ Cofnij do Tygodnia {core.week - 1} (G20)
            </button>
          )}
        </div>

        {core.status === "playing" && (
          <button
            onClick={() => advanceWeek()}
            disabled={currentEvent !== null}
            data-testid="advance-week-button"
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
              currentEvent !== null
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
            }`}
          >
            Zakończ Tydzień {core.week} i leć dalej →
          </button>
        )}
      </section>
    </div>
  );
}

export default function GameLevel1Page(props: PageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Ładowanie symulacji gry...</div>}>
      <GameLevel1Content {...props} />
    </Suspense>
  );
}

"use client";

import React from "react";
import { useGameStore } from "../../lib/ui/game-store";
import { selectCurrentEvent, selectForecast } from "../../lib/ui/game-views";
import { GameAsset } from "../../lib/ui/assets";
import { pln, shortDate, useCopy, type MissingLabelKey } from "../../lib/ui/copy";
import { reactionFor } from "../../narrative";
import { gameData, type EventChoiceId, type EventId, type CurrentEvent, type Forecast } from "../../engine";

const EVENT_SPRITES: Record<EventId, string> = {
  E1: "sprite.event.account-change",
  E2: "sprite.event.new-order",
  E3: "sprite.event.ai-tool",
  E5: "sprite.action.nonbank-loan",
  E6: "sprite.event.late-customer",
};

const CHOICE_LABEL_KEYS: Record<EventChoiceId, MissingLabelKey | "ui.event.check" | "ui.event.risky"> = {
  check: "ui.event.check",
  pay_as_is: "ui.event.risky",
  accept: "ui.event.choice.accept",
  decline: "ui.event.choice.decline",
  now: "ui.event.choice.now",
  january: "ui.event.choice.january",
  show_cost: "ui.event.choice.show_cost",
  ignore: "ui.event.choice.ignore",
  acknowledge: "ui.event.choice.acknowledge",
};

type EventDef = (typeof gameData.level1.events)[number];
type EffectDef = EventDef["choices"][number]["effects"][number];

/** The ledger row a `reveal` effect of this event points at (E1 → L08), with its engine forecast amount. */
function revealedRowAmount(def: EventDef | undefined, forecast: Forecast): number | null {
  for (const choice of def?.choices ?? []) {
    for (const effect of choice.effects) {
      if (effect.type === "reveal") {
        const row = forecast.tasks.find((t) => t.id === effect.ledgerId);
        if (row) return row.amount;
      }
    }
  }
  return null;
}

function effectLine(effect: EffectDef): { amount: number; date: string; title: string } | null {
  if (effect.type === "transaction") return { amount: effect.amount, date: effect.date, title: effect.title };
  return null;
}

function EventBody({ event, forecast }: { event: CurrentEvent; forecast: Forecast }) {
  const { copy } = useCopy();
  const def = gameData.level1.events.find((e) => e.id === event.id);

  if (event.id === "E1") {
    const amount = revealedRowAmount(def, forecast);
    return (
      <>
        {amount !== null && (
          <p className="text-base text-slate-100">{copy("g11.body", { "supplier.amount": pln(Math.abs(amount)) })}</p>
        )}
        <p className="text-base text-slate-300 italic">{copy("g11.joke")}</p>
      </>
    );
  }
  if (event.id === "E2") return <p className="text-base text-slate-100">{copy("rx.project")}</p>;
  if (event.id === "E5") return <p className="text-base text-slate-100">{copy("g16.explanation")}</p>;
  if (event.id === "E6") return <p className="text-base text-slate-100">{copy("event.late")}</p>;
  return null;
}

/** What each choice books, straight from the event data the engine applies (no UI arithmetic). */
function ChoiceEffects({ event }: { event: CurrentEvent }) {
  const def = gameData.level1.events.find((e) => e.id === event.id);
  const rows = (def?.choices ?? []).flatMap((choice) =>
    choice.effects.flatMap((effect) => {
      const line = effectLine(effect);
      return line ? [{ choiceId: choice.id, ...line }] : [];
    })
  );
  if (rows.length === 0) return null;
  return (
    <ul className="space-y-1" data-testid="event-effects">
      {rows.map((r) => (
        <li key={`${r.choiceId}-${r.title}-${r.date}`} className="text-base font-mono text-slate-200">
          {shortDate(r.date)} · {r.title} · {r.amount > 0 ? "+" : ""}
          {pln(r.amount)}
        </li>
      ))}
    </ul>
  );
}

function FraudNotice() {
  const notice = useGameStore((s) => s.fraudNotice);
  const state = useGameStore((s) => s.state);
  const rewindToWeek = useGameStore((s) => s.rewindToWeek);
  const dismiss = useGameStore((s) => s.dismissFraudNotice);
  const { copy, label, playerGender, narratorGender } = useCopy();
  if (!notice) return null;

  const reaction = reactionFor(notice, state, playerGender, narratorGender);
  // Rewind to the week the fraud decision was taken (engine record), if its snapshot exists.
  const decisionWeek = state.core.eventsResolved.find((r) => r.eventId === notice.eventId)?.week ?? null;
  const canRewind = decisionWeek !== null && state.snapshots[decisionWeek] !== undefined;

  return (
    <div
      role="alert"
      data-testid="fraud-revealed-banner"
      className="w-full bg-red-950/90 border-2 border-red-500 rounded-3xl p-6 shadow-2xl text-white space-y-4"
    >
      <h2 className="text-2xl font-black text-white">{label("ui.fraud.title")}</h2>
      <p className="text-base text-red-100 max-w-3xl">{reaction.text}</p>
      <div className="flex flex-wrap gap-3">
        {canRewind && decisionWeek !== null && (
          <button
            type="button"
            onClick={() => rewindToWeek(decisionWeek)}
            data-testid="rewind-fraud-button"
            className="min-h-[44px] px-6 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-black text-base transition cursor-pointer"
          >
            {label("ui.fraud.rewind", { week: decisionWeek })}
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="min-h-[44px] px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base transition cursor-pointer"
        >
          {copy("ui.btn.close")}
        </button>
      </div>
    </div>
  );
}

/** Competence the engine recorded for this week's resolved event (e.g. Bezpieczne płatności 2 after „check”). */
function ResolvedEventNote() {
  const core = useGameStore((s) => s.state.core);
  const { label } = useCopy();
  const resolved = core.eventsResolved.find((r) => r.week === core.week);
  if (!resolved) return null;
  const def = gameData.level1.events.find((e) => e.id === resolved.eventId);
  const competenceId = def?.choices.find((c) => c.id === resolved.choiceId)?.competence?.id ?? null;
  if (!competenceId) return null;
  const name = gameData.level1.competences.find((c) => c.id === competenceId)?.title ?? competenceId;
  return (
    <p data-testid="event-competence" className="text-base font-semibold text-emerald-300">
      {label("ui.plan.competence", { name, level: core.competences[competenceId] })}
    </p>
  );
}

export function EventCard() {
  const currentEvent = useGameStore(selectCurrentEvent);
  const forecast = useGameStore(selectForecast);
  const resolveCurrentEvent = useGameStore((s) => s.resolveCurrentEvent);
  const { copy, label } = useCopy();

  const choiceLabel = (id: EventChoiceId, engineLabel: string | null): string => {
    if (engineLabel !== null) return engineLabel;
    const key = CHOICE_LABEL_KEYS[id];
    return key === "ui.event.check" || key === "ui.event.risky" ? copy(key) : label(key);
  };

  return (
    <>
      <FraudNotice />
      <ResolvedEventNote />
      {currentEvent && (
        <section
          role="region"
          aria-label={currentEvent.title}
          data-testid="event-card-g11"
          className="w-full bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-6 shadow-2xl space-y-5"
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 p-2">
              <GameAsset id={EVENT_SPRITES[currentEvent.id]} width={64} height={64} alt="" />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-bold text-amber-300">{copy("ui.hud.week", { week: currentEvent.week })}</span>
              <h2 className="text-xl font-black text-white">{currentEvent.title}</h2>
              <EventBody event={currentEvent} forecast={forecast} />
              <ChoiceEffects event={currentEvent} />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            {currentEvent.choices.map((choice) => (
              <button
                type="button"
                key={choice.id}
                onClick={() => resolveCurrentEvent(choice.id)}
                data-testid={`event-choice-${choice.id}`}
                className={`min-h-[44px] px-5 py-3 rounded-xl font-bold text-base transition shadow-md cursor-pointer ${
                  choice.id === "check"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : choice.id === "pay_as_is"
                    ? "bg-rose-900/80 hover:bg-rose-800 text-rose-50 border border-rose-600"
                    : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                }`}
              >
                {choiceLabel(choice.id, choice.label)}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

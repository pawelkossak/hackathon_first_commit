"use client";

import React from "react";
import Link from "next/link";
import { useGameStore } from "../../lib/ui/game-store";
import { GameAsset } from "../../lib/ui/assets";
import { useCopy, type MissingLabelKey } from "../../lib/ui/copy";
import { gameData, type StarStatus } from "../../engine";

const STAR_STATUS_LABEL: Record<StarStatus, MissingLabelKey> = {
  earned: "ui.star.earned",
  pending: "ui.star.pending",
  missed: "ui.star.missed",
  open: "ui.star.open",
};

const LOCKED_LEVELS = [
  { level: 3, spriteId: "sprite.campaign.investment" },
  { level: 4, spriteId: "sprite.campaign.next-generation" },
] as const;

/** G09: level 1 active; level 2 shows the engine unlock but stays closed until E-11; 3–4 in fog. */
export function CampaignMap() {
  const core = useGameStore((s) => s.state.core);
  const { copy, label } = useCopy();
  const lapDone = core.status === "completed";

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6" data-testid="campaign-map-g09">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">{copy("ui.map.title")}</h1>
          <p className="text-base text-slate-200 mt-1">{lapDone ? copy("map.next") : copy("map.start")}</p>
        </div>
        <ul className="flex flex-wrap gap-3">
          {gameData.level1.stars.map((star) => {
            const status = core.stars[star.id];
            return (
              <li key={star.id} className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
                <span aria-hidden="true" className={status === "earned" ? "text-amber-400 text-lg" : "text-slate-500 text-lg"}>
                  {status === "earned" ? "★" : "☆"}
                </span>
                <span className="text-base">
                  <span className="block font-semibold text-white">{star.title}</span>
                  <span className="block text-slate-300">{label(STAR_STATUS_LABEL[status])}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div data-testid="campaign-island-1" className="p-6 rounded-3xl border bg-slate-900 border-amber-500/40 flex flex-col justify-between min-h-[320px]">
          <div>
            <span className="text-base font-semibold text-amber-300">{label("ui.map.level", { level: 1 })}</span>
            <h2 className="text-2xl font-bold text-white mt-1">{gameData.level1.title}</h2>
            <p className="text-base text-slate-200 mt-2">{copy("mission.storm")}</p>
          </div>
          <div className="my-4 flex items-center justify-center">
            <GameAsset id="sprite.campaign.survive" width={180} height={180} alt="" />
          </div>
          <Link
            href="/gra/1"
            data-testid="campaign-start-level-1"
            className="self-end min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base"
          >
            {label("ui.map.fly")}
          </Link>
        </div>

        <div
          data-testid="campaign-island-2"
          data-unlocked={core.level2Unlocked}
          className="p-6 rounded-3xl border bg-slate-950/80 border-slate-800 flex flex-col justify-between min-h-[320px]"
        >
          <div>
            <span className="text-base font-semibold text-slate-300">
              {label("ui.map.level", { level: 2 })} · {core.level2Unlocked ? label("ui.map.unlocked") : label("ui.map.locked")}
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">{label("ui.level2.title")}</h2>
          </div>
          <div className="my-4 flex items-center justify-center relative">
            <GameAsset id="sprite.campaign.first-hire" width={180} height={180} alt="" />
            {!core.level2Unlocked && (
              <div data-testid="fog-overlay-2" className="absolute inset-0 bg-slate-950/80 flex items-center justify-center rounded-xl">
                <GameAsset id="sprite.weather.fog" width={64} height={64} alt="" />
              </div>
            )}
          </div>
          <span className="self-end min-h-[44px] inline-flex items-center px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-base font-semibold border border-slate-700/60">
            {label("ui.map.coming")}
          </span>
        </div>

        {LOCKED_LEVELS.map((lvl) => (
          <div
            key={lvl.level}
            data-testid={`campaign-island-${lvl.level}`}
            className="p-6 rounded-3xl border bg-slate-950/80 border-slate-800 flex flex-col justify-between min-h-[240px]"
          >
            <span className="text-base font-semibold text-slate-300">
              {label("ui.map.level", { level: lvl.level })} · {label("ui.map.locked")}
            </span>
            <div className="my-4 flex items-center justify-center relative">
              <GameAsset id={lvl.spriteId} width={140} height={140} alt="" />
              <div data-testid={`fog-overlay-${lvl.level}`} className="absolute inset-0 bg-slate-950/80 flex items-center justify-center rounded-xl">
                <GameAsset id="sprite.weather.fog" width={64} height={64} alt="" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

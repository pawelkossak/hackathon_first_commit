"use client";

import React from "react";
import Link from "next/link";
import { GameAsset } from "../../../lib/ui/assets";
import { useCopy } from "../../../lib/ui/copy";

/**
 * Level 2 placeholder. The level-2 rules belong to the engine (E-11), which does not exist yet, so the
 * UI holds no game logic here and the map does not link to this route.
 */
export default function Level2GamePage() {
  const { copy, label } = useCopy();
  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4 text-center space-y-6" data-testid="level2-locked-screen">
      <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center p-4">
        <GameAsset id="sprite.weather.fog" width={72} height={72} alt="" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">
        {label("ui.map.level", { level: 2 })}: {label("ui.level2.title")}
      </h1>
      <p className="text-base text-slate-200">{label("ui.map.coming")}</p>
      <Link
        href="/mapa"
        className="inline-flex items-center min-h-[44px] px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base"
      >
        {copy("ui.map.title")}
      </Link>
    </div>
  );
}

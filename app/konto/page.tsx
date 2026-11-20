"use client";

import Link from "next/link";
import { useCopy } from "../../lib/ui/copy";

/** G01–G04 placeholder: the hackathon build is guest-only (GAME-DESIGN §10, D-08). */
export default function KontoPage() {
  const { copy } = useCopy();
  return (
    <div className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col justify-center">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
        <p className="text-lg text-white">{copy("g04.goodbye")}</p>
        <Link
          href="/gra/1"
          className="min-h-[44px] inline-flex items-center px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base"
        >
          {copy("ui.banner.return_to_game")}
        </Link>
      </div>
    </div>
  );
}

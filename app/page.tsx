"use client";

import Link from "next/link";
import { useCopy } from "../lib/ui/copy";

export default function HomePage() {
  const { copy, label } = useCopy();
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto gap-6">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-amber-400">Pilot Płynności</h1>
      <p className="text-lg text-slate-100">{copy("intro.goal")}</p>
      <p className="text-base text-slate-200">{copy("intro.practice")}</p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/start"
          data-testid="home-start"
          className="min-h-[44px] inline-flex items-center px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base"
        >
          {label("ui.home.start")}
        </Link>
        <Link
          href="/mapa"
          className="min-h-[44px] inline-flex items-center px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-base border border-slate-700"
        >
          {copy("ui.map.title")}
        </Link>
      </div>
    </div>
  );
}

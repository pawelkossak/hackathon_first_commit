"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "../../lib/ui/game-store";
import { useCopy } from "../../lib/ui/copy";

export function AppHeader() {
  const pathname = usePathname();
  const reset = useGameStore((s) => s.reset);
  const week = useGameStore((s) => s.state.core.week);
  const { copy, label } = useCopy();
  const [showConfirm, setShowConfirm] = useState(false);

  const links = [
    { href: "/mapa", text: copy("ui.map.title"), active: pathname === "/mapa" },
    { href: "/gra/1", text: copy("ui.hud.week", { week }), active: pathname?.startsWith("/gra") ?? false },
    { href: "/podsumowanie", text: label("ui.nav.summary"), active: pathname === "/podsumowanie" },
    { href: "/plan", text: label("ui.nav.plan"), active: pathname === "/plan" },
    { href: "/ustawienia", text: label("ui.nav.settings"), active: pathname === "/ustawienia" },
  ];

  return (
    <header className="w-full bg-slate-900 text-white border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Link href="/" className="min-h-[44px] inline-flex items-center font-bold text-lg tracking-tight text-amber-400 hover:text-amber-300">
          Pilot Płynności
        </Link>
        <span className="text-sm font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
          {label("ui.common.synthetic")}
        </span>
      </div>

      <nav className="flex flex-wrap items-center gap-1 sm:gap-2 text-base" aria-label={copy("ui.map.title")}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={l.active ? "page" : undefined}
            className={`min-h-[44px] inline-flex items-center px-3 rounded transition ${
              l.active ? "bg-slate-800 text-white font-semibold" : "text-slate-200 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            {l.text}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {showConfirm ? (
          <div className="flex items-center gap-2 bg-red-950/80 p-1 rounded border border-red-800">
            <button
              type="button"
              onClick={() => {
                reset();
                setShowConfirm(false);
              }}
              className="min-h-[44px] text-base font-bold bg-red-600 hover:bg-red-500 text-white px-3 rounded cursor-pointer"
            >
              {label("ui.nav.reset_confirm")}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="min-h-[44px] text-base text-slate-200 hover:text-white px-3 cursor-pointer"
            >
              {copy("ui.btn.close")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            data-testid="reset-game-button"
            className="min-h-[44px] text-base font-medium text-slate-200 hover:text-red-300 border border-slate-700 hover:border-red-600 px-3 rounded transition cursor-pointer"
          >
            {label("ui.nav.reset")}
          </button>
        )}
      </div>
    </header>
  );
}

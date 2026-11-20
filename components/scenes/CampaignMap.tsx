"use client";

import React from "react";
import Link from "next/link";
import { useGameStore } from "@/lib/ui/game-store";
import { GameAsset } from "@/lib/ui/assets";

export function CampaignMap() {
  const level2Unlocked = useGameStore((s) => s.state.core.level2Unlocked);
  const stars = useGameStore((s) => s.state.core.stars);

  const levels = [
    {
      id: 1,
      title: "Poziom 1: Sztorm grudniowy",
      subtitle: "Przetrwanie i płynność",
      spriteId: "sprite.campaign.survive",
      unlocked: true,
      href: "/gra/1",
      badge: "Dostępny do lotu",
      description: "7 tygodni grudniowego sztormu. Obroń cash flow studia przed deficytem.",
    },
    {
      id: 2,
      title: "Poziom 2: Pierwszy pracownik",
      subtitle: "ZUS, PIT i stałe koszty",
      spriteId: "sprite.campaign.first-hire",
      unlocked: level2Unlocked,
      href: level2Unlocked ? "/gra/2" : "#",
      badge: level2Unlocked ? "Odblokowany" : "Spowity mgłą",
      description: "Zarządzanie wynagrodzeniami i podatkami przy opóźnieniach płatności.",
    },
    {
      id: 3,
      title: "Poziom 3: Skok inwestycyjny",
      subtitle: "Leasing i środki trwałe",
      spriteId: "sprite.campaign.investment",
      unlocked: false,
      href: "#",
      badge: "Zablokowany",
      description: "Inwestycje w park maszynowy i ryzyko utraty płynności operacyjnej.",
    },
    {
      id: 4,
      title: "Poziom 4: Ekspansja rynkowa",
      subtitle: "Faktoring i kontrakty",
      spriteId: "sprite.campaign.next-generation",
      unlocked: false,
      href: "#",
      badge: "Zablokowany",
      description: "Duże wolumeny i zabezpieczenia należności handlowych.",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6" data-testid="campaign-map-g09">
      {/* Header and Stars Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Archipelag Płynności (G09)
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Mapa Kampanii</h1>
          <p className="text-sm text-slate-300 mt-1">
            Wybierz wyspę misji. Ukończenie Poziomu 1 z min. 1 gwiazdką rozprasza mgłę i odblokowuje Poziom 2.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
            <span className={stars.przetrwanie === "earned" ? "text-amber-400 text-lg" : "text-slate-600 text-lg"}>
              ★
            </span>
            <div className="text-xs">
              <div className="font-semibold text-white">Przetrwanie</div>
              <div className="text-slate-400 capitalize">{stars.przetrwanie}</div>
            </div>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
            <span className={stars.tanio === "earned" ? "text-amber-400 text-lg" : "text-slate-600 text-lg"}>
              ★
            </span>
            <div className="text-xs">
              <div className="font-semibold text-white">Tanio</div>
              <div className="text-slate-400 capitalize">{stars.tanio}</div>
            </div>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
            <span className={stars.pilot === "earned" ? "text-amber-400 text-lg" : "text-slate-600 text-lg"}>
              ★
            </span>
            <div className="text-xs">
              <div className="font-semibold text-white">Pilot</div>
              <div className="text-slate-400 capitalize">{stars.pilot}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Archipelago grid of 4 Islands */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {levels.map((lvl) => (
          <div
            key={lvl.id}
            data-testid={`campaign-island-${lvl.id}`}
            className={`p-6 rounded-3xl border transition relative overflow-hidden flex flex-col justify-between min-h-[320px] ${
              lvl.unlocked
                ? "bg-slate-900 border-amber-500/40 shadow-xl shadow-amber-500/5 hover:border-amber-400"
                : "bg-slate-950/80 border-slate-800"
            }`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 z-10">
              <div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    lvl.unlocked
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {lvl.badge}
                </span>
                <h2 className="text-2xl font-bold text-white mt-3">{lvl.title}</h2>
                <div className="text-sm font-medium text-amber-300/80">{lvl.subtitle}</div>
              </div>
              <div className="text-slate-600 font-mono text-sm font-bold">0{lvl.id}</div>
            </div>

            {/* Visual Island Asset / Placeholder */}
            <div className="my-4 flex items-center justify-center z-10">
              <div className="relative">
                <GameAsset id={lvl.spriteId} width={180} height={180} alt={lvl.title} />
                {!lvl.unlocked && (
                  <div
                    data-testid={`fog-overlay-${lvl.id}`}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-xl border border-slate-700/60 p-2 text-center"
                  >
                    <GameAsset id="sprite.weather.fog" width={64} height={64} alt="Mgła" />
                    <span className="text-[11px] text-slate-300 font-medium mt-1">
                      {lvl.id === 2 ? "Wymaga ≥ 1 ★ w Poziomie 1" : "Zablokowany"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description & Action */}
            <div className="z-10 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-400 max-w-xs">{lvl.description}</p>
              {lvl.unlocked ? (
                <Link
                  href={lvl.href}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition whitespace-nowrap shadow-md shadow-amber-500/20"
                >
                  Wystartuj →
                </Link>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed border border-slate-700/60"
                >
                  Niedostępny
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

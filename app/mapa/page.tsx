"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/ui/game-store";

export default function MapaPage() {
  const level2Unlocked = useGameStore((s) => s.state.core.level2Unlocked);
  const stars = useGameStore((s) => s.state.core.stars);

  const levels = [
    {
      id: 1,
      title: "Poziom 1: Sztorm grudniowy (Przetrwanie)",
      description: "Przeprowadź studio graficzne przez grudniowy dołek płynnościowy i unikaj kosztownych pożyczek.",
      unlocked: true,
      href: "/gra/1",
      badge: "Aktywny",
    },
    {
      id: 2,
      title: "Poziom 2: Pierwszy pracownik",
      description: "Nowe obowiązki ZUS i PIT, pensje 10. każdego miesiąca i skalowanie zespołu.",
      unlocked: level2Unlocked,
      href: level2Unlocked ? "/gra/2" : "#",
      badge: level2Unlocked ? "Odblokowany" : "Mgła (wymaga ukończenia Poziomu 1)",
    },
    {
      id: 3,
      title: "Poziom 3: Skok inwestycyjny",
      description: "Nowy sprzęt, leasing i rozbudowa portfolio przy zmiennych terminach płatności.",
      unlocked: false,
      href: "#",
      badge: "Zablokowany",
    },
    {
      id: 4,
      title: "Poziom 4: Ekspansja rynkowa",
      description: "Duże kontrakty korporacyjne, faktoring i zarządzanie ryzykiem walutowym.",
      unlocked: false,
      href: "#",
      badge: "Zablokowany",
    },
  ];

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mapa Kampanii (G09)</h1>
        <p className="text-slate-400">
          Wybierz wyspę misji. Odblokowuj kolejne etapy, zdobywając gwiazdki za przetrwanie i oszczędne finansowanie.
        </p>
        <div className="mt-3 flex gap-4 text-xs text-slate-300">
          <div>
            ★ Przetrwanie: <span className="text-amber-400 font-bold">{stars.przetrwanie}</span>
          </div>
          <div>
            ★ Tanio: <span className="text-amber-400 font-bold">{stars.tanio}</span>
          </div>
          <div>
            ★ Pilot: <span className="text-amber-400 font-bold">{stars.pilot}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {levels.map((lvl) => (
          <div
            key={lvl.id}
            data-testid={`campaign-level-${lvl.id}`}
            className={`p-6 rounded-2xl border transition relative overflow-hidden ${
              lvl.unlocked
                ? "bg-slate-900/90 border-amber-500/50 shadow-lg shadow-amber-500/5"
                : "bg-slate-950/50 border-slate-800 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  lvl.unlocked
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {lvl.badge}
              </span>
              <span className="text-slate-500 text-xs font-mono">Misja 0{lvl.id}</span>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{lvl.title}</h2>
            <p className="text-sm text-slate-400 mb-6">{lvl.description}</p>

            {lvl.unlocked ? (
              <Link
                href={lvl.href}
                className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition"
              >
                Rozpocznij misję →
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                Spowite mgłą płynności
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

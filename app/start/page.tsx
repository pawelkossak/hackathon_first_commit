"use client";

import Link from "next/link";
import { useState } from "react";

export default function StartPage() {
  const [playerGender, setPlayerGender] = useState<"female" | "male">("female");
  const [narratorGender, setNarratorGender] = useState<"female" | "male">("female");

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col justify-center">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Wprowadzenie (G05–G08)</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Wybór postaci i narracji</h1>
          <p className="text-sm text-slate-300 mt-2">
            „Mam klientów, dobre pomysły i kawę na trzy dni. Pomożesz mi utrzymać stery studia?”
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-white">Twój bohater (Pilot finansów)</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPlayerGender("female")}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold border transition ${
                  playerGender === "female"
                    ? "bg-amber-500 text-slate-950 border-amber-400"
                    : "bg-slate-900 text-slate-400 border-slate-700"
                }`}
              >
                Kobieta
              </button>
              <button
                type="button"
                onClick={() => setPlayerGender("male")}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold border transition ${
                  playerGender === "male"
                    ? "bg-amber-500 text-slate-950 border-amber-400"
                    : "bg-slate-900 text-slate-400 border-slate-700"
                }`}
              >
                Mężczyzna
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-white">Właściciel studia (Narrator)</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setNarratorGender("female")}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold border transition ${
                  narratorGender === "female"
                    ? "bg-amber-500 text-slate-950 border-amber-400"
                    : "bg-slate-900 text-slate-400 border-slate-700"
                }`}
              >
                Szefowa (Ania)
              </button>
              <button
                type="button"
                onClick={() => setNarratorGender("male")}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold border transition ${
                  narratorGender === "male"
                    ? "bg-amber-500 text-slate-950 border-amber-400"
                    : "bg-slate-900 text-slate-400 border-slate-700"
                }`}
              >
                Szef
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-between items-center border-t border-slate-800">
          <Link href="/mapa" className="text-sm text-slate-400 hover:text-white">
            Pomiń intro →
          </Link>
          <Link
            href="/gra/1"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition"
          >
            Lecimy do gry!
          </Link>
        </div>
      </div>
    </div>
  );
}

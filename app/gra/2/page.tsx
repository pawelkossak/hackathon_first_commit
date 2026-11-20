"use client";

import React from "react";
import Link from "next/link";
import { useGameStore } from "@/lib/ui/game-store";
import { useLevel2Store } from "@/lib/ui/level2-store";
import { GameAsset } from "@/lib/ui/assets";

export default function Level2GamePage() {
  const level2Unlocked = useGameStore((s) => s.state.core.level2Unlocked);
  const { game, chooseAction, rewindToWeek, resetGame } = useLevel2Store();

  if (!level2Unlocked) {
    return (
      <div
        className="w-full max-w-4xl mx-auto py-12 px-4 text-center space-y-6"
        data-testid="level2-locked-screen"
      >
        <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center p-4">
          <GameAsset id="sprite.weather.fog" width={72} height={72} alt="Mgła nad wyspą" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/80 px-3 py-1 rounded-full">
            Wyspa spowita mgłą
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-3">
            Poziom 2: Pierwszy pracownik jest zablokowany
          </h1>
          <p className="text-slate-300 max-w-md mx-auto text-sm">
            Aby odblokować tę misję, ukończ najpierw <strong>Poziom 1 (Sztorm grudniowy)</strong> zdobywając co najmniej 1 gwiazdkę.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/mapa"
            className="inline-flex items-center gap-2 min-h-[44px] px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20"
          >
            ← Wróć do Mapy Kampanii
          </Link>
        </div>
      </div>
    );
  }

  const isCrashed = game.status === "crashed";
  const isCompleted = game.status === "completed";

  return (
    <div
      className="w-full max-w-5xl mx-auto py-6 px-4 space-y-6"
      data-testid="level2-active-screen"
    >
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
            <GameAsset id="sprite.campaign.first-hire" width={48} height={48} alt="Pierwszy pracownik" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Poziom 2 · Luty 2027
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Dane syntetyczne
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-0.5">Pierwszy pracownik</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mapa"
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700 flex items-center"
          >
            ← Mapa
          </Link>
          <button
            onClick={resetGame}
            data-testid="level2-reset-button"
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700 flex items-center cursor-pointer"
          >
            Reset misji
          </button>
        </div>
      </div>

      {/* HUD: Balance, Week, Stars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800" data-testid="level2-balance">
          <div className="text-xs text-slate-400 uppercase font-semibold">Bieżące saldo gotówki</div>
          <div
            className={`text-2xl font-black font-mono mt-1 ${
              game.balance < 0 ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {game.balance.toLocaleString("pl-PL")} zł
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800" data-testid="level2-week">
          <div className="text-xs text-slate-400 uppercase font-semibold">Tydzień misji</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            Tydzień {game.week} / 3
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800" data-testid="level2-stars">
          <div className="text-xs text-slate-400 uppercase font-semibold">Zdobyte gwiazdki</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {"★".repeat(game.stars)}
            <span className="text-slate-600">{"★".repeat(Math.max(0, 3 - game.stars))}</span>
            <span className="text-xs text-slate-400 font-sans font-normal ml-2">({game.stars}/3)</span>
          </div>
        </div>
      </div>

      {/* Crash Alert (GM-06 / FIRST-EMPLOYEE-SCENARIO: Hire + wait crashes on 10 Feb with 900 PLN shortfall) */}
      {isCrashed && game.crash && (
        <div
          role="alert"
          data-testid="level2-crash-alert"
          className="bg-red-950/80 border-2 border-red-500 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-white"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">💥</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                Załamanie płynności w dniu {game.crash.date}
              </span>
              <h2 className="text-2xl font-black">Wynagrodzenie zablokowane!</h2>
            </div>
          </div>
          <p className="text-sm text-red-200">
            Wypłata pensji 10 lutego wyczerpała gotówkę! Deficyt wynosi{" "}
            <strong className="font-mono text-white text-base">
              {game.crash.shortfall.toLocaleString("pl-PL")} zł
            </strong>.
            Faktura od klienta (9 000 zł) przyjdzie dopiero 12 lutego — za późno!
          </p>
          <div className="pt-2">
            <button
              onClick={() => rewindToWeek(2)}
              data-testid="level2-rewind-button"
              className="min-h-[44px] px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              ⟲ Cofnij do Tygodnia 2 i weź zaliczkę od klienta
            </button>
          </div>
        </div>
      )}

      {/* Success View */}
      {isCompleted && (
        <div
          data-testid="level2-success-view"
          className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 space-y-4 text-white"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Misja zakończona sukcesem!
              </span>
              <h2 className="text-2xl font-black">Pierwszy pracownik na pokładzie</h2>
            </div>
          </div>
          <p className="text-sm text-slate-200">
            Zarządziłeś przepływami pieniężnymi tak, że podatki i wynagrodzenia zostały opłacone na czas.
            Saldo końcowe: <strong className="font-mono text-emerald-400 text-lg">{game.balance.toLocaleString("pl-PL")} zł</strong>.
          </p>
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs">
            💡 <strong>Lekcja:</strong> Koszt pracownika to nie tylko pensja netto na konto, ale podatki, ZUS i konieczność zgrania terminów wpływów z terminami wypłat.
          </div>
        </div>
      )}

      {/* Decision Card Container for Active Week */}
      {!isCrashed && !isCompleted && (
        <div
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6"
          data-testid="level2-decision-container"
        >
          {game.week === 1 && (
            <div className="space-y-4" data-testid="decision-week-1">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Decyzja Tygodnia 1 (1–7 lutego)
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Czy zatrudniasz pierwszego pracownika studia?
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Nowe zlecenie wymaga rąk do pracy. Zatrudnienie to 6 000 zł pensji 10 II oraz 1 200 zł składek ZUS 15 II.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => chooseAction("hire")}
                  data-testid="choose-hire-button"
                  className="min-h-[44px] p-5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-left transition flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div>
                    <div className="font-black text-white text-base group-hover:text-amber-400 transition">
                      A. Zatrudnij pracownika
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Wypłata 6 000 zł w dniu 10 II + koszty pracodawcy 1 200 zł w dniu 15 II.
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400">Wybierz ten manewr →</span>
                </button>

                <button
                  type="button"
                  onClick={() => chooseAction("defer")}
                  data-testid="choose-defer-button"
                  className="min-h-[44px] p-5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-left transition flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div>
                    <div className="font-black text-white text-base group-hover:text-amber-400 transition">
                      B. Odrocz zatrudnienie
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Bezpieczna poduszka finansowa, brak stałych obciążeń płacowych w tym miesiącu.
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400">Wybierz ten manewr →</span>
                </button>
              </div>
            </div>
          )}

          {game.week === 2 && (
            <div className="space-y-4" data-testid="decision-week-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Decyzja Tygodnia 2 (8–14 lutego)
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Jak sfinansujesz wypłatę 10 lutego?
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Duża faktura od klienta (9 000 zł) ma termin dopiero 12 lutego. Możesz poprosić o wcześniejszą zaliczkę.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => chooseAction("advance")}
                  data-testid="choose-advance-button"
                  className="min-h-[44px] p-5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-left transition flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div>
                    <div className="font-black text-white text-base group-hover:text-amber-400 transition">
                      A. Pobierz zaliczkę 3 000 zł (8 II)
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Klient przelewa 3 000 zł przed terminem pensji. Reszta faktury (6 000 zł) wpłynie 12 II.
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400">Wybierz ten manewr →</span>
                </button>

                <button
                  type="button"
                  onClick={() => chooseAction("wait")}
                  data-testid="choose-wait-button"
                  className="min-h-[44px] p-5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-left transition flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div>
                    <div className="font-black text-white text-base group-hover:text-amber-400 transition">
                      B. Czekaj na pełną fakturę (12 II)
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Nie prosisz o zaliczkę. Czekasz na całe 9 000 zł w umownym terminie.
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400">Wybierz ten manewr →</span>
                </button>
              </div>
            </div>
          )}

          {game.week === 3 && (
            <div className="space-y-4" data-testid="decision-week-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Decyzja Tygodnia 3 (15–21 lutego)
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Zarządzanie rezerwą na podatek dochodowy (19 II)
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  19 lutego musisz zapłacić 4 300 zł podatku. Czy tworzysz celową rezerwę na subkoncie?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => chooseAction("reserve")}
                  data-testid="choose-reserve-button"
                  className="min-h-[44px] p-5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-left transition flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div>
                    <div className="font-black text-white text-base group-hover:text-amber-400 transition">
                      A. Zabezpiecz rezerwę 4 300 zł
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Earmarking środków chroni przed przypadkowym wydaniem pieniędzy na podatek.
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400">Wybierz ten manewr →</span>
                </button>

                <button
                  type="button"
                  onClick={() => chooseAction("unreserved")}
                  data-testid="choose-unreserved-button"
                  className="min-h-[44px] p-5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-left transition flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div>
                    <div className="font-black text-white text-base group-hover:text-amber-400 transition">
                      B. Wspólne saldo bez rezerwy
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Środki pozostają w jednym worku operacyjnym.
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400">Wybierz ten manewr →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ledger History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3" data-testid="level2-ledger">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Księga operacji poziomu 2 ({game.ledger.length})
        </h3>
        <div className="space-y-2">
          {game.ledger.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 font-bold">{item.date}</span>
                <span className="text-white font-medium">{item.title}</span>
              </div>
              <span
                className={`font-mono font-bold ${
                  item.amount > 0 ? "text-emerald-400" : "text-rose-300"
                }`}
              >
                {item.amount > 0 ? "+" : ""}
                {item.amount.toLocaleString("pl-PL")} zł
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

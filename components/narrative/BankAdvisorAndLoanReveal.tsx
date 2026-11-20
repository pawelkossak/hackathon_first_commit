"use client";

import React from "react";
import type { CardId, GameState } from "../../engine";

export interface BankAdvisorAndLoanRevealProps {
  state: GameState;
  onSelectCard?: (cardId: CardId) => void;
  onClose?: () => void;
  className?: string;
}

export function BankAdvisorAndLoanReveal({
  state,
  onSelectCard,
  onClose,
  className = "",
}: BankAdvisorAndLoanRevealProps) {
  const currentWeek = state.core.week;
  const isOverdraftAvailable = currentWeek <= 3;

  return (
    <section
      aria-label="Doradca bankowy i analiza pożyczki pozabankowej (G16)"
      className={`w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-neutral-100 ${className}`}
    >
      <header className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-amber-400">Finansowanie zewnętrzne i analiza kosztów</h2>
          <p className="text-xs text-neutral-400">Porównanie limitu bankowego i oferty pożyczki pozabankowej SMS</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] text-xs px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 transition-colors"
          >
            Zamknij
          </button>
        )}
      </header>

      <div className="space-y-6">
        {/* Panel 1: Doradca Banku (Overdraft / Kredyt w koncie) */}
        <article className="p-4 bg-neutral-800/80 border border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 text-sm">
              🏛️
            </span>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100">Doradca bankowy: Kredyt w rachunku bieżącym</h3>
              <span className="text-[11px] text-neutral-400">Produkt bankowy (wymaga procedury do końca T3)</span>
            </div>
          </div>

          <div className="text-xs text-neutral-300 space-y-1 my-3">
            <p>
              Limit w koncie pozwala pokryć chwilowe luki w płynności bez konieczności pożyczek ratalnych.
            </p>
            <p className="text-amber-300 font-medium">
              Szacunkowy koszt: <span className="underline">ok. 194 zł</span> (szacunek oparty na stopach rynkowych).
            </p>
            {!isOverdraftAvailable && (
              <p className="text-red-400 font-medium">
                ⛔ Za późno: Wniosek o limit bankowy musiał być złożony do 3. tygodnia.
              </p>
            )}
          </div>

          {isOverdraftAvailable && onSelectCard && (
            <button
              type="button"
              onClick={() => onSelectCard("C4")}
              className="min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Wybierz kredyt kupiecki / limit bankowy
            </button>
          )}
        </article>

        {/* Panel 2: Pożyczka pozabankowa SMS (Ujawnienie kosztów - nigdy nie oferowana przez bank!) */}
        <article className="p-4 bg-amber-950/40 border border-amber-600/50 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center font-bold text-red-400 text-sm">
              📱
            </span>
            <div>
              <h3 className="text-sm font-semibold text-amber-200">
                Pożyczka pozabankowa SMS (Karta C5)
              </h3>
              <span className="text-[11px] text-red-400 font-semibold uppercase">
                ⚠️ Oferta zewnętrzna firmy pożyczkowej — nigdy nie oferowana przez bank!
              </span>
            </div>
          </div>

          {/* SMS Mockup Box */}
          <div className="p-3 bg-neutral-950 border border-neutral-700/80 rounded-lg text-xs font-mono text-neutral-300 my-3">
            <div className="text-[10px] text-neutral-500 mb-1">Nadawca: POZYCZKA-SMS</div>
            „Błyskawiczna gotówka dla firm: 15 000 zł na Twoim koncie w 15 minut! Odpisz TAK!”
          </div>

          {/* Full Truth Cost Disclosure */}
          <div className="p-3 bg-red-950/60 border border-red-600/60 rounded-lg text-xs text-red-200 space-y-1">
            <span className="font-bold block text-red-300 text-sm">Rzeczywisty koszt oferty:</span>
            <div className="flex justify-between">
              <span>Wypłacana kwota:</span>
              <span className="font-bold">15 000 zł</span>
            </div>
            <div className="flex justify-between">
              <span>Koszt pożyczki (prowizja + opłaty):</span>
              <span className="font-bold text-red-400">+2 400 zł</span>
            </div>
            <div className="flex justify-between border-t border-red-800/80 pt-1 font-bold text-sm">
              <span>Całkowita spłata do 15 stycznia:</span>
              <span className="text-amber-300">17 400 zł</span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 mt-3 italic">
            Zasada gry: Wygrana nigdy nie wymaga wzięcia pożyczki pozabankowej. Zawsze istnieją tańsze manewry operacyjne (zaliczka, skonto, odroczenie).
          </p>

          {onSelectCard && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => onSelectCard("C5")}
                className="min-h-[44px] px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-red-300 border border-red-600/40 font-medium text-xs rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Rozważ pożyczkę pozabankową SMS (17 400 zł do spłaty)
              </button>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

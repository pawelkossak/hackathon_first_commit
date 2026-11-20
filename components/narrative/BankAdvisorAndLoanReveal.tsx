"use client";

// G16: the bank advisor's overdraft (C4) and the reveal of the non-bank SMS loan (C5). Hard rule 3: the bank
// never offers the loan; winning never needs a product. Every amount, date and cost comes from the engine
// (bankAdvisorView: getAvailableCards, previewCard); availability and reasons are the engine's.
import React from "react";
import type { CardId, GameState } from "../../engine";
import {
  disabledReasonText,
  formatDayMonth,
  formatPln,
  getCopy,
  type NarratorGender,
  type PlayerGender,
} from "../../narrative";
import { bankAdvisorView } from "./advisor-views";

export interface BankAdvisorAndLoanRevealProps {
  state: GameState;
  playerGender?: PlayerGender;
  narratorGender?: NarratorGender;
  onSelectCard?: (cardId: CardId) => void;
  onClose?: () => void;
  className?: string;
}

export function BankAdvisorAndLoanReveal({
  state,
  playerGender = "female",
  narratorGender = "female",
  onSelectCard,
  onClose,
  className = "",
}: BankAdvisorAndLoanRevealProps) {
  const { overdraft, loan } = bankAdvisorView(state);
  const copy = (id: string, extra?: Record<string, string | number>) =>
    getCopy(id, state, playerGender, narratorGender, extra);

  return (
    <section
      aria-label="Doradca bankowy i pożyczka pozabankowa (G16)"
      className={`w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-neutral-100 ${className}`}
    >
      <header className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-amber-400">{copy("ui.bank_advisor.title")}</h2>
          <p className="text-sm text-neutral-400">Limit w koncie z banku i oferta pożyczki pozabankowej z SMS-a</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] text-sm px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {copy("ui.btn.close")}
          </button>
        )}
      </header>

      <div className="space-y-6">
        <article className="p-4 bg-neutral-800/80 border border-neutral-700 rounded-xl" data-card-id={overdraft.cardId}>
          <h3 className="text-base font-semibold text-neutral-100">{overdraft.title}</h3>
          <p className="text-sm text-neutral-400">{copy("card.overdraft.body")}</p>

          <div className="text-sm text-neutral-300 space-y-1 my-3">
            {overdraft.limit !== null && (
              <p>Limit do wykorzystania: {formatPln(overdraft.limit)}</p>
            )}
            <p className="text-amber-300 font-medium">
              {copy("card.overdraft.cost", { "overdraft.costEstimate": formatPln(overdraft.cost) })}
            </p>
            {overdraft.disabledReason && (
              <p className="text-red-300 font-medium" role="status">
                {disabledReasonText(overdraft.disabledReason, playerGender, narratorGender)}
              </p>
            )}
          </div>

          {overdraft.playable && onSelectCard && (
            <button
              type="button"
              onClick={() => onSelectCard(overdraft.cardId)}
              className="min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Wybierz limit w koncie
            </button>
          )}
        </article>

        <article className="p-4 bg-amber-950/40 border border-amber-600/50 rounded-xl" data-card-id={loan.cardId}>
          <h3 className="text-base font-semibold text-amber-200">{loan.title}</h3>
          <p className="text-sm text-red-300 font-semibold">{copy("g16.explanation")}</p>

          <div className="p-3 bg-neutral-950 border border-neutral-700/80 rounded-lg text-sm text-neutral-300 my-3">
            <span className="block text-xs text-neutral-400 mb-1" aria-hidden="true">SMS</span>
            {loan.title}
          </div>

          <div className="p-3 bg-red-950/60 border border-red-600/60 rounded-lg text-sm text-red-200 space-y-1">
            {loan.payout && loan.repayment ? (
              <p className="font-bold">
                {copy("g16.repay", {
                  "loan.amount": formatPln(loan.payout.amount),
                  "loan.repayment": formatPln(loan.repayment.amount),
                  "loan.dueDate": formatDayMonth(loan.repayment.date),
                })}
              </p>
            ) : null}
            <p className="font-bold text-amber-300">{copy("g16.cost", { "loan.cost": formatPln(loan.cost) })}</p>
            {loan.disabledReason && (
              <p role="status">{disabledReasonText(loan.disabledReason, playerGender, narratorGender)}</p>
            )}
          </div>

          <p className="text-sm text-neutral-400 mt-3 italic">
            Wygrana nigdy nie wymaga pożyczki. Zawsze jest tańszy manewr: zaliczka, skonto albo przesunięcie płatności.
          </p>

          {loan.playable && onSelectCard && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => onSelectCard(loan.cardId)}
                className="min-h-[44px] px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-red-300 border border-red-600/40 font-medium text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Rozważ pożyczkę pozabankową
              </button>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

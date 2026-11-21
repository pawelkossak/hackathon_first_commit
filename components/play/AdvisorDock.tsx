"use client";

import React, { useEffect, useRef, useState } from "react";
import { BankAdvisorAndLoanReveal, CfoAdvisor, NegotiationDialogue } from "../narrative";
import { useGameStore } from "../../lib/ui/game-store";
import { useCopy } from "../../lib/ui/copy";
import type { GameState } from "../../engine";

type Panel = "klient_a" | "cfo" | "bank";

/**
 * G14 negotiation, G15 AI-CFO and G16 bank advisor, mounted from components/narrative.
 * The negotiation runs through /api/agent → engine negotiate(); its returned state goes into the store.
 */
export function AdvisorDock() {
  const state = useGameStore((s) => s.state);
  const applyEngineState = useGameStore((s) => s.applyEngineState);
  const delegateBestAction = useGameStore((s) => s.delegateBestAction);
  const selectCard = useGameStore((s) => s.selectCard);
  const { copy, playerGender, narratorGender } = useCopy();
  const [open, setOpen] = useState<Panel | null>(null);
  // The dialogue keeps its own thread; it starts from the state at the moment it was opened.
  const [openedWith, setOpenedWith] = useState<GameState | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(null);
    setOpenedWith(null);
  };

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(null);
        setOpenedWith(null);
      }
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLElement>("button, input")?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open]);

  if (state.core.status !== "playing") return null;

  const openPanel = (panel: Panel) => {
    setOpenedWith(state);
    setOpen(panel);
  };

  const buttons: { panel: Panel; text: string; testId: string }[] = [
    { panel: "klient_a", text: copy("ui.btn.negotiate"), testId: "open-negotiation" },
    { panel: "cfo", text: copy("ui.btn.ai_cfo"), testId: "open-cfo" },
    { panel: "bank", text: copy("ui.bank_advisor.title"), testId: "open-bank" },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-3" data-testid="advisor-dock">
        {buttons.map((b) => (
          <button
            key={b.panel}
            type="button"
            data-testid={b.testId}
            onClick={() => openPanel(b.panel)}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {b.text}
          </button>
        ))}
      </div>

      {open && openedWith && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={buttons.find((b) => b.panel === open)?.text}
          data-testid={`advisor-dialog-${open}`}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          {open === "klient_a" && (
            <NegotiationDialogue
              state={openedWith}
              agent="klient_a"
              playerGender={playerGender}
              narratorGender={narratorGender}
              onStateChange={(next) => applyEngineState(next)}
              onClose={close}
            />
          )}
          {open === "cfo" && (
            <CfoAdvisor
              state={state}
              playerGender={playerGender}
              narratorGender={narratorGender}
              onPlayCard={(cardId) => {
                selectCard(cardId);
                close();
              }}
              onDelegate={() => {
                delegateBestAction();
                close();
              }}
              onClose={close}
            />
          )}
          {open === "bank" && (
            <BankAdvisorAndLoanReveal
              state={state}
              playerGender={playerGender}
              narratorGender={narratorGender}
              onSelectCard={(cardId) => {
                selectCard(cardId);
                close();
              }}
              onClose={close}
            />
          )}
        </div>
      )}
    </>
  );
}

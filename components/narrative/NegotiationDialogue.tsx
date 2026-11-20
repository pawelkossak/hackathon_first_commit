"use client";

import React, { useRef, useState } from "react";
import type { CardId, WeekNumber } from "../../engine";
import { processAgentNegotiation } from "../../lib/ai";
import type { QuickReplyOption } from "../../lib/ai/types";

export interface MessageItem {
  id: string;
  sender: "player" | "agent";
  text: string;
}

export interface NegotiationDialogueProps {
  week: WeekNumber;
  initialCounterPending?: boolean;
  onCardUnlocked?: (cardId: CardId) => void;
  onClose?: () => void;
  className?: string;
}

export function NegotiationDialogue({
  week,
  initialCounterPending = false,
  onCardUnlocked,
  onClose,
  className = "",
}: NegotiationDialogueProps) {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "init",
      sender: "agent",
      text: "Dzień dobry! Słyszałem, że chcesz porozmawiać o warunkach rozliczenia naszego grudniowego projektu.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [counterPending, setCounterPending] = useState(initialCounterPending);
  const [messagesCount, setMessagesCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlockedCard, setUnlockedCard] = useState<CardId | null>(null);
  const messageIdRef = useRef(1);

  const maxMessages = 3;
  const isBlocked = messagesCount >= maxMessages;

  const quickReplies: QuickReplyOption[] = counterPending
    ? [
        {
          id: "accept_counter",
          label: "Przyjmij kontrofertę 30% (15 000 zł do 3 XII)",
          intent: "accept_counter",
          percent: 30,
        },
        {
          id: "ask_50",
          label: "Nalegaj na 50% zaliczki",
          intent: "ask_advance",
          percent: 50,
        },
      ]
    : week <= 2
    ? [
        {
          id: "ask_50",
          label: "Poproś o zaliczkę 50% na poczet projektu",
          intent: "ask_advance",
          percent: 50,
        },
        {
          id: "ask_30",
          label: "Zaproponuj 30% zaliczki (bezpieczna opcja)",
          intent: "ask_advance",
          percent: 30,
        },
        {
          id: "discount",
          label: "Zaoferuj skonto 2% za zapłatę w 7 dni",
          intent: "offer_discount",
          percent: 2,
        },
      ]
    : [
        {
          id: "discount",
          label: "Zaoferuj skonto 2% za zapłatę w 7 dni",
          intent: "offer_discount",
          percent: 2,
        },
      ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isBlocked || isSubmitting) return;

    messageIdRef.current += 1;
    const userMsg: MessageItem = {
      id: `user-${messageIdRef.current}`,
      sender: "player",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsSubmitting(true);
    setMessagesCount((prev) => prev + 1);

    try {
      // Direct call through narrative ai service (with fallback)
      const res = await processAgentNegotiation({
        message: textToSend,
        agent: "klient_a",
        week,
        counterPending,
      });

      messageIdRef.current += 1;
      const agentMsg: MessageItem = {
        id: `agent-${messageIdRef.current}`,
        sender: "agent",
        text: res.reply,
      };

      setMessages((prev) => [...prev, agentMsg]);

      if (res.outcome === "counter") {
        setCounterPending(true);
      } else if (res.outcome === "accept") {
        setCounterPending(false);
        if (res.cardId) {
          setUnlockedCard(res.cardId as CardId);
          onCardUnlocked?.(res.cardId as CardId);
        }
      }
    } catch {
      messageIdRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `fallback-${messageIdRef.current}`,
          sender: "agent",
          text: "Wybierz jedną z przygotowanych opcji negocjacji:",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-label="Negocjacje z Klientem A (G14)"
      className={`w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 shadow-2xl flex flex-col text-neutral-100 ${className}`}
    >
      <header className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-amber-400">Klient A (Agencja)</h2>
          <p className="text-xs text-neutral-400">
            Faktura INV-A1 (20 295 zł brutto, termin 60 dni)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-neutral-800 border border-neutral-700 px-2.5 py-1 rounded-full text-neutral-300">
            Wiadomości: {messagesCount}/{maxMessages}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] text-xs px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 transition-colors"
            >
              Zamknij
            </button>
          )}
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto max-h-[360px] space-y-3 p-2 bg-neutral-950/60 rounded-xl border border-neutral-800/80 mb-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === "player" ? "items-end" : "items-start"
            }`}
          >
            <span className="text-[11px] text-neutral-500 mb-1 px-1">
              {m.sender === "player" ? "Ty" : "Klient A"}
            </span>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm sm:text-base leading-relaxed ${
                m.sender === "player"
                  ? "bg-amber-400 text-neutral-950 font-medium rounded-tr-none"
                  : "bg-neutral-800 text-neutral-100 border border-neutral-700/80 rounded-tl-none"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Unlocked Card Notification Banner */}
      {unlockedCard && (
        <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-sm flex items-center justify-between">
          <span>
            Uzyskano manewr: <strong>{unlockedCard === "C1" ? "Zaliczka (C1)" : "Skonto (C2)"}</strong>! Możesz go teraz zatwierdzić w talii kart.
          </span>
        </div>
      )}

      {/* Quick Replies */}
      {!isBlocked && (
        <div className="mb-4">
          <span className="text-xs text-neutral-400 font-medium block mb-2">
            Szybkie odpowiedzi (kliknij, aby wysłać):
          </span>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((q) => (
              <button
                key={q.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSend(q.label)}
                className="min-h-[44px] text-xs sm:text-sm px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-700 text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Free Text Input */}
      {!isBlocked && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputVal);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isSubmitting}
            placeholder="Wpisz propozycję (np. Poproszę o 50% zaliczki)..."
            className="flex-1 min-h-[44px] px-4 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isSubmitting}
            className="min-h-[44px] px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-neutral-950 font-semibold text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            Wyślij
          </button>
        </form>
      )}

      {isBlocked && (
        <div className="text-center p-3 bg-neutral-800/80 rounded-xl text-xs text-neutral-400">
          Osiągnięto limit 3 wiadomości w tym tygodniu.
        </div>
      )}
    </section>
  );
}

"use client";

// G14 negotiation with Klient A, and the bank thread of G16 (ENGINE-DATA-AND-TESTS.md §4.1–§4.2, GM-04).
// Every message goes to the server route /api/agent; the engine decides there and returns the new state.
// An accepted deal is already played by the engine (result.state): the parent only stores that state.
// On a failed call or after 3 s the cached fallback line and the quick replies are shown.
import React, { useRef, useState } from "react";
import type { AgentId, AgentIntent, GameState, NegotiationResult } from "../../engine";
import { getAvailableCards } from "../../engine";
import {
  agentName,
  fallbackLineId,
  getCopy,
  maxMessagesPerWeek,
  quickRepliesFor,
  type NarratorGender,
  type PlayerGender,
  type QuickReply,
} from "../../narrative";
import { postAgentTurn } from "./agent-client";
import { dialogueSync } from "./negotiation-sync";

export interface MessageItem {
  id: string;
  sender: "player" | "agent";
  text: string;
}

export interface NegotiationDialogueProps {
  state: GameState;
  agent?: AgentId;
  playerGender?: PlayerGender;
  narratorGender?: NarratorGender;
  /** The engine's new state after each answered message (a deal is already applied in it). */
  onStateChange?: (state: GameState, result: NegotiationResult) => void;
  onClose?: () => void;
  className?: string;
}

export function NegotiationDialogue({
  state,
  agent = "klient_a",
  playerGender = "female",
  narratorGender = "female",
  onStateChange,
  onClose,
  className = "",
}: NegotiationDialogueProps) {
  const copy = (id: string, extra?: Record<string, string | number>) =>
    getCopy(id, state, playerGender, narratorGender, extra);
  const name = agentName(agent);

  const greeting = (): MessageItem[] => [{ id: "init", sender: "agent", text: copy(`ui.negotiate.greeting.${agent}`) }];
  const [current, setCurrent] = useState<GameState>(state);
  const [synced, setSynced] = useState<GameState>(state);
  const [messages, setMessages] = useState<MessageItem[]>(greeting);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(() => quickRepliesFor(state, agent));
  const [inputVal, setInputVal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playedTitle, setPlayedTitle] = useState<string | null>(null);
  const messageIdRef = useRef(1);

  // A new `state` prop (rewind, new week, reset) restarts the thread from it; the parent's echo of our
  // own answer keeps it (negotiation-sync.ts). Adjusting state during render, not in an effect.
  const sync = dialogueSync(state, synced, current);
  if (sync !== "none") {
    setSynced(state);
    if (sync === "reset") {
      setCurrent(state);
      setMessages(greeting());
      setQuickReplies(quickRepliesFor(state, agent));
      setPlayedTitle(null);
      setInputVal("");
    }
  }

  const maxMessages = maxMessagesPerWeek(agent);
  const used = current.core.negotiation[agent].messagesThisWeek;
  const isBlocked = used >= maxMessages || current.core.status !== "playing";

  const push = (sender: MessageItem["sender"], text: string) => {
    messageIdRef.current += 1;
    const item: MessageItem = { id: `${sender}-${messageIdRef.current}`, sender, text };
    setMessages((prev) => [...prev, item]);
  };

  const send = async (text: string, intent?: AgentIntent) => {
    if (!text.trim() || isBlocked || isSubmitting) return;
    push("player", text);
    setInputVal("");
    setIsSubmitting(true);
    try {
      const response = await postAgentTurn({
        state: current,
        agent,
        ...(intent ? { intent } : { message: text }),
        playerGender,
        narratorGender,
      });
      if (response === null) {
        push("agent", copy(fallbackLineId(agent)));
        setQuickReplies(quickRepliesFor(current, agent));
        return;
      }
      push("agent", response.text);
      setQuickReplies(response.quickReplies);
      if (response.ok) {
        const next = response.result.state;
        setCurrent(next);
        const playedId = response.result.appliedCardId;
        if (playedId) {
          setPlayedTitle(getAvailableCards(next).find((c) => c.id === playedId)?.title ?? playedId);
        }
        onStateChange?.(next, response.result);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-label={name}
      className={`w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 shadow-2xl flex flex-col text-neutral-100 ${className}`}
    >
      <header className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-amber-400">{name}</h2>
          <p className="text-base text-neutral-400">{copy(`ui.negotiate.subtitle.${agent}`)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base bg-neutral-800 border border-neutral-700 px-2.5 py-1 rounded-full text-neutral-300">
            {copy("ui.negotiate.messages", { used, max: maxMessages })}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] text-base px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {copy("ui.btn.close")}
            </button>
          )}
        </div>
      </header>

      <div
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto max-h-[360px] space-y-3 p-2 bg-neutral-950/60 rounded-xl border border-neutral-800/80 mb-4"
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === "player" ? "items-end" : "items-start"}`}>
            <span className="text-base text-neutral-400 mb-1 px-1">
              {m.sender === "player" ? copy("ui.negotiate.you") : name}
            </span>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-base leading-relaxed ${
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

      {playedTitle && (
        <div
          role="status"
          className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-base"
        >
          {copy("ui.negotiate.card_played", { "card.title": playedTitle })}
        </div>
      )}

      {!isBlocked && quickReplies.length > 0 && (
        <div className="mb-4">
          <span className="text-base text-neutral-400 font-medium block mb-2">{copy("ui.negotiate.quick_replies")}</span>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((q) => {
              const label = copy(q.labelKey);
              return (
                <button
                  key={q.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => send(label, q.intent)}
                  className="min-h-[44px] text-base px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-700 text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isBlocked && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(inputVal);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            aria-label={copy("ui.negotiate.input_label")}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isSubmitting}
            maxLength={500}
            placeholder={copy("ui.negotiate.placeholder")}
            className="flex-1 min-h-[44px] px-4 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-base text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isSubmitting}
            className="min-h-[44px] px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-neutral-950 font-semibold text-base rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {copy("ui.negotiate.send")}
          </button>
        </form>
      )}

      {isBlocked && (
        <div role="status" className="text-center p-3 bg-neutral-800/80 rounded-xl text-base text-neutral-300">
          {copy("ui.negotiate.limit")}
        </div>
      )}
    </section>
  );
}

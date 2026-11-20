// E-04 event deck cases. Expected values are copied from ENGINE-DATA-AND-TESTS.md §7.3
// (and GAME-DESIGN.md §6.2, §6.5), never computed by the engine and pasted back.
import { describe, expect, it } from "vitest";
import { gameData } from "./data";
import type { CardId, EngineEvent, EventChoiceId, EventId, GameState } from "./index";
import {
  RuleError,
  createGame,
  forecast,
  getCurrentEvent,
  playCard,
  resetGame,
  resolveEvent,
  resolveWeek,
  rewind,
} from "./index";

function errorCode(fn: () => unknown): string | null {
  try {
    fn();
  } catch (e) {
    return e instanceof RuleError ? e.code : "not a RuleError";
  }
  return null;
}

/** Safe event choices of §7 (E1 check, E2 decline, E3 january); E5 ignore, E6 acknowledge. */
const safe: Record<EventId, EventChoiceId> = {
  E1: "check",
  E2: "decline",
  E3: "january",
  E5: "ignore",
  E6: "acknowledge",
};

interface Lap {
  state: GameState;
  weekEnds: (number | null)[];
  /** Ids of the events shown, in order. */
  shown: EventId[];
  /** Every engine event emitted by the lap's transitions. */
  emitted: EngineEvent[];
}

/** Play the demo lap: `choices` override the safe choices, `plays[week]` is the week's card (after the event). */
function playLap(choices: Partial<Record<EventId, EventChoiceId>>, plays: Partial<Record<number, CardId>> = {}): Lap {
  let s = createGame("demo");
  const weekEnds: (number | null)[] = [];
  const shown: EventId[] = [];
  const emitted: EngineEvent[] = [...s.emitted];
  while (s.core.status === "playing") {
    const ev = getCurrentEvent(s);
    if (ev) {
      shown.push(ev.id);
      s = resolveEvent(s, choices[ev.id] ?? safe[ev.id]);
      emitted.push(...s.emitted);
    }
    const card = plays[s.core.week];
    if (card) {
      s = playCard(s, card);
      emitted.push(...s.emitted);
    }
    const r = resolveWeek(s);
    weekEnds.push(r.endBalance);
    emitted.push(...r.events);
    s = r.state;
  }
  return { state: s, weekEnds, shown, emitted };
}

/** Demo seed at the start of `week` with safe choices and `plays`, the week's event not yet resolved. */
function atWeek(week: number, plays: Partial<Record<number, CardId>> = {}, choices: Partial<Record<EventId, EventChoiceId>> = {}): GameState {
  let s = createGame("demo");
  while (s.core.week < week) {
    const ev = getCurrentEvent(s);
    if (ev) s = resolveEvent(s, choices[ev.id] ?? safe[ev.id]);
    const card = plays[s.core.week];
    if (card) s = playCard(s, card);
    s = resolveWeek(s).state;
  }
  return s;
}

describe("E-04 event deck (ENGINE-DATA-AND-TESTS §7.3)", () => {
  it("ET-E01 E1 pay_as_is, no card: crash 22 XII at L08, short 8 095 (before the fraud matters)", () => {
    const lap = playLap({ E1: "pay_as_is" });
    expect(lap.state.core.status).toBe("crashed");
    expect(lap.state.core.crash).toMatchObject({ date: "2026-12-22", transactionId: "L08", shortfall: 8095 });
  });

  it("ET-E02 E1 pay_as_is + C1: … 6 905 · 9 985 · —; crash 8 I at E1, short 25 715", () => {
    const lap = playLap({ E1: "pay_as_is" }, { 1: "C1" });
    expect(lap.weekEnds.slice(4)).toEqual([6905, 9985, null]);
    expect(lap.state.core.crash).toMatchObject({ date: "2027-01-08", transactionId: "E1", shortfall: 25715 });
  });

  it("ET-E03 E1 pay_as_is + C1 + C2 in T4: crash 8 I at E1, short 5 826", () => {
    const lap = playLap({ E1: "pay_as_is" }, { 1: "C1", 4: "C2" });
    expect(lap.state.core.crash).toMatchObject({ date: "2027-01-08", transactionId: "E1", shortfall: 5826 });
  });

  it("ET-E04 E2 accept, no card: crash 22 XII, short 11 095", () => {
    const lap = playLap({ E2: "accept" });
    expect(lap.state.core.crash).toMatchObject({ date: "2026-12-22", shortfall: 11095 });
  });

  it("ET-E05 E2 accept + C1: 33 700 · 56 080 · 40 380 · 43 705 · 3 905 · —; crash 28 XII at L09, short 395", () => {
    const lap = playLap({ E2: "accept" }, { 1: "C1" });
    expect(lap.weekEnds).toEqual([33700, 56080, 40380, 43705, 3905, null]);
    expect(lap.state.core.crash).toMatchObject({ date: "2026-12-28", transactionId: "L09", shortfall: 395 });
  });

  it("ET-E06 E3 now + C1: … 46 305 · 6 505 · 9 585 · 9 585; low +2 205", () => {
    const lap = playLap({ E3: "now" }, { 1: "C1" });
    expect(lap.state.core.status).toBe("completed");
    expect(lap.weekEnds.slice(3)).toEqual([46305, 6505, 9585, 9585]);
    expect(lap.state.core.lowestBalance?.balance).toBe(2205);
  });

  it("ET-E07 E5 shown when no card played by T5; hidden after C1, C2 (T1–T4), C3, C4 or C6", () => {
    expect(getCurrentEvent(atWeek(5))?.id).toBe("E5");
    expect(playLap({}).shown).toContain("E5");

    const hiddenAfter: Partial<Record<number, CardId>>[] = [
      { 1: "C1" },
      { 2: "C1" },
      { 1: "C2" },
      { 2: "C2" },
      { 3: "C2" },
      { 4: "C2" },
      { 1: "C3" },
      { 4: "C3" },
      { 1: "C4" },
      { 3: "C4" },
      { 1: "C6" },
      { 4: "C6" },
    ];
    for (const plays of hiddenAfter) {
      expect(getCurrentEvent(atWeek(5, plays)), JSON.stringify(plays)).toBeNull();
    }
    // C6 played in T5 closes the gap, so the SMS is no longer shown that week.
    expect(getCurrentEvent(playCard(atWeek(5), "C6"))).toBeNull();
    // C2 in T5 is too late (money on 28 XII): the gap stays open and E5 is shown.
    expect(getCurrentEvent(playCard(atWeek(5), "C2"))?.id).toBe("E5");
  });

  it("ET-E08 E6 after C2 or C6: no effect (INV-A1 not pending)", () => {
    for (const card of ["C2", "C6"] as const) {
      const s = atWeek(6, { 4: card });
      expect(s.core.invoiceState).not.toBe("pending");
      expect(getCurrentEvent(s)?.id).toBe("E6");
      const resolved = resolveEvent(s, "acknowledge");
      expect(forecast(resolved)).toEqual(forecast(s));
      expect(forecast(resolved, { includeFutureEvents: false })).toEqual(forecast(s, { includeFutureEvents: false }));
      expect(s.emitted).toContainEqual({ type: "lateClient", week: 6, eventId: "E6", newDate: null });
    }
  });

  it("ET-E09 E1 check: Bezpieczne płatności = 2; delegated check = 1", () => {
    const s = createGame("demo");
    expect(resolveEvent(s, "check").core.competences.bezpieczne_platnosci).toBe(2);
    expect(resolveEvent(s, "check", true).core.competences.bezpieczne_platnosci).toBe(1);
    expect(resolveEvent(s, "pay_as_is").core.competences.bezpieczne_platnosci).toBe(0);
  });
});

describe("E-04 seeded deck, conditions and narration signals", () => {
  it("the demo seed deals E1, E2, E3, E5 (conditional), E6 (forced) in T1, T2, T3, T5, T6", () => {
    const lap = playLap({}, { 1: "C1" });
    expect(lap.shown).toEqual(["E1", "E2", "E3", "E6"]);
    expect(playLap({}, { 1: "C4" }).shown).toEqual(["E1", "E2", "E3", "E6"]);
    expect(getCurrentEvent(atWeek(4))).toBeNull();
    expect(getCurrentEvent(atWeek(7, { 1: "C1" }))).toBeNull();
  });

  it("a seed without a deck throws RuleError unknown_seed instead of falling back to the demo deck", () => {
    for (const seed of ["random", "", "constructor"]) {
      expect(errorCode(() => createGame(seed))).toBe("unknown_seed");
      expect(errorCode(() => resetGame(seed))).toBe("unknown_seed");
    }
    expect(createGame().core.seed).toBe("demo");
  });

  it("bigProject is emitted when E2 is shown (the transition into T2), not when it is resolved", () => {
    const t1 = resolveEvent(createGame("demo"), "check");
    const r = resolveWeek(t1);
    expect(getCurrentEvent(r.state)?.id).toBe("E2");
    expect(r.events).toContainEqual({ type: "bigProject", week: 2, eventId: "E2" });
    expect(r.state.emitted).toEqual(r.events);
    expect(resolveEvent(r.state, "accept").emitted).toEqual([]);
    // Rewinding to T2 shows E2 again, so the signal is emitted again.
    const later = resolveWeek(resolveEvent(r.state, "decline")).state;
    expect(rewind(later, 2).emitted).toEqual([{ type: "bigProject", week: 2, eventId: "E2" }]);
  });

  it("E5 shown emits loanOffered via E5; E6 shown with INV-A1 pending emits lateClient with the new date", () => {
    const toT5 = resolveWeek(atWeek(4));
    expect(toT5.events).toContainEqual({ type: "loanOffered", week: 5, via: "E5" });
    const hidden = resolveWeek(atWeek(4, { 1: "C1" }));
    expect(hidden.events.some((e) => e.type === "loanOffered")).toBe(false);
    const toT6 = resolveWeek(atWeek(5, { 1: "C4" }));
    expect(toT6.events).toContainEqual({ type: "lateClient", week: 6, eventId: "E6", newDate: "2027-01-22" });
  });

  it("E5 show_cost reveals the non-bank SMS loan without playing it or using the week's action", () => {
    const s = atWeek(5);
    const shown = resolveEvent(s, "show_cost");
    expect(shown.core.loanTermsShown).toBe(true);
    expect(shown.core.competences.koszt_pieniadza).toBe(1);
    expect(shown.core.played).toEqual([]);
    expect(shown.core.weekActionUsed).toBe(false);
    const c5 = gameData.level1.cards.find((c) => c.id === "C5");
    const lender = gameData.persona.counterparties.find((c) => c.id === (c5?.effect.type === "loan" ? c5.effect.counterpartyId : ""));
    expect(lender?.type).toBe("non_bank_lender");
    expect(resolveEvent(s, "ignore").core.loanTermsShown).toBe(false);
    // C5 stays playable after either choice.
    expect(() => playCard(resolveEvent(s, "ignore"), "C5")).not.toThrow();
  });

  it("E1 pay_as_is marks L08 as the fraud payment; the known ledger shows the re-payment only after the 23 XII reveal", () => {
    const s = resolveEvent(createGame("demo"), "pay_as_is");
    const txs = (st: GameState, includeFutureEvents: boolean) =>
      forecast(st, { includeFutureEvents }).points.flatMap((p) => p.transactions);
    expect(txs(s, true).find((t) => t.id === "L08")?.eventId).toBe("E1");
    expect(txs(s, true).find((t) => t.id === "E1")).toMatchObject({ date: "2027-01-08", amount: -35700, counterpartyId: "S1", source: "event" });
    expect(txs(s, false).some((t) => t.id === "E1")).toBe(false);
    const t6 = atWeek(6, { 1: "C1" }, { E1: "pay_as_is" });
    expect(txs(t6, false).some((t) => t.id === "E1")).toBe(true);
  });

  it("an event never consumes the week's card action, and resolveEvent rejects a wrong or repeated choice", () => {
    const s = resolveEvent(createGame("demo"), "check");
    expect(s.core.weekActionUsed).toBe(false);
    expect(playCard(s, "C1").core.played.map((p) => p.cardId)).toEqual(["C1"]);
    expect(() => resolveEvent(createGame("demo"), "accept")).toThrow(RuleError);
    expect(() => resolveEvent(s, "check")).toThrow(RuleError);
    expect(() => resolveWeek(createGame("demo"))).toThrow(RuleError);
  });

  it("resolving events never mutates the input state", () => {
    const s = atWeek(2);
    const copy = JSON.parse(JSON.stringify(s)) as GameState;
    resolveEvent(s, "accept");
    resolveWeek(resolveEvent(s, "accept"));
    expect(s).toEqual(copy);
  });
});

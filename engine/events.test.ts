// E-04 event deck cases. Expected values are copied from ENGINE-DATA-AND-TESTS.md §7.3
// (and GAME-DESIGN.md §6.2, §6.5), never computed by the engine and pasted back.
import { describe, expect, it } from "vitest";
import { gameData } from "./data";
import type { CardId, EngineEvent, EventChoiceId, EventId, Forecast, GameState } from "./index";
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

/** The committed part of a forecast, without the E-07 no-card baseline and its comparison. */
function committedView(f: Forecast): Omit<Forecast, "baseline" | "vsBaseline"> {
  const { baseline, vsBaseline, ...rest } = f;
  void baseline;
  void vsBaseline;
  return rest;
}

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
      // The committed forecast is unchanged. The E-07 „Bez działania” baseline (no card, so INV-A1
      // pending) does see the delay once E6 is resolved, so it is left out of the comparison.
      expect(committedView(forecast(resolved))).toEqual(committedView(forecast(s)));
      expect(committedView(forecast(resolved, { includeFutureEvents: false }))).toEqual(
        committedView(forecast(s, { includeFutureEvents: false })),
      );
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

  it("E1 pay_as_is: neither forecast view shows the fraud before the 23 XII reveal; from T6 L08 is marked and the re-payment is listed", () => {
    const s = resolveEvent(createGame("demo"), "pay_as_is");
    const txs = (st: GameState, includeFutureEvents: boolean) =>
      forecast(st, { includeFutureEvents }).points.flatMap((p) => p.transactions);
    for (const view of [true, false]) {
      expect(txs(s, view).find((t) => t.id === "L08")?.eventId).toBeNull();
      expect(txs(s, view).some((t) => t.id === "E1")).toBe(false);
    }
    const t6 = atWeek(6, { 1: "C1" }, { E1: "pay_as_is" });
    for (const view of [true, false]) {
      expect(txs(t6, view).find((t) => t.id === "L08")?.eventId).toBe("E1");
      expect(txs(t6, view).find((t) => t.id === "E1")).toMatchObject({ date: "2027-01-08", amount: -35700, counterpartyId: "S1", source: "event" });
    }
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

describe("D-18 fraudRevealed (ENGINE-DATA-AND-TESTS §6)", () => {
  // From the specification: the reveal is on 23 XII (D-18, §6), which lies in T5 = 21–27 XII (§1);
  // the reported payment is L08, −35 700 on 22 XII (ET-F04).
  const revealDate = "2026-12-23";
  const revealWeek = 5;
  const expected: EngineEvent = { type: "fraudRevealed", week: 5, eventId: "E1", ledgerId: "L08", amount: -35700, date: revealDate };

  /** Settle from `s` to the end of the lap; returns every week's resolution events keyed by week. */
  function settleFrom(start: GameState, choices: Partial<Record<EventId, EventChoiceId>>, plays: Partial<Record<number, CardId>> = {}) {
    let s = start;
    const byWeek: Partial<Record<number, EngineEvent[]>> = {};
    while (s.core.status === "playing") {
      const ev = getCurrentEvent(s);
      if (ev) s = resolveEvent(s, choices[ev.id] ?? safe[ev.id]);
      const card = plays[s.core.week];
      if (card) s = playCard(s, card);
      const r = resolveWeek(s);
      expect(r.state.emitted).toEqual(r.events);
      byWeek[r.week] = r.events;
      s = r.state;
    }
    return { state: s, byWeek };
  }

  function fraudEvents(byWeek: Partial<Record<number, EngineEvent[]>>): { week: number; e: EngineEvent }[] {
    return Object.entries(byWeek).flatMap(([w, es]) => (es ?? []).filter((e) => e.type === "fraudRevealed").map((e) => ({ week: Number(w), e })));
  }

  it("the reveal date and payment in the data match the specification", () => {
    const e1 = gameData.level1.events.find((e) => e.id === "E1");
    const reveal = e1?.choices.find((c) => c.id === "pay_as_is")?.effects.find((x) => x.type === "reveal");
    expect(reveal).toEqual({ type: "reveal", date: revealDate, what: "fraud", ledgerId: "L08" });
    const week = gameData.level1.weeks.find((w) => w.start <= revealDate && revealDate <= w.end);
    expect(week?.week).toBe(revealWeek);
  });

  it("E1 pay_as_is + C1 (survives T5): fraudRevealed exactly once, in the T5 resolution, before the 8 I crash", () => {
    const { state, byWeek } = settleFrom(createGame("demo"), { E1: "pay_as_is" }, { 1: "C1" });
    expect(fraudEvents(byWeek)).toEqual([{ week: revealWeek, e: expected }]);
    // ET-E02: the lap still crashes on 8 I at E1, short 25 715.
    expect(state.core.crash).toMatchObject({ date: "2027-01-08", transactionId: "E1", shortfall: 25715 });
  });

  it("E1 pay_as_is, no card: the lap crashes on 22 XII, before the reveal, so no fraudRevealed", () => {
    const { state, byWeek } = settleFrom(createGame("demo"), { E1: "pay_as_is" });
    // ET-E01: crash 22 XII at L08, short 8 095.
    expect(state.core.crash).toMatchObject({ date: "2026-12-22", transactionId: "L08", shortfall: 8095 });
    expect(fraudEvents(byWeek)).toEqual([]);
    expect(byWeek[revealWeek]?.map((e) => e.type)).toEqual(["crash"]);
  });

  it("E1 check and call: never fraudRevealed", () => {
    for (const plays of [{}, { 1: "C1" as const }, { 1: "C6" as const }]) {
      const { byWeek } = settleFrom(createGame("demo"), { E1: "check" }, plays);
      expect(fraudEvents(byWeek)).toEqual([]);
    }
  });

  it("E1 pay_as_is + C3: L08 moves to 8 I and is rejected by the 8 I crash (ET-C06), so nothing is reported and no view shows the fraud", () => {
    const { state, byWeek } = settleFrom(createGame("demo"), { E1: "pay_as_is" }, { 1: "C3" });
    // ET-C06: crash 8 I, short 5 015; the rejected transaction is the moved −35 700 (L08).
    expect(state.core.crash).toMatchObject({ date: "2027-01-08", transactionId: "L08", shortfall: 5015 });
    expect(fraudEvents(byWeek)).toEqual([]);
    for (const st of [state, atWeek(6, { 1: "C3" }, { E1: "pay_as_is" }), atWeek(7, { 1: "C3" }, { E1: "pay_as_is" })]) {
      for (const includeFutureEvents of [true, false]) {
        const all = forecast(st, { includeFutureEvents }).points.flatMap((p) => p.transactions);
        expect(all.some((t) => t.eventId === "E1"), `T${st.core.week} ${String(includeFutureEvents)}`).toBe(false);
      }
    }
  });

  it("E-10 one reveal rule: E1 pay_as_is + C1 + C3 (T3) reports the fraud when the moved payment goes out on 8 I, and the views show it from that resolution on", () => {
    // The payment of 35 700 to the changed account goes out on 8 I (C3 moves −35 700 to 8 I, GAME-DESIGN
    // §6.1), which lies in T7 = 4–10 I (§1). ET-X06 (C1 + C3): T6 end 45 685; 8 I −35 700 → 9 985,
    // then the E1 re-payment −35 700 → −25 715: crash 8 I at E1, short 25 715 (the ET-E02 shortfall).
    const moved: EngineEvent = { type: "fraudRevealed", week: 7, eventId: "E1", ledgerId: "L08", amount: -35700, date: "2027-01-08" };
    const { state, byWeek } = settleFrom(createGame("demo"), { E1: "pay_as_is" }, { 1: "C1", 3: "C3" });
    expect(fraudEvents(byWeek)).toEqual([{ week: 7, e: moved }]);
    expect(byWeek[7]?.map((e) => e.type)).toEqual(["fraudRevealed", "crash"]);
    expect(state.core.crash).toMatchObject({ date: "2027-01-08", transactionId: "E1", shortfall: 25715 });
    // Before the T7 resolution no player-facing view shows the fraud (it has not happened in game time).
    const hiddenIn = [atWeek(5, { 1: "C1", 3: "C3" }, { E1: "pay_as_is" }), atWeek(6, { 1: "C1", 3: "C3" }, { E1: "pay_as_is" }), atWeek(7, { 1: "C1", 3: "C3" }, { E1: "pay_as_is" })];
    for (const st of hiddenIn) {
      for (const includeFutureEvents of [true, false]) {
        const all = forecast(st, { includeFutureEvents }).points.flatMap((p) => p.transactions);
        expect(all.some((t) => t.eventId === "E1"), `T${st.core.week}`).toBe(false);
      }
    }
    // After it (the crashed lap), the views show the payment marked and the re-payment.
    const after = forecast(state).points.flatMap((p) => p.transactions);
    expect(after.find((t) => t.id === "L08")).toMatchObject({ date: "2027-01-08", eventId: "E1" });
    expect(after.find((t) => t.id === "E1")).toMatchObject({ date: "2027-01-08", amount: -35700 });
    expect(forecast(state).crash).toMatchObject({ date: "2027-01-08", transactionId: "E1", shortfall: 25715 });
  });

  it("E-10 one reveal rule on the 23 XII path: the views show the fraud exactly from the resolution that emitted fraudRevealed", () => {
    let s = resolveEvent(createGame("demo"), "pay_as_is");
    s = playCard(s, "C1");
    while (s.core.status === "playing") {
      const shownBefore = forecast(s).points.some((p) => p.transactions.some((t) => t.eventId === "E1"));
      const r = resolveWeek(s);
      const emitted = r.events.some((e) => e.type === "fraudRevealed");
      const shownAfter = forecast(r.state).points.some((p) => p.transactions.some((t) => t.eventId === "E1"));
      // A view changes from hidden to shown only in the resolution that emits the signal (T5).
      expect(shownAfter && !shownBefore, `T${r.week}`).toBe(emitted);
      expect(shownAfter, `T${r.week}`).toBe(r.week >= revealWeek);
      const next = getCurrentEvent(r.state);
      s = next ? resolveEvent(r.state, safe[next.id]) : r.state;
    }
  });

  it("rewind before the reveal and replay emits fraudRevealed again; a replay after it does not", () => {
    const first = settleFrom(createGame("demo"), { E1: "pay_as_is" }, { 1: "C1" });
    for (const w of [2, 3, 4, 5] as const) {
      const replay = settleFrom(rewind(first.state, w), { E1: "pay_as_is" });
      expect(fraudEvents(replay.byWeek)).toEqual([{ week: revealWeek, e: expected }]);
    }
    const after = settleFrom(rewind(first.state, 6), { E1: "pay_as_is" });
    expect(fraudEvents(after.byWeek)).toEqual([]);
    // Rewind to 1 and a different choice (check and call): no reveal.
    const changed = settleFrom(rewind(first.state, 1), { E1: "check" }, { 1: "C1" });
    expect(fraudEvents(changed.byWeek)).toEqual([]);
  });
});

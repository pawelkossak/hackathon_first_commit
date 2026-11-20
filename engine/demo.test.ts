// E-10 demo path end to end (GAME-DESIGN.md §9, ENGINE-DATA-AND-TESTS.md §7.8 ET-D01) and the ET case
// inventory of ENGINE-DATA-AND-TESTS.md §7. Expected values are copied from the specification (§9,
// §6.1–§6.4 of GAME-DESIGN, §1, §5, §6 and §7 of ENGINE-DATA-AND-TESTS), never computed by the engine and
// pasted back. The engine is driven only through the public API of engine/index.ts, as the UI would.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { EngineEvent, GameState } from "./index";
import {
  DEMO_SEED,
  advanceAccountClock,
  createGame,
  createPlan,
  forecast,
  getAvailableCards,
  getCfoHint,
  getCurrentEvent,
  negotiate,
  resolveEvent,
  resolveWeek,
  savePlan,
} from "./index";

/**
 * One UI transition: the input must not be mutated and the output must survive a JSON round trip
 * (the UI persists it in localStorage).
 */
function step<T>(input: GameState, fn: (s: GameState) => T, pick: (r: T) => GameState): T {
  const before = JSON.stringify(input);
  const result = fn(input);
  expect(JSON.stringify(input), "input mutated").toBe(before);
  const out = pick(result);
  expect(JSON.parse(JSON.stringify(out)) as GameState).toEqual(out);
  return result;
}

function same(s: GameState): GameState {
  return s;
}

describe("E-10 demo path end to end (GAME-DESIGN §9)", () => {
  it("ET-D01 E1 check → C1 via negotiation in T1 → E2 decline → E3 january → (E5 hidden) → E6 → lap end → save plan → account +2 weeks", () => {
    // Step 1: `/gra/1?seed=demo` starts the lap (rx.welcome).
    expect(DEMO_SEED).toBe("demo");
    let s = createGame("demo");
    expect(JSON.parse(JSON.stringify(s)) as GameState).toEqual(s);
    expect(s.emitted).toEqual([{ type: "lapStart", week: 1 }]);
    expect(s.core.week).toBe(1);
    expect(s.core.balance).toBe(38000);
    expect(s.core.relations).toBe(5);
    expect(forecast(s).runwayDays).toBe(42); // ET-F03

    // Step 2 (G10): the December route with the storm on 28 XII, −12 395 zł.
    const board = forecast(s);
    expect(board.minimum).toEqual({ date: "2026-12-28", balance: -12395, counterfactual: true });
    expect(board.crash).toMatchObject({ date: "2026-12-22", transactionId: "L08", shortfall: 8095 }); // ET-F02
    expect(getCfoHint(s).risk).toMatchObject({ date: "2026-12-22", shortfall: 8095 });

    // Step 3 (G11): changed account number → „Sprawdź i zadzwoń” → Bezpieczne płatności 2.
    const e1 = getCurrentEvent(s);
    expect(e1).toMatchObject({ id: "E1", week: 1, title: "Nowy numer konta podwykonawcy" });
    expect(e1?.choices.map((c) => c.label)).toEqual(["Sprawdź na białej liście i zadzwoń", "Zapłać jak jest"]);
    s = step(s, (x) => resolveEvent(x, "check"), same);
    expect(s.emitted).toEqual([]);
    expect(s.core.competences.bezpieczne_platnosci).toBe(2);
    expect(s.core.weekActionUsed).toBe(false);

    // Step 4 (G14): „50% zaliczki?” → „Mogę dać 30% — 15 000 zł do 3 grudnia” → accept.
    const ask = step(s, (x) => negotiate(x, "klient_a", "ask_advance", 50), (r) => r.state);
    expect(ask.outcome).toBe("counter");
    expect(ask.counterPercent).toBe(30);
    expect(ask.lineId).toBe("a.advance.counter");
    expect(ask.numbers).toEqual(expect.arrayContaining([30, 15000, 3]));
    expect(ask.appliedCardId).toBeNull();
    expect(ask.state.emitted).toEqual([{ type: "negotiationOpen", week: 1, agent: "klient_a" }]);
    expect(ask.state.core.played).toEqual([]);
    const deal = step(ask.state, (x) => negotiate(x, "klient_a", "accept_counter"), (r) => r.state);
    expect(deal.outcome).toBe("accept");
    expect(deal.appliedCardId).toBe("C1");
    expect(deal.numbers).toEqual(expect.arrayContaining([15000, 3]));
    expect(deal.state.emitted).toEqual([{ type: "goodMove", week: 1, cardId: "C1" }]);
    s = deal.state;
    expect(s.core.played).toEqual([{ cardId: "C1", week: 1, delegated: false, cost: 0 }]);
    expect(s.core.weekActionUsed).toBe(true);
    expect(s.core.competences.luka_plynnosciowa).toBe(2);
    expect(getAvailableCards(s).find((c) => c.id === "C1")).toMatchObject({ played: true, playable: false });

    // Step 5 (G30): the 28 XII node, before −12 395 zł, after +2 605 zł, with the transactions.
    const cf = forecast(s);
    expect(cf.committedCards).toEqual(["C1"]);
    expect(cf.crash).toBeNull();
    expect(cf.vsBaseline.days.find((d) => d.date === "2026-12-28")).toMatchObject({ before: -12395, after: 2605, delta: 15000 });
    expect(cf.points.find((p) => p.date === "2026-12-28")?.transactions).toEqual([
      expect.objectContaining({ id: "L09", amount: -4300, counterpartyId: "US", title: "VAT za listopad" }),
    ]);
    expect(cf.vsBaseline.added).toEqual([expect.objectContaining({ id: "C1", date: "2026-12-03", amount: 15000, counterpartyId: "A" })]);
    expect(cf.low).toEqual({ date: "2026-12-28", balance: 2605 });
    expect(getCfoHint(s)).toMatchObject({ risk: null, options: [] });

    // Step 6: resolve T2–T7 with one choice per event (decline Klient C, AI tool from January,
    // acknowledge late Klient A); E5 stays hidden in T5 because the gap is closed (ET-E07).
    const weekEnds: (number | null)[] = [];
    const signals: EngineEvent[][] = [];
    const shown: string[] = ["E1"];
    const choice: Record<string, "decline" | "january" | "acknowledge"> = { E2: "decline", E3: "january", E6: "acknowledge" };
    while (s.core.status === "playing") {
      const r = step(s, resolveWeek, (x) => x.state);
      expect(r.state.emitted).toEqual(r.events);
      weekEnds.push(r.endBalance);
      signals.push(r.events);
      s = r.state;
      const ev = getCurrentEvent(s);
      if (ev) {
        shown.push(ev.id);
        const id = choice[ev.id];
        expect(id, `unexpected event ${ev.id}`).toBeDefined();
        s = step(s, (x) => resolveEvent(x, id), same);
      }
    }
    expect(shown).toEqual(["E1", "E2", "E3", "E6"]);
    // ET-D01 / ET-C01 week-ends T1…T7.
    expect(weekEnds).toEqual([33700, 56080, 40380, 46705, 6905, 9985, 9985]);
    // Narration signals (§6): bigProject when E2 is shown (T2), lateClient with 8 I → 22 I when E6 is
    // shown (T6), no loanOffered (E5 hidden), no fraudRevealed (check and call), lapWon at lap end.
    const flat = signals.flat();
    expect(signals[0]).toContainEqual({ type: "bigProject", week: 2, eventId: "E2" });
    expect(signals[4]).toContainEqual({ type: "lateClient", week: 6, eventId: "E6", newDate: "2027-01-22" });
    expect(signals[6]).toEqual([{ type: "lapWon", week: 7, stars: ["przetrwanie", "tanio"] }]);
    for (const absent of ["loanOffered", "fraudRevealed", "crash", "goodMove"]) {
      expect(flat.some((e) => e.type === absent), absent).toBe(false);
    }

    // Lap end → summary (G18): 9 985 zł, ★ Przetrwanie, ★ Tanio, ☆ Pilot pending, „Unikasz 2 400 zł”.
    expect(s.core.status).toBe("completed");
    expect(s.core.balance).toBe(9985);
    expect(s.core.crash).toBeNull();
    expect(s.core.lowestBalance).toEqual({ date: "2026-12-28", balance: 2605 });
    expect(s.core.stars).toEqual({ przetrwanie: "earned", tanio: "earned", pilot: "pending" });
    expect(s.core.costOfMoney).toBe(0);
    expect(s.core.avoidedCost).toBe(2400);
    expect(s.core.relations).toBe(5);
    expect(s.core.level2Unlocked).toBe(true);
    // ET-S05: Bezpieczne płatności 2, Luka płynnościowa 2 at lap end.
    expect(s.core.competences).toEqual({ luka_plynnosciowa: 2, koszt_pieniadza: 0, bezpieczne_platnosci: 2 });
    const lapEnd = forecast(s);
    expect(lapEnd.endBalance).toBe(9985);
    expect(lapEnd.low).toEqual({ date: "2026-12-28", balance: 2605 });

    // Step 7: „Zapisz plan” → ★★★, level 2 unlocked.
    const draft = createPlan(s, "C1");
    expect(draft).toMatchObject({
      cardId: "C1",
      counterpartyId: "A",
      amount: 15000,
      tolerancePct: 10,
      deadline: "2026-12-04",
      direction: "inflow",
      title: "Zaliczka 15 000 zł ±10 % od Klienta A do 4 grudnia",
      status: "open",
    });
    s = step(s, (x) => savePlan(x, "C1"), same);
    expect(s.core.stars).toEqual({ przetrwanie: "earned", tanio: "earned", pilot: "earned" });
    expect(s.core.level2Unlocked).toBe(true);
    expect(s.account.plans).toHaveLength(1);
    expect(s.account.plans[0]).toMatchObject({ cardId: "C1", status: "open", savedAt: "2026-11-21" });

    // „Przewiń czas o 2 tygodnie”: account 21 XI → 5 XII (§5) → „Zaliczka dotarła”, Luka płynnościowa 3 (G23).
    expect(s.account.clock).toBe("2026-11-21");
    const game = { week: s.core.week, status: s.core.status, stars: s.core.stars, unlocked: s.core.level2Unlocked };
    s = step(s, (x) => advanceAccountClock(x), same);
    expect(s.account.clock).toBe("2026-12-05");
    expect(s.account.balance).toBe(56080);
    expect(s.account.matchedTx.map((t) => [t.date, t.amount, t.counterpartyId])).toEqual([
      ["2026-11-25", -4300, "US"],
      ["2026-11-30", 7380, "C"],
      ["2026-12-03", 15000, "A"],
    ]);
    expect(s.account.matchedTx[2].title).toBe("Zaliczka 30% projekt rebranding");
    expect(s.account.plans[0].status).toBe("met");
    expect(s.emitted).toEqual([{ type: "planValidated", week: 7, planId: s.account.plans[0].id }]);
    expect(s.core.competences).toEqual({ luka_plynnosciowa: 3, koszt_pieniadza: 0, bezpieczne_platnosci: 2 });
    // ET-M03: the account clock does not change game week, status, stars or unlock.
    expect({ week: s.core.week, status: s.core.status, stars: s.core.stars, unlocked: s.core.level2Unlocked }).toEqual(game);
  });
});

describe("E-10 ET case inventory (ENGINE-DATA-AND-TESTS §7)", () => {
  const spec = readFileSync(join(__dirname, "..", "docs", "specification", "ENGINE-DATA-AND-TESTS.md"), "utf8");
  const section = spec.slice(spec.indexOf("## 7. Engine test cases"));
  const nextSection = section.indexOf("\n## ", 1);
  const cases = section.slice(0, nextSection === -1 ? undefined : nextSection);
  const specIds = [...cases.matchAll(/^\| (ET-[A-Z]\d{2}) \|/gm)].map((m) => m[1]);

  const testDir = __dirname;
  const titles = readdirSync(testDir)
    .filter((f) => f.endsWith(".test.ts"))
    .flatMap((f) => [...readFileSync(join(testDir, f), "utf8").matchAll(/\bit\(\s*["'`](ET-[A-Z]\d{2})\b/g)].map((m) => m[1]));

  it("§7 lists 58 distinct ET cases", () => {
    expect(new Set(specIds).size).toBe(specIds.length);
    expect(specIds).toHaveLength(58);
  });

  it("every ET case of §7 is the title of at least one engine test, and no test names an unknown case", () => {
    expect(new Set(titles).size).toBe(58);
    for (const id of specIds) {
      expect(titles.includes(id), id).toBe(true);
    }
    expect(titles.filter((t) => !specIds.includes(t))).toEqual([]);
  });
});

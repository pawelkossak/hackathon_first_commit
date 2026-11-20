// U-round1: render tests for the demo-path screens and the selector rule that crashed /gra/1 (React #185).
import React from "react";
import fs from "node:fs";
import path from "node:path";
import { renderToString } from "react-dom/server";
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { StateCreator } from "zustand";

// Server rendering reads a Zustand store through getServerSnapshot, which is the store's *initial* state.
// For these tests the snapshot reads the live state instead, so a screen can be rendered at any step.
vi.mock("zustand", async (importOriginal) => {
  const actual = await importOriginal<typeof import("zustand")>();
  const { createStore } = await import("zustand/vanilla");
  const ReactMod = await import("react");
  function create<T>(init: StateCreator<T>) {
    const api = createStore<T>()(init);
    function useBound<U>(selector: (s: T) => U = (s) => s as unknown as U): U {
      return ReactMod.useSyncExternalStore(
        api.subscribe,
        () => selector(api.getState()),
        () => selector(api.getState())
      );
    }
    return Object.assign(useBound, api);
  }
  return { ...actual, create };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => undefined, replace: () => undefined, back: () => undefined, prefetch: () => undefined }),
  usePathname: () => "/gra/1",
}));

const { useGameStore } = await import("./game-store");
const { selectCards, selectCurrentEvent, selectForecast } = await import("./game-views");
const { pln } = await import("./copy");
const engine = await import("../../engine");
const GamePage = (await import("../../app/gra/1/page")).default;
const SummaryPage = (await import("../../app/podsumowanie/page")).default;
const PlanPage = (await import("../../app/plan/page")).default;
const StartPage = (await import("../../app/start/page")).default;
const MapPage = (await import("../../app/mapa/page")).default;
const SettingsPage = (await import("../../app/ustawienia/page")).default;
const Level2Page = (await import("../../app/gra/2/page")).default;
const { CashFlowPanel } = await import("../../components/play/CashFlowPanel");

/** Rendered text with React's text separators removed. */
function html(node: React.ReactElement): string {
  const out = renderToString(node);
  // A render error inside Suspense does not throw: React emits a client-render fallback instead.
  const failed = /data-msg="([^"]*)"/.exec(out);
  if (failed) throw new Error(failed[1]);
  return out.replace(/<!-- -->/g, "");
}

function store() {
  return useGameStore.getState();
}

/** GAME-DESIGN §9 steps 3–4: E1 „check”, then the Klient A negotiation through the engine (50 % → 30 % → accept). */
function weekOneOfTheDemo() {
  store().reset("demo");
  store().resolveCurrentEvent("check");
  const counter = engine.negotiate(store().state, "klient_a", "ask_advance", 50);
  store().applyEngineState(counter.state);
  const accepted = engine.negotiate(store().state, "klient_a", "accept_counter");
  store().applyEngineState(accepted.state);
}

/** Step 6: T1–T7 with one tap per event. */
function finishTheLap() {
  weekOneOfTheDemo();
  store().advanceWeek();
  store().resolveCurrentEvent("decline");
  store().advanceWeek();
  store().resolveCurrentEvent("january");
  store().advanceWeek();
  store().advanceWeek();
  store().advanceWeek();
  store().resolveCurrentEvent("acknowledge");
  store().advanceWeek();
  store().advanceWeek();
}

describe("selectors are stable for an unchanged store state (React #185 regression)", () => {
  beforeEach(() => store().reset("demo"));

  it("forecast, cards and current event return the same object until the state changes", () => {
    const s = store();
    expect(selectForecast(s)).toBe(selectForecast(store()));
    expect(selectCards(s)).toBe(selectCards(store()));
    expect(selectCurrentEvent(s)).toBe(selectCurrentEvent(store()));
    expect(s.getForecast()).toBe(store().getForecast());
    const before = selectForecast(store());
    store().resolveCurrentEvent("check");
    expect(selectForecast(store())).not.toBe(before);
  });

  it("no ui component selects a derived engine value inline (only fields or the cached select* functions)", () => {
    const root = path.resolve(__dirname, "../..");
    const dirs = ["app", "components", "lib/ui"];
    const skip = new Set(["app/api", "components/narrative"]);
    const files: string[] = [];
    const walk = (rel: string) => {
      for (const e of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
        const child = `${rel}/${e.name}`;
        if (e.isDirectory()) {
          if (!skip.has(child)) walk(child);
        } else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) {
          files.push(child);
        }
      }
    };
    dirs.forEach(walk);
    const allowed = /^useGameStore\((?:\(s\) => s(?:\.[A-Za-z]+)+|select[A-Z][A-Za-z]*)\)$/;
    const offenders: string[] = [];
    for (const f of files) {
      const src = fs.readFileSync(path.join(root, f), "utf8");
      for (const m of src.matchAll(/useGameStore\([^;]*?\)(?=;|\n|,)/g)) {
        if (!allowed.test(m[0])) offenders.push(`${f}: ${m[0]}`);
      }
    }
    expect(offenders).toEqual([]);
    expect(files.length).toBeGreaterThan(10);
  });
});

describe("demo path screens render with engine values (GAME-DESIGN §9)", () => {
  it("/gra/1 at the start: board, E1 event, six cards, storm 28 XII −12 395 zł", () => {
    store().reset("demo");
    const out = html(<GamePage />);
    expect(out).toContain('data-testid="game-board-g10"');
    expect(out).toContain('data-testid="event-card-g11"');
    expect(out).toContain("Nowy numer konta podwykonawcy");
    expect(out).toContain("Sprawdź na białej liście i zadzwoń");
    expect(out).toContain(pln(-12395));
    expect(out).toContain('data-testid="route-storm-badge"');
    for (const id of ["C1", "C2", "C3", "C4", "C5", "C6"]) expect(out).toContain(`data-testid="card-${id}"`);
    expect(out).not.toContain("fraud-revealed-banner");
  });

  it("the fallback list shows the same storm value", () => {
    store().reset("demo");
    store().setFallbackMode(true);
    const out = html(<GamePage />);
    expect(out).toContain('data-testid="week-card-list-fallback"');
    expect(out).toContain(pln(-12395));
    store().setFallbackMode(false);
  });

  it("after E1 check and the negotiation: C1 played, Bezpieczne płatności 2, storm after +2 605 zł", () => {
    weekOneOfTheDemo();
    expect(store().state.core.played.map((p) => p.cardId)).toEqual(["C1"]);
    const out = html(<GamePage />);
    expect(out).toContain('data-testid="event-competence"');
    expect(out).toContain("Bezpieczne płatności: poziom 2");
    expect(out).toContain(pln(2605));
    expect(out).toContain('data-testid="board-narrator"');
  });

  it("Cash Flow on 28 XII: before −12 395, after +2 605, delta +15 000, VAT za listopad, added C1", () => {
    weekOneOfTheDemo();
    const out = html(<CashFlowPanel isOpen onClose={() => undefined} initialDate="2026-12-28" />);
    expect(out).toMatch(new RegExp(`data-testid="drilldown-before"[^>]*>${pln(-12395)}<`));
    expect(out).toMatch(new RegExp(`data-testid="drilldown-after"[^>]*>${pln(2605)}<`));
    expect(out).toMatch(new RegExp(`data-testid="drilldown-delta"[^>]*>\\+${pln(15000)}<`));
    expect(out).toContain("VAT za listopad");
    expect(out).toContain(`+${pln(15000)}`);
  });

  it("a crash shows one dialog (G19) with 22 XII and 8 095 zł, not the week resolution", () => {
    store().reset("demo");
    store().resolveCurrentEvent("check");
    store().advanceWeek();
    store().resolveCurrentEvent("decline");
    store().advanceWeek();
    store().resolveCurrentEvent("january");
    store().advanceWeek();
    store().advanceWeek();
    store().resolveCurrentEvent("ignore");
    store().advanceWeek();
    expect(store().state.core.status).toBe("crashed");
    const out = html(<GamePage />);
    expect(out).toContain('data-testid="failure-rewind-g19-g20"');
    expect(out).not.toContain('data-testid="week-resolution-g17"');
    expect(out.match(/role="dialog"/g)?.length).toBe(1);
    expect(out).toContain(pln(8095));
    expect(out).toContain("22 grudnia");
  });

  it("the fraud banner comes from the engine signal, and rewinds to the week of the decision", () => {
    store().reset("demo");
    store().resolveCurrentEvent("pay_as_is");
    const counter = engine.negotiate(store().state, "klient_a", "ask_advance");
    store().applyEngineState(engine.negotiate(counter.state, "klient_a", "accept_counter").state);
    store().advanceWeek();
    store().resolveCurrentEvent("decline");
    store().advanceWeek();
    store().resolveCurrentEvent("january");
    store().advanceWeek();
    let out = html(<GamePage />);
    expect(out).not.toContain("fraud-revealed-banner");
    store().advanceWeek();
    store().advanceWeek();
    expect(store().fraudNotice?.amount).toBe(-35700);
    out = html(<GamePage />);
    expect(out).toContain('data-testid="fraud-revealed-banner"');
    expect(out).toContain(pln(35700));
    expect(out).toContain('data-testid="rewind-fraud-button"');
    expect(out).toContain("Cofnij do tygodnia 1");
  });

  it("after week 7: the board links to the summary; G18 shows 9 985, the low +2 605 on 28 XII, stars and 2 400", () => {
    finishTheLap();
    expect(store().state.core.status).toBe("completed");
    expect(html(<GamePage />)).toContain('data-testid="goto-summary-button"');
    const out = html(<SummaryPage />);
    expect(out).toContain('data-testid="lap-summary-g18"');
    expect(out).toContain(pln(9985));
    expect(out).toContain(pln(2605));
    expect(out).toContain("28 grudnia");
    expect(out).toContain(pln(2400));
    expect(out).toMatch(/data-testid="star-przetrwanie" data-status="earned"/);
    expect(out).toMatch(/data-testid="star-tanio" data-status="earned"/);
    expect(out).toMatch(/data-testid="star-pilot" data-status="pending"/);
  });

  it("G22/G23: the plan of the won card, then the engine's met status, matched 3 XII advance and competence 3", () => {
    finishTheLap();
    let out = html(<PlanPage />);
    expect(out).toContain(`Zaliczka ${pln(15000)} ±10% od Klienta A do 4 grudnia.`);
    store().saveCurrentPlan("C1");
    expect(store().state.core.stars.pilot).toBe("earned");
    out = html(<PlanPage />);
    expect(out).toContain('data-testid="plan-saved-confirmation"');
    expect(out).toContain('data-testid="advance-account-clock-button"');
    expect(out).toContain("21 XI → 5 XII");
    store().advanceClock();
    out = html(<PlanPage />);
    expect(out).toContain('data-status="met"');
    expect(out).toContain("Zaliczka dotarła!");
    expect(out).toContain(pln(56080));
    expect(out).toContain("Zaliczka 30% projekt rebranding");
    expect(out).toContain("Luka płynnościowa: poziom 3");
    expect(store().state.core.week).toBe(7);
  });

  it("a lap that is not won has no plan and no fake success", () => {
    store().reset("demo");
    const out = html(<PlanPage />);
    expect(out).toContain('data-testid="plan-not-allowed"');
    expect(out).not.toContain("Zaliczka dotarła");
    expect(html(<SummaryPage />)).toContain('data-testid="lap-summary-not-completed"');
  });

  it("intro, map, settings and the level-2 placeholder render the narrative components", () => {
    store().reset("demo");
    expect(html(<StartPage />)).toContain('data-testid="intro-page"');
    const map = html(<MapPage />);
    expect(map).toContain('data-testid="campaign-map-g09"');
    expect(map).not.toContain('href="/gra/2"');
    expect(html(<SettingsPage />)).toContain('data-testid="settings-page"');
    expect(html(<Level2Page />)).toContain('data-testid="level2-locked-screen"');
  });
});

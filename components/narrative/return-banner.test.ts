import { describe, expect, it, vi } from "vitest";
import {
  checkReturnParam,
  clearLastActiveSession,
  getLastActiveSession,
  saveLastActiveSession,
} from "../../lib/reminders/return-state";
import { createGame, forecast, gameData, negotiate, playCard, resolveEvent, resolveWeek, rewind } from "../../engine";
import { formatDayMonth, formatPln } from "../../narrative";
import { dialogueSync } from "./negotiation-sync";
import { returnBannerView } from "./return-banner-view";

describe("N-08 Return banner and resume logic", () => {
  it("test: parses return URL parameter ?resume=TX correctly", () => {
    expect(checkReturnParam("?resume=T3")).toBe(3);
    expect(checkReturnParam("?seed=demo&resume=T5")).toBe(5);
    expect(checkReturnParam("?resume=4")).toBe(4);
    expect(checkReturnParam("?foo=bar")).toBeNull();
    expect(checkReturnParam("?resume=T9")).toBeNull(); // Week 9 is out of 1-7 range
  });

  it("test: saves and restores last active session from storage to resume game after reload", () => {
    // Mock localStorage
    const storage: Record<string, string> = {};
    const mockStorage = {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, val: string) => {
        storage[key] = val;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    };

    vi.stubGlobal("window", { localStorage: mockStorage });

    saveLastActiveSession({ week: 4, lap: 1, timestamp: Date.now() });

    const restored = getLastActiveSession();
    expect(restored).not.toBeNull();
    expect(restored?.week).toBe(4);
    expect(restored?.lap).toBe(1);

    clearLastActiveSession();
    expect(getLastActiveSession()).toBeNull();

    vi.unstubAllGlobals();
  });
});

describe("Round 2: return banner copy from the engine", () => {
  it("names the week total from level1 and the storm from the forecast minimum, in 4 variants", () => {
    const state = createGame("demo");
    const minimum = forecast(state).minimum;
    expect(minimum.balance).toBeLessThan(0);

    const view = returnBannerView(state, 3, "female", "female", "pl");
    expect(view.title).toBe(`Wróciłaś! Tydzień 3 z ${gameData.level1.weeks.length} czeka na Twoją decyzję.`);
    expect(view.line).toContain(formatDayMonth(minimum.date));
    expect(view.line).toContain(formatPln(minimum.balance));
    expect(returnBannerView(state, 3, "male", "male", "pl").title).toContain("Wróciłeś");
    expect(returnBannerView(state, 3, "male", "male", "pl").line).toMatch(/^Szef:/);
    expect(returnBannerView(state, 3, "female", "female", "en").title).toContain("of 7");

    // After C1 the minimum moves above zero: the line follows the engine, no fixed storm text.
    const after = playCard(state, "C1");
    const calm = forecast(after).minimum;
    const afterView = returnBannerView(after, 3, "female", "female", "pl");
    expect(afterView.line).toContain(formatPln(calm.balance));
    expect(afterView.line).not.toContain("Burza");
  });
});

describe("Round 2: NegotiationDialogue resyncs with its state prop", () => {
  it("keeps the thread on the parent's echo and restarts it on a rewind or a new week", () => {
    const start = createGame("demo");
    expect(dialogueSync(start, start, start)).toBe("none");

    const answered = negotiate(start, "klient_a", "ask_advance", 50).state;
    // The dialogue set current = answered; the parent passes it back.
    expect(dialogueSync(answered, start, answered)).toBe("echo");

    // A rewind or a new week from outside: a different state object.
    const week2 = resolveWeek(resolveEvent(answered, "check")).state;
    expect(dialogueSync(week2, answered, answered)).toBe("reset");
    const rewound = rewind(week2, 1);
    expect(dialogueSync(rewound, week2, week2)).toBe("reset");
    expect(rewound.core.negotiation.klient_a.messagesThisWeek).toBe(0);
  });
});

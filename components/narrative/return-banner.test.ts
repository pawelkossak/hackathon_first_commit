import { describe, expect, it, vi } from "vitest";
import {
  checkReturnParam,
  clearLastActiveSession,
  getLastActiveSession,
  saveLastActiveSession,
} from "../../lib/reminders/return-state";

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

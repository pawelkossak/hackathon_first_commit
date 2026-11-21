import { describe, expect, it, vi } from "vitest";
import { useSettingsStore } from "../../narrative/settings-store";

describe("N-10 Loaders G25-G28 and settings G24", () => {
  it("test: settings persist in localStorage and restore correctly", () => {
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

    const store = useSettingsStore.getState();
    store.setPlayerGender("male");
    store.setNarratorGender("male");
    store.setVolume(0.5);
    store.setReducedMotion(true);
    store.setChattiness("reduced");

    // Clear in-memory store state to test restoring from storage
    useSettingsStore.setState({
      playerGender: "female",
      narratorGender: "female",
      volume: 1,
      reducedMotion: false,
      chattiness: "normal",
    });

    useSettingsStore.getState().loadFromStorage();
    const restored = useSettingsStore.getState();

    expect(restored.playerGender).toBe("male");
    expect(restored.narratorGender).toBe("male");
    expect(restored.volume).toBe(0.5);
    expect(restored.reducedMotion).toBe(true);
    expect(restored.chattiness).toBe("reduced");

    vi.unstubAllGlobals();
  });

  it("test: save failure is shown honestly when storage write fails", () => {
    const mockStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError: DOM Exception 22");
      },
      removeItem: () => {},
    };

    vi.stubGlobal("window", { localStorage: mockStorage });

    const store = useSettingsStore.getState();
    const result = store.saveToStorage();

    expect(result).toBe(false);
    expect(useSettingsStore.getState().saveFailed).toBe(true);

    vi.unstubAllGlobals();
  });
});

// Game settings persistence and accessibility controls (GM-23, GAME-EXPERIENCE-AND-NARRATION.md §9, §11).
import { create } from "zustand";
import type { Locale, NarratorGender, PlayerGender } from "./types";
import { setLocale } from "./copy/get-copy";

export interface GameSettingsData {
  playerGender: PlayerGender;
  narratorGender: NarratorGender;
  volume: number;
  muted: boolean;
  captionsOnly: boolean;
  reducedMotion: boolean;
  chattiness: "normal" | "reduced";
  language: Locale;
}

export interface SettingsStore extends GameSettingsData {
  saveFailed: boolean;
  setPlayerGender: (gender: PlayerGender) => void;
  setNarratorGender: (gender: NarratorGender) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setCaptionsOnly: (captionsOnly: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setChattiness: (chattiness: "normal" | "reduced") => void;
  setLanguage: (language: Locale) => void;
  saveToStorage: () => boolean;
  loadFromStorage: () => void;
  clearSaveFailure: () => void;
}

const STORAGE_KEY = "pilot_settings_v1";

const DEFAULT_SETTINGS: GameSettingsData = {
  playerGender: "female",
  narratorGender: "female",
  volume: 0.8,
  muted: false,
  captionsOnly: false,
  reducedMotion: false,
  chattiness: "normal",
  language: "pl",
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  saveFailed: false,

  setPlayerGender: (playerGender) => {
    set({ playerGender });
    get().saveToStorage();
  },

  setNarratorGender: (narratorGender) => {
    set({ narratorGender });
    get().saveToStorage();
  },

  setVolume: (volume) => {
    set({ volume: Math.max(0, Math.min(1, volume)) });
    get().saveToStorage();
  },

  setMuted: (muted) => {
    set({ muted });
    get().saveToStorage();
  },

  setCaptionsOnly: (captionsOnly) => {
    set({ captionsOnly });
    get().saveToStorage();
  },

  setReducedMotion: (reducedMotion) => {
    set({ reducedMotion });
    get().saveToStorage();
  },

  setChattiness: (chattiness) => {
    set({ chattiness });
    get().saveToStorage();
  },

  setLanguage: (language) => {
    set({ language });
    setLocale(language);
    get().saveToStorage();
  },

  clearSaveFailure: () => set({ saveFailed: false }),

  saveToStorage: () => {
    if (typeof window === "undefined" || !window.localStorage) return true;
    try {
      const data: GameSettingsData = {
        playerGender: get().playerGender,
        narratorGender: get().narratorGender,
        volume: get().volume,
        muted: get().muted,
        captionsOnly: get().captionsOnly,
        reducedMotion: get().reducedMotion,
        chattiness: get().chattiness,
        language: get().language,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      set({ saveFailed: false });
      return true;
    } catch {
      // Storage quota or restriction -> save failure reported honestly!
      set({ saveFailed: true });
      return false;
    }
  },

  loadFromStorage: () => {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const language: Locale =
          parsed.language === "en" || parsed.language === "pl"
            ? parsed.language
            : DEFAULT_SETTINGS.language;
        setLocale(language);

        set({
          playerGender: parsed.playerGender ?? DEFAULT_SETTINGS.playerGender,
          narratorGender: parsed.narratorGender ?? DEFAULT_SETTINGS.narratorGender,
          volume: parsed.volume ?? DEFAULT_SETTINGS.volume,
          muted: parsed.muted ?? DEFAULT_SETTINGS.muted,
          captionsOnly: parsed.captionsOnly ?? DEFAULT_SETTINGS.captionsOnly,
          reducedMotion: parsed.reducedMotion ?? DEFAULT_SETTINGS.reducedMotion,
          chattiness: parsed.chattiness ?? DEFAULT_SETTINGS.chattiness,
          language,
          saveFailed: false,
        });
      }
    } catch {
      // In case of corruption, keep defaults
    }
  },
}));

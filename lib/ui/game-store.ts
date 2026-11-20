import { create } from "zustand";
import {
  createGame,
  resetGame,
  playCard as enginePlayCard,
  resolveEvent as engineResolveEvent,
  resolveWeek as engineResolveWeek,
  rewind as engineRewind,
  savePlan as engineSavePlan,
  advanceAccountClock as engineAdvanceAccountClock,
  previewCard as enginePreviewCard,
  forecast as engineForecast,
  getAvailableCards as engineGetAvailableCards,
  getCurrentEvent as engineGetCurrentEvent,
  getCfoHint as engineGetCfoHint,
  delegateBestCard as engineDelegateBestCard,
  type GameState,
  type CardPreview,
  type CardView,
  type CurrentEvent,
  type Forecast,
  type CfoHint,
  type WeekResolution,
  type IsoDate,
  type CardId,
  type EventChoiceId,
  type WeekNumber,
} from "../../engine";

const STORAGE_KEY = "pilot_plynnosci_game_state_v1";

export interface GameStoreState {
  state: GameState;
  selectedCardId: CardId | null;
  activePreview: CardPreview | null;
  cfoHint: CfoHint | null;
  lastResolution: WeekResolution | null;
  fallbackMode: boolean; // U-11 fallback flag

  // Actions
  init: (seed?: string) => void;
  reset: (seed?: string) => void;
  selectCard: (cardId: CardId | null) => void;
  playSelectedCard: (delegated?: boolean) => void;
  playCardById: (cardId: CardId, delegated?: boolean) => void;
  resolveCurrentEvent: (choiceId: EventChoiceId, delegated?: boolean) => void;
  advanceWeek: () => WeekResolution;
  rewindToWeek: (week: WeekNumber) => void;
  saveCurrentPlan: (cardId: CardId) => void;
  advanceClock: (date?: IsoDate) => void;
  requestCfoHint: () => void;
  delegateBestAction: () => void;
  setFallbackMode: (enabled: boolean) => void;

  // Computed getters
  getForecast: () => Forecast;
  getAvailableCards: () => CardView[];
  getCurrentEvent: () => CurrentEvent | null;
}

function loadSavedState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

function persistState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or storage disabled
  }
}

function clearPersistedState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("pilot_plynnosci_settings");
    localStorage.removeItem("pilot_plynnosci_plan");
  } catch {
    // ignore
  }
}

export const useGameStore = create<GameStoreState>((set, get) => {
  const initial = loadSavedState() ?? createGame("demo");

  return {
    state: initial,
    selectedCardId: null,
    activePreview: null,
    cfoHint: null,
    lastResolution: null,
    fallbackMode: false,

    init: (seed = "demo") => {
      const saved = loadSavedState();
      if (saved) {
        set({ state: saved, selectedCardId: null, activePreview: null });
      } else {
        const fresh = createGame(seed);
        persistState(fresh);
        set({ state: fresh, selectedCardId: null, activePreview: null });
      }
    },

    reset: (seed = "demo") => {
      clearPersistedState();
      const fresh = resetGame(seed);
      persistState(fresh);
      set({
        state: fresh,
        selectedCardId: null,
        activePreview: null,
        cfoHint: null,
        lastResolution: null,
      });
    },

    selectCard: (cardId: CardId | null) => {
      if (!cardId) {
        set({ selectedCardId: null, activePreview: null });
        return;
      }
      try {
        const prev = enginePreviewCard(get().state, cardId);
        set({ selectedCardId: cardId, activePreview: prev });
      } catch {
        set({ selectedCardId: cardId, activePreview: null });
      }
    },

    playSelectedCard: (delegated = false) => {
      const { selectedCardId, state } = get();
      if (!selectedCardId) return;
      const next = enginePlayCard(state, selectedCardId, delegated);
      persistState(next);
      set({ state: next, selectedCardId: null, activePreview: null });
    },

    playCardById: (cardId: CardId, delegated = false) => {
      const next = enginePlayCard(get().state, cardId, delegated);
      persistState(next);
      set({ state: next, selectedCardId: null, activePreview: null });
    },

    resolveCurrentEvent: (choiceId: EventChoiceId, delegated = false) => {
      const next = engineResolveEvent(get().state, choiceId, delegated);
      persistState(next);
      set({ state: next });
    },

    advanceWeek: () => {
      const res = engineResolveWeek(get().state);
      persistState(res.state);
      set({
        state: res.state,
        lastResolution: res,
        selectedCardId: null,
        activePreview: null,
        cfoHint: null,
      });
      return res;
    },

    rewindToWeek: (week: WeekNumber) => {
      const next = engineRewind(get().state, week);
      persistState(next);
      set({
        state: next,
        selectedCardId: null,
        activePreview: null,
        lastResolution: null,
        cfoHint: null,
      });
    },

    saveCurrentPlan: (cardId: CardId) => {
      const next = engineSavePlan(get().state, cardId);
      persistState(next);
      set({ state: next });
    },

    advanceClock: (date?: IsoDate) => {
      const next = engineAdvanceAccountClock(get().state, date);
      persistState(next);
      set({ state: next });
    },

    requestCfoHint: () => {
      const hint = engineGetCfoHint(get().state);
      set({ cfoHint: hint });
    },

    delegateBestAction: () => {
      const next = engineDelegateBestCard(get().state);
      persistState(next);
      set({ state: next, selectedCardId: null, activePreview: null });
    },

    setFallbackMode: (enabled: boolean) => {
      set({ fallbackMode: enabled });
    },

    getForecast: () => engineForecast(get().state),
    getAvailableCards: () => engineGetAvailableCards(get().state),
    getCurrentEvent: () => engineGetCurrentEvent(get().state),
  };
});

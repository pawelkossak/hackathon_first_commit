import { create } from "zustand";
import {
  createGame,
  resetGame,
  DEMO_SEED,
  SCHEMA_VERSION,
  playCard as enginePlayCard,
  resolveEvent as engineResolveEvent,
  resolveWeek as engineResolveWeek,
  rewind as engineRewind,
  savePlan as engineSavePlan,
  advanceAccountClock as engineAdvanceAccountClock,
  previewCard as enginePreviewCard,
  getCfoHint as engineGetCfoHint,
  delegateBestCard as engineDelegateBestCard,
  type GameState,
  type CardPreview,
  type CardView,
  type CurrentEvent,
  type EngineEvent,
  type Forecast,
  type CfoHint,
  type WeekResolution,
  type IsoDate,
  type CardId,
  type EventChoiceId,
  type WeekNumber,
} from "../../engine";
import { cardsOf, currentEventOf, forecastOf } from "./game-views";
import { ReactionTracker, type NarratorReaction } from "../../narrative";
import { useSettingsStore } from "../../narrative/settings-store";

const STORAGE_KEY = "pilot_plynnosci_game_state_v1";

export type FraudRevealedEvent = Extract<EngineEvent, { type: "fraudRevealed" }>;

export interface GameStoreState {
  state: GameState;
  /** True once the persisted state was read on the client (the server render always uses a fresh lap). */
  hydrated: boolean;
  selectedCardId: CardId | null;
  activePreview: CardPreview | null;
  cfoHint: CfoHint | null;
  lastResolution: WeekResolution | null;
  /** D-18: the fraudRevealed signal of the last week resolution, shown until dismissed, rewound or reset. */
  fraudNotice: FraudRevealedEvent | null;
  fallbackMode: boolean; // U-11 fallback flag
  /** Narrator reaction to the engine events of the last transition (narrative/reactions, max one per week). */
  reaction: NarratorReaction | null;

  // Actions
  hydrate: () => void;
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
  /** Adopt a state the engine returned elsewhere (negotiate via /api/agent); a deal is already applied in it. */
  applyEngineState: (next: GameState) => void;
  requestCfoHint: () => void;
  delegateBestAction: () => void;
  setFallbackMode: (enabled: boolean) => void;
  dismissResolution: () => void;
  dismissFraudNotice: () => void;
  dismissReaction: () => void;

  // Derived engine views (cached per state object; see game-views.ts)
  getForecast: () => Forecast;
  getAvailableCards: () => CardView[];
  getCurrentEvent: () => CurrentEvent | null;
}

function isGameStateLike(value: unknown): value is GameState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<GameState>;
  return (
    v.schemaVersion === SCHEMA_VERSION &&
    typeof v.core === "object" &&
    v.core !== null &&
    typeof v.account === "object" &&
    v.account !== null &&
    typeof v.snapshots === "object" &&
    Array.isArray(v.emitted)
  );
}

function loadSavedState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isGameStateLike(parsed) ? parsed : null;
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
  } catch {
    // ignore
  }
}

const CLEARED_VIEW = { selectedCardId: null, activePreview: null, cfoHint: null } as const;

const tracker = new ReactionTracker();

/** The narrator's reaction to the events this state emitted, or null (cooldown, no events, missing copy). */
function reactTo(next: GameState): { reaction?: NarratorReaction } {
  const { playerGender, narratorGender } = useSettingsStore.getState();
  try {
    const reaction = tracker.chooseReaction(next.emitted, next, playerGender, narratorGender);
    return reaction ? { reaction } : {};
  } catch {
    return {};
  }
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  state: createGame(DEMO_SEED),
  hydrated: false,
  selectedCardId: null,
  activePreview: null,
  cfoHint: null,
  lastResolution: null,
  fraudNotice: null,
  fallbackMode: false,
  reaction: null,

  hydrate: () => {
    if (get().hydrated) return;
    const saved = loadSavedState();
    set(saved ? { state: saved, hydrated: true, ...CLEARED_VIEW } : { hydrated: true });
  },

  init: (seed = DEMO_SEED) => {
    const saved = loadSavedState();
    if (saved && saved.core.seed === seed) {
      set({ state: saved, hydrated: true, ...CLEARED_VIEW });
    } else {
      const fresh = createGame(seed);
      persistState(fresh);
      set({ state: fresh, hydrated: true, lastResolution: null, fraudNotice: null, ...CLEARED_VIEW });
    }
  },

  reset: (seed = DEMO_SEED) => {
    clearPersistedState();
    const fresh = resetGame(seed);
    persistState(fresh);
    tracker.reset();
    set({ state: fresh, hydrated: true, lastResolution: null, fraudNotice: null, reaction: null, ...CLEARED_VIEW });
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
    set({ state: next, ...CLEARED_VIEW, ...reactTo(next) });
  },

  playCardById: (cardId: CardId, delegated = false) => {
    const next = enginePlayCard(get().state, cardId, delegated);
    persistState(next);
    set({ state: next, ...CLEARED_VIEW, ...reactTo(next) });
  },

  resolveCurrentEvent: (choiceId: EventChoiceId, delegated = false) => {
    const next = engineResolveEvent(get().state, choiceId, delegated);
    persistState(next);
    set({ state: next, ...CLEARED_VIEW, ...reactTo(next) });
  },

  advanceWeek: () => {
    const res = engineResolveWeek(get().state);
    persistState(res.state);
    const fraud = res.events.find((e): e is FraudRevealedEvent => e.type === "fraudRevealed") ?? null;
    set({
      state: res.state,
      lastResolution: res,
      ...(fraud ? { fraudNotice: fraud } : {}),
      ...CLEARED_VIEW,
      reaction: reactTo(res.state).reaction ?? null,
    });
    return res;
  },

  rewindToWeek: (week: WeekNumber) => {
    const next = engineRewind(get().state, week);
    persistState(next);
    tracker.reset();
    set({ state: next, lastResolution: null, fraudNotice: null, ...CLEARED_VIEW, reaction: reactTo(next).reaction ?? null });
  },

  saveCurrentPlan: (cardId: CardId) => {
    const next = engineSavePlan(get().state, cardId);
    persistState(next);
    set({ state: next, ...reactTo(next) });
  },

  advanceClock: (date?: IsoDate) => {
    const next = engineAdvanceAccountClock(get().state, date);
    persistState(next);
    set({ state: next, ...reactTo(next) });
  },

  applyEngineState: (next: GameState) => {
    persistState(next);
    set({ state: next, ...CLEARED_VIEW, ...reactTo(next) });
  },

  requestCfoHint: () => {
    const hint = engineGetCfoHint(get().state);
    set({ cfoHint: hint });
  },

  delegateBestAction: () => {
    const next = engineDelegateBestCard(get().state);
    persistState(next);
    set({ state: next, ...CLEARED_VIEW, ...reactTo(next) });
  },

  setFallbackMode: (enabled: boolean) => {
    set({ fallbackMode: enabled });
  },

  dismissResolution: () => set({ lastResolution: null }),
  dismissFraudNotice: () => set({ fraudNotice: null }),
  dismissReaction: () => set({ reaction: null }),

  getForecast: () => forecastOf(get().state),
  getAvailableCards: () => cardsOf(get().state),
  getCurrentEvent: () => currentEventOf(get().state),
}));

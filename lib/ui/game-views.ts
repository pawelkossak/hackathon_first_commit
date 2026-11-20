// Derived engine views for the UI, memoised per GameState object.
// A Zustand selector must return the same value for the same store state (useSyncExternalStore);
// calling forecast()/getAvailableCards()/getCurrentEvent() inside a selector returns a new object on
// every call and crashes React with error #185 (maximum update depth). These selectors cache the
// engine result per state object, so `useGameStore(selectForecast)` is stable until the state changes.
import {
  forecast,
  getAvailableCards,
  getCurrentEvent,
  type CardView,
  type CurrentEvent,
  type Forecast,
  type GameState,
} from "../../engine";

const forecastCache = new WeakMap<GameState, Forecast>();
const cardsCache = new WeakMap<GameState, CardView[]>();
const eventCache = new WeakMap<GameState, { value: CurrentEvent | null }>();

/** Engine forecast of this exact state object (cached). */
export function forecastOf(state: GameState): Forecast {
  const hit = forecastCache.get(state);
  if (hit) return hit;
  const value = forecast(state);
  forecastCache.set(state, value);
  return value;
}

/** Engine card views of this exact state object (cached). */
export function cardsOf(state: GameState): CardView[] {
  const hit = cardsCache.get(state);
  if (hit) return hit;
  const value = getAvailableCards(state);
  cardsCache.set(state, value);
  return value;
}

/** Engine current event of this exact state object (cached; null is cached too). */
export function currentEventOf(state: GameState): CurrentEvent | null {
  const hit = eventCache.get(state);
  if (hit) return hit.value;
  const value = getCurrentEvent(state);
  eventCache.set(state, { value });
  return value;
}

interface HasState {
  state: GameState;
}

/** Store selectors: stable for an unchanged store state. */
export const selectForecast = (s: HasState): Forecast => forecastOf(s.state);
export const selectCards = (s: HasState): CardView[] => cardsOf(s.state);
export const selectCurrentEvent = (s: HasState): CurrentEvent | null => currentEventOf(s.state);

"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Hook detecting user's preference for reduced motion using React's useSyncExternalStore.
 * Respects system accessibility setting (WCAG 2.2 / GAME-EXPERIENCE-AND-NARRATION.md §11).
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Standard game motion timings from design/tokens.json.
 */
export const motionTimings = {
  select: 180, // ms
  turn: 280, // ms
  overlay: 180, // ms
  starsEach: 250, // ms
} as const;

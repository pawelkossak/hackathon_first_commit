"use client";

import { useEffect } from "react";
import { useGameStore } from "../../lib/ui/game-store";
import { useSettingsStore } from "../../narrative/settings-store";

/**
 * Reads the persisted game state and settings once on the client. The server render and the first
 * client render use the same fresh lap, so hydration never mismatches; pages wait for `hydrated`.
 */
export function ClientBoot() {
  const hydrate = useGameStore((s) => s.hydrate);
  const loadSettings = useSettingsStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadSettings();
    hydrate();
  }, [hydrate, loadSettings]);

  return null;
}

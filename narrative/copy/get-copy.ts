// Implementation of getCopy and template resolution with explicit failure on missing bindings.
// BUILD-PLAN.md §5 N-01, RUNTIME-ENGINE-CONTRACT.md.
import type { GameState } from "../../engine";
import {
  type CopyRecord,
  MissingBindingError,
  type NarratorGender,
  type PlayerGender,
  UnknownCopyKeyError,
  type VariantKey,
} from "../types";
import { SEED_COPY } from "./seed.pl";

const copyRegistry: Record<string, CopyRecord> = { ...SEED_COPY };

/**
 * Register additional copy records (for Phase 2 full copy or module-specific strings).
 */
export function registerCopy(records: Record<string, CopyRecord>): void {
  Object.assign(copyRegistry, records);
}

/**
 * Convert player and narrator gender into the stable 4-variant key.
 */
export function toVariantKey(
  playerGender: PlayerGender = "female",
  narratorGender: NarratorGender = "female"
): VariantKey {
  return `player-${playerGender}_narrator-${narratorGender}`;
}

/**
 * Resolve a copy key into the final localized string in the requested gender variant.
 * Fails explicitly if the key does not exist or if a required template binding is missing.
 */
export function getCopy(
  id: string,
  state?: GameState,
  playerGender: PlayerGender = "female",
  narratorGender: NarratorGender = "female",
  extra?: Record<string, string | number>
): string {
  const entry = copyRegistry[id];
  if (!entry) {
    throw new UnknownCopyKeyError(id);
  }

  const variantKey = toVariantKey(playerGender, narratorGender);
  const rawTemplate = entry[variantKey];
  if (typeof rawTemplate !== "string") {
    throw new UnknownCopyKeyError(`${id} (variant ${variantKey})`);
  }

  // Resolve template variables {variable.name}
  return rawTemplate.replace(/\{([^{}]+)\}/g, (_match, tokenRaw: string) => {
    const token = tokenRaw.trim();

    // 1. Built-in gender and narrator grammar tokens
    if (token === "narrator.introduction") {
      return narratorGender === "female"
        ? "Jestem Ania i prowadzę to studio."
        : "Jestem właścicielem tego studia.";
    }
    if (token === "narrator.invited") {
      return narratorGender === "female" ? "Zaprosiłam" : "Zaprosiłem";
    }
    if (token === "player.handled") {
      return playerGender === "female" ? "Poradziłaś" : "Poradziłeś";
    }
    if (token === "narrator.title") {
      return narratorGender === "female" ? "Szefowa" : "Szef";
    }
    if (token === "narrator.name") {
      return narratorGender === "female" ? "Ania" : "Szef";
    }

    // 2. Extra parameters
    if (extra && token in extra && extra[token] !== undefined) {
      return String(extra[token]);
    }

    // 3. Game state bindings
    if (state) {
      if (token === "week") return String(state.core.week);
      if (token === "balance") return `${state.core.balance.toLocaleString("pl-PL")} zł`;
      if (token === "status") return String(state.core.status);
    }

    // 4. Missing binding -> fail explicitly per acceptance rule
    throw new MissingBindingError(token, id);
  });
}

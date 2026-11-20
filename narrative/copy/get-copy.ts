// Implementation of getCopy and template resolution with explicit failure on missing bindings.
// Supports internationalization (i18n) with PL and EN locales.
// BUILD-PLAN.md §5 N-01, RUNTIME-ENGINE-CONTRACT.md.
import type { GameState } from "../../engine";
import {
  type CopyRecord,
  type Locale,
  MissingBindingError,
  type NarratorGender,
  type PlayerGender,
  UnknownCopyKeyError,
  type VariantKey,
} from "../types";
import { SEED_COPY } from "./seed.pl";
import { SEED_COPY_EN } from "./seed.en";

let activeLocale: Locale = "pl";

export function setLocale(locale: Locale): void {
  activeLocale = locale;
}

export function getLocale(): Locale {
  return activeLocale;
}

const copyRegistries: Record<Locale, Record<string, CopyRecord>> = {
  pl: { ...SEED_COPY },
  en: { ...SEED_COPY_EN },
};

/**
 * Register additional copy records (for Phase 2 full copy or module-specific strings).
 */
export function registerCopy(
  records: Record<string, CopyRecord>,
  locale: Locale = activeLocale
): void {
  Object.assign(copyRegistries[locale], records);
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
 * Resolve a copy key into the final localized string in the requested gender variant and locale.
 * Fails explicitly if the key does not exist or if a required template binding is missing.
 */
export function getCopy(
  id: string,
  state?: GameState,
  playerGender: PlayerGender = "female",
  narratorGender: NarratorGender = "female",
  extra?: Record<string, string | number>,
  locale?: Locale
): string {
  const currentLang = locale ?? activeLocale;
  const registry = copyRegistries[currentLang] ?? copyRegistries.pl;
  const entry = registry[id] ?? copyRegistries.pl[id];
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
      if (currentLang === "en") {
        return narratorGender === "female"
          ? "I am Ania and I run this studio."
          : "I am the owner of this studio.";
      }
      return narratorGender === "female"
        ? "Jestem Ania i prowadzę to studio."
        : "Jestem właścicielem tego studia.";
    }
    if (token === "narrator.invited") {
      if (currentLang === "en") return "I invited";
      return narratorGender === "female" ? "Zaprosiłam" : "Zaprosiłem";
    }
    if (token === "player.handled") {
      if (currentLang === "en") return "You handled";
      return playerGender === "female" ? "Poradziłaś" : "Poradziłeś";
    }
    if (token === "narrator.title") {
      if (currentLang === "en") return "Boss";
      return narratorGender === "female" ? "Szefowa" : "Szef";
    }
    if (token === "narrator.name") {
      if (currentLang === "en") {
        return narratorGender === "female" ? "Ania" : "Boss";
      }
      return narratorGender === "female" ? "Ania" : "Szef";
    }

    // 2. Extra parameters
    if (extra && token in extra && extra[token] !== undefined) {
      return String(extra[token]);
    }

    // 3. Game state bindings
    if (state) {
      if (token === "week") return String(state.core.week);
      if (token === "balance") {
        return currentLang === "en"
          ? `${state.core.balance.toLocaleString("en-US")} PLN`
          : `${state.core.balance.toLocaleString("pl-PL")} zł`;
      }
      if (token === "status") return String(state.core.status);
    }

    // 4. Missing binding -> fail explicitly per acceptance rule
    throw new MissingBindingError(token, id);
  });
}

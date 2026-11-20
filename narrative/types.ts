// Narrative types: gender variants, copy entries, voice scripts and emotions.
import type { GameState } from "../engine";

export type PlayerGender = "female" | "male";
export type NarratorGender = "female" | "male";

export type VariantKey =
  | "player-female_narrator-female"
  | "player-male_narrator-female"
  | "player-female_narrator-male"
  | "player-male_narrator-male";

export const VARIANT_KEYS: readonly VariantKey[] = [
  "player-female_narrator-female",
  "player-male_narrator-female",
  "player-female_narrator-male",
  "player-male_narrator-male",
] as const;

export type Emotion =
  | "welcoming"
  | "confident"
  | "excited"
  | "suspicious"
  | "proud"
  | "exasperated"
  | "supportive"
  | "delighted"
  | "relaxed";

export type CopyRecord = Record<VariantKey, string>;

export interface VoiceScript {
  id: string;
  copyId?: string;
  scene?: string;
  speaker: string;
  emotion: Emotion | string;
  text: string;
  actedText?: string;
  durationMs?: number;
  path?: string;
  variant: VariantKey;
}

export class MissingBindingError extends Error {
  constructor(
    public readonly placeholder: string,
    public readonly copyKey: string
  ) {
    super(`Missing binding for "${placeholder}" in copy key "${copyKey}"`);
    this.name = "MissingBindingError";
  }
}

export class UnknownCopyKeyError extends Error {
  constructor(public readonly copyKey: string) {
    super(`Unknown copy key: "${copyKey}"`);
    this.name = "UnknownCopyKeyError";
  }
}

export interface CopyContext {
  state?: GameState;
  playerGender?: PlayerGender;
  narratorGender?: NarratorGender;
  extra?: Record<string, string | number>;
}

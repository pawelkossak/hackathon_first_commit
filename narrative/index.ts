// Public API of the narrative lane (RUNTIME-ENGINE-CONTRACT.md, BUILD-PLAN.md §5 N-01).
export * from "./types";
export { SEED_COPY } from "./copy/seed.pl";
export { getCopy, toVariantKey, registerCopy } from "./copy/get-copy";
export { getVoiceScript, VOICE_SCRIPTS } from "./copy/voice-scripts";
export {
  reactionFor,
  ReactionTracker,
  type NarratorReaction,
  type ReactionStep,
} from "./reactions";
export {
  useVoicePlayerStore,
  type VoiceLine,
  type VoicePlayerState,
} from "./voice-player-store";

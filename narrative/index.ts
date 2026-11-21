// Public API of the narrative lane (RUNTIME-ENGINE-CONTRACT.md, BUILD-PLAN.md §5 N-01).
export * from "./types";
export { SEED_COPY } from "./copy/seed.pl";
export { SEED_COPY_EN } from "./copy/seed.en";
export {
  getCopy,
  toVariantKey,
  registerCopy,
  setLocale,
  getLocale,
} from "./copy/get-copy";
export { getVoiceScript, VOICE_SCRIPTS } from "./copy/voice-scripts";
export { formatDayMonth, formatPercent, formatPln } from "./format";
export { storyBindings } from "./story-bindings";
export {
  agentLineBindings,
  agentLineIds,
  agentLineText,
  agentName,
  dealCardFor,
  disabledReasonText,
  fallbackLineId,
  maxMessagesPerWeek,
  quickRepliesFor,
  type QuickReply,
} from "./agent-lines";
export {
  eventBindings,
  REACTION_CONFIG,
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

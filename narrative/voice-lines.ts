// Which recording plays for a copy line, and where the browser finds it (GAME-EXPERIENCE-AND-NARRATION.md §10).
// Recordings live in design/voice/production/<ania|szef>/<lineId>.mp3; the ui asset pipeline publishes them
// unchanged to public/media/voice/production/… (see docs/team/handoffs/N-polish.md). A line plays audio only when
// its caption equals the recorded text, so the captions never disagree with the voice; otherwise captions only.
import { getVoiceScript } from "./copy/voice-scripts";
import type { NarratorGender, PlayerGender, VoiceScript } from "./types";

/**
 * Reaction lines recorded under another line id, with the same text in all 4 variants
 * (voice-lines.test.ts checks the equality). `rx.goodmove` differs from `move.praise`, so it has no alias.
 */
export const VOICE_ALIASES: Readonly<Record<string, string>> = {
  "rx.negotiate": "advance.joke",
  "rx.late": "client.late.joke",
  "rx.loan": "loan.joke",
  "rx.crash": "failure.joke",
  "rx.rewind": "failure.support",
  "rx.quiet": "week.quiet",
};

/** Public URL of a recording: `design/<path>` is published as `public/media/<path>`. */
export function voiceAudioUrl(script: Pick<VoiceScript, "path">): string | undefined {
  return script.path ? `/media/${script.path}` : undefined;
}

export interface VoiceBinding {
  script: VoiceScript;
  audioUrl: string;
}

/**
 * The recording for a copy line in one variant, or undefined (captions only).
 * With `caption`, the recording is used only when its text equals the caption shown.
 */
export function voiceLineFor(
  lineId: string,
  playerGender: PlayerGender = "female",
  narratorGender: NarratorGender = "female",
  caption?: string
): VoiceBinding | undefined {
  const script = getVoiceScript(VOICE_ALIASES[lineId] ?? lineId, playerGender, narratorGender);
  if (!script) return undefined;
  if (caption !== undefined && caption !== script.text) return undefined;
  const audioUrl = voiceAudioUrl(script);
  return audioUrl ? { script, audioUrl } : undefined;
}

export interface VoiceSequence {
  audioUrl: string;
  audioQueue: string[];
  durationMs: number;
}

/**
 * Several recorded lines spoken as one caption (for example G05: intro.owner + intro.role).
 * Used only when every line is recorded and the recorded texts, joined by a space, equal the caption.
 */
export function voiceSequenceFor(
  lineIds: readonly string[],
  playerGender: PlayerGender = "female",
  narratorGender: NarratorGender = "female",
  caption?: string
): VoiceSequence | undefined {
  const bindings = lineIds.map((id) => voiceLineFor(id, playerGender, narratorGender));
  const found = bindings.filter((b): b is VoiceBinding => b !== undefined);
  if (found.length === 0 || found.length !== lineIds.length) return undefined;
  if (caption !== undefined && caption !== found.map((b) => b.script.text).join(" ")) return undefined;
  const [first, ...rest] = found;
  return {
    audioUrl: first.audioUrl,
    audioQueue: rest.map((b) => b.audioUrl),
    durationMs: found.reduce((sum, b) => sum + (b.script.durationMs ?? 0), 0),
  };
}

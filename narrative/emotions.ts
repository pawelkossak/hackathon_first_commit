// The narrator emotions (narrative/types.ts Emotion, engine EmotionSchema, data/reactions.json).
// `satisfies Record<Emotion, true>` makes a new emotion fail `pnpm typecheck` until it is listed here;
// emotions.test.ts checks that every listed emotion has its `ui.emotion.*` copy key.
import type { Emotion } from "./types";

const EMOTION_SET = {
  welcoming: true,
  excited: true,
  confident: true,
  suspicious: true,
  proud: true,
  exasperated: true,
  supportive: true,
  delighted: true,
  relaxed: true,
} as const satisfies Record<Emotion, true>;

export const EMOTIONS: readonly Emotion[] = Object.keys(EMOTION_SET) as Emotion[];

export function isEmotion(value: string): value is Emotion {
  return Object.prototype.hasOwnProperty.call(EMOTION_SET, value);
}

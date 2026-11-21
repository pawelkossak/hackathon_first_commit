// N-polish: the narrator mood has one copy key per emotion, and every interim label the ui lane wants
// (lib/ui/copy.ts MISSING_LABELS) exists in the seed, PL and EN, in all 4 variants, with no typed-in digit.
import { describe, expect, it } from "vitest";
import { EmotionSchema } from "../../engine/schema";
import { gameData } from "../../engine";
import { MISSING_LABELS } from "../../lib/ui/copy";
import { EMOTIONS, isEmotion } from "../emotions";
import { VARIANT_KEYS } from "../types";
import { getCopy } from "./get-copy";
import { SEED_COPY } from "./seed.pl";
import { SEED_COPY_EN } from "./seed.en";
import { emotionCopyKey } from "./seed.ui";

const GENDERS = ["female", "male"] as const;

describe("N-polish narrator mood keys", () => {
  it("the emotion list equals the engine EmotionSchema and covers data/reactions.json", () => {
    expect([...EMOTIONS].sort()).toEqual([...EmotionSchema.options].sort());
    for (const r of gameData.reactions.reactions) {
      for (const step of r.steps) expect(isEmotion(step.emotion), step.emotion).toBe(true);
    }
    expect(isEmotion("Welcoming")).toBe(false);
  });

  it("every emotion has a ui.emotion key in PL and EN, all 4 variants", () => {
    for (const emotion of EMOTIONS) {
      const key = emotionCopyKey(emotion);
      for (const deck of [SEED_COPY, SEED_COPY_EN]) {
        const record = deck[key];
        expect(record, key).toBeDefined();
        for (const variant of VARIANT_KEYS) expect(record[variant].length, `${key} ${variant}`).toBeGreaterThan(0);
      }
    }
  });

  it("the Polish adjective agrees with the narrator gender and the enum never shows raw", () => {
    expect(getCopy("ui.emotion.welcoming", undefined, "female", "female")).toBe("przyjazna");
    expect(getCopy("ui.emotion.welcoming", undefined, "female", "male")).toBe("przyjazny");
    expect(getCopy("ui.emotion.proud", undefined, "male", "female")).toBe("dumna");
    expect(getCopy("ui.emotion.proud", undefined, "male", "male")).toBe("dumny");
    for (const emotion of EMOTIONS) {
      for (const narrator of GENDERS) {
        const label = getCopy(emotionCopyKey(emotion), undefined, "female", narrator);
        const line = getCopy("ui.narrator_dialogue.mood", undefined, "female", narrator, { emotion: label });
        expect(line).toMatch(/^Nastrój: /);
        expect(line).not.toContain(emotion);
        expect(SEED_COPY[emotionCopyKey(emotion)]["player-female_narrator-female"]).not.toBe(
          SEED_COPY[emotionCopyKey(emotion)]["player-female_narrator-male"]
        );
      }
    }
  });
});

describe("N-polish copy keys for the ui lane's interim labels", () => {
  const keys = Object.keys(MISSING_LABELS);

  it("lists the ui lane's labels", () => {
    expect(keys.length).toBeGreaterThan(70);
  });

  it("every MISSING_LABELS key exists in the PL and EN seed in all 4 variants, without digits", () => {
    for (const key of keys) {
      for (const deck of [SEED_COPY, SEED_COPY_EN]) {
        const record = deck[key];
        expect(record, key).toBeDefined();
        for (const variant of VARIANT_KEYS) {
          expect(record[variant].length, `${key} ${variant}`).toBeGreaterThan(0);
          expect(record[variant], `${key} ${variant}`).not.toMatch(/\d/);
        }
      }
    }
  });

  it("the PL seed keeps the ui lane's wording and its bindings", () => {
    for (const [key, interim] of Object.entries(MISSING_LABELS)) {
      for (const variant of VARIANT_KEYS) expect(SEED_COPY[key][variant], key).toBe(interim);
      const bindings = (interim.match(/\{[^{}]+\}/g) ?? []).sort();
      const en = (SEED_COPY_EN[key]["player-female_narrator-female"].match(/\{[^{}]+\}/g) ?? []).sort();
      expect(en, key).toEqual(bindings);
    }
  });

  it("bound labels resolve with engine-style values", () => {
    expect(getCopy("ui.fraud.rewind", undefined, "female", "female", { week: 1 })).toBe("Cofnij do tygodnia 1");
    expect(getCopy("ui.plan.competence", undefined, "male", "male", { name: "Luka", level: 3 })).toBe("Luka: poziom 3");
  });
});

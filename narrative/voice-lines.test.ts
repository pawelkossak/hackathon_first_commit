// N-polish voice bindings: every recording a line binds to exists in design/voice, its public URL is the
// published path, captions equal the recorded text, and a line without a recording stays captions only.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getCopy } from "./copy/get-copy";
import { VOICE_SCRIPTS } from "./copy/voice-scripts";
import { REACTION_CONFIG } from "./reactions";
import { VARIANT_KEYS } from "./types";
import { VOICE_ALIASES, voiceAudioUrl, voiceLineFor, voiceSequenceFor } from "./voice-lines";

const VARIANTS = [
  ["female", "female"],
  ["male", "female"],
  ["female", "male"],
  ["male", "male"],
] as const;

describe("N-polish voice bindings", () => {
  it("every voice script path exists under design/ and maps to /media/<same path>", () => {
    for (const s of VOICE_SCRIPTS) {
      expect(s.path, s.id).toMatch(/^voice\/production\/(ania|szef)\/[a-z0-9.-]+\.mp3$/);
      expect(existsSync(join(process.cwd(), "design", s.path ?? "")), s.path).toBe(true);
      expect(voiceAudioUrl(s)).toBe(`/media/${s.path}`);
      expect(s.path?.startsWith(s.variant.endsWith("narrator-male") ? "voice/production/szef/" : "voice/production/ania/")).toBe(true);
    }
  });

  it("the G05 intro plays intro.owner then intro.role for the shown caption, in all 4 variants", () => {
    for (const [player, narrator] of VARIANTS) {
      const caption = `${getCopy("intro.owner", undefined, player, narrator)} ${getCopy("intro.role", undefined, player, narrator)}`;
      const seq = voiceSequenceFor(["intro.owner", "intro.role"], player, narrator, caption);
      const folder = narrator === "female" ? "ania" : "szef";
      expect(seq?.audioUrl).toBe(`/media/voice/production/${folder}/intro.owner.mp3`);
      expect(seq?.audioQueue).toEqual([`/media/voice/production/${folder}/intro.role.mp3`]);
    }
  });

  it("a reaction alias has the recorded text in all 4 variants, so captions equal the voice", () => {
    for (const [copyId, recordedId] of Object.entries(VOICE_ALIASES)) {
      for (const [player, narrator] of VARIANTS) {
        const caption = getCopy(copyId, undefined, player, narrator);
        const voice = voiceLineFor(copyId, player, narrator, caption);
        expect(voice?.script.id, `${copyId} ${player}/${narrator}`).toBe(recordedId);
      }
    }
  });

  it("a reaction line without a matching recording stays captions only", () => {
    const aliased = new Set(Object.keys(VOICE_ALIASES));
    for (const config of Object.values(REACTION_CONFIG)) {
      for (const step of config.steps) {
        if (aliased.has(step.lineId) || step.lineId === "rx.fraud") continue;
        for (const [player, narrator] of VARIANTS) {
          const caption = getCopy(step.lineId, undefined, player, narrator);
          expect(voiceLineFor(step.lineId, player, narrator, caption), step.lineId).toBeUndefined();
        }
      }
    }
  });

  it("a caption that differs from the recording or an unknown line never gets audio", () => {
    expect(voiceLineFor("intro.owner", "female", "female", "Inny tekst")).toBeUndefined();
    expect(voiceLineFor("missing.line")).toBeUndefined();
    expect(voiceSequenceFor(["intro.owner", "missing.line"])).toBeUndefined();
    expect(VARIANT_KEYS).toHaveLength(4);
  });
});

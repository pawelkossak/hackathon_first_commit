import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVoicePlayerStore, type VoiceLine } from "./index";

describe("N-04 Voice player with captions-only mode, mute, skip, replay", () => {
  beforeEach(() => {
    const store = useVoicePlayerStore.getState();
    store.stop();
    store.setMuted(false);
    store.setCaptionsOnly(false);
    useVoicePlayerStore.setState({ currentLine: null, isPlaying: false, hasAudioFailed: false });
  });

  const sampleLine: VoiceLine = {
    id: "intro.owner",
    speaker: "Szefowa",
    text: "Jestem Ania i prowadzę to studio. Mam klientów, dobre pomysły i kawę na trzy dni.",
    audioUrl: "/media/voice/production/szef/intro.owner.mp3",
    durationMs: 7200,
  };

  const lineWithoutAudio: VoiceLine = {
    id: "dialogue.custom",
    speaker: "Szefowa",
    text: "Kwestia bez pliku dźwiękowego (np. dynamiczna decyzja).",
  };

  it("test: captions are always shown immediately when played", () => {
    const store = useVoicePlayerStore.getState();
    store.play(sampleLine);

    const state = useVoicePlayerStore.getState();
    expect(state.currentLine).not.toBeNull();
    expect(state.currentLine?.text).toBe(sampleLine.text);
    expect(state.currentLine?.speaker).toBe("Szefowa");
  });

  it("test: missing audio never blocks a decision; captions still appear", () => {
    const store = useVoicePlayerStore.getState();

    // Line without audioUrl
    expect(() => store.play(lineWithoutAudio)).not.toThrow();
    let state = useVoicePlayerStore.getState();
    expect(state.currentLine?.text).toBe(lineWithoutAudio.text);
    expect(state.isPlaying).toBe(false);

    // Line with invalid/missing audio path
    const invalidAudioLine: VoiceLine = {
      id: "broken",
      speaker: "Szef",
      text: "Ścieżka do nieistniejącego pliku",
      audioUrl: "/invalid/missing/file.mp3",
    };
    expect(() => store.play(invalidAudioLine)).not.toThrow();
    state = useVoicePlayerStore.getState();
    expect(state.currentLine?.text).toBe(invalidAudioLine.text);
  });

  it("captions-only mode renders captions without audio", () => {
    const store = useVoicePlayerStore.getState();
    store.setCaptionsOnly(true);

    store.play(sampleLine);
    const state = useVoicePlayerStore.getState();
    expect(state.captionsOnly).toBe(true);
    expect(state.currentLine?.text).toBe(sampleLine.text);
    expect(state.isPlaying).toBe(false);
  });

  it("mute suppresses audio while captions remain visible", () => {
    const store = useVoicePlayerStore.getState();
    store.setMuted(true);

    store.play(sampleLine);
    const state = useVoicePlayerStore.getState();
    expect(state.muted).toBe(true);
    expect(state.currentLine?.text).toBe(sampleLine.text);
    expect(state.isPlaying).toBe(false);

    store.toggleMute();
    expect(useVoicePlayerStore.getState().muted).toBe(false);
  });

  it("skip cancels current playback and line", () => {
    const store = useVoicePlayerStore.getState();
    store.play(sampleLine);
    expect(useVoicePlayerStore.getState().currentLine).not.toBeNull();

    store.skip();
    expect(useVoicePlayerStore.getState().currentLine).toBeNull();
    expect(useVoicePlayerStore.getState().isPlaying).toBe(false);
  });

  it("replay restarts current line", () => {
    const store = useVoicePlayerStore.getState();
    store.play(sampleLine);

    store.replay();
    const state = useVoicePlayerStore.getState();
    expect(state.currentLine?.id).toBe(sampleLine.id);
  });

  it("playing a new line replaces the previous line (one speaker at a time)", () => {
    const store = useVoicePlayerStore.getState();
    store.play(sampleLine);
    expect(useVoicePlayerStore.getState().currentLine?.id).toBe("intro.owner");

    const secondLine: VoiceLine = {
      id: "intro.role",
      speaker: "Szef",
      text: "Zaprosiłem Cię, żeby pomóc przeprowadzić moje studio przez grudzień.",
    };
    store.play(secondLine);
    expect(useVoicePlayerStore.getState().currentLine?.id).toBe("intro.role");
    expect(useVoicePlayerStore.getState().currentLine?.speaker).toBe("Szef");
  });

  describe("queued recordings (one caption, several lines)", () => {
    class FakeAudio {
      static created: FakeAudio[] = [];
      onplay: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      currentTime = 0;
      constructor(public src: string) {
        FakeAudio.created.push(this);
      }
      play(): Promise<void> {
        this.onplay?.();
        return Promise.resolve();
      }
      pause(): void {}
    }

    beforeEach(() => {
      FakeAudio.created = [];
      vi.stubGlobal("window", {});
      vi.stubGlobal("Audio", FakeAudio);
    });
    afterEach(() => {
      useVoicePlayerStore.getState().stop();
      vi.unstubAllGlobals();
    });

    it("plays audioUrl, then each audioQueue entry, then stops", () => {
      useVoicePlayerStore.getState().play({
        ...sampleLine,
        audioUrl: "/media/voice/production/ania/intro.owner.mp3",
        audioQueue: ["/media/voice/production/ania/intro.role.mp3"],
      });
      expect(FakeAudio.created.map((a) => a.src)).toEqual(["/media/voice/production/ania/intro.owner.mp3"]);
      expect(useVoicePlayerStore.getState().isPlaying).toBe(true);
      FakeAudio.created[0].onended?.();
      expect(FakeAudio.created.map((a) => a.src)).toEqual([
        "/media/voice/production/ania/intro.owner.mp3",
        "/media/voice/production/ania/intro.role.mp3",
      ]);
      FakeAudio.created[1].onended?.();
      expect(useVoicePlayerStore.getState().isPlaying).toBe(false);
      expect(useVoicePlayerStore.getState().currentLine?.text).toBe(sampleLine.text);
    });

    it("a missing recording in the queue falls back to captions without blocking", () => {
      useVoicePlayerStore.getState().play({ ...sampleLine, audioQueue: ["/media/voice/missing.mp3"] });
      FakeAudio.created[0].onended?.();
      FakeAudio.created[1].onerror?.();
      const state = useVoicePlayerStore.getState();
      expect(state.hasAudioFailed).toBe(true);
      expect(state.isPlaying).toBe(false);
      expect(state.currentLine?.text).toBe(sampleLine.text);
    });
  });
});

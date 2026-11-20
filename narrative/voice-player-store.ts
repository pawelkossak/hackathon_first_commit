// Voice player state management and audio adapter (GAME-EXPERIENCE-AND-NARRATION.md §10, GM-20).
// Rule 6: Captions are always shown; missing audio never blocks a decision.
import { create } from "zustand";

export interface VoiceLine {
  id: string;
  speaker: string;
  text: string;
  audioUrl?: string;
  durationMs?: number;
}

export interface VoicePlayerState {
  muted: boolean;
  captionsOnly: boolean;
  currentLine: VoiceLine | null;
  isPlaying: boolean;
  hasAudioFailed: boolean;

  play: (line: VoiceLine) => void;
  stop: () => void;
  skip: () => void;
  replay: () => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setCaptionsOnly: (captionsOnly: boolean) => void;
  toggleCaptionsOnly: () => void;
}

let activeAudio: HTMLAudioElement | null = null;

function stopActiveAudio(): void {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = "";
    } catch {
      // Audio cleanup error ignored safely
    }
    activeAudio = null;
  }
}

export const useVoicePlayerStore = create<VoicePlayerState>((set, get) => ({
  muted: false,
  captionsOnly: false,
  currentLine: null,
  isPlaying: false,
  hasAudioFailed: false,

  play: (line: VoiceLine) => {
    stopActiveAudio();

    // Captions are ALWAYS displayed immediately, regardless of audio state
    set({
      currentLine: line,
      isPlaying: false,
      hasAudioFailed: false,
    });

    const { muted, captionsOnly } = get();
    if (muted || captionsOnly || !line.audioUrl) {
      return;
    }

    // Audio playback in browser environment
    if (typeof window !== "undefined" && typeof Audio !== "undefined") {
      try {
        const audio = new Audio(line.audioUrl);
        activeAudio = audio;

        audio.onplay = () => {
          set({ isPlaying: true, hasAudioFailed: false });
        };

        audio.onended = () => {
          set({ isPlaying: false });
          activeAudio = null;
        };

        audio.onerror = () => {
          // Audio missing or failed -> fall back silently to captions-only mode without blocking!
          set({ isPlaying: false, hasAudioFailed: true });
          activeAudio = null;
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay blocked by browser or file missing -> keep captions visible
            set({ isPlaying: false, hasAudioFailed: true });
            activeAudio = null;
          });
        }
      } catch {
        // Audio constructor failed -> captions still visible
        set({ isPlaying: false, hasAudioFailed: true });
        activeAudio = null;
      }
    }
  },

  stop: () => {
    stopActiveAudio();
    set({ isPlaying: false });
  },

  skip: () => {
    stopActiveAudio();
    set({ isPlaying: false, currentLine: null });
  },

  replay: () => {
    const { currentLine } = get();
    if (currentLine) {
      get().play(currentLine);
    }
  },

  setMuted: (muted: boolean) => {
    if (muted) stopActiveAudio();
    set({ muted, isPlaying: muted ? false : get().isPlaying });
  },

  toggleMute: () => {
    const next = !get().muted;
    get().setMuted(next);
  },

  setCaptionsOnly: (captionsOnly: boolean) => {
    if (captionsOnly) stopActiveAudio();
    set({ captionsOnly, isPlaying: captionsOnly ? false : get().isPlaying });
  },

  toggleCaptionsOnly: () => {
    const next = !get().captionsOnly;
    get().setCaptionsOnly(next);
  },
}));

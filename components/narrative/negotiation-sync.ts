// Prop → local state sync of NegotiationDialogue. The dialogue keeps the engine state of its own last
// answer (`current`); the parent stores that state and passes it back (an echo). Any other new `state`
// prop (rewind, a new week, a reset, a card played elsewhere) replaces the thread: local state, quick
// replies and messages restart from the prop, so the dialogue never posts a stale state to /api/agent.
import type { GameState } from "../../engine";

export type DialogueSync = "none" | "echo" | "reset";

/**
 * `synced` is the last prop seen, `current` the dialogue's own state.
 * - none: the prop did not change;
 * - echo: the parent passed back the state the dialogue produced (keep the thread);
 * - reset: a different state arrived (restart the thread from it).
 */
export function dialogueSync(prop: GameState, synced: GameState, current: GameState): DialogueSync {
  if (prop === synced) return "none";
  if (prop === current) return "echo";
  return "reset";
}

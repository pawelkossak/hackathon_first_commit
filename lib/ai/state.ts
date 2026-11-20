// Shape check of a serialized GameState sent by the client to /api/agent.
// The engine owns the rules; this only rejects bodies that are not a level-1 game state, so the engine
// never runs on garbage. Any deeper inconsistency surfaces as an engine error, which the route turns
// into the deterministic fallback.
import { z } from "zod";
import type { AgentIntent, GameState } from "../../engine";

const ThreadSchema = z.looseObject({
  messagesThisWeek: z.number().int().min(0),
  counterPending: z.boolean(),
});

const CoreSchema = z.looseObject({
  level: z.literal(1),
  seed: z.string(),
  week: z.number().int().min(1).max(7),
  status: z.enum(["playing", "crashed", "completed"]),
  hand: z.array(z.string()),
  played: z.array(z.looseObject({ cardId: z.string(), week: z.number().int() })),
  weekActionUsed: z.boolean(),
  eventsResolved: z.array(z.looseObject({})),
  weeksResolved: z.array(z.number().int()),
  invoiceState: z.string(),
  overdraftLimit: z.number().int(),
  balance: z.number().int(),
  relations: z.number().int(),
  costOfMoney: z.number().int(),
  competences: z.record(z.string(), z.number().int()),
  stars: z.record(z.string(), z.string()),
  negotiation: z.looseObject({ klient_a: ThreadSchema, bank: ThreadSchema }),
});

const GameStateShape = z.looseObject({
  schemaVersion: z.literal(1),
  core: CoreSchema,
  snapshots: z.record(z.string(), CoreSchema),
  account: z.looseObject({
    clock: z.string(),
    balance: z.number().int(),
    plans: z.array(z.looseObject({})),
    matchedTx: z.array(z.looseObject({})),
  }),
  emitted: z.array(z.looseObject({ type: z.string() })),
});

/** True when `value` has the shape of a serialized level-1 GameState. */
export function isGameState(value: unknown): value is GameState {
  return GameStateShape.safeParse(value).success;
}

/** Every engine intent; `satisfies` fails the typecheck when the engine adds or drops one. */
const INTENTS = {
  ask_advance: true,
  accept_counter: true,
  offer_discount: true,
  rude: true,
  ask_overdraft: true,
  unknown: true,
} as const satisfies Record<AgentIntent, true>;

export const AGENT_INTENTS = Object.keys(INTENTS) as [AgentIntent, ...AgentIntent[]];

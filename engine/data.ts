// Loads every data/*.json file as a JSON module and validates it with Zod at module load.
import personaJson from "../data/persona.json";
import level1Json from "../data/level1.json";
import agentsJson from "../data/agents.json";
import futureScriptJson from "../data/future-script.json";
import reactionsJson from "../data/reactions.json";
import {
  AgentsFileSchema,
  EngineEventTypeSchema,
  FutureScriptFileSchema,
  Level1FileSchema,
  PersonaFileSchema,
  ReactionsFileSchema,
} from "./schema";
import type { AgentsFile, FutureScriptFile, Level1File, PersonaFile, ReactionsFile } from "./types";

export interface GameData {
  persona: PersonaFile;
  level1: Level1File;
  agents: AgentsFile;
  futureScript: FutureScriptFile;
  reactions: ReactionsFile;
}

/** Raw JSON modules keyed by their file name in `data/`. */
export const rawDataFiles: Readonly<Record<string, unknown>> = {
  "persona.json": personaJson,
  "level1.json": level1Json,
  "agents.json": agentsJson,
  "future-script.json": futureScriptJson,
  "reactions.json": reactionsJson,
};

/** Cross-file and cross-row checks that a per-file schema cannot express. Returns the list of problems. */
export function checkReferences(data: GameData): string[] {
  const problems: string[] = [];
  const cpIds = new Set(data.persona.counterparties.map((c) => c.id));
  const ledgerIds = new Set(data.persona.ledger.map((l) => l.id));
  const cardIds = new Set(data.level1.cards.map((c) => c.id));
  const eventIds = new Set(data.level1.events.map((e) => e.id));

  if (cpIds.size !== data.persona.counterparties.length) problems.push("duplicate counterparty id");
  if (ledgerIds.size !== data.persona.ledger.length) problems.push("duplicate ledger id");
  if (cardIds.size !== data.level1.cards.length) problems.push("duplicate card id");
  if (eventIds.size !== data.level1.events.length) problems.push("duplicate event id");

  for (const l of data.persona.ledger) {
    if (!cpIds.has(l.counterpartyId)) problems.push(`ledger ${l.id}: unknown counterparty ${l.counterpartyId}`);
    if (l.date < l.dueDate) problems.push(`ledger ${l.id}: booked before due date`);
  }
  for (const inv of data.persona.invoices) {
    if (!ledgerIds.has(inv.ledgerId)) problems.push(`invoice ${inv.id}: unknown ledger ${inv.ledgerId}`);
  }
  data.level1.weeks.forEach((w, i) => {
    if (w.week !== i + 1) problems.push(`week ${w.week} out of order`);
  });
  for (const card of data.level1.cards) {
    for (const other of card.exclusiveWith) {
      const peer = data.level1.cards.find((c) => c.id === other);
      if (!peer || !peer.exclusiveWith.includes(card.id)) problems.push(`card ${card.id}: exclusivity with ${other} not mutual`);
    }
    if (card.isProduct && card.competence !== null) problems.push(`card ${card.id}: a product never raises a competence`);
    const e = card.effect;
    if ("counterpartyId" in e && !cpIds.has(e.counterpartyId)) problems.push(`card ${card.id}: unknown counterparty`);
    if (e.type === "move_ledger" && !ledgerIds.has(e.ledgerId)) problems.push(`card ${card.id}: unknown ledger`);
    if (e.type === "discount" || e.type === "factoring") {
      const inv = data.persona.invoices.find((i) => i.id === e.invoiceId);
      if (!inv) {
        problems.push(`card ${card.id}: unknown invoice ${e.invoiceId}`);
      } else if (e.type === "factoring") {
        // D-11: fee = round(1.5 % × gross), payout = gross − fee, cost = fee.
        const fee = Math.round(e.feeRate * inv.gross);
        if (e.fee !== fee) problems.push(`card ${card.id}: fee ${e.fee} is not round(rate × gross) ${fee}`);
        if (e.amount !== inv.gross - e.fee) problems.push(`card ${card.id}: payout is not gross − fee`);
        if (card.cost.fixed !== e.fee) problems.push(`card ${card.id}: cost is not the fee`);
      } else {
        const payout = Math.round((inv.gross * (100 - e.discountPct)) / 100);
        if (e.amount !== payout) problems.push(`card ${card.id}: payout ${e.amount} is not gross less discount ${payout}`);
        if (card.cost.fixed !== inv.gross - e.amount) problems.push(`card ${card.id}: cost is not gross − payout`);
      }
    }
  }
  for (const ev of data.level1.events) {
    for (const ch of ev.choices) {
      for (const eff of ch.effects) {
        if (eff.type === "transaction" && !cpIds.has(eff.counterpartyId)) problems.push(`event ${ev.id}: unknown counterparty`);
        if (eff.type === "reveal_card" && !cardIds.has(eff.cardId)) problems.push(`event ${ev.id}: unknown card`);
        if (eff.type === "reveal" && !ledgerIds.has(eff.ledgerId)) problems.push(`event ${ev.id}: unknown ledger ${eff.ledgerId}`);
      }
    }
  }
  if (!("demo" in data.level1.seeds)) problems.push("level1: the demo seed is missing");
  for (const [seed, deck] of Object.entries(data.level1.seeds)) {
    if (new Set(deck.map((s) => s.week)).size !== deck.length) problems.push(`seed ${seed}: two events in one week`);
    for (const slot of deck) {
      const ev = data.level1.events.find((e) => e.id === slot.eventId);
      if (!ev) problems.push(`seed ${seed}: unknown event ${slot.eventId}`);
      else if (ev.week !== slot.week) problems.push(`seed ${seed}: ${slot.eventId} in week ${slot.week}, card says ${ev.week}`);
    }
  }
  for (const agent of [data.agents.klient_a, data.agents.bank]) {
    for (const rule of agent.rules) {
      if (rule.cardId !== null && agent.neverOffers.includes(rule.cardId)) problems.push(`${agent.name}: offers forbidden card ${rule.cardId}`);
      if (rule.outcome === "counter" && (rule.counterPercent === null || rule.cardId === null)) {
        problems.push(`${agent.name}: a counter rule needs counterPercent and cardId`);
      }
      if ((rule.outcome === "accept" || rule.outcome === "inform_allow") && rule.cardId === null) {
        problems.push(`${agent.name}: an ${rule.outcome} rule needs cardId`);
      }
    }
    if (!agent.rules.some((r) => r.intent === "unknown" && r.weeks === null && r.cardId === null)) {
      problems.push(`${agent.name}: no fallback rule (intent unknown, any week)`);
    }
  }
  for (const t of data.futureScript.planTemplates) {
    if (!cardIds.has(t.cardId)) problems.push(`plan template: unknown card ${t.cardId}`);
  }
  const covered = new Set(data.reactions.reactions.map((r) => r.event));
  for (const type of EngineEventTypeSchema.options) {
    if (!covered.has(type)) problems.push(`reactions: no mapping for ${type}`);
  }
  return problems;
}

function load(): GameData {
  const data: GameData = {
    persona: PersonaFileSchema.parse(personaJson),
    level1: Level1FileSchema.parse(level1Json),
    agents: AgentsFileSchema.parse(agentsJson),
    futureScript: FutureScriptFileSchema.parse(futureScriptJson),
    reactions: ReactionsFileSchema.parse(reactionsJson),
  };
  const problems = checkReferences(data);
  if (problems.length > 0) throw new Error(`Invalid game data: ${problems.join("; ")}`);
  return data;
}

/** Validated game data. Throws at import time if any file breaks its schema. */
export const gameData: GameData = load();

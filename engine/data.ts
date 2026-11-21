// Loads every data/*.json file as a JSON module and validates it with Zod at module load.
import personaJson from "../data/persona.json";
import level1Json from "../data/level1.json";
import level2Json from "../data/level2.json";
import agentsJson from "../data/agents.json";
import futureScriptJson from "../data/future-script.json";
import reactionsJson from "../data/reactions.json";
import {
  AgentsFileSchema,
  EmployeeHiringChoiceSchema,
  EmployeeInvoiceChoiceSchema,
  EmployeeTaxChoiceSchema,
  EngineEventTypeSchema,
  FutureScriptFileSchema,
  Level1FileSchema,
  Level2FileSchema,
  PersonaFileSchema,
  ReactionsFileSchema,
} from "./schema";
import type { AgentsFile, FutureScriptFile, Level1File, Level2File, PersonaFile, ReactionsFile } from "./types";

export interface GameData {
  persona: PersonaFile;
  level1: Level1File;
  agents: AgentsFile;
  futureScript: FutureScriptFile;
  reactions: ReactionsFile;
  level2: Level2File;
}

/** Raw JSON modules keyed by their file name in `data/`. */
export const rawDataFiles: Readonly<Record<string, unknown>> = {
  "persona.json": personaJson,
  "level1.json": level1Json,
  "agents.json": agentsJson,
  "future-script.json": futureScriptJson,
  "reactions.json": reactionsJson,
  "level2.json": level2Json,
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
  let previous = data.futureScript.accountClock.start;
  for (const r of data.futureScript.replay) {
    if (r.date <= previous) problems.push(`future script: replay ${r.date} not after ${previous}`);
    previous = r.date;
    if (!cpIds.has(r.counterpartyId)) problems.push(`future script: unknown counterparty ${r.counterpartyId}`);
    if (r.source === "ledger") {
      const l = data.persona.ledger.find((x) => x.id === r.ledgerId);
      if (!l || r.cardId !== null) problems.push(`future script: ledger row ${r.date} needs a known ledgerId and no cardId`);
      else if (l.date !== r.date || l.amount !== r.amount || l.counterpartyId !== r.counterpartyId) {
        problems.push(`future script: ${l.id} differs from the persona ledger`);
      }
    } else if (r.cardId === null || !cardIds.has(r.cardId) || r.ledgerId !== null) {
      problems.push(`future script: card row ${r.date} needs a known cardId and no ledgerId`);
    }
  }
  if (data.futureScript.accountClock.defaultTarget < data.futureScript.accountClock.start) {
    problems.push("future script: default target before the account start");
  }
  for (const t of data.futureScript.planTemplates) {
    if (!cardIds.has(t.cardId)) problems.push(`plan template: unknown card ${t.cardId}`);
  }
  const covered = new Set(data.reactions.reactions.map((r) => r.event));
  for (const type of EngineEventTypeSchema.options) {
    if (!covered.has(type)) problems.push(`reactions: no mapping for ${type}`);
  }
  problems.push(...checkLevel2(data.level2));
  return problems;
}

/** Level 2 cross-row checks (FIRST-EMPLOYEE-SCENARIO.md). Returns the list of problems. */
export function checkLevel2(l2: Level2File): string[] {
  const problems: string[] = [];
  const inPeriod = (date: string): boolean => date >= l2.period.start && date <= l2.period.end;
  const ledgerIds = new Set(l2.ledger.map((l) => l.id));
  const choiceIds = new Set(l2.choices.map((c) => c.id));
  if (ledgerIds.size !== l2.ledger.length) problems.push("level2: duplicate ledger id");
  if (choiceIds.size !== l2.choices.length) problems.push("level2: duplicate choice id");
  if (l2.period.start > l2.period.end) problems.push("level2: period start after end");

  let previousEnd: string | null = null;
  l2.weeks.forEach((w, i) => {
    if (w.week !== i + 1) problems.push(`level2: week ${w.week} out of order`);
    if (w.start > w.end || !inPeriod(w.start) || !inPeriod(w.end)) problems.push(`level2: week ${w.week} outside the period`);
    if (i === 0 && w.start !== l2.period.start) problems.push("level2: week 1 does not start the period");
    if (i === l2.weeks.length - 1 && w.end !== l2.period.end) problems.push("level2: the last week does not end the period");
    if (previousEnd !== null && w.start <= previousEnd) problems.push(`level2: week ${w.week} overlaps the previous week`);
    previousEnd = w.end;
    const options: readonly string[] = {
      hiring: EmployeeHiringChoiceSchema.options,
      invoice: EmployeeInvoiceChoiceSchema.options,
      tax: EmployeeTaxChoiceSchema.options,
    }[w.decision];
    if ([...w.choices].sort().join(",") !== [...options].sort().join(",")) {
      problems.push(`level2: week ${w.week} choices do not match the ${w.decision} decision`);
    }
    if (!w.choices.includes(w.defaultChoice)) problems.push(`level2: week ${w.week} default is not one of its choices`);
    for (const id of w.choices) {
      const choice = l2.choices.find((c) => c.id === id);
      if (!choice || choice.week !== w.week) problems.push(`level2: week ${w.week} choice ${id} is not a week-${w.week} choice`);
    }
  });
  const decisions = l2.weeks.map((w) => w.decision).join(",");
  if (decisions !== "hiring,invoice,tax") problems.push(`level2: decisions ${decisions} are not hiring,invoice,tax`);

  for (const l of l2.ledger) {
    if (!inPeriod(l.date)) problems.push(`level2: ledger ${l.id} outside the period`);
    if ((l.kind === "receivable") !== l.amount > 0) problems.push(`level2: ledger ${l.id} sign does not match its kind`);
  }

  for (const c of l2.choices) {
    const week = l2.weeks.find((w) => w.week === c.week);
    const ownTx = c.effects.flatMap((e) => (e.type === "transaction" ? [e] : []));
    for (const e of c.effects) {
      if (e.type === "transaction") {
        if (!inPeriod(e.date)) problems.push(`level2: ${c.id} transaction ${e.id} outside the period`);
        if (week && e.date < week.start) problems.push(`level2: ${c.id} transaction ${e.id} before its decision week`);
      } else if (e.type === "set_ledger_amount") {
        const row = l2.ledger.find((l) => l.id === e.ledgerId);
        if (!row) {
          problems.push(`level2: ${c.id} changes unknown ledger ${e.ledgerId}`);
        } else {
          // The advance preserves total client revenue: advance + reduced invoice = original invoice.
          const advance = ownTx.filter((t) => t.role === "advance").reduce((sum, t) => sum + t.amount, 0);
          if (advance + e.amount !== row.amount) problems.push(`level2: ${c.id} does not conserve ${row.id} revenue`);
        }
      } else {
        const tax = l2.ledger.find((l) => l.id === e.releasedByLedgerId);
        if (!tax) problems.push(`level2: ${c.id} reserve released by unknown ledger ${e.releasedByLedgerId}`);
        else if (-tax.amount !== e.amount) problems.push(`level2: ${c.id} reserve ${e.amount} is not the tax ${-tax.amount}`);
        else if (week && tax.date < week.start) problems.push(`level2: ${c.id} reserve released before its decision week`);
      }
    }
    const salary = ownTx.filter((t) => t.role === "salary").reduce((sum, t) => sum + t.amount, 0);
    const employer = ownTx.filter((t) => t.role === "employer_costs").reduce((sum, t) => sum + t.amount, 0);
    if (salary !== 0 && employer !== Math.round((salary * l2.assumptions.employerCostPct) / 100)) {
      problems.push(`level2: ${c.id} employer costs are not ${l2.assumptions.employerCostPct} % of the salary`);
    }
  }
  if (l2.stars.completed + l2.stars.reserveFunded !== l2.stars.max) problems.push("level2: star rules do not add up to max");
  return problems;
}

function load(): GameData {
  const data: GameData = {
    persona: PersonaFileSchema.parse(personaJson),
    level1: Level1FileSchema.parse(level1Json),
    agents: AgentsFileSchema.parse(agentsJson),
    futureScript: FutureScriptFileSchema.parse(futureScriptJson),
    reactions: ReactionsFileSchema.parse(reactionsJson),
    level2: Level2FileSchema.parse(level2Json),
  };
  const problems = checkReferences(data);
  if (problems.length > 0) throw new Error(`Invalid game data: ${problems.join("; ")}`);
  return data;
}

/** Validated game data. Throws at import time if any file breaks its schema. */
export const gameData: GameData = load();

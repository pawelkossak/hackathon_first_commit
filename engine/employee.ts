// Level 2 „Pierwszy pracownik” (FIRST-EMPLOYEE-SCENARIO.md). Pure: every function returns a new state.
// Three weeks 1–21 II 2027, opening balance and every amount from data/level2.json. One choice per week:
// hire / defer, advance / wait, reserve / common. Same-day order inflows before outflows (level 1);
// crash when cash goes below −overdraftLimit (0). The tax reserve is an earmark only: no income and no
// second tax debit; it holds min(target, cash) and is released when the tax is paid.
// Stars (the spec is silent on the rule, the simplest consistent one): 0 unless completed; completed = 2;
// +1 when the reserve was fully funded on the day before the tax payment. Hiring is never required.
import { addDays, dateRange } from "./calendar";
import { gameData } from "./data";
import { RuleError } from "./errors";
import {
  EmployeeChoiceIdSchema,
  EmployeeHiringChoiceSchema,
  EmployeeInvoiceChoiceSchema,
  EmployeeSaveSchema,
  EmployeeTaxChoiceSchema,
} from "./schema";
import type {
  Crash,
  EmployeeChoiceId,
  EmployeeChoices,
  EmployeeForecast,
  EmployeePoint,
  EmployeeReserveView,
  EmployeeScore,
  EmployeeState,
  EmployeeTransaction,
  EmployeeWeek,
  EmployeeWeekResolution,
  EngineEvent,
  Level2File,
  Pln,
} from "./types";

const level2: Level2File = gameData.level2;

/** localStorage key of the level-2 save; the global reset clears it. */
export const EMPLOYEE_STORAGE_KEY = level2.storageKey;

type WeekDef = Level2File["weeks"][number];
type ChoiceDef = Level2File["choices"][number];
type FullChoices = EmployeeForecast["assumedChoices"];

const WEEKS: readonly EmployeeWeek[] = [1, 2, 3];

function weekDef(week: EmployeeWeek): WeekDef {
  const def = level2.weeks.find((w) => w.week === week);
  if (!def) throw new RuleError("invalid_week", `level 2 has no week ${week}`);
  return def;
}

function weekOfDate(date: string): EmployeeWeek {
  const def = level2.weeks.find((w) => date >= w.start && date <= w.end);
  if (!def) throw new RuleError("invalid_date", `${date} is outside level 2`);
  return def.week;
}

function choiceDef(id: EmployeeChoiceId): ChoiceDef {
  const def = level2.choices.find((c) => c.id === id);
  if (!def) throw new RuleError("invalid_choice", `unknown level-2 choice ${id}`);
  return def;
}

function isEmployeeWeek(value: unknown): value is EmployeeWeek {
  return value === 1 || value === 2 || value === 3;
}

function nextWeek(week: EmployeeWeek): EmployeeWeek {
  return week === 1 ? 2 : 3;
}

function choiceOfWeek(choices: EmployeeChoices, week: EmployeeWeek): EmployeeChoiceId | null {
  return choices[weekDef(week).decision];
}

/** Sets the choice of `week`; RuleError("invalid_choice") when `id` is not one of that week's choices. */
function setChoice(choices: EmployeeChoices, week: EmployeeWeek, id: unknown): EmployeeChoices {
  const def = weekDef(week);
  const invalid = (): RuleError => new RuleError("invalid_choice", `${String(id)} is not a week-${week} choice`);
  if (typeof id !== "string" || !def.choices.some((c) => c === id)) throw invalid();
  switch (def.decision) {
    case "hiring": {
      const parsed = EmployeeHiringChoiceSchema.safeParse(id);
      if (!parsed.success) throw invalid();
      return { ...choices, hiring: parsed.data };
    }
    case "invoice": {
      const parsed = EmployeeInvoiceChoiceSchema.safeParse(id);
      if (!parsed.success) throw invalid();
      return { ...choices, invoice: parsed.data };
    }
    case "tax": {
      const parsed = EmployeeTaxChoiceSchema.safeParse(id);
      if (!parsed.success) throw invalid();
      return { ...choices, tax: parsed.data };
    }
  }
}

/** Made choices, plus the passive default of every week not chosen yet. */
function assumedChoices(choices: EmployeeChoices): FullChoices {
  const filled = WEEKS.reduce<EmployeeChoices>(
    (acc, week) => (choiceOfWeek(acc, week) === null ? setChoice(acc, week, weekDef(week).defaultChoice) : acc),
    choices,
  );
  const { hiring, invoice, tax } = filled;
  if (hiring === null || invoice === null || tax === null) throw new RuleError("invalid_choice", "unfilled level-2 choice");
  return { hiring, invoice, tax };
}

interface Run {
  points: EmployeePoint[];
  crash: Crash | null;
  reserve: EmployeeReserveView | null;
}

/** Inflows before outflows; otherwise the listed order (ledger first, then choice rows). */
function sameDayOrder(txs: readonly EmployeeTransaction[]): EmployeeTransaction[] {
  return [...txs.filter((t) => t.amount > 0), ...txs.filter((t) => t.amount <= 0)];
}

function transactionsOf(choices: FullChoices): EmployeeTransaction[] {
  const chosen = [choices.hiring, choices.invoice, choices.tax].map(choiceDef);
  const overrides = new Map<string, Pln>();
  for (const c of chosen) {
    for (const e of c.effects) if (e.type === "set_ledger_amount") overrides.set(e.ledgerId, e.amount);
  }
  const ledger: EmployeeTransaction[] = level2.ledger.map((l) => ({
    id: l.id,
    date: l.date,
    amount: overrides.get(l.id) ?? l.amount,
    title: l.title,
    source: "ledger",
    choiceId: null,
  }));
  const own: EmployeeTransaction[] = chosen.flatMap((c) =>
    c.effects.flatMap((e) =>
      e.type === "transaction"
        ? [{ id: e.id, date: e.date, amount: e.amount, title: e.title, source: "choice" as const, choiceId: c.id }]
        : [],
    ),
  );
  return [...ledger, ...own];
}

/** The daily run 1 II … 21 II of a full set of choices. Post-crash points are counterfactual. */
function run(choices: FullChoices): Run {
  const limit = level2.assumptions.overdraftLimit;
  const txs = transactionsOf(choices);
  const taxChoice = choiceDef(choices.tax);
  const reserveEffect = taxChoice.effects.flatMap((e) => (e.type === "reserve" ? [e] : []))[0] ?? null;
  const reserveFrom = weekDef(taxChoice.week).start;
  const releasedOn = reserveEffect ? (level2.ledger.find((l) => l.id === reserveEffect.releasedByLedgerId)?.date ?? null) : null;

  let balance = level2.openingBalance;
  let crash: Crash | null = null;
  const points: EmployeePoint[] = [];
  for (const date of dateRange(level2.period.start, level2.period.end)) {
    const today = sameDayOrder(txs.filter((t) => t.date === date));
    const openingBalance = balance;
    for (const t of today) {
      balance += t.amount;
      if (crash === null && balance < -limit) {
        crash = { week: weekOfDate(date), date, transactionId: t.id, shortfall: -limit - balance };
      }
    }
    const holding = reserveEffect !== null && releasedOn !== null && date >= reserveFrom && date < releasedOn;
    const reserved = holding ? Math.min(reserveEffect.amount, Math.max(0, balance)) : 0;
    points.push({
      date,
      week: weekOfDate(date),
      openingBalance,
      balance,
      reserved,
      available: balance - reserved,
      transactions: today,
      counterfactual: crash !== null && date > crash.date,
    });
  }

  let reserve: EmployeeReserveView | null = null;
  if (reserveEffect !== null && releasedOn !== null) {
    const dayBefore = points.find((p) => p.date === addDays(releasedOn, -1));
    const fundedBeforeTax = dayBefore && dayBefore.date >= reserveFrom ? dayBefore.reserved : 0;
    reserve = { target: reserveEffect.amount, fundedBeforeTax, fullyFunded: fundedBeforeTax === reserveEffect.amount, releasedOn };
  }
  return { points, crash, reserve };
}

function toForecast(choices: FullChoices, r: Run): EmployeeForecast {
  const real = r.points.filter((p) => !p.counterfactual);
  const lowest = real.reduce((min, p) => (p.balance < min.balance ? p : min), real[0]);
  const last = r.points[r.points.length - 1];
  return {
    points: r.points,
    crash: r.crash,
    endBalance: r.crash === null ? last.balance : null,
    minimum: { date: lowest.date, balance: lowest.balance },
    assumedChoices: choices,
    reserve: r.reserve,
  };
}

/** A fresh level-2 game: week 1, opening balance from data/level2.json, no choice made. Emits lapStart. */
export function createEmployeeGame(): EmployeeState {
  return {
    schemaVersion: 1,
    level: 2,
    week: 1,
    status: "playing",
    choices: { hiring: null, invoice: null, tax: null },
    weeksResolved: [],
    balance: level2.openingBalance,
    reserved: 0,
    booked: [],
    crash: null,
    emitted: [{ type: "lapStart", week: 1 }],
  };
}

/**
 * Read-only daily forecast 1 II … 21 II with the choices made so far and the passive default
 * (defer, wait, common) for the rest. To preview a choice: employeeForecast(chooseEmployeeAction(s, id)).
 */
export function employeeForecast(state: EmployeeState): EmployeeForecast {
  const choices = assumedChoices(state.choices);
  return toForecast(choices, run(choices));
}

/**
 * Choose the current week's action (may replace a choice not yet settled). Throws RuleError("not_playing")
 * after a crash or completion and RuleError("invalid_choice") for anything that is not a current-week choice.
 */
export function chooseEmployeeAction(state: EmployeeState, choiceId: EmployeeChoiceId): EmployeeState {
  if (state.status !== "playing") throw new RuleError("not_playing", `level 2 is ${state.status}`);
  if (!EmployeeChoiceIdSchema.safeParse(choiceId).success) throw new RuleError("invalid_choice", `unknown choice ${String(choiceId)}`);
  return { ...state, choices: setChoice(state.choices, state.week, choiceId), emitted: [] };
}

/**
 * Settle the current week exactly once. Throws RuleError("not_playing") after a crash or completion and
 * RuleError("choice_missing") before the week's choice. A crash stops the game (status "crashed", event
 * `crash`); week 3 completes it (event `lapWon` with `stars: []`, the star count is employeeScore);
 * any other week emits `quietWeek` and moves on.
 */
export function resolveEmployeeWeek(state: EmployeeState): EmployeeWeekResolution {
  if (state.status !== "playing") throw new RuleError("not_playing", `level 2 is ${state.status}`);
  const week = state.week;
  if (choiceOfWeek(state.choices, week) === null) throw new RuleError("choice_missing", `week ${week} has no choice`);
  const def = weekDef(week);
  const r = run(assumedChoices(state.choices));
  const weekPoints = r.points.filter((p) => p.date >= def.start && p.date <= def.end);
  const weeksResolved = [...state.weeksResolved, week];

  const crash = r.crash !== null && r.crash.date <= def.end ? r.crash : null;
  if (crash !== null) {
    const transactions: EmployeeTransaction[] = [];
    for (const p of weekPoints.filter((pt) => pt.date <= crash.date)) {
      for (const t of p.transactions) {
        if (p.date === crash.date && t.id === crash.transactionId) break;
        transactions.push(t);
      }
    }
    const events: EngineEvent[] = [{ type: "crash", week, crash }];
    const next: EmployeeState = {
      ...state,
      status: "crashed",
      weeksResolved,
      booked: [...state.booked, ...transactions],
      crash,
      emitted: events,
    };
    return { state: next, week, transactions, endBalance: null, crash, events };
  }

  const transactions = weekPoints.flatMap((p) => p.transactions);
  const last = weekPoints[weekPoints.length - 1];
  const completed = week === 3;
  const events: EngineEvent[] = completed ? [{ type: "lapWon", week, stars: [] }] : [{ type: "quietWeek", week }];
  const next: EmployeeState = {
    ...state,
    week: completed ? week : nextWeek(week),
    status: completed ? "completed" : "playing",
    weeksResolved,
    balance: last.balance,
    reserved: last.reserved,
    booked: [...state.booked, ...transactions],
    emitted: events,
  };
  return { state: next, week, transactions, endBalance: last.balance, crash: null, events };
}

/**
 * Rebuild a game from choices by replaying the weeks. `resolved` weeks are settled; the next week may
 * hold a pending choice. Throws RuleError("invalid_save") when the choices cannot be replayed.
 */
function replay(choices: EmployeeChoices, resolved: number): EmployeeState {
  let state = createEmployeeGame();
  for (const week of WEEKS) {
    const choice = choiceOfWeek(choices, week);
    if (week <= resolved) {
      if (state.status !== "playing") throw new RuleError("invalid_save", `week ${week} settled after the game ended`);
      if (choice === null) throw new RuleError("invalid_save", `week ${week} settled without a choice`);
      state = resolveEmployeeWeek(chooseEmployeeAction(state, choice)).state;
    } else if (choice !== null) {
      if (week !== resolved + 1 || state.status !== "playing") {
        throw new RuleError("invalid_save", `week ${week} has a choice but is not the current week`);
      }
      state = chooseEmployeeAction(state, choice);
    }
  }
  return { ...state, emitted: [] };
}

/**
 * Back to the start of `week` (1 … current week): the choices of earlier weeks stay, the rest are
 * cleared, the state is replayed from data. Throws RuleError("invalid_week") for a week outside 1–3 and
 * RuleError("no_snapshot") for a week not reached yet. Emits nothing.
 */
export function rewindEmployeeGame(state: EmployeeState, week: EmployeeWeek): EmployeeState {
  if (!isEmployeeWeek(week)) throw new RuleError("invalid_week", `level 2 has no week ${String(week)}`);
  if (week > state.week) throw new RuleError("no_snapshot", `week ${week} not reached yet`);
  const kept = WEEKS.filter((w) => w < week).reduce<EmployeeChoices>((acc, w) => {
    const choice = choiceOfWeek(state.choices, w);
    return choice === null ? acc : setChoice(acc, w, choice);
  }, { hiring: null, invoice: null, tax: null });
  return replay(kept, week - 1);
}

/** Stars and the outcome. 0 stars unless completed; completed = 2, +1 when the tax reserve was fully funded. */
export function employeeScore(state: EmployeeState): EmployeeScore {
  const completed = state.status === "completed";
  const reserve = completed ? run(assumedChoices(state.choices)).reserve : null;
  const reserveFunded = reserve?.fullyFunded ?? false;
  const stars = completed ? level2.stars.completed + (reserveFunded ? level2.stars.reserveFunded : 0) : 0;
  return {
    status: state.status,
    stars,
    maxStars: level2.stars.max,
    finalBalance: completed ? state.balance : null,
    hired: state.choices.hiring === "hire",
    reserveFunded,
    crash: state.crash,
  };
}

/**
 * Rebuild a game from a `pilot.employee.v1` save (any JSON value). Only schemaVersion, level, choices
 * and weeksResolved are read and validated; balances, reserve and booked rows are recomputed, never
 * trusted. weeksResolved must be 1 … k in order. Throws RuleError("invalid_save") otherwise. Emits nothing.
 */
export function restoreEmployeeGame(saved: unknown): EmployeeState {
  const parsed = EmployeeSaveSchema.safeParse(saved);
  if (!parsed.success) throw new RuleError("invalid_save", parsed.error.message);
  const { choices, weeksResolved } = parsed.data;
  if (!weeksResolved.every((w, i) => w === i + 1)) throw new RuleError("invalid_save", "weeksResolved is not 1 … k in order");
  return replay(choices, weeksResolved.length);
}

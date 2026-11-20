// Engine types for level 1 „Przetrwaj grudzień”. Integer PLN, ISO dates (UTC calendar).
import type { z } from "zod";
import type {
  ActionCardSchema,
  AgentIdSchema,
  AgentIntentSchema,
  AgentOutcomeSchema,
  AgentsFileSchema,
  CardEffectSchema,
  CardIdSchema,
  CompetenceIdSchema,
  CompetenceLevelSchema,
  CounterpartyIdSchema,
  CounterpartySchema,
  DisabledReasonTextKeySchema,
  EmotionSchema,
  EngineEventTypeSchema,
  EventCardSchema,
  EventChoiceIdSchema,
  EventIdSchema,
  FutureScriptFileSchema,
  InvoiceIdSchema,
  InvoiceStateSchema,
  LedgerEntrySchema,
  LedgerIdSchema,
  LedgerKindSchema,
  Level1FileSchema,
  PersonaFileSchema,
  PlanDirectionSchema,
  ReactionsFileSchema,
  StarIdSchema,
  WeekNumberSchema,
} from "./schema";

// ---------- primitives ----------

/** ISO calendar date `YYYY-MM-DD`, UTC calendar. */
export type IsoDate = string;
/** Integer PLN; inflow > 0, outflow < 0. */
export type Pln = number;

export type WeekNumber = z.infer<typeof WeekNumberSchema>;
export type CardId = z.infer<typeof CardIdSchema>;
export type EventId = z.infer<typeof EventIdSchema>;
export type EventChoiceId = z.infer<typeof EventChoiceIdSchema>;
export type CounterpartyId = z.infer<typeof CounterpartyIdSchema>;
export type LedgerId = z.infer<typeof LedgerIdSchema>;
export type LedgerKind = z.infer<typeof LedgerKindSchema>;
export type InvoiceId = z.infer<typeof InvoiceIdSchema>;
export type InvoiceState = z.infer<typeof InvoiceStateSchema>;
export type CompetenceId = z.infer<typeof CompetenceIdSchema>;
/** 0 unpractised · 1 observed/delegated · 2 own decision · 3 validated on the account. */
export type CompetenceLevel = z.infer<typeof CompetenceLevelSchema>;
export type StarId = z.infer<typeof StarIdSchema>;
export type AgentId = z.infer<typeof AgentIdSchema>;
export type AgentIntent = z.infer<typeof AgentIntentSchema>;
export type AgentOutcome = z.infer<typeof AgentOutcomeSchema>;
export type PlanDirection = z.infer<typeof PlanDirectionSchema>;
export type Emotion = z.infer<typeof EmotionSchema>;
export type EngineEventType = z.infer<typeof EngineEventTypeSchema>;
export type DisabledReasonTextKey = z.infer<typeof DisabledReasonTextKeySchema>;

// ---------- data files ----------

export type PersonaFile = z.infer<typeof PersonaFileSchema>;
export type Level1File = z.infer<typeof Level1FileSchema>;
export type AgentsFile = z.infer<typeof AgentsFileSchema>;
export type FutureScriptFile = z.infer<typeof FutureScriptFileSchema>;
export type ReactionsFile = z.infer<typeof ReactionsFileSchema>;
export type Counterparty = z.infer<typeof CounterpartySchema>;
export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;
export type ActionCard = z.infer<typeof ActionCardSchema>;
export type CardEffect = z.infer<typeof CardEffectSchema>;
export type EventCard = z.infer<typeof EventCardSchema>;

// ---------- status ----------

export type GameStatus = "playing" | "crashed" | "completed";
/** open = not decided yet (lap running) · pending = Pilot waits for the plan save · earned · missed. */
export type StarStatus = "open" | "pending" | "earned" | "missed";
export type PlanStatus = "open" | "met" | "missed" | "ask";

// ---------- forecast ----------

/** Where a forecast transaction comes from (ARCHITECTURE §4 ForecastEvent.source). */
export type TransactionSource = "known" | "recurring" | "card" | "event";

export interface Transaction {
  /** Ledger id (L01…), card id (C1…), or event effect id (E1, E2-S2…); C5 repayment uses `C5-R`. */
  id: string;
  /** Booked date after the business-day shift (U-12). */
  date: IsoDate;
  amount: Pln;
  counterpartyId: CounterpartyId;
  title: string;
  source: TransactionSource;
  /** Ledger kind for ledger rows, null for card/event rows. */
  kind: LedgerKind | null;
  cardId: CardId | null;
  eventId: EventId | null;
}

/** End-of-day balance. Transactions are listed inflows first (U-10). */
export interface ForecastPoint {
  date: IsoDate;
  balance: Pln;
  /** Sum of `transactions` equals the change against the previous day's balance. */
  transactions: Transaction[];
  /** True for every point after a crash ("Prognoza bez działania"). */
  counterfactual: boolean;
  /** E-07: lap week of the date; null outside the lap (21–22 XI). */
  week: WeekNumber | null;
  /** E-07: balance before the day's transactions (previous end of day; 38 000 on 21 XI). */
  openingBalance: Pln;
  /** E-07: sum of the day's inflows (≥ 0). */
  inflow: Pln;
  /** E-07: sum of the day's outflows (≤ 0, signed). */
  outflow: Pln;
  /** E-07: inflow + outflow = balance − openingBalance. */
  change: Pln;
}

export interface BalanceAt {
  date: IsoDate;
  balance: Pln;
}

export interface Crash {
  week: WeekNumber;
  date: IsoDate;
  transactionId: string;
  /** −limit − balance, positive PLN. */
  shortfall: Pln;
}

export interface WeekEndBalance {
  week: WeekNumber;
  date: IsoDate;
  /** null when the lap stopped in or before this week. */
  balance: Pln | null;
}

export interface ForecastOptions {
  /** Default true: includes the scripted future E6 delay. False = known ledger only (E6 applies only if resolved). */
  includeFutureEvents?: boolean;
}

// ---------- Cash Flow drilldown (E-07, G12/G30/G32) ----------

/** Lowest end-of-day balance over the lap (23 XI … 10 I), earliest date on a tie, crash or not. */
export interface CashFlowMinimum extends BalanceAt {
  /** True when the minimum lies after the crash (label „Prognoza bez działania”). */
  counterfactual: boolean;
}

/** Headline numbers of one series. */
export interface CashFlowSummary {
  minimum: CashFlowMinimum;
  crash: Crash | null;
  /** Balance on 10 I; counterfactual when `crash` is set. */
  endBalance: Pln;
}

/** A full daily series (used for the „Bez działania” baseline). */
export interface CashFlowSeries extends CashFlowSummary {
  points: ForecastPoint[];
  weekEnds: WeekEndBalance[];
  overdraftLimit: Pln;
  /** Transactions dated after the last point (outside the chart). */
  afterLap: Transaction[];
}

/** One date of a before/after comparison. */
export interface CashFlowDay {
  date: IsoDate;
  week: WeekNumber | null;
  before: Pln;
  after: Pln;
  /** after − before. */
  delta: Pln;
  beforeCounterfactual: boolean;
  afterCounterfactual: boolean;
}

/** „Przed decyzją / Po decyzji”: the same dates, the two summaries and the transactions that differ. */
export interface CashFlowComparison {
  days: CashFlowDay[];
  before: CashFlowSummary;
  after: CashFlowSummary;
  /** Transactions of `after` that `before` does not have (same id, date and amount), any date. */
  added: Transaction[];
  /** Transactions of `before` that `after` does not have, any date (a moved row is removed + added). */
  removed: Transaction[];
}

/**
 * Status of one row of the „Zadania” list:
 * booked = in a week already settled · upcoming = not settled yet · rejected = the crash transaction ·
 * stopped = after the crash (the lap stopped; counterfactual).
 */
export type CashFlowTaskStatus = "booked" | "upcoming" | "rejected" | "stopped";

/** One dated transaction of the lap in booking order, with its running balance. */
export interface CashFlowTask extends Transaction {
  counterpartyName: string;
  week: WeekNumber | null;
  /** Running balance right after this transaction. */
  balanceAfter: Pln;
  status: CashFlowTaskStatus;
}

export interface Forecast {
  /** 21 XI 2026 (account today) … 10 I 2027. */
  from: IsoDate;
  to: IsoDate;
  points: ForecastPoint[];
  weekEnds: WeekEndBalance[];
  crash: Crash | null;
  /** Lowest end-of-day balance over the lap; null when crashed. */
  low: BalanceAt | null;
  /** Balance on 10 I; null when crashed. */
  endBalance: Pln | null;
  /** Counterfactual run past the crash (lap not stopped); null without crash. */
  counterfactual: { low: BalanceAt; endBalance: Pln } | null;
  overdraftLimit: Pln;
  /** round(Σ max(0, −EOD balance) × 0.12 / 365), not posted to the balance. */
  overdraftInterest: Pln;
  /** Paliwo: floor(max(0, balance at the start of the current week) / 900); 42 at the start. */
  runwayDays: number;
  /** E-07: lowest lap balance whether or not the lap crashed (the storm marker). */
  minimum: CashFlowMinimum;
  /** E-07: cards whose effects this forecast includes (played order); empty = this forecast is the baseline. */
  committedCards: CardId[];
  /** E-07: „Bez działania” — the same state with no card played (events and choices kept). */
  baseline: CashFlowSeries;
  /** E-07: baseline (before) against this forecast (after, „Po zatwierdzeniu”). */
  vsBaseline: CashFlowComparison;
  /** E-07: „Zadania” — every transaction of the forecast range in booking order. */
  tasks: CashFlowTask[];
  /** E-07: transactions dated after `to` (e.g. C5-R on 20 I, Klient A moved to 22 I by E6). */
  afterLap: Transaction[];
}

// ---------- cards ----------

export type DisabledReasonCode =
  | "not_playing"
  | "event_unresolved"
  | "week_action_used"
  | "already_played"
  | "outside_window"
  | "budget_closed"
  | "bank_too_late"
  | "invoice_financed"
  | "invoice_paid"
  | "payment_already_booked"
  | "overdraft_active";

export interface DisabledReason {
  code: DisabledReasonCode;
  /** Polish text where the specification gives one; otherwise null and the copy deck renders `card.disabled.<code>`. */
  text: string | null;
}

export interface CardView {
  id: CardId;
  key: number;
  title: string;
  labels: string[];
  window: { from: WeekNumber; to: WeekNumber };
  played: boolean;
  playable: boolean;
  disabledReason: DisabledReason | null;
  /** C2 in T5: still playable, shown as "too late". */
  tooLate: boolean;
  /** Fixed cost in PLN; for C4 the overdraft interest is added by the engine (see `costIsEstimate`). */
  cost: Pln;
  costIsEstimate: boolean;
  relationsDelta: number;
  competenceId: CompetenceId | null;
  isProduct: boolean;
}

export interface CardPreview {
  cardId: CardId;
  playable: boolean;
  disabledReason: DisabledReason | null;
  /** Forecast of the live state. */
  before: Forecast;
  /** Forecast of the simulated state after the card. */
  after: Forecast;
  /** Simulated state; never committed. */
  simulated: GameState;
  cost: Pln;
  relationsDelta: number;
  /** E-07: `before` against `after` for G32 „Przed decyzją / Po decyzji”. */
  comparison: CashFlowComparison;
}

// ---------- events ----------

export interface EventChoiceView {
  id: EventChoiceId;
  /** Polish label where the specification quotes one; otherwise the copy deck owns it. */
  label: string | null;
}

export interface CurrentEvent {
  id: EventId;
  week: WeekNumber;
  title: string;
  choices: EventChoiceView[];
}

export interface ResolvedEvent {
  eventId: EventId;
  week: WeekNumber;
  choiceId: EventChoiceId;
  delegated: boolean;
}

export interface PlayedCard {
  cardId: CardId;
  week: WeekNumber;
  delegated: boolean;
  /** Cost booked at play time (C4 interest is added at lap end). */
  cost: Pln;
}

// ---------- negotiation ----------

export interface AgentThread {
  /** Messages sent this week (max 3). */
  messagesThisWeek: number;
  /** Klient A counter-offer (30 %) awaiting accept. */
  counterPending: boolean;
}

export interface NegotiationResult {
  state: GameState;
  agent: AgentId;
  intent: AgentIntent;
  outcome: AgentOutcome;
  /** Cached line id the narrative layer renders (`a.advance.counter`, `bank.od.late`…). */
  lineId: string;
  /** Card whose effect was applied, if any (C1, C2, C4). */
  appliedCardId: CardId | null;
  counterPercent: number | null;
  /** True when the message limit is reached: quick replies only. */
  blocked: boolean;
  /** Every number the reply may mention (number guardrail). */
  numbers: Pln[];
}

// ---------- AI-CFO ----------

export interface CfoOption {
  cardId: CardId;
  cost: Pln;
}

export interface CfoHint {
  week: WeekNumber;
  /** Earliest future crash in the current forecast; null when no risk. */
  risk: Crash | null;
  /** Up to two cheapest playable cards that remove the risk; products only as the last resort (D-17). */
  options: CfoOption[];
}

// ---------- plan and account clock ----------

export interface Plan {
  id: string;
  cardId: CardId;
  counterpartyId: CounterpartyId;
  amount: Pln;
  tolerancePct: number;
  deadline: IsoDate;
  direction: PlanDirection;
  title: string;
  status: PlanStatus;
  savedAt: IsoDate | null;
}

export interface AccountState {
  /** Account clock; starts 21 XI 2026, independent of the game week. */
  clock: IsoDate;
  balance: Pln;
  plans: Plan[];
  matchedTx: Transaction[];
}

// ---------- engine events (ENGINE-DATA-AND-TESTS §6) ----------

export type EngineEvent =
  | { type: "lapStart"; week: WeekNumber }
  | { type: "playerReturns"; week: WeekNumber }
  | { type: "bigProject"; week: WeekNumber; eventId: "E2" }
  | { type: "negotiationOpen"; week: WeekNumber; agent: AgentId }
  | { type: "lateClient"; week: WeekNumber; eventId: "E6"; newDate: IsoDate | null }
  | { type: "loanOffered"; week: WeekNumber; via: "E5" | "C5_preview" }
  /**
   * D-18: the payment to the changed account (E1 „Zapłać jak jest”) is reported as fraud.
   * `ledgerId`/`amount` are the booked ledger row (signed, outflow < 0), `date` the reveal date.
   */
  | { type: "fraudRevealed"; week: WeekNumber; eventId: EventId; ledgerId: LedgerId; amount: Pln; date: IsoDate }
  | { type: "goodMove"; week: WeekNumber; cardId: CardId }
  | { type: "crash"; week: WeekNumber; crash: Crash }
  | { type: "quietWeek"; week: WeekNumber }
  | { type: "lapWon"; week: WeekNumber; stars: StarId[] }
  | { type: "planValidated"; week: WeekNumber; planId: string };

/** True when A and B are the same type (strict, not mutual assignability). */
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type AssertTrue<T extends true> = T;
/**
 * Compile-time guard: the `type` tags of EngineEvent equal EngineEventTypeSchema (reactions.json).
 * Adding an event to one list without the other fails `pnpm typecheck`.
 */
export type EngineEventTypesInSync = AssertTrue<Equals<EngineEvent["type"], EngineEventType>>;

// ---------- state ----------

/** Everything a rewind restores. Snapshots hold GameCore only (no nested snapshots). */
export interface GameCore {
  level: 1;
  seed: string;
  week: WeekNumber;
  status: GameStatus;
  /** Cards still in hand (not yet played). */
  hand: CardId[];
  played: PlayedCard[];
  /** The optional action of the current week is used. */
  weekActionUsed: boolean;
  eventsResolved: ResolvedEvent[];
  /** Weeks already settled by resolveWeek. */
  weeksResolved: WeekNumber[];
  invoiceState: InvoiceState;
  overdraftLimit: Pln;
  /** Balance at the start of the current week (end of the previous settled week). */
  balance: Pln;
  relations: number;
  costOfMoney: Pln;
  competences: Record<CompetenceId, CompetenceLevel>;
  stars: Record<StarId, StarStatus>;
  crash: Crash | null;
  /** Lowest own end-of-day balance so far; null before the first settled week. */
  lowestBalance: BalanceAt | null;
  /** 2 400 − cost of money, set at lap end without crash. */
  avoidedCost: Pln | null;
  level2Unlocked: boolean;
  /** C5 terms revealed by E5 `show_cost`. */
  loanTermsShown: boolean;
  negotiation: Record<AgentId, AgentThread>;
}

export interface GameState {
  schemaVersion: 1;
  core: GameCore;
  /** Core at the start of each week, for rewind. */
  snapshots: Partial<Record<WeekNumber, GameCore>>;
  /** Separate account clock and saved plans; preserved by rewind, cleared by reset. */
  account: AccountState;
  /** Engine events emitted by the last transition (replaced on every call). */
  emitted: EngineEvent[];
}

export interface WeekResolution {
  state: GameState;
  week: WeekNumber;
  transactions: Transaction[];
  /** null when the week crashed. */
  endBalance: Pln | null;
  crash: Crash | null;
  events: EngineEvent[];
}

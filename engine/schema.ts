// Zod schemas for every data/*.json file. Data types are inferred from these schemas.
import { z } from "zod";

// ---------- shared primitives ----------

/** ISO calendar date `YYYY-MM-DD`, interpreted in UTC. */
export const IsoDateSchema = z.iso.date();
/** Integer PLN (signed: inflow > 0, outflow < 0). */
export const PlnSchema = z.number().int();

export const WeekNumberSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);

export const WeekRangeSchema = z
  .object({ from: WeekNumberSchema, to: WeekNumberSchema })
  .refine((r) => r.from <= r.to, { message: "week range from > to" });

export const CardIdSchema = z.enum(["C1", "C2", "C3", "C4", "C5", "C6"]);
export const EventIdSchema = z.enum(["E1", "E2", "E3", "E5", "E6"]);
export const EventChoiceIdSchema = z.enum([
  "check",
  "pay_as_is",
  "accept",
  "decline",
  "now",
  "january",
  "show_cost",
  "ignore",
  "acknowledge",
]);
export const CounterpartyIdSchema = z.enum(["A", "B", "C", "S1", "S2", "O", "US", "ZUS", "BANK", "N"]);
export const CounterpartyTypeSchema = z.enum(["client", "supplier", "public", "bank", "non_bank_lender"]);
export const LedgerIdSchema = z.enum(["L01", "L02", "L03", "L04", "L05", "L06", "L07", "L08", "L09", "L10", "L11"]);
export const LedgerKindSchema = z.enum(["obligation", "receivable", "recurring", "committed"]);
export const InvoiceIdSchema = z.literal("INV-A1");
export const InvoiceStateSchema = z.enum(["pending", "discounted", "factored", "paid"]);
export const CompetenceIdSchema = z.enum(["luka_plynnosciowa", "koszt_pieniadza", "bezpieczne_platnosci"]);
export const CompetenceLevelSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);
export const StarIdSchema = z.enum(["przetrwanie", "tanio", "pilot"]);
export const AgentIdSchema = z.enum(["klient_a", "bank"]);
export const DisabledReasonTextKeySchema = z.enum([
  "budget_closed",
  "bank_too_late",
  "invoice_financed",
  "invoice_paid",
  "already_played",
]);

// ---------- persona.json ----------

export const CounterpartySchema = z.object({
  id: CounterpartyIdSchema,
  name: z.string().min(1),
  type: CounterpartyTypeSchema,
  revenueSharePct: z.number().int().min(0).max(100).nullable(),
  termsDays: z.number().int().min(0).nullable(),
  note: z.string(),
});

export const LedgerEntrySchema = z.object({
  id: LedgerIdSchema,
  /** Booked date (already moved to a business day). */
  date: IsoDateSchema,
  /** Statutory or contractual due date before the business-day shift. */
  dueDate: IsoDateSchema,
  amount: PlnSchema.refine((n) => n !== 0, { message: "zero amount" }),
  counterpartyId: CounterpartyIdSchema,
  title: z.string().min(1),
  kind: LedgerKindSchema,
});

export const InvoiceSchema = z.object({
  id: InvoiceIdSchema,
  counterpartyId: CounterpartyIdSchema,
  gross: PlnSchema.positive(),
  expectedDate: IsoDateSchema,
  ledgerId: LedgerIdSchema,
  state: InvoiceStateSchema,
});

export const PersonaFileSchema = z.object({
  synthetic: z.literal(true),
  persona: z.object({
    name: z.string().min(1),
    business: z.string().min(1),
    legalForm: z.string().min(1),
    employees: z.number().int().min(0),
  }),
  account: z.object({
    openingBalance: PlnSchema,
    openingDate: IsoDateSchema,
    monthlyFixedCosts: PlnSchema.positive(),
  }),
  counterparties: z.array(CounterpartySchema).min(1),
  ledger: z.array(LedgerEntrySchema).min(1),
  invoices: z.array(InvoiceSchema).min(1),
});

// ---------- level1.json ----------

const DatedWeekSchema = z.object({ week: WeekNumberSchema, date: IsoDateSchema });

export const CardEligibilitySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("negotiation"), agent: AgentIdSchema }),
  z.object({ type: z.literal("invoice_state"), invoiceId: InvoiceIdSchema, state: InvoiceStateSchema }),
  z.object({ type: z.literal("ledger_not_booked"), ledgerId: LedgerIdSchema }),
  z.object({ type: z.literal("overdraft_inactive") }),
]);

export const CardEffectSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("inflow"),
    date: IsoDateSchema,
    amount: PlnSchema.positive(),
    counterpartyId: CounterpartyIdSchema,
    title: z.string().min(1),
  }),
  z.object({
    type: z.literal("discount"),
    invoiceId: InvoiceIdSchema,
    discountPct: z.number().positive(),
    amount: PlnSchema.positive(),
    counterpartyId: CounterpartyIdSchema,
    title: z.string().min(1),
    invoiceStateAfter: InvoiceStateSchema,
    payoutDates: z.array(DatedWeekSchema).min(1),
  }),
  z.object({ type: z.literal("move_ledger"), ledgerId: LedgerIdSchema, newDate: IsoDateSchema }),
  z.object({ type: z.literal("overdraft"), limit: PlnSchema.positive() }),
  z.object({
    type: z.literal("loan"),
    amount: PlnSchema.positive(),
    counterpartyId: CounterpartyIdSchema,
    title: z.string().min(1),
    inflowDates: z.array(DatedWeekSchema).min(1),
    repayment: z.object({ date: IsoDateSchema, amount: PlnSchema.negative(), title: z.string().min(1) }),
  }),
  z.object({
    type: z.literal("factoring"),
    invoiceId: InvoiceIdSchema,
    feeRate: z.number().positive(),
    fee: PlnSchema.positive(),
    amount: PlnSchema.positive(),
    counterpartyId: CounterpartyIdSchema,
    title: z.string().min(1),
    invoiceStateAfter: InvoiceStateSchema,
    payoutDates: z.array(DatedWeekSchema).min(1),
  }),
]);

export const CompetenceAwardSchema = z.object({
  id: CompetenceIdSchema,
  own: CompetenceLevelSchema,
  delegated: CompetenceLevelSchema,
});

export const ActionCardSchema = z.object({
  id: CardIdSchema,
  key: z.number().int().min(1).max(6),
  title: z.string().min(1),
  window: WeekRangeSchema,
  /** Week from which the card is still playable but shown in its "too late" state (C2 in T5). */
  tooLateFrom: WeekNumberSchema.nullable(),
  /** Disabled-reason text key once the window has passed, when the specification names one. */
  afterWindowReason: DisabledReasonTextKeySchema.nullable(),
  eligibility: z.array(CardEligibilitySchema),
  effect: CardEffectSchema,
  cost: z.object({ fixed: PlnSchema.min(0), overdraftInterest: z.boolean() }),
  relationsDelta: z.number().int(),
  competence: CompetenceAwardSchema.nullable(),
  isProduct: z.boolean(),
  exclusiveWith: z.array(CardIdSchema),
  labels: z.array(z.string().min(1)),
});

export const EventEffectSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("transaction"),
    id: z.string().min(1),
    date: IsoDateSchema,
    amount: PlnSchema,
    counterpartyId: CounterpartyIdSchema,
    title: z.string().min(1),
  }),
  // Fraud reveal (E1 pay_as_is): the ledger payment that went to the changed account, reported on `date`.
  z.object({ type: z.literal("reveal"), date: IsoDateSchema, what: z.literal("fraud"), ledgerId: LedgerIdSchema }),
  z.object({ type: z.literal("reveal_card"), cardId: CardIdSchema }),
  z.object({
    type: z.literal("move_invoice"),
    invoiceId: InvoiceIdSchema,
    ledgerId: LedgerIdSchema,
    newDate: IsoDateSchema,
    requiresInvoiceState: InvoiceStateSchema,
  }),
]);

export const EventChoiceSchema = z.object({
  id: EventChoiceIdSchema,
  /** Polish label where the specification quotes one; otherwise the copy deck owns it. */
  label: z.string().min(1).nullable(),
  effects: z.array(EventEffectSchema),
  competence: CompetenceAwardSchema.nullable(),
});

export const EventConditionSchema = z.enum(["always", "gap_open", "forced"]);

export const EventCardSchema = z.object({
  id: EventIdSchema,
  week: WeekNumberSchema,
  title: z.string().min(1),
  condition: EventConditionSchema,
  choices: z.array(EventChoiceSchema).min(1),
});

export const StarRuleSchema = z.object({
  id: StarIdSchema,
  title: z.string().min(1),
  rule: z.enum(["lap_completed_without_crash", "cost_and_relations", "own_balance_and_plan"]),
  maxCostOfMoney: PlnSchema.nullable(),
  requiredRelations: z.number().int().nullable(),
  minOwnBalance: PlnSchema.nullable(),
});

export const Level1FileSchema = z.object({
  level: z.literal(1),
  title: z.string().min(1),
  synthetic: z.literal(true),
  lap: z.object({ forecastStart: IsoDateSchema, start: IsoDateSchema, end: IsoDateSchema }),
  weeks: z
    .array(z.object({ week: WeekNumberSchema, start: IsoDateSchema, end: IsoDateSchema }))
    .length(7),
  holidays: z.array(IsoDateSchema),
  markers: z.array(
    z.object({ id: z.string().min(1), label: z.string().min(1), dueDate: IsoDateSchema, date: IsoDateSchema }),
  ),
  rules: z.object({
    runwayDailyCost: PlnSchema.positive(),
    relationsStart: z.number().int(),
    relationsMax: z.number().int(),
    postponementRelationsDelta: z.number().int(),
    rudeRelationsDelta: z.number().int(),
    overdraftInterestRatePerYear: z.number().positive(),
    daysInYear: z.number().int().positive(),
    defaultCostOfMoney: PlnSchema.positive(),
    competenceMax: z.literal(3),
    maxActionsPerWeek: z.literal(1),
    sameDayOrder: z.literal("inflows_first"),
  }),
  disabledReasons: z.record(DisabledReasonTextKeySchema, z.string().min(1)),
  commonLabels: z.array(z.string().min(1)),
  competences: z.array(z.object({ id: CompetenceIdSchema, title: z.string().min(1) })).length(3),
  cards: z.array(ActionCardSchema).length(6),
  events: z.array(EventCardSchema).min(1),
  seeds: z.record(z.string().min(1), z.array(z.object({ week: WeekNumberSchema, eventId: EventIdSchema }))),
  stars: z.array(StarRuleSchema).length(3),
  unlock: z.object({ level: z.literal(2), minStars: z.number().int().min(1) }),
});

// ---------- agents.json ----------

export const AgentIntentSchema = z.enum([
  "ask_advance",
  "accept_counter",
  "offer_discount",
  "rude",
  "ask_overdraft",
  "unknown",
]);
export const AgentOutcomeSchema = z.enum(["accept", "counter", "refuse", "inform_allow", "quick_replies", "blocked"]);
export const AgentConditionSchema = z.enum([
  "none",
  "percent_at_most_30",
  "percent_above_30",
  "counter_pending",
  "invoice_pending",
  "gap_closed",
]);

export const AgentRuleSchema = z.object({
  intent: AgentIntentSchema,
  /** null = any week. */
  weeks: WeekRangeSchema.nullable(),
  condition: AgentConditionSchema,
  outcome: AgentOutcomeSchema,
  cardId: CardIdSchema.nullable(),
  counterPercent: z.number().int().positive().nullable(),
  relationsDelta: z.number().int(),
  lineId: z.string().min(1),
  text: z.string().min(1).nullable(),
});

export const AgentDefinitionSchema = z.object({
  name: z.string().min(1),
  maxMessagesPerWeek: z.number().int().positive(),
  neverOffers: z.array(CardIdSchema),
  /** Evaluated in order; the first matching rule wins. */
  rules: z.array(AgentRuleSchema).min(1),
});

export const AgentsFileSchema = z.object({
  klient_a: AgentDefinitionSchema,
  bank: AgentDefinitionSchema,
  cfo: z.object({
    name: z.string().min(1),
    hintsPerWeek: z.number().int().positive(),
    optionCount: z.number().int().positive(),
    delegatedCompetenceLevel: CompetenceLevelSchema,
  }),
});

// ---------- future-script.json ----------

export const PlanDirectionSchema = z.enum(["inflow", "outflow"]);

export const PlanTemplateSchema = z.object({
  cardId: CardIdSchema,
  counterpartyId: CounterpartyIdSchema,
  amount: PlnSchema.positive(),
  tolerancePct: z.number().int().min(0),
  deadline: IsoDateSchema,
  direction: PlanDirectionSchema,
  title: z.string().min(1),
});

export const FutureScriptFileSchema = z.object({
  synthetic: z.literal(true),
  accountClock: z.object({ start: IsoDateSchema, defaultTarget: IsoDateSchema }),
  replay: z.array(
    z.object({
      date: IsoDateSchema,
      source: z.enum(["ledger", "card"]),
      ledgerId: LedgerIdSchema.nullable(),
      cardId: CardIdSchema.nullable(),
      amount: PlnSchema,
      counterpartyId: CounterpartyIdSchema,
      title: z.string().min(1),
    }),
  ),
  matcher: z.object({ tolerancePct: z.number().int().min(0) }),
  planTemplates: z.array(PlanTemplateSchema),
  variantB: z.array(CardIdSchema),
});

// ---------- reactions.json ----------

export const EngineEventTypeSchema = z.enum([
  "lapStart",
  "playerReturns",
  "bigProject",
  "negotiationOpen",
  "lateClient",
  "loanOffered",
  "goodMove",
  "crash",
  "quietWeek",
  "lapWon",
  "planValidated",
]);

export const EmotionSchema = z.enum([
  "welcoming",
  "excited",
  "confident",
  "suspicious",
  "proud",
  "exasperated",
  "supportive",
  "relaxed",
  "delighted",
]);

export const ReactionsFileSchema = z.object({
  cooldown: z.object({
    maxReactionsPerWeekResolution: z.number().int().positive(),
    sceneChangeCancels: z.boolean(),
  }),
  reactions: z
    .array(
      z.object({
        event: EngineEventTypeSchema,
        steps: z.array(z.object({ emotion: EmotionSchema, lineIdPrefix: z.string().regex(/^rx\./) })).min(1),
      }),
    )
    .min(1),
});

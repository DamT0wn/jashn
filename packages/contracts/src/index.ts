import { z } from 'zod';

export const LIMITS = { bodyBytes: 524_288, budgetLines: 100, tasks: 200, vendors: 100, ideas: 50, notes: 2_000 } as const;
const text = (max: number = LIMITS.notes) => z.string().trim().min(1).max(max);
export const IdSchema = z.string().min(1).max(128).regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/);
export const MoneyMinorSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
export const VersionSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
export const CurrencySchema = z.literal('INR');
export const LocalDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return value.slice(0, 4) !== '0000' && !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}, 'Invalid calendar date');
export const TimestampSchema = z.string().datetime({ offset: true });
export const TimezoneSchema = z.string().min(1).max(100).refine(value => {
  try { new Intl.DateTimeFormat('en', { timeZone: value }); return true; } catch { return false; }
}, 'Use a valid IANA timezone');
export const ProvenanceSchema = z.object({
  sourceType: z.enum(['ai_estimate', 'template_estimate', 'organizer_estimate', 'confirmed_quote', 'synthetic']),
  note: text().optional(),
}).strict();

export const EventBriefSchema = z.object({
  name: text(120), type: z.enum(['wedding', 'birthday', 'community']), city: text(100),
  localDate: LocalDateSchema, timezone: TimezoneSchema,
  guests: z.number().int().min(1).max(100_000), currency: CurrencySchema,
  budgetMinor: MoneyMinorSchema.refine(value => value > 0, 'Budget must be positive'),
  briefText: text(5_000).optional(), venueStatus: z.enum(['undecided', 'shortlisted', 'confirmed']).optional(),
  setting: z.enum(['indoor', 'outdoor', 'mixed', 'undecided']).optional(),
  priorities: z.array(text(160)).max(20),
  hardRequirements: z.array(text()).max(20),
  preferences: z.object({ theme: text().optional(), dietary: text().optional(), accessibility: text().optional(), cultural: text().optional(), notes: text().optional() }).strict(),
}).strict();

/** Creation has a clock-aware rule; reading historical briefs does not. */
export function createEventBriefSchema(now: Date) {
  if (Number.isNaN(now.valueOf())) throw new Error('A valid clock is required');
  return EventBriefSchema.superRefine((brief, context) => {
    if (!TimezoneSchema.safeParse(brief.timezone).success) return;
    const parts = new Intl.DateTimeFormat('en', { timeZone: brief.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const part = (kind: string) => parts.find(item => item.type === kind)?.value;
    const today = `${part('year')}-${part('month')}-${part('day')}`;
    if (brief.localDate < today) context.addIssue({ code: z.ZodIssueCode.custom, path: ['localDate'], message: 'Event date must be today or later in its timezone' });
  });
}

export const BudgetLineSchema = z.object({
  id: IdSchema, category: text(160), currency: CurrencySchema,
  allocationMinor: MoneyMinorSchema, estimatedCostMinor: MoneyMinorSchema,
  committedCostMinor: MoneyMinorSchema.nullable(), paidMinor: MoneyMinorSchema,
  locked: z.boolean(), provenance: ProvenanceSchema, rationale: text(),
}).strict();

export const ScheduleSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('date'), localDate: LocalDateSchema }).strict(),
  z.object({ kind: z.literal('timed'), startsAt: TimestampSchema, endsAt: TimestampSchema }).strict(),
]);
export const TaskSchema = z.object({
  id: IdSchema, title: text(160), kind: z.enum(['preparation', 'agenda', 'post_event']),
  schedule: ScheduleSchema, timezone: TimezoneSchema,
  dependencyIds: z.array(IdSchema).max(50), priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'done']), locked: z.boolean(), rationale: text(),
}).strict().superRefine((task, context) => {
  if (task.kind === 'agenda' && task.schedule.kind !== 'timed') context.addIssue({ code: z.ZodIssueCode.custom, path: ['schedule'], message: 'Agenda items require a timed schedule' });
  if (task.schedule.kind === 'timed' && Date.parse(task.schedule.endsAt) <= Date.parse(task.schedule.startsAt)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['schedule', 'endsAt'], message: 'End must follow start' });
  if (new Set(task.dependencyIds).size !== task.dependencyIds.length || task.dependencyIds.includes(task.id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['dependencyIds'], message: 'Dependencies must be distinct and exclude this task' });
});

export const VendorChecklistItemSchema = z.object({
  id: IdSchema, category: text(160), requiredBy: LocalDateSchema,
  questions: z.array(text()).min(1).max(20), documentsToRequest: z.array(text(160)).max(20),
  estimatedRange: z.object({ minMinor: MoneyMinorSchema, maxMinor: MoneyMinorSchema, currency: CurrencySchema, provenance: ProvenanceSchema }).strict().refine(range => range.minMinor <= range.maxMinor, 'Range minimum exceeds maximum'),
  manuallyEnteredName: text(160).optional(), contactNotes: text().optional(),
  status: z.enum(['researching', 'contacted', 'shortlisted', 'booked']),
  quote: z.object({ amountMinor: MoneyMinorSchema, currency: CurrencySchema, provenance: ProvenanceSchema }).strict().nullable(),
  linkedBudgetLineId: IdSchema.nullable(),
}).strict();

export const IdeaSchema = z.object({
  id: IdSchema, title: text(160), description: text(), preferenceMatch: text(),
  estimatedCostImpact: z.object({ direction: z.enum(['increase', 'decrease', 'neutral']), amountMinor: MoneyMinorSchema, currency: CurrencySchema, provenance: ProvenanceSchema }).strict(),
  status: z.enum(['suggested', 'saved', 'dismissed']),
}).strict();
export const FeasibilitySchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('feasible'), shortfallMinor: z.literal(0), reasons: z.array(text()).max(20) }).strict(),
  z.object({ status: z.literal('infeasible'), shortfallMinor: MoneyMinorSchema, reasons: z.array(text()).min(1).max(20) }).strict(),
]);

export const PlanSnapshotSchema = z.object({
  brief: EventBriefSchema, overview: text(), assumptions: z.array(text()).max(30),
  budgetLines: z.array(BudgetLineSchema).min(1).max(LIMITS.budgetLines), contingencyMinor: MoneyMinorSchema,
  tasks: z.array(TaskSchema).min(1).max(LIMITS.tasks),
  vendorChecklist: z.array(VendorChecklistItemSchema).min(1).max(LIMITS.vendors),
  ideas: z.array(IdeaSchema).min(1).max(LIMITS.ideas), warnings: z.array(text()).max(30),
  feasibility: FeasibilitySchema,
}).strict().superRefine((plan, context) => {
  for (const key of ['budgetLines', 'tasks', 'vendorChecklist', 'ideas'] as const) {
    if (new Set(plan[key].map(item => item.id)).size !== plan[key].length) context.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: 'Duplicate stable IDs' });
  }
});
export const GenerationMetadataSchema = z.object({
  source: z.enum(['gemini', 'manual', 'synthetic']), modelId: text(160).nullable(), promptVersion: text(80).nullable(),
  latencyMs: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  inputTokens: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER), outputTokens: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
}).strict();
export const PlanVersionSchema = z.object({
  id: IdSchema, eventId: IdSchema, schemaVersion: z.literal(1), version: VersionSchema.refine(value => value > 0),
  snapshot: PlanSnapshotSchema, acceptedAt: TimestampSchema, acceptedBy: IdSchema,
  generation: GenerationMetadataSchema, acknowledgedInfeasible: z.boolean(),
}).strict().refine(plan => plan.snapshot.feasibility.status !== 'infeasible' || plan.acknowledgedInfeasible, 'Infeasibility requires explicit acknowledgement');

export const RequestedChangesSchema = z.object({
  budgetMinor: MoneyMinorSchema.refine(value => value > 0).optional(), localDate: LocalDateSchema.optional(),
  guests: z.number().int().min(1).max(100_000).optional(),
  hardRequirements: z.array(text()).max(20).optional(),
}).strict().refine(value => Object.values(value).some(item => item !== undefined), 'At least one confirmed change is required');
export const ReplanProposalSchema = z.object({
  id: IdSchema, eventId: IdSchema, ownerId: IdSchema, baseVersion: VersionSchema,
  requestedChanges: RequestedChangesSchema, candidate: PlanSnapshotSchema,
  diff: z.array(z.object({ entity: z.enum(['brief', 'budget', 'task', 'vendor', 'idea', 'contingency']), entityId: IdSchema.nullable(), field: text(100), before: text().nullable(), after: text().nullable() }).strict()).max(500),
  preservedLockIds: z.array(IdSchema).max(300),
  validation: z.object({ schemaVersion: z.literal(1), rulesVersion: text(80), checkedAt: TimestampSchema }).strict(),
  status: z.enum(['draft', 'applied', 'discarded', 'expired']), createdAt: TimestampSchema, expiresAt: TimestampSchema,
  appliedVersion: VersionSchema.nullable(),
}).strict().superRefine((proposal, context) => {
  if (Date.parse(proposal.expiresAt) <= Date.parse(proposal.createdAt)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['expiresAt'], message: 'Expiry must follow creation' });
  if ((proposal.status === 'applied') !== (proposal.appliedVersion !== null)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['appliedVersion'], message: 'Only applied proposals have an accepted version' });
});

export const ApiErrorSchema = z.object({ error: z.object({
  code: z.enum(['INVALID_INPUT', 'UNAUTHENTICATED', 'NOT_FOUND', 'FORBIDDEN', 'VERSION_CONFLICT', 'INFEASIBLE', 'PROPOSAL_EXPIRED', 'USAGE_LIMIT', 'PROVIDER_UNAVAILABLE', 'PAYLOAD_TOO_LARGE', 'INTERNAL_ERROR']),
  message: text(500), requestId: text(128),
  fields: z.array(z.object({ path: text(160), message: text(300) }).strict()).max(50).optional(),
}).strict() }).strict();
export const HealthResponseSchema = z.object({ status: z.literal('ok'), service: z.literal('jashn-api'), schemaVersion: z.literal(1) }).strict();

// Client mutation envelopes deliberately exclude owner/audit/accepted-version fields.
export const CreateEventRequestSchema = z.object({ brief: EventBriefSchema }).strict();
export const GeneratePlanRequestSchema = z.object({ expectedVersion: VersionSchema }).strict();
export const AcceptDraftRequestSchema = z.object({ expectedVersion: VersionSchema, acknowledgeInfeasible: z.boolean() }).strict();
export const ReplanRequestSchema = z.object({ baseVersion: VersionSchema, changes: RequestedChangesSchema }).strict();
export const ApplyProposalRequestSchema = AcceptDraftRequestSchema;
export const IdempotencyKeySchema = z.string().uuid();

export type EventBrief = z.infer<typeof EventBriefSchema>;
export type BudgetLine = z.infer<typeof BudgetLineSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type VendorChecklistItem = z.infer<typeof VendorChecklistItemSchema>;
export type Idea = z.infer<typeof IdeaSchema>;
export type PlanSnapshot = z.infer<typeof PlanSnapshotSchema>;
export type PlanVersion = z.infer<typeof PlanVersionSchema>;
export type ReplanProposal = z.infer<typeof ReplanProposalSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Phase 05: server-owned event records and strict lifecycle envelopes.
export const EventRecordSchema = z.object({
  id: IdSchema, ownerId: IdSchema, brief: EventBriefSchema,
  status: z.enum(['active', 'archived', 'deleting']), revision: VersionSchema,
  currentVersion: VersionSchema.nullable(), createdAt: TimestampSchema, updatedAt: TimestampSchema,
}).strict();
export type EventRecord = z.infer<typeof EventRecordSchema>;
export const EditEventRequestSchema = z.object({ expectedVersion: VersionSchema, brief: EventBriefSchema }).strict();
export const EventVersionRequestSchema = z.object({ expectedVersion: VersionSchema }).strict();
export const DeleteEventRequestSchema = z.object({ expectedVersion: VersionSchema, confirmationName: text(120) }).strict();
export const EventListQuerySchema = z.object({
  status: z.enum(['active', 'archived']).default('active'),
  limit: z.string().regex(/^[1-9]\d?$/).transform(Number).refine(value => value <= 50).default('20'),
  cursor: z.string().min(1).max(2048).optional(),
}).strict();
export const EventListResponseSchema = z.object({ events: z.array(EventRecordSchema), nextCursor: z.string().nullable() }).strict();
export const EventResponseSchema = z.object({ event: EventRecordSchema }).strict();
export const EventDetailResponseSchema = z.object({ event: EventRecordSchema, plan: PlanSnapshotSchema.nullable() }).strict();
export const DeletionResponseSchema = z.object({ eventId: IdSchema, status: z.enum(['deleting', 'deleted', 'failed']) }).strict();

// A manual ledger is not an accepted AI plan. Empty ledgers are valid.
export const BudgetLedgerSchema = z.object({ lines: z.array(BudgetLineSchema).max(LIMITS.budgetLines), contingencyMinor: MoneyMinorSchema }).strict().refine(value => new Set(value.lines.map(line => line.id)).size === value.lines.length, 'Duplicate budget IDs');
export const SaveBudgetRequestSchema = z.object({ expectedVersion: VersionSchema, ledger: BudgetLedgerSchema, confirmCorrections: z.boolean(), reason: z.string().trim().max(500), acknowledgeShortfall: z.boolean() }).strict();
export const BudgetTotalsSchema = z.object({ projectedMinor: MoneyMinorSchema, paidMinor: MoneyMinorSchema, outstandingMinor: MoneyMinorSchema, creditMinor: MoneyMinorSchema, protectedMinor: MoneyMinorSchema, minimumShortfallMinor: MoneyMinorSchema, remainingMinor: z.number().int().min(-Number.MAX_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER), shortfallMinor: MoneyMinorSchema }).strict();
export const BudgetResponseSchema = z.object({ event: EventRecordSchema, ledger: BudgetLedgerSchema, totals: BudgetTotalsSchema }).strict();
export type BudgetLedger = z.infer<typeof BudgetLedgerSchema>;
export type BudgetResponse = z.infer<typeof BudgetResponseSchema>;
export type SaveBudgetRequest = z.infer<typeof SaveBudgetRequestSchema>;

// Phase 07: generated candidates are separate from accepted versions.
export const ExtractBriefRequestSchema = z.object({ text: text(5000) }).strict();
export const ExtractedBriefSchema = z.object({
  name: text(120).nullable(), type: z.enum(['birthday','wedding','community']).nullable(), city: text(100).nullable(),
  localDate: LocalDateSchema.nullable(), timezone: TimezoneSchema.nullable(), guests: z.number().int().min(1).max(100000).nullable(), budgetMinor: MoneyMinorSchema.nullable(),
}).strict();
export const ExtractionResponseSchema = z.object({ draft: ExtractedBriefSchema, missingFields: z.array(z.string()).max(7), uncertainties: z.array(text()).max(20) }).strict();
export const PlanDraftSchema = z.object({ id: IdSchema, baseVersion: VersionSchema, snapshot: PlanSnapshotSchema, totals: BudgetTotalsSchema.optional(), generation: GenerationMetadataSchema, status: z.enum(['draft','accepted','discarded']), createdAt: TimestampSchema, expiresAt: TimestampSchema, acceptedVersion: VersionSchema.nullable() }).strict();
export const DraftResponseSchema = z.object({ draft: PlanDraftSchema }).strict();
export const DraftListResponseSchema = z.object({ drafts: z.array(PlanDraftSchema).max(10) }).strict();
export const GenerationResponseSchema = z.object({ jobId: IdSchema, draft: PlanDraftSchema }).strict();
export const AiStatusSchema = z.object({ enabled: z.boolean(), model: z.string().nullable() }).strict();
export type PlanDraft = z.infer<typeof PlanDraftSchema>;
export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>;

export const GenerationJobSchema = z.object({ id:IdSchema,status:z.enum(['pending','running','succeeded','failed']),deadline:z.number().int(),draftId:IdSchema.nullable() }).strict();
export const GenerationJobsResponseSchema = z.object({jobs:z.array(GenerationJobSchema).max(5)}).strict();

// Phase08 manual accepted-plan editing; server controls owner, revision and budget.
export const SaveTaskRequestSchema = z.object({expectedVersion:VersionSchema,item:TaskSchema,reason:z.string().trim().max(500).default('')}).strict();
export const SaveVendorRequestSchema = z.object({expectedVersion:VersionSchema,item:VendorChecklistItemSchema,reason:z.string().trim().max(500).default('')}).strict();
export const SaveIdeaRequestSchema = z.object({expectedVersion:VersionSchema,item:IdeaSchema,reason:z.string().trim().max(500).default('')}).strict();
export const DeletePlanItemRequestSchema = z.object({expectedVersion:VersionSchema,reason:z.string().trim().max(500).default('')}).strict();

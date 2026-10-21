import test from 'node:test';
import assert from 'node:assert/strict';
import { AcceptDraftRequestSchema, ApiErrorSchema, BudgetLineSchema, CreateEventRequestSchema, EventBriefSchema, IdeaSchema, IdSchema, LocalDateSchema, MoneyMinorSchema, PlanSnapshotSchema, PlanVersionSchema, ReplanProposalSchema, ReplanRequestSchema, TaskSchema, VendorChecklistItemSchema, createEventBriefSchema } from './index.js';

const brief = {
  name: 'Birthday', type: 'birthday', city: 'Noida', localDate: '2030-01-02', timezone: 'Asia/Kolkata',
  guests: 50, currency: 'INR', budgetMinor: 5_000_000, priorities: ['food'], hardRequirements: ['vegetarian'], preferences: {},
};
const provenance = { sourceType: 'synthetic' };
const budget = { id: 'food', category: 'Food', currency: 'INR', allocationMinor: 2_000_000, estimatedCostMinor: 2_000_000, committedCostMinor: null, paidMinor: 0, locked: true, provenance, rationale: 'Synthetic estimate' };
const task = { id: 'menu', title: 'Confirm menu', kind: 'preparation', schedule: { kind: 'date', localDate: '2030-01-01' }, timezone: 'Asia/Kolkata', dependencyIds: [], priority: 'high', status: 'todo', locked: false, rationale: 'Prepare before the event' };
const vendor = { id: 'caterer', category: 'Catering', requiredBy: '2030-01-01', questions: ['Can you provide vegetarian food?'], documentsToRequest: [], estimatedRange: { minMinor: 100, maxMinor: 200, currency: 'INR', provenance }, status: 'researching', quote: null, linkedBudgetLineId: null };
const idea = { id: 'games', title: 'Group games', description: 'An outdoor activity', preferenceMatch: 'Small gathering', estimatedCostImpact: { direction: 'increase', amountMinor: 100, currency: 'INR', provenance }, status: 'suggested' };
const snapshot = { brief, overview: 'Synthetic test plan', assumptions: [], budgetLines: [budget], contingencyMinor: 100, tasks: [task], vendorChecklist: [vendor], ideas: [idea], warnings: [], feasibility: { status: 'feasible', shortfallMinor: 0, reasons: [] } };

test('valid complete brief and plan structures parse', () => {
  assert.equal(EventBriefSchema.parse(brief).guests, 50);
  assert.equal(PlanSnapshotSchema.parse(snapshot).brief.currency, 'INR');
});
test('brief rejects malformed, excessive and injected fields', () => {
  for (const change of [{ name: ' ' }, { name: 'x'.repeat(121) }, { city: 'x'.repeat(101) }, { guests: 0 }, { guests: 1.1 }, { guests: 100_001 }, { currency: 'USD' }, { timezone: 'Not/AZone' }, { budgetMinor: 0 }, { briefText: 'x'.repeat(5001) }, { priorities: Array(21).fill('food') }, { preferences: { notes: 'x'.repeat(2001) } }, { ownerId: 'attacker' }]) {
    assert.equal(EventBriefSchema.safeParse({ ...brief, ...change }).success, false, JSON.stringify(change));
  }
  assert.equal(CreateEventRequestSchema.safeParse({ brief, ownerId: 'attacker' }).success, false);
});
test('money rejects negative, fractional, nonfinite, unsafe and coerced values; zero commitment remains zero', () => {
  for (const value of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '100']) assert.equal(MoneyMinorSchema.safeParse(value).success, false);
  assert.equal(BudgetLineSchema.parse({ ...budget, committedCostMinor: 0 }).committedCostMinor, 0);
  assert.equal(BudgetLineSchema.parse(budget).committedCostMinor, null);
});
test('calendar validation and creation clock respect event timezone while historical records remain readable', () => {
  for (const date of ['2030-02-29', '2030-04-31', '0000-01-01', '2030-1-1']) assert.equal(LocalDateSchema.safeParse(date).success, false);
  assert.equal(LocalDateSchema.safeParse('2032-02-29').success, true);
  const schema = createEventBriefSchema(new Date('2030-01-01T20:00:00Z')); // Jan 2 in Kolkata
  assert.equal(schema.safeParse({ ...brief, localDate: '2030-01-01' }).success, false);
  assert.equal(schema.safeParse(brief).success, true);
  assert.equal(EventBriefSchema.safeParse({ ...brief, localDate: '2000-01-01' }).success, true);
});
test('stable IDs, versions and mutation envelopes reject unsafe fields', () => {
  for (const id of ['', '../other', 'a/b', 'x'.repeat(129)]) assert.equal(IdSchema.safeParse(id).success, false);
  assert.equal(AcceptDraftRequestSchema.safeParse({ acknowledgeInfeasible: false }).success, false);
  assert.equal(AcceptDraftRequestSchema.safeParse({ expectedVersion: -1, acknowledgeInfeasible: false }).success, false);
  assert.equal(AcceptDraftRequestSchema.safeParse({ expectedVersion: 0, acknowledgeInfeasible: false, ownerId: 'attacker' }).success, false);
  assert.equal(ReplanRequestSchema.safeParse({ baseVersion: 1, changes: {} }).success, false);
});
test('task schedule requires agenda times, valid order and distinct dependencies', () => {
  for (const change of [{ kind: 'agenda' }, { dependencyIds: ['menu'] }, { dependencyIds: ['a', 'a'] }, { schedule: { kind: 'timed', startsAt: '2030-01-02T12:00:00Z', endsAt: '2030-01-02T11:00:00Z' } }]) assert.equal(TaskSchema.safeParse({ ...task, ...change }).success, false);
  assert.equal(TaskSchema.safeParse({ ...task, kind: 'agenda', schedule: { kind: 'timed', startsAt: '2030-01-02T12:00:00+05:30', endsAt: '2030-01-02T13:00:00+05:30' } }).success, true);
});
test('vendor ranges and idea impact require bounded nonnegative amounts and provenance', () => {
  assert.equal(VendorChecklistItemSchema.safeParse({ ...vendor, estimatedRange: { ...vendor.estimatedRange, minMinor: 300 } }).success, false);
  assert.equal(IdeaSchema.safeParse({ ...idea, estimatedCostImpact: { ...idea.estimatedCostImpact, amountMinor: -100 } }).success, false);
  assert.equal(BudgetLineSchema.safeParse({ ...budget, provenance: { sourceType: 'verified_by_ai' } }).success, false);
});
test('plan requires all output collections with bounded sizes and distinct IDs', () => {
  for (const key of ['budgetLines', 'tasks', 'vendorChecklist', 'ideas']) assert.equal(PlanSnapshotSchema.safeParse({ ...snapshot, [key]: [] }).success, false);
  assert.equal(PlanSnapshotSchema.safeParse({ ...snapshot, tasks: [task, task] }).success, false);
  assert.equal(PlanSnapshotSchema.safeParse({ ...snapshot, ideas: Array(51).fill(idea) }).success, false);
});
test('accepted plan requires explicit infeasibility acknowledgement', () => {
  const version = { id: 'v1', eventId: 'event1', version: 1, schemaVersion: 1, snapshot: { ...snapshot, feasibility: { status: 'infeasible', shortfallMinor: 500_000, reasons: ['Fixed costs exceed cap'] } }, acceptedAt: '2030-01-01T00:00:00Z', acceptedBy: 'owner1', generation: { source: 'synthetic', modelId: null, promptVersion: null, latencyMs: 0, inputTokens: 0, outputTokens: 0 }, acknowledgedInfeasible: false };
  assert.equal(PlanVersionSchema.safeParse(version).success, false);
  assert.equal(PlanVersionSchema.safeParse({ ...version, acknowledgedInfeasible: true }).success, true);
});
test('proposal rejects reversed expiry and inconsistent apply state', () => {
  const proposal = { id: 'p1', eventId: 'event1', ownerId: 'owner1', baseVersion: 1, requestedChanges: { budgetMinor: 4_000_000 }, candidate: snapshot, diff: [], preservedLockIds: ['food'], validation: { schemaVersion: 1, rulesVersion: 'test-only', checkedAt: '2030-01-01T00:00:00Z' }, status: 'draft', createdAt: '2030-01-01T00:00:00Z', expiresAt: '2030-01-02T00:00:00Z', appliedVersion: null };
  assert.equal(ReplanProposalSchema.safeParse(proposal).success, true);
  assert.equal(ReplanProposalSchema.safeParse({ ...proposal, expiresAt: proposal.createdAt }).success, false);
  assert.equal(ReplanProposalSchema.safeParse({ ...proposal, status: 'applied' }).success, false);
});
test('API error envelope excludes raw diagnostic fields', () => {
  assert.equal(ApiErrorSchema.safeParse({ error: { code: 'INTERNAL_ERROR', message: 'Try again', requestId: 'request1', stack: 'private' } }).success, false);
});

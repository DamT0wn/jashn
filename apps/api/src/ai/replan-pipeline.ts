import { PlanSnapshotSchema } from '@jashn/contracts';
import type { BudgetLine, EventBrief, PlanSnapshot, ReplanProposal, Task, VendorChecklistItem } from '@jashn/contracts';
import { budgetTotals, validateProtectedBudget, validateProtectedTasks, validateTimeline, RuleError } from '@jashn/planning-rules';

export type ReplanDiffEntry = ReplanProposal['diff'][number];

function fmtMoney(minor: number | null) { return minor === null ? null : `₹${(minor / 100).toFixed(2)}`; }
function fmtDate(value: string | null) { return value; }

/**
 * Compute a human-readable diff between the current accepted snapshot and a proposed candidate.
 * All amounts are compared as-is (integer paise).
 */
export function computeReplanDiff(before: PlanSnapshot, after: PlanSnapshot): ReplanDiffEntry[] {
  const diff: ReplanDiffEntry[] = [];
  // Brief-level changes
  for (const field of ['budgetMinor','guests','localDate'] as const) {
    const bv = before.brief[field]; const av = after.brief[field];
    if (bv !== av) diff.push({ entity:'brief', entityId:null, field, before: field==='budgetMinor'?fmtMoney(Number(bv)):String(bv), after: field==='budgetMinor'?fmtMoney(Number(av)):String(av) });
  }
  // Contingency
  if (before.contingencyMinor !== after.contingencyMinor) {
    diff.push({ entity:'contingency', entityId:null, field:'contingencyMinor', before:fmtMoney(before.contingencyMinor), after:fmtMoney(after.contingencyMinor) });
  }
  // Budget lines
  const beforeBudget = new Map(before.budgetLines.map(l => [l.id, l]));
  const afterBudget = new Map(after.budgetLines.map(l => [l.id, l]));
  for (const [id, bLine] of beforeBudget) {
    const aLine = afterBudget.get(id);
    if (!aLine) { diff.push({ entity:'budget', entityId:id, field:'removed', before:bLine.category, after:null }); continue; }
    for (const field of ['estimatedCostMinor','allocationMinor','category'] as const) {
      if (bLine[field] !== aLine[field]) diff.push({ entity:'budget', entityId:id, field, before: field==='category'?String(bLine[field]):fmtMoney(Number(bLine[field])), after: field==='category'?String(aLine[field]):fmtMoney(Number(aLine[field])) });
    }
  }
  for (const [id, aLine] of afterBudget) {
    if (!beforeBudget.has(id)) diff.push({ entity:'budget', entityId:id, field:'added', before:null, after:aLine.category });
  }
  // Tasks
  const beforeTasks = new Map(before.tasks.map(t => [t.id, t]));
  const afterTasks = new Map(after.tasks.map(t => [t.id, t]));
  for (const [id, bTask] of beforeTasks) {
    const aTask = afterTasks.get(id);
    if (!aTask) { diff.push({ entity:'task', entityId:id, field:'removed', before:bTask.title, after:null }); continue; }
    if (bTask.title !== aTask.title) diff.push({ entity:'task', entityId:id, field:'title', before:bTask.title, after:aTask.title });
    const bd = bTask.schedule.kind === 'date' ? bTask.schedule.localDate : bTask.schedule.startsAt;
    const ad = aTask.schedule.kind === 'date' ? aTask.schedule.localDate : aTask.schedule.startsAt;
    if (bd !== ad) diff.push({ entity:'task', entityId:id, field:'schedule', before:fmtDate(bd), after:fmtDate(ad) });
  }
  for (const [id, aTask] of afterTasks) {
    if (!beforeTasks.has(id)) diff.push({ entity:'task', entityId:id, field:'added', before:null, after:aTask.title });
  }
  // Ideas
  const beforeIdeas = new Map(before.ideas.map(i => [i.id, i]));
  for (const [id, bIdea] of beforeIdeas) {
    if (!after.ideas.some(i => i.id === id)) diff.push({ entity:'idea', entityId:id, field:'removed', before:bIdea.title, after:null });
  }
  for (const aIdea of after.ideas) {
    if (!beforeIdeas.has(aIdea.id)) diff.push({ entity:'idea', entityId:aIdea.id, field:'added', before:null, after:aIdea.title });
  }
  return diff.slice(0, 500);
}

/**
 * Validate a raw AI replan candidate against the current accepted snapshot and rules.
 * Returns a fully-validated PlanSnapshot that can be stored as a proposal candidate.
 */
export function checkedReplanCandidate(raw: unknown, requestedBrief: EventBrief, currentSnapshot: PlanSnapshot, now: Date): PlanSnapshot {
  const generated = PlanSnapshotSchema.parse(raw);
  const beforeLedger = { lines: currentSnapshot.budgetLines, contingencyMinor: currentSnapshot.contingencyMinor };
  const candidateLedger = { lines: generated.budgetLines, contingencyMinor: generated.contingencyMinor };
  // Locks, commitments, payments must survive
  validateProtectedBudget(beforeLedger, candidateLedger);
  validateProtectedTasks(currentSnapshot.tasks, generated.tasks);
  // Hard requirements must survive
  for (const req of currentSnapshot.brief.hardRequirements) {
    if (!generated.brief.hardRequirements.includes(req)) throw new RuleError(`Hard requirement "${req}" was removed from the proposal.`);
  }
  const snapshot = PlanSnapshotSchema.parse({ ...generated, brief: requestedBrief });
  const totals = budgetTotals(candidateLedger, requestedBrief.budgetMinor);
  const timeline = validateTimeline(snapshot.tasks, requestedBrief.timezone, now, requestedBrief.localDate);
  const reasons = [...(snapshot.feasibility.status === 'infeasible' ? snapshot.feasibility.reasons : []),
    ...(totals.shortfallMinor > 0 ? [`Projected costs exceed the budget cap by ₹${(totals.shortfallMinor / 100).toFixed(2)}.`] : []),
    ...(timeline.overdueIds.length ? ['Some preparation tasks are already overdue under this schedule.'] : [])];
  snapshot.feasibility = reasons.length
    ? { status: 'infeasible', shortfallMinor: totals.shortfallMinor, reasons: reasons.slice(0, 20) }
    : { status: 'feasible', shortfallMinor: 0, reasons: [] };
  return PlanSnapshotSchema.parse(snapshot);
}

/**
 * Collect the IDs of every locked budget line and locked task in a candidate snapshot.
 */
export function collectPreservedLockIds(candidate: PlanSnapshot): string[] {
  return [
    ...candidate.budgetLines.filter((l: BudgetLine) => l.locked).map((l: BudgetLine) => l.id),
    ...candidate.tasks.filter((t: Task) => t.locked).map((t: Task) => t.id),
    ...candidate.vendorChecklist.filter((v: VendorChecklistItem) => v.status === 'booked').map((v: VendorChecklistItem) => v.id),
  ];
}

/**
 * Build the feasibility-first description of a requested change set.
 */
export function buildReplanPromptData(
  currentSnapshot: PlanSnapshot,
  requestedChanges: { budgetMinor?: number | undefined; localDate?: string | undefined; guests?: number | undefined; hardRequirements?: string[] | undefined },
) {
  const requestedBrief = {
    ...currentSnapshot.brief,
    ...(requestedChanges.budgetMinor !== undefined ? { budgetMinor: requestedChanges.budgetMinor } : {}),
    ...(requestedChanges.localDate !== undefined ? { localDate: requestedChanges.localDate } : {}),
    ...(requestedChanges.guests !== undefined ? { guests: requestedChanges.guests } : {}),
    ...(requestedChanges.hardRequirements !== undefined ? { hardRequirements: requestedChanges.hardRequirements } : {}),
  } as EventBrief;
  return {
    currentPlan: {
      brief: requestedBrief,
      budgetLines: currentSnapshot.budgetLines.map(l => ({ id:l.id, category:l.category, estimatedCostMinor:l.estimatedCostMinor, committedCostMinor:l.committedCostMinor, paidMinor:l.paidMinor, locked:l.locked, allocationMinor:l.allocationMinor, provenance:l.provenance, rationale:l.rationale, currency:l.currency })),
      contingencyMinor: currentSnapshot.contingencyMinor,
      tasks: currentSnapshot.tasks,
      vendorChecklist: currentSnapshot.vendorChecklist,
      ideas: currentSnapshot.ideas,
    },
    requestedChanges,
    today: new Date().toISOString(),
  };
}

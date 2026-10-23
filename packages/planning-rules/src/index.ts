import { BudgetLedgerSchema, MoneyMinorSchema, TaskSchema, TimezoneSchema, LocalDateSchema, LIMITS } from '@jashn/contracts';
import type { BudgetLedger, Task } from '@jashn/contracts';

export class RuleError extends Error {}
const fail = (message: string): never => { throw new RuleError(message); };
function sum(values: number[]) {
  const total = values.reduce((value, item) => value + BigInt(MoneyMinorSchema.parse(item)), 0n);
  if (total > BigInt(Number.MAX_SAFE_INTEGER)) fail('Combined amounts exceed the supported limit.');
  return Number(total);
}
export function budgetTotals(input: BudgetLedger, cap: number) {
  const ledger = BudgetLedgerSchema.parse(input); MoneyMinorSchema.parse(cap);
  for (const line of ledger.lines) if (line.paidMinor > 0 && line.committedCostMinor === null) fail('Record a commitment before recording a payment.');
  const projectedMinor = sum([...ledger.lines.map(line => line.committedCostMinor ?? line.estimatedCostMinor), ledger.contingencyMinor]);
  const protectedMinor = sum(ledger.lines.map(line => line.committedCostMinor !== null ? line.committedCostMinor : line.locked ? line.estimatedCostMinor : 0));
  return { projectedMinor, protectedMinor, minimumShortfallMinor: Math.max(protectedMinor - cap, 0), remainingMinor: cap - projectedMinor, shortfallMinor: Math.max(projectedMinor - cap, 0),
    paidMinor: sum(ledger.lines.map(line => line.paidMinor)),
    outstandingMinor: sum(ledger.lines.map(line => Math.max((line.committedCostMinor ?? 0) - line.paidMinor, 0))),
    creditMinor: sum(ledger.lines.map(line => Math.max(line.paidMinor - (line.committedCostMinor ?? 0), 0))) };
}
export function validateManualBudget(before: BudgetLedger, after: BudgetLedger, confirmed: boolean, reason: string) {
  for (const old of before.lines) {
    const next = after.lines.find(line => line.id === old.id);
    if (!next && (old.committedCostMinor !== null || old.paidMinor > 0 || old.locked)) fail('Clear obligations and unlock the line explicitly before deleting it.');
    if (next && ((old.committedCostMinor !== null && (next.committedCostMinor === null || next.committedCostMinor < old.committedCostMinor)) || next.paidMinor < old.paidMinor)) {
      if (!confirmed || !reason.trim()) fail('Reducing a commitment or payment requires confirmation and a reason.');
    }
  }
}
export function validateProtectedBudget(before: BudgetLedger, candidate: BudgetLedger) {
  BudgetLedgerSchema.parse(before); BudgetLedgerSchema.parse(candidate);
  for (const old of before.lines) {
    const next = candidate.lines.find(line => line.id === old.id);
    if (!next && (old.locked || old.committedCostMinor !== null || old.paidMinor)) fail('A protected budget line was removed.');
    if (next && (old.locked && JSON.stringify(old) !== JSON.stringify(next) || old.committedCostMinor !== next.committedCostMinor || old.paidMinor !== next.paidMinor || old.locked !== next.locked)) fail('AI cannot change locks, commitments or payments.');
  }
  for (const line of candidate.lines) if (!before.lines.some(old => old.id === line.id) && (line.locked || line.committedCostMinor !== null || line.paidMinor)) fail('AI cannot invent financial records or locks.');
}
export function localDateAt(instant: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(instant);
  return ['year','month','day'].map(kind => parts.find(part => part.type === kind)!.value).join('-');
}
export function validateTimeline(input: Task[], timezone: string, now: Date, eventDate?: string) {
  TimezoneSchema.parse(timezone);
  if (!Number.isFinite(now.getTime()) || input.length > LIMITS.tasks) fail('Invalid clock or too many tasks.');
  if (eventDate !== undefined) LocalDateSchema.parse(eventDate);
  const tasks = input.map(task => TaskSchema.parse(task));
  const byId = new Map(tasks.map(task => [task.id, task]));
  if (byId.size !== tasks.length) fail('Duplicate task IDs.');
  const visited = new Set<string>(); const visiting = new Set<string>();
  const date = (task: Task, end = false) => task.schedule.kind === 'date' ? task.schedule.localDate : localDateAt(new Date(end ? task.schedule.endsAt : task.schedule.startsAt), timezone);
  function visit(task: Task) {
    if (visiting.has(task.id)) fail('Task dependencies contain a cycle.');
    if (visited.has(task.id)) return;
    if (task.timezone !== timezone) fail('Task timezone must match the event.');
    if (eventDate && (task.kind === 'preparation' && date(task, true) > eventDate || task.kind === 'agenda' && date(task) !== eventDate || task.kind === 'post_event' && date(task) < eventDate)) fail('Task dates do not match their event phase.');
    visiting.add(task.id);
    for (const id of task.dependencyIds) {
      const prerequisite = byId.get(id); if (!prerequisite) return fail('A task dependency is missing.');
      visit(prerequisite);
      if (task.status === 'done' && prerequisite.status !== 'done') fail('Complete prerequisites first.');
      if (date(prerequisite, true) > date(task) || prerequisite.schedule.kind === 'timed' && task.schedule.kind === 'timed' && Date.parse(prerequisite.schedule.endsAt) > Date.parse(task.schedule.startsAt)) fail('A prerequisite is scheduled after its dependent.');
    }
    visiting.delete(task.id); visited.add(task.id);
  }
  tasks.forEach(visit);
  return { overdueIds: tasks.filter(task => task.status !== 'done' && (task.schedule.kind === 'date' ? task.schedule.localDate < localDateAt(now, timezone) : Date.parse(task.schedule.endsAt) < now.getTime())).map(task => task.id), blockedIds: tasks.filter(task => task.dependencyIds.some(id => byId.get(id)!.status !== 'done')).map(task => task.id) };
}
export function validateProtectedTasks(before: Task[], after: Task[]) {
  for (const task of before.filter(item => item.locked)) if (JSON.stringify(task) !== JSON.stringify(after.find(item => item.id === task.id))) fail('A locked task cannot be moved, changed or removed.');
  for (const task of after) if (task.locked && !before.some(item => item.id === task.id && item.locked)) fail('AI cannot create task locks.');
}

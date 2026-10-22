import type { EventBrief, PlanSnapshot } from '@jashn/contracts';
import { createSample, sampleIds } from './fixtures';

export interface WorkspaceEvent { id: string; mode: 'synthetic' | 'local-draft'; brief: EventBrief; plan: PlanSnapshot | null }
export interface EventRepository {
  list(signal?: AbortSignal): Promise<WorkspaceEvent[]>;
  get(id: string, signal?: AbortSignal): Promise<WorkspaceEvent | null>;
}
/** Explicit fixture adapter. Never used as a fallback for private API failures. */
export function fixtureRepository(clock: () => Date = () => new Date()): EventRepository {
  return {
    async list(signal) { signal?.throwIfAborted(); return sampleIds.map(id => { const plan = createSample(id, clock()); return { id, mode: 'synthetic', brief: plan.brief, plan }; }); },
    async get(id, signal) { signal?.throwIfAborted(); if (!sampleIds.includes(id as typeof sampleIds[number])) return null; const plan = createSample(id as typeof sampleIds[number], clock()); return { id, mode: 'synthetic', brief: plan.brief, plan }; },
  };
}
/** Tab-memory only. This does not authenticate, persist, or contact a backend. */
export function draftRepository(draft: EventBrief | null): EventRepository {
  const event: WorkspaceEvent | null = draft ? { id: 'local-draft', mode: 'local-draft', brief: draft, plan: null } : null;
  return { async list(signal) { signal?.throwIfAborted(); return event ? [event] : []; }, async get(id, signal) { signal?.throwIfAborted(); return id === event?.id ? event : null; } };
}

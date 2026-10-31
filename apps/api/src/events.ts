import { createHash } from 'node:crypto';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { FieldPath } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';
import { CreateEventRequestSchema, createEventBriefSchema, DeleteEventRequestSchema, EditEventRequestSchema, EventListQuerySchema, EventRecordSchema, EventVersionRequestSchema, IdSchema } from '@jashn/contracts';
import type { EventRecord } from '@jashn/contracts';
import { BudgetLedgerSchema, SaveBudgetRequestSchema } from '@jashn/contracts';
import { budgetTotals, validateManualBudget, RuleError } from '@jashn/planning-rules';
import { PlanSnapshotSchema, PlanVersionSchema } from '@jashn/contracts';
import { planningRoutes } from './planning.js';
import { aiRoutes } from './ai/routes.js';
import type { AiConfig } from './ai/provider.js';

export class ApiFailure extends Error {
  constructor(public statusCode: number, public code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'VERSION_CONFLICT' | 'PROVIDER_UNAVAILABLE' | 'INVALID_INPUT' | 'USAGE_LIMIT' | 'INFEASIBLE' | 'PROPOSAL_EXPIRED', message: string) { super(message); }
}
export interface EventServices { db: Firestore; verify(token: string): Promise<string> }
const missing = () => new ApiFailure(404, 'NOT_FOUND', 'Occasion not found.');
const conflict = () => new ApiFailure(409, 'VERSION_CONFLICT', 'This occasion changed or cannot be edited. Reload before trying again.');
export function eventRoutes(app: FastifyInstance, services: EventServices | null, ai: AiConfig | null = null) {
  const identities = new WeakMap<FastifyRequest, string>();
  app.register(async routes => {
    routes.addHook('preHandler', async request => {
      const match = /^Bearer ([^\s]+)$/.exec(request.headers.authorization || '');
      if (!match || match[1]!.length > 16000) throw new ApiFailure(401, 'UNAUTHENTICATED', 'Please sign in again.');
      if (!services) throw new ApiFailure(503, 'PROVIDER_UNAVAILABLE', 'Account storage is not configured.');
      try { identities.set(request, IdSchema.parse(await services.verify(match[1]!))); }
      catch { throw new ApiFailure(401, 'UNAUTHENTICATED', 'Your session could not be verified. Please sign in again.'); }
    });
    const context = (request: FastifyRequest) => {
      const uid = identities.get(request)!;
      const user = services!.db.collection('users').doc(uid);
      return { uid, events: user.collection('events'), deletions: user.collection('deletions') };
    };
    const eventId = (request: FastifyRequest) => IdSchema.parse((request.params as { id: string }).id);
    aiRoutes(routes, () => services!.db, context, ai);
    planningRoutes(routes, () => services!.db, context);
    const owned = (data: unknown, uid: string): EventRecord => {
      if (!data) throw missing();
      const event = EventRecordSchema.parse(data);
      if (event.ownerId !== uid || event.status === 'deleting') throw missing();
      return event;
    };
    routes.post('/v1/events', async (request, reply) => {
      const { brief } = CreateEventRequestSchema.parse(request.body);
      createEventBriefSchema(new Date()).parse(brief);
      const { uid, events } = context(request);
      const ref = events.doc(); const now = new Date().toISOString();
      const event = EventRecordSchema.parse({ id: ref.id, ownerId: uid, brief, status: 'active', revision: 0, currentVersion: null, createdAt: now, updatedAt: now });
      await ref.create(event);
      return reply.code(201).send({ event });
    });
    routes.get('/v1/events', async request => {
      const query = EventListQuerySchema.parse(request.query);
      const { uid, events } = context(request);
      let after: string | undefined;
      if (query.cursor) {
        try {
          const cursor = JSON.parse(Buffer.from(query.cursor, 'base64url').toString()) as { uid: string; status: string; id: string };
          if (cursor.uid !== uid || cursor.status !== query.status) throw new Error();
          after = IdSchema.parse(cursor.id);
        } catch { throw new ApiFailure(400, 'INVALID_INPUT', 'Invalid page cursor.'); }
      }
      let selection = events.where('status', '==', query.status).orderBy(FieldPath.documentId()).limit(query.limit + 1);
      if (after) selection = selection.startAfter(after);
      const results = await selection.get();
      const page = results.docs.slice(0, query.limit).map(doc => owned(doc.data(), uid));
      return { events: page, nextCursor: results.size > query.limit ? Buffer.from(JSON.stringify({ uid, status: query.status, id: page.at(-1)!.id })).toString('base64url') : null };
    });
    routes.get('/v1/events/:id', async request => {
      const { uid, events } = context(request);
      const ref = events.doc(eventId(request));
      return services!.db.runTransaction(async tx => {
        const event = owned((await tx.get(ref)).data(), uid);
        const plan = event.currentVersion === null ? null : PlanSnapshotSchema.parse((await tx.get(ref.collection('planning').doc('current'))).data());
        return { event, plan };
      });
    });
    routes.get('/v1/events/:id/budget', async request => {
      const { uid, events } = context(request); const ref = events.doc(eventId(request));
      return services!.db.runTransaction(async transaction => {
        const event = owned((await transaction.get(ref)).data(), uid);
        const ledger = BudgetLedgerSchema.parse((await transaction.get(ref.collection('planning').doc('budget'))).data() || { lines: [], contingencyMinor: 0 });
        return { event, ledger, totals: budgetTotals(ledger, event.brief.budgetMinor) };
      });
    });
    routes.put('/v1/events/:id/budget', async request => {
      const body = SaveBudgetRequestSchema.parse(request.body);
      const { uid, events } = context(request); const ref = events.doc(eventId(request));
      return services!.db.runTransaction(async transaction => {
        const current = owned((await transaction.get(ref)).data(), uid);
        if (current.status !== 'active' || current.revision !== body.expectedVersion || current.revision === Number.MAX_SAFE_INTEGER) throw conflict();
        const ledgerRef = ref.collection('planning').doc('budget');
        const before = BudgetLedgerSchema.parse((await transaction.get(ledgerRef)).data() || { lines: [], contingencyMinor: 0 });
        const accepted = current.currentVersion === null ? null : PlanSnapshotSchema.parse((await transaction.get(ref.collection('planning').doc('current'))).data());
        try {
          validateManualBudget(before, body.ledger, body.confirmCorrections, body.reason);
          const totals = budgetTotals(body.ledger, current.brief.budgetMinor);
          if (totals.shortfallMinor && !body.acknowledgeShortfall) throw new RuleError('Acknowledge the budget shortfall before saving.');
          if (accepted?.vendorChecklist.some(vendor => vendor.linkedBudgetLineId && !body.ledger.lines.some(line => line.id === vendor.linkedBudgetLineId))) throw new RuleError('Resolve vendor links before removing budget lines.');
          const event = EventRecordSchema.parse({ ...current, revision: current.revision + 1, currentVersion: accepted ? current.revision + 1 : null, updatedAt: new Date().toISOString() });
          if (accepted) {
            const reasons = accepted.feasibility.reasons.filter(reason => reason !== 'Projected costs exceed the budget cap.');
            if (totals.shortfallMinor) reasons.push('Projected costs exceed the budget cap.');
            const plan = PlanSnapshotSchema.parse({ ...accepted, budgetLines: body.ledger.lines, contingencyMinor: body.ledger.contingencyMinor, feasibility: reasons.length ? { status:'infeasible',shortfallMinor:totals.shortfallMinor,reasons:reasons.slice(0,20) } : { status:'feasible',shortfallMinor:0,reasons:[] } });
            transaction.set(ref.collection('planning').doc('current'),plan);
            transaction.create(ref.collection('versions').doc(String(event.revision)),PlanVersionSchema.parse({id:String(event.revision),eventId:event.id,schemaVersion:1,version:event.revision,snapshot:plan,acceptedAt:event.updatedAt,acceptedBy:uid,generation:{source:'manual',modelId:null,promptVersion:null,latencyMs:0,inputTokens:0,outputTokens:0},acknowledgedInfeasible:plan.feasibility.status==='infeasible'}));
          }
          transaction.set(ledgerRef, body.ledger);
          transaction.set(ref.collection('budgetHistory').doc(String(event.revision)), { before, after: body.ledger, actor: uid, recordedAt: event.updatedAt, reason: body.reason, confirmCorrections: body.confirmCorrections, acknowledgeShortfall: body.acknowledgeShortfall });
          transaction.set(ref, event);
          return { event, ledger: body.ledger, totals };
        } catch (error) { if (error instanceof RuleError) throw new ApiFailure(400, 'INVALID_INPUT', error.message); throw error; }
      });
    });
    for (const operation of ['edit', 'archive', 'unarchive'] as const) {
      routes.route({ method: operation === 'edit' ? 'PATCH' : 'POST', url: `/v1/events/:id${operation === 'edit' ? '' : `/${operation}`}`, handler: async request => {
        const edit = operation === 'edit' ? EditEventRequestSchema.parse(request.body) : null;
        const body = edit || EventVersionRequestSchema.parse(request.body);
        const { uid, events } = context(request); const ref = events.doc(eventId(request));
        const event = await services!.db.runTransaction(async transaction => {
          const current = owned((await transaction.get(ref)).data(), uid);
          if (current.revision !== body.expectedVersion || current.revision === Number.MAX_SAFE_INTEGER) throw conflict();
          if (operation === 'edit' && (current.status !== 'active' || current.currentVersion !== null)) throw conflict();
          if (operation === 'archive' && current.status !== 'active' || operation === 'unarchive' && current.status !== 'archived') throw conflict();
          if (edit && edit.brief.localDate !== current.brief.localDate) createEventBriefSchema(new Date()).parse(edit.brief);
          const next = EventRecordSchema.parse({ ...current, ...(edit ? { brief: edit.brief } : { status: operation === 'archive' ? 'archived' : 'active' }), revision: current.revision + 1, updatedAt: new Date().toISOString() });
          transaction.set(ref, next); return next;
        });
        return { event };
      } });
    }
    routes.delete('/v1/events/:id', async request => {
      const body = DeleteEventRequestSchema.parse(request.body);
      const { uid, events, deletions } = context(request); const id = eventId(request);
      const ref = events.doc(id); const deletion = deletions.doc(id);
      await services!.db.runTransaction(async transaction => {
        const [existing, prior] = await Promise.all([transaction.get(ref), transaction.get(deletion)]);
        if (prior.exists) {
          const data = prior.data()!;
          if (data.ownerId !== uid) throw missing();
          if (data.expectedVersion !== body.expectedVersion || data.confirmationHash !== createHash('sha256').update(body.confirmationName).digest('hex')) throw conflict();
          return;
        }
        const current = owned(existing.data(), uid);
        if (current.revision !== body.expectedVersion || current.brief.name !== body.confirmationName) throw conflict();
        transaction.update(ref, { status: 'deleting', updatedAt: new Date().toISOString() });
        transaction.set(deletion, { ownerId: uid, expectedVersion: body.expectedVersion, confirmationHash: createHash('sha256').update(body.confirmationName).digest('hex'), status: 'deleting', updatedAt: new Date().toISOString() });
      });
      if ((await deletion.get()).data()?.status === 'deleted') return { eventId: id, status: 'deleted' };
      // Await cleanup. A durable tombstone blocks writes and permits safe retries after a crash.
      try { await services!.db.recursiveDelete(ref); await deletion.update({ status: 'deleted', updatedAt: new Date().toISOString() }); }
      catch { await deletion.update({ status: 'failed', updatedAt: new Date().toISOString() }); }
      return { eventId: id, status: (await deletion.get()).data()!.status };
    });
    routes.post('/v1/events/:id/deletion/retry', async request => {
      // Only an already-confirmed durable deletion can be retried.
      if (request.body !== undefined) throw new ApiFailure(400, 'INVALID_INPUT', 'This request does not accept a body.');
      const { uid, events, deletions } = context(request); const id = eventId(request);
      const deletion = deletions.doc(id); const data = (await deletion.get()).data();
      if (!data || data.ownerId !== uid) throw missing();
      if (data.status === 'deleted') return { eventId: id, status: 'deleted' };
      try { await services!.db.recursiveDelete(events.doc(id)); await deletion.update({ status: 'deleted', updatedAt: new Date().toISOString() }); }
      catch { await deletion.update({ status: 'failed', updatedAt: new Date().toISOString() }); }
      return { eventId: id, status: (await deletion.get()).data()!.status };
    });
    routes.get('/v1/events/:id/deletion', async request => {
      const { uid, deletions } = context(request); const id = eventId(request);
      const data = (await deletions.doc(id).get()).data();
      if (!data || data.ownerId !== uid) throw missing();
      return { eventId: id, status: data.status };
    });
  });
}

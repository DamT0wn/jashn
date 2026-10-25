import { isDeepStrictEqual } from 'node:util';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { CollectionReference, Firestore } from 'firebase-admin/firestore';
import { DeletePlanItemRequestSchema, EventRecordSchema, IdSchema, PlanSnapshotSchema, PlanVersionSchema, SaveIdeaRequestSchema, SaveTaskRequestSchema, SaveVendorRequestSchema } from '@jashn/contracts';
import type { Idea, PlanSnapshot, Task, VendorChecklistItem } from '@jashn/contracts';
import { budgetTotals, RuleError, validateTimeline } from '@jashn/planning-rules';
import { ApiFailure } from './events.js';

type Section = 'tasks' | 'vendors' | 'ideas';
const collection = {tasks:'tasks',vendors:'vendorChecklist',ideas:'ideas'} as const;
const schemas = {tasks:SaveTaskRequestSchema,vendors:SaveVendorRequestSchema,ideas:SaveIdeaRequestSchema};
const missing = () => new ApiFailure(404,'NOT_FOUND','Plan item not found.');
const conflict = () => new ApiFailure(409,'VERSION_CONFLICT','This plan changed or cannot be edited. Reload before trying again.');
export function editPlanItem(plan:PlanSnapshot, section:Section, method:'POST'|'PUT'|'DELETE', id:string, item:Task|VendorChecklistItem|Idea|undefined, reason:string, now:Date):PlanSnapshot {
  const key=collection[section];
  const before=plan[key]; const old=before.find(value=>value.id===id);
  if (method==='POST' ? Boolean(old) : !old) throw method==='POST'?conflict():missing();
  if (item && item.id!==id) throw new RuleError('Stable item IDs cannot change.');
  if (section==='tasks' && (old as Task|undefined)?.locked) {
    if (!item || !reason.trim() || !isDeepStrictEqual({...old,locked:false},item)) throw new RuleError('Unlock this task in a separate save with a reason before changing or deleting it.');
  }
  if (section==='vendors') {
    const previous=old as VendorChecklistItem|undefined; const next=item as VendorChecklistItem|undefined;
    if (previous && (previous.status==='booked' || previous.quote) && (!next || previous.status==='booked' && next.status!=='booked' || previous.quote && (!next.quote || next.quote.amountMinor<previous.quote.amountMinor)) && !reason.trim()) throw new RuleError('Removing a booking record or reducing a quote requires a correction reason. This does not cancel an agreement.');
    if (next?.quote && next.quote.provenance.sourceType!=='confirmed_quote') throw new RuleError('A recorded quote must be marked organizer-confirmed.');
    if (next?.linkedBudgetLineId && !plan.budgetLines.some(line=>line.id===next.linkedBudgetLineId)) throw new RuleError('Choose an existing budget line.');
  }
  const values=method==='DELETE'?before.filter(value=>value.id!==id):method==='POST'?[...before,item]:before.map(value=>value.id===id?item:value);
  if (!values.length) throw new RuleError('Keep at least one item in each plan section. Add a replacement before removing the last item.');
  const next=PlanSnapshotSchema.parse({...plan,[key]:values});
  const timeline=validateTimeline(next.tasks,next.brief.timezone,now,next.brief.localDate);
  const totals=budgetTotals({lines:next.budgetLines,contingencyMinor:next.contingencyMinor},next.brief.budgetMinor);
  const deadlineReason='Preparation deadlines have already passed; review lead times.';
  const reasons=next.feasibility.reasons.filter(reason=>reason!==deadlineReason);
  if (timeline.overdueIds.length) reasons.push(deadlineReason);
  next.feasibility=reasons.length?{status:'infeasible',shortfallMinor:totals.shortfallMinor,reasons:reasons.slice(0,20)}:{status:'feasible',shortfallMinor:0,reasons:[]};
  return PlanSnapshotSchema.parse(next);
}
export function planningRoutes(app:FastifyInstance,db:()=>Firestore,context:(request:FastifyRequest)=>{uid:string;events:CollectionReference}) {
  for (const section of ['tasks','vendors','ideas'] as const) for (const method of ['POST','PUT','DELETE'] as const) {
    app.route({method,url:`/v1/events/:id/plan/${section}${method==='POST'?'':'/:itemId'}`,handler:async request=>{
      const body=method==='DELETE'?DeletePlanItemRequestSchema.parse(request.body):schemas[section].parse(request.body);
      const item=method==='DELETE'?undefined:schemas[section].parse(request.body).item;
      const params=request.params as {id:string;itemId?:string};
      const itemId=IdSchema.parse(method==='POST'?item?.id:params.itemId);
      const {uid,events}=context(request); const ref=events.doc(IdSchema.parse(params.id));
      return db().runTransaction(async tx=>{
        const data=(await tx.get(ref)).data(); if(!data) throw missing();
        const current=EventRecordSchema.parse(data); if(current.ownerId!==uid||current.status==='deleting') throw missing();
        if(current.status!=='active'||current.currentVersion===null||current.revision!==body.expectedVersion||current.revision===Number.MAX_SAFE_INTEGER) throw conflict();
        const planRef=ref.collection('planning').doc('current');const before=PlanSnapshotSchema.parse((await tx.get(planRef)).data());
        let plan:PlanSnapshot;
        try {plan=editPlanItem(before,section,method,itemId,item,body.reason,new Date());}
        catch(error) {if(error instanceof RuleError) throw new ApiFailure(400,'INVALID_INPUT',error.message);throw error;}
        const revision=current.revision+1;const now=new Date().toISOString();
        const event=EventRecordSchema.parse({...current,revision,currentVersion:revision,updatedAt:now});
        const version=PlanVersionSchema.parse({id:String(revision),eventId:current.id,schemaVersion:1,version:revision,snapshot:plan,acceptedAt:now,acceptedBy:uid,generation:{source:'manual',modelId:null,promptVersion:null,latencyMs:0,inputTokens:0,outputTokens:0},acknowledgedInfeasible:plan.feasibility.status==='infeasible'});
        tx.set(ref,event);tx.set(planRef,plan);tx.create(ref.collection('versions').doc(String(revision)),version);
        tx.create(ref.collection('planEdits').doc(String(revision)),{section,operation:method,itemId,reason:body.reason,actor:uid,recordedAt:now});
        return {event,plan};
      });
    }});
  }
}

import { createHash } from 'node:crypto';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { CollectionReference, DocumentReference, Firestore, Transaction } from 'firebase-admin/firestore';
import { AcceptDraftRequestSchema, BudgetLedgerSchema, EventRecordSchema, EventVersionRequestSchema, ExtractBriefRequestSchema, GeneratePlanRequestSchema, IdempotencyKeySchema, IdSchema, PlanDraftSchema, PlanVersionSchema } from '@jashn/contracts';
import type { EventRecord } from '@jashn/contracts';
import { budgetTotals, RuleError } from '@jashn/planning-rules';
import { ApiFailure } from '../events.js';
import type { AiConfig } from './provider.js';
import { checkedExtraction, checkedPlan, generateValidated, recheckDraft, templates } from './pipeline.js';
interface Context { uid:string; events:CollectionReference }
type ContextFn=(request:FastifyRequest)=>Context;
const conflict=()=>new ApiFailure(409,'VERSION_CONFLICT','This request is stale, already running or no longer applicable. Reload and review.');
const missing=()=>new ApiFailure(404,'NOT_FOUND','Planning resource not found.');
function own(data:unknown,uid:string) { if(!data) throw missing(); const event=EventRecordSchema.parse(data); if(event.ownerId!==uid || event.status==='deleting') throw missing(); return event; }
function active(event:EventRecord,version:number) { if(event.status!=='active' || event.currentVersion!==null || event.revision!==version || event.revision===Number.MAX_SAFE_INTEGER) throw conflict(); }
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const key=(request:FastifyRequest)=>IdempotencyKeySchema.parse(request.headers['idempotency-key']);
const id=(request:FastifyRequest,field:string)=>IdSchema.parse((request.params as Record<string,string>)[field]);
function reviewedDraft(input: unknown) {
  const draft = PlanDraftSchema.parse(input);
  const plan = draft.snapshot;
  return {...draft, totals: budgetTotals({lines:plan.budgetLines, contingencyMinor:plan.contingencyMinor}, plan.brief.budgetMinor)};
}
interface Lease { id:string; uid:string; deadline:number }
export function aiRoutes(routes:FastifyInstance, db:()=>Firestore, context:ContextFn, config:AiConfig|null) {
  const configured=()=>{ if(!config) throw new ApiFailure(503,'PROVIDER_UNAVAILABLE','AI generation is not configured. Your saved work is available.'); return config; };
  routes.get('/v1/ai/status',async()=>({enabled:Boolean(config),model:config?.provider.model || null}));
  async function reserve(tx:Transaction,uid:string,job:DocumentReference, fingerprint:string,check:(exists:boolean)=>Promise<void>) {
    const settings=configured(); const prior=await tx.get(job); await check(prior.exists);
    if(prior.exists) { if(prior.data()!.fingerprint!==fingerprint) throw conflict(); return prior.data()!; }
    const day=new Date().toISOString().slice(0,10); const global=db().collection('aiUsage').doc(day); const user=db().collection('users').doc(uid).collection('aiUsage').doc(day);
    const [g,u]=await Promise.all([tx.get(global),tx.get(user)]); const now=Date.now();
    const leases=((g.data()?.leases || []) as Lease[]).filter(lease=>lease.deadline>now);
    if((g.data()?.count || 0)+2>settings.globalDailyLimit || (u.data()?.count || 0)+2>settings.userDailyLimit || leases.length>=settings.concurrency || leases.some(lease=>lease.uid===uid)) throw new ApiFailure(429,'USAGE_LIMIT','AI usage limit reached or another request is running. Try later.');
    const deadline=now+settings.timeoutMs+5000; const leaseId=hash(job.path);
    tx.set(global,{count:(g.data()?.count || 0)+2,leases:[...leases,{id:leaseId,uid,deadline}]}); tx.set(user,{count:(u.data()?.count || 0)+2});
    const record={fingerprint,status:'pending',createdAt:new Date(now).toISOString(),deadline,day,leaseId}; tx.create(job,record); return null;
  }
  async function release(job:DocumentReference) {
    await db().runTransaction(async tx=>{ const saved=await tx.get(job); if(!saved.exists) return; const global=db().collection('aiUsage').doc(saved.data()!.day); const usage=await tx.get(global); if(usage.exists) tx.update(global,{leases:((usage.data()!.leases || []) as Lease[]).filter(item=>item.id!==saved.data()!.leaseId)}); });
  }
  function replay(prior:Record<string,unknown>) {
    if(prior.status==='succeeded') return prior.result;
    if(prior.status==='failed' || Number(prior.deadline)<Date.now()) throw new ApiFailure(503,'PROVIDER_UNAVAILABLE','This AI attempt failed or expired. Start a new request.');
    throw conflict();
  }
  async function run(job:DocumentReference, work:()=>Promise<unknown>, check:(tx:Transaction)=>Promise<void>) {
    try {
      await db().runTransaction(async tx=>{ await check(tx); const saved=await tx.get(job); if(!saved.exists || saved.data()!.deadline<Date.now()) throw conflict(); tx.update(job,{status:'running'}); });
      return await work();
    } catch(error) {
      // Never recreate event children after deletion; transaction reads the parent barrier.
      await db().runTransaction(async tx=>{ try { await check(tx); } catch { return; } const saved=await tx.get(job); if(saved.exists) tx.update(job,{status:'failed',error:'Generation failed. Saved work was not replaced.'}); }).catch(()=>undefined);
      if(error instanceof ApiFailure) throw error;
      if(error instanceof RuleError) throw new ApiFailure(400,'INVALID_INPUT',error.message);
      throw new ApiFailure(503,'PROVIDER_UNAVAILABLE','AI could not produce a valid draft within the limits. Your saved work is unchanged.');
    } finally { await release(job).catch(()=>undefined); }
  }
  routes.post('/v1/briefs/extract',async request=>{
    const body=ExtractBriefRequestSchema.parse(request.body); const settings=configured(); const {uid}=context(request); const job=db().collection('users').doc(uid).collection('extractions').doc(key(request));
    const prior=await db().runTransaction(tx=>reserve(tx,uid,job,hash(body),async()=>undefined)); if(prior) return replay(prior);
    return run(job,async()=>{ const output=await generateValidated(settings,{text:body.text},'extract',raw=>checkedExtraction(raw,body.text)); await job.update({status:'succeeded',result:output.value,generation:output.generation}); return output.value; },async()=>undefined);
  });
  routes.post('/v1/events/:id/generations',async(request,reply)=>{
    const body=GeneratePlanRequestSchema.parse(request.body); const settings=configured(); const {uid,events}=context(request); const ref=events.doc(id(request,'id')); const job=ref.collection('jobs').doc(key(request));
    const check=async(tx:Transaction)=>{ own((await tx.get(ref)).data(),uid); };
    const prior=await db().runTransaction(tx=>reserve(tx,uid,job,hash(body),async exists=>{ const event=own((await tx.get(ref)).data(),uid); if(!exists) active(event,body.expectedVersion); })); if(prior) return replay(prior);
    return run(job,async()=>{
      const initial=await db().runTransaction(async tx=>{ const event=own((await tx.get(ref)).data(),uid); active(event,body.expectedVersion); const ledger=BudgetLedgerSchema.parse((await tx.get(ref.collection('planning').doc('budget'))).data() || {lines:[],contingencyMinor:0}); return {event,ledger}; });
      const {brief}=initial.event;
      const output=await generateValidated(settings,{brief:{type:brief.type,city:brief.city,localDate:brief.localDate,timezone:brief.timezone,guests:brief.guests,currency:brief.currency,budgetMinor:brief.budgetMinor,priorities:brief.priorities,hardRequirements:brief.hardRequirements,preferences:{theme:brief.preferences.theme,dietary:brief.preferences.dietary,accessibility:brief.preferences.accessibility,cultural:brief.preferences.cultural}},existingBudget:initial.ledger.lines.map(({id,category,estimatedCostMinor,committedCostMinor,paidMinor,locked})=>({id,category,estimatedCostMinor,committedCostMinor,paidMinor,locked})),contingencyMinor:initial.ledger.contingencyMinor,template:templates[brief.type],today:new Date().toISOString()},'plan',raw=>checkedPlan(raw,brief,initial.ledger,new Date()));
      if (output.generation.source === 'synthetic') {
        const manualIds = new Set(initial.ledger.lines.map(line=>line.id));
        for (const line of output.value.budgetLines) if (!manualIds.has(line.id)) line.provenance.sourceType = 'synthetic';
        for (const vendor of output.value.vendorChecklist) vendor.estimatedRange.provenance.sourceType = 'synthetic';
        for (const idea of output.value.ideas) idea.estimatedCostImpact.provenance.sourceType = 'synthetic';
      }
      const now=new Date(); const draft=reviewedDraft({id:job.id,baseVersion:body.expectedVersion,snapshot:output.value,generation:output.generation,status:'draft',createdAt:now.toISOString(),expiresAt:new Date(now.getTime()+86400000).toISOString(),acceptedVersion:null});
      const result={jobId:job.id,draft};
      await db().runTransaction(async tx=>{ const event=own((await tx.get(ref)).data(),uid); active(event,body.expectedVersion); const saved=await tx.get(job); if(!saved.exists || saved.data()!.deadline<Date.now()) throw conflict(); tx.create(ref.collection('drafts').doc(draft.id),draft); tx.update(job,{status:'succeeded',result}); });
      return reply.code(201).send(result);
    },check);
  });
  routes.get('/v1/events/:id/jobs/:jobId',async request=>{
    const {uid,events}=context(request); const ref=events.doc(id(request,'id')); const job=ref.collection('jobs').doc(id(request,'jobId'));
    return db().runTransaction(async tx=>{ own((await tx.get(ref)).data(),uid); const saved=await tx.get(job); if(!saved.exists) throw missing(); const data=saved.data()!; const expired=(data.status==='pending'||data.status==='running')&&data.deadline<Date.now(); if(expired) tx.update(job,{status:'failed',error:'Request expired after interruption.'}); return {job:{id:job.id,status:expired?'failed':data.status,deadline:data.deadline,draftId:data.status==='succeeded'?job.id:null}}; });
  });
  routes.get('/v1/events/:id/jobs',async request=>{
    const {uid,events}=context(request); const ref=events.doc(id(request,'id')); own((await ref.get()).data(),uid);
    const saved=await ref.collection('jobs').orderBy('createdAt','desc').limit(5).get();
    return {jobs:saved.docs.map(doc=>{const data=doc.data();return {id:doc.id,status:(data.status==='pending'||data.status==='running')&&data.deadline<Date.now()?'failed':data.status,deadline:data.deadline,draftId:data.status==='succeeded'?doc.id:null};})};
  });
  routes.get('/v1/events/:id/drafts',async request=>{
    const {uid,events}=context(request); const ref=events.doc(id(request,'id')); own((await ref.get()).data(),uid);
    const docs=await ref.collection('drafts').orderBy('createdAt','desc').limit(10).get(); return {drafts:docs.docs.map(doc=>reviewedDraft(doc.data()))};
  });
  routes.get('/v1/events/:id/drafts/:draftId',async request=>{
    const {uid,events}=context(request); const ref=events.doc(id(request,'id')); own((await ref.get()).data(),uid); const saved=await ref.collection('drafts').doc(id(request,'draftId')).get(); if(!saved.exists) throw missing(); return {draft:reviewedDraft(saved.data())};
  });
  routes.post('/v1/events/:id/drafts/:draftId/discard',async request=>{
    const body=EventVersionRequestSchema.parse(request.body); const {uid,events}=context(request); const ref=events.doc(id(request,'id')); const draftRef=ref.collection('drafts').doc(id(request,'draftId'));
    return db().runTransaction(async tx=>{ const event=own((await tx.get(ref)).data(),uid); if(event.status!=='active'||event.revision!==body.expectedVersion) throw conflict(); const saved=await tx.get(draftRef); if(!saved.exists) throw missing(); const draft=PlanDraftSchema.parse(saved.data()); if(draft.status==='accepted') throw conflict(); tx.update(draftRef,{status:'discarded'}); return {draftId:draft.id,status:'discarded'}; });
  });
  routes.post('/v1/events/:id/drafts/:draftId/accept',async request=>{
    const body=AcceptDraftRequestSchema.parse(request.body); const {uid,events}=context(request); const ref=events.doc(id(request,'id')); const draftRef=ref.collection('drafts').doc(id(request,'draftId')); const action=ref.collection('actions').doc(key(request)); const fingerprint=hash({draftId:draftRef.id,...body});
    return db().runTransaction(async tx=>{
      const current=own((await tx.get(ref)).data(),uid); const prior=await tx.get(action);
      if(prior.exists) { if(prior.data()!.fingerprint!==fingerprint) throw conflict(); return prior.data()!.result; }
      active(current,body.expectedVersion);
      const saved=await tx.get(draftRef); if(!saved.exists) throw missing(); const draft=PlanDraftSchema.parse(saved.data());
      if(draft.status!=='draft'||draft.baseVersion!==current.revision||Date.parse(draft.expiresAt)<=Date.now()) throw conflict();
      const ledger=BudgetLedgerSchema.parse((await tx.get(ref.collection('planning').doc('budget'))).data()||{lines:[],contingencyMinor:0});
      let plan; try { plan=recheckDraft(draft.snapshot,current.brief,ledger,new Date()); } catch { throw conflict(); }
      if(plan.feasibility.status==='infeasible'&&!body.acknowledgeInfeasible) throw new ApiFailure(422,'INFEASIBLE','Review and acknowledge the infeasibility before accepting.');
      const revision=current.revision+1; const now=new Date().toISOString(); const event=EventRecordSchema.parse({...current,revision,currentVersion:revision,updatedAt:now});
      const version=PlanVersionSchema.parse({id:String(revision),eventId:event.id,schemaVersion:1,version:revision,snapshot:plan,acceptedAt:now,acceptedBy:uid,generation:draft.generation,acknowledgedInfeasible:body.acknowledgeInfeasible});
      const result={event,plan}; tx.set(ref,event); tx.create(ref.collection('versions').doc(String(revision)),version); tx.set(ref.collection('planning').doc('current'),plan); tx.set(ref.collection('planning').doc('budget'),{lines:plan.budgetLines,contingencyMinor:plan.contingencyMinor}); tx.update(draftRef,{status:'accepted',acceptedVersion:revision}); tx.create(action,{fingerprint,result}); return result;
    });
  });
}



import { createHash } from 'node:crypto';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { CollectionReference, DocumentReference, Firestore, Transaction } from 'firebase-admin/firestore';
import { AcceptDraftRequestSchema, BudgetLedgerSchema, EventRecordSchema, EventVersionRequestSchema, ExtractBriefRequestSchema, GeneratePlanRequestSchema, IdempotencyKeySchema, IdSchema, PlanDraftSchema, PlanSnapshotSchema, PlanVersionSchema, ReplanExtractRequestSchema, ReplanProposalSchema, ReplanRequestSchema, RestoreProposalRequestSchema, VersionSummarySchema } from '@jashn/contracts';
import type { EventRecord, PlanSnapshot } from '@jashn/contracts';
import { budgetTotals, RuleError } from '@jashn/planning-rules';
import { ApiFailure } from '../events.js';
import type { AiConfig } from './provider.js';
import { checkedExtraction, checkedPlan, generateValidated, recheckDraft, templates } from './pipeline.js';
import { buildReplanPromptData, checkedReplanCandidate, collectPreservedLockIds, computeReplanDiff } from './replan-pipeline.js';
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

  // ── Phase 09: Replanning, proposals and version history ──────────────────

  /** Extract structured changes from natural-language text (same quota/idempotency as brief extraction). */
  routes.post('/v1/events/:id/replans/extract',async request=>{
    const body=ReplanExtractRequestSchema.parse(request.body); const settings=configured(); const {uid,events}=context(request); const ref=events.doc(id(request,'id'));
    await db().runTransaction(async tx=>{ own((await tx.get(ref)).data(),uid); });
    const job=db().collection('users').doc(uid).collection('extractions').doc(key(request));
    const prior=await db().runTransaction(tx=>reserve(tx,uid,job,hash(body),async()=>undefined)); if(prior) return replay(prior);
    return run(job,async()=>{
      const output=await generateValidated(settings,{text:body.text},'extract',raw=>checkedExtraction(raw,body.text));
      const changes: Record<string,unknown>={};
      if(output.value.draft.budgetMinor!=null) changes.budgetMinor=output.value.draft.budgetMinor;
      if(output.value.draft.localDate!=null) changes.localDate=output.value.draft.localDate;
      if(output.value.draft.guests!=null) changes.guests=output.value.draft.guests;
      const result={draftChanges:changes,uncertainties:output.value.uncertainties};
      await job.update({status:'succeeded',result}); return result;
    },async()=>undefined);
  });

  /** Generate a replan proposal without mutating the accepted plan. */
  routes.post('/v1/events/:id/replans',async(request,reply)=>{
    const body=ReplanRequestSchema.parse(request.body); const settings=configured(); const {uid,events}=context(request); const ref=events.doc(id(request,'id')); const job=ref.collection('replanJobs').doc(key(request));
    const check=async(tx:Transaction)=>{ own((await tx.get(ref)).data(),uid); };
    const prior=await db().runTransaction(tx=>reserve(tx,uid,job,hash(body),async exists=>{ const event=own((await tx.get(ref)).data(),uid); if(!exists){ if(event.status!=='active'||event.currentVersion===null||event.revision!==body.baseVersion) throw conflict(); } })); if(prior) return replay(prior);
    return run(job,async()=>{
      const initial=await db().runTransaction(async tx=>{ const event=own((await tx.get(ref)).data(),uid); if(event.status!=='active'||event.currentVersion===null||event.revision!==body.baseVersion) throw conflict(); const currentPlan=PlanSnapshotSchema.parse((await tx.get(ref.collection('planning').doc('current'))).data()); return {event,currentPlan}; });
      const {event,currentPlan}=initial; const {changes}=body;
      const requestedBrief={...currentPlan.brief,...(changes.budgetMinor!==undefined?{budgetMinor:changes.budgetMinor}:{}),...(changes.localDate!==undefined?{localDate:changes.localDate}:{}),...(changes.guests!==undefined?{guests:changes.guests}:{}),...(changes.hardRequirements!==undefined?{hardRequirements:changes.hardRequirements}:{})};
      const promptData=buildReplanPromptData(currentPlan,changes);
      const output=await generateValidated(settings,promptData,'replan',raw=>checkedReplanCandidate(raw,requestedBrief,currentPlan,new Date()));
      const candidate=output.value;
      const diff=computeReplanDiff(currentPlan,candidate); const preservedLockIds=collectPreservedLockIds(candidate);
      const now=new Date(); const proposalId=job.id;
      const proposal=ReplanProposalSchema.parse({id:proposalId,eventId:event.id,ownerId:uid,baseVersion:body.baseVersion,requestedChanges:changes,candidate,diff,preservedLockIds,validation:{schemaVersion:1,rulesVersion:'jashn-rules-v1',checkedAt:now.toISOString()},status:'draft',createdAt:now.toISOString(),expiresAt:new Date(now.getTime()+86400000).toISOString(),appliedVersion:null});
      const result={proposal};
      await db().runTransaction(async tx=>{ const evt=own((await tx.get(ref)).data(),uid); if(evt.status!=='active'||evt.currentVersion===null||evt.revision!==body.baseVersion) throw conflict(); const saved=await tx.get(job); if(!saved.exists||saved.data()!.deadline<Date.now()) throw conflict(); tx.create(ref.collection('proposals').doc(proposalId),proposal); tx.update(job,{status:'succeeded',result}); });
      return reply.code(201).send(result);
    },check);
  });

  /** Get a proposal by ID. */
  routes.get('/v1/events/:id/proposals/:proposalId',async request=>{
    const {uid,events}=context(request); const ref=events.doc(id(request,'id')); own((await ref.get()).data(),uid);
    const saved=await ref.collection('proposals').doc(id(request,'proposalId')).get(); if(!saved.exists) throw missing();
    const proposal=ReplanProposalSchema.parse(saved.data());
    // Mark as expired if stale
    if(proposal.status==='draft'&&Date.parse(proposal.expiresAt)<=Date.now()) { await ref.collection('proposals').doc(proposal.id).update({status:'expired'}); return {proposal:{...proposal,status:'expired'}}; }
    return {proposal};
  });

  /** Apply a proposal atomically. Idempotent. */
  routes.post('/v1/events/:id/proposals/:proposalId/apply',async request=>{
    const body=AcceptDraftRequestSchema.parse(request.body); const {uid,events}=context(request); const ref=events.doc(id(request,'id')); const proposalRef=ref.collection('proposals').doc(id(request,'proposalId')); const action=ref.collection('actions').doc(key(request)); const fingerprint=hash({proposalId:proposalRef.id,...body});
    return db().runTransaction(async tx=>{
      const current=own((await tx.get(ref)).data(),uid); const prior=await tx.get(action);
      if(prior.exists){ if(prior.data()!.fingerprint!==fingerprint) throw conflict(); return prior.data()!.result; }
      if(current.status!=='active'||current.currentVersion===null||current.revision!==body.expectedVersion||current.revision===Number.MAX_SAFE_INTEGER) throw conflict();
      const saved=await tx.get(proposalRef); if(!saved.exists) throw missing();
      const proposal=ReplanProposalSchema.parse(saved.data());
      if(proposal.status!=='draft') throw conflict(); // already applied, discarded or expired
      if(proposal.baseVersion!==current.revision) throw new ApiFailure(409,'VERSION_CONFLICT','This proposal was based on an older plan. Reload and generate a new proposal.');
      if(Date.parse(proposal.expiresAt)<=Date.now()) throw new ApiFailure(409,'PROPOSAL_EXPIRED','This proposal expired. Generate a new one.');
      if(proposal.candidate.feasibility.status==='infeasible'&&!body.acknowledgeInfeasible) throw new ApiFailure(422,'INFEASIBLE','This proposal is infeasible. Acknowledge the shortfall before applying.');
      const livePlan=PlanSnapshotSchema.parse((await tx.get(ref.collection('planning').doc('current'))).data());
      checkedReplanCandidate(proposal.candidate,proposal.candidate.brief,livePlan,new Date());
      const revision=current.revision+1; const now=new Date().toISOString();
      const event=EventRecordSchema.parse({...current,brief:proposal.candidate.brief,revision,currentVersion:revision,updatedAt:now});
      const version=PlanVersionSchema.parse({id:String(revision),eventId:event.id,schemaVersion:1,version:revision,snapshot:proposal.candidate,acceptedAt:now,acceptedBy:uid,generation:{source:'synthetic',modelId:null,promptVersion:'replan-v1',latencyMs:0,inputTokens:0,outputTokens:0},acknowledgedInfeasible:body.acknowledgeInfeasible});
      const result={event,plan:proposal.candidate};
      tx.set(ref,event); tx.create(ref.collection('versions').doc(String(revision)),version); tx.set(ref.collection('planning').doc('current'),proposal.candidate); tx.set(ref.collection('planning').doc('budget'),{lines:proposal.candidate.budgetLines,contingencyMinor:proposal.candidate.contingencyMinor}); tx.update(proposalRef,{status:'applied',appliedVersion:revision}); tx.create(action,{fingerprint,result});
      return result;
    });
  });

  /** Discard a proposal without touching the accepted plan. */
  routes.post('/v1/events/:id/proposals/:proposalId/discard',async request=>{
    const body=EventVersionRequestSchema.parse(request.body); const {uid,events}=context(request); const ref=events.doc(id(request,'id')); const proposalRef=ref.collection('proposals').doc(id(request,'proposalId'));
    return db().runTransaction(async tx=>{ const event=own((await tx.get(ref)).data(),uid); if(event.status!=='active'||event.revision!==body.expectedVersion) throw conflict(); const saved=await tx.get(proposalRef); if(!saved.exists) throw missing(); const proposal=ReplanProposalSchema.parse(saved.data()); if(proposal.status!=='draft') throw conflict(); tx.update(proposalRef,{status:'discarded'}); return {proposalId:proposal.id,status:'discarded'}; });
  });

  /** List accepted plan versions (newest first, cursor-paginated). */
  routes.get('/v1/events/:id/versions',async request=>{
    const {uid,events}=context(request); const ref=events.doc(id(request,'id')); own((await ref.get()).data(),uid);
    const params=request.query as Record<string,string>;
    const limit=Math.min(Number(params.limit)||20,50); const cursor=params.cursor;
    let query=ref.collection('versions').orderBy('version','desc').limit(limit+1);
    if(cursor) query=query.startAfter(Number(cursor));
    const docs=await query.get();
    const items=docs.docs.slice(0,limit).map(doc=>{ const data=doc.data(); return VersionSummarySchema.parse({id:doc.id,version:data.version,acceptedAt:data.acceptedAt,overview:data.snapshot?.overview||''}); });
    const nextCursor=docs.docs.length>limit?String(items[items.length-1]?.version):null;
    return {versions:items,nextCursor};
  });

  /** Get a single accepted version snapshot. */
  routes.get('/v1/events/:id/versions/:versionId',async request=>{
    const {uid,events}=context(request); const ref=events.doc(id(request,'id')); own((await ref.get()).data(),uid);
    const saved=await ref.collection('versions').doc(id(request,'versionId')).get(); if(!saved.exists) throw missing();
    return {version:PlanVersionSchema.parse(saved.data())};
  });

  /** Create a restore-proposal from a historical version, reconciling current financial state. */
  routes.post('/v1/events/:id/versions/:versionId/restore-proposals',async(request,reply)=>{
    const body=RestoreProposalRequestSchema.parse(request.body); const {uid,events}=context(request); const ref=events.doc(id(request,'id'));
    const data=await db().runTransaction(async tx=>{
      const event=own((await tx.get(ref)).data(),uid); if(event.status!=='active'||event.currentVersion===null||event.revision!==body.baseVersion) throw conflict();
      const versionDoc=await tx.get(ref.collection('versions').doc(id(request,'versionId'))); if(!versionDoc.exists) throw missing();
      const currentPlan=PlanSnapshotSchema.parse((await tx.get(ref.collection('planning').doc('current'))).data());
      return {event,historicalSnapshot:PlanVersionSchema.parse(versionDoc.data()).snapshot,currentPlan};
    });
    const {event,historicalSnapshot,currentPlan}=data;
    // Reconcile: start from historical content but overwrite financial fields from the current ledger.
    const currentFinancialById=new Map(currentPlan.budgetLines.map(l=>[l.id,l]));
    const reconciledLines=historicalSnapshot.budgetLines.map(hLine=>{
      const live=currentFinancialById.get(hLine.id);
      if(live) return {...hLine,committedCostMinor:live.committedCostMinor,paidMinor:live.paidMinor,locked:live.locked};
      return {...hLine,committedCostMinor:null,paidMinor:0};
    });
    const reconciledSnapshot:PlanSnapshot={...historicalSnapshot,budgetLines:reconciledLines};
    // Build as a proposal so the normal review/apply flow handles acceptance.
    const now=new Date(); const proposalId=`restore-${event.id}-v${id(request,'versionId')}-${Date.now()}`.replace(/[^A-Za-z0-9_-]/g,'-');
    const candidate=checkedReplanCandidate(reconciledSnapshot,reconciledSnapshot.brief,currentPlan,now);
    const diff=computeReplanDiff(currentPlan,candidate); const preservedLockIds=collectPreservedLockIds(candidate);
    const totals=budgetTotals({lines:candidate.budgetLines,contingencyMinor:candidate.contingencyMinor},candidate.brief.budgetMinor);
    const reasons=totals.shortfallMinor>0?[`Restored plan exceeds the budget cap by ₹${(totals.shortfallMinor/100).toFixed(2)}.`]:[];
    const candidateWithFeasibility=PlanSnapshotSchema.parse({...candidate,feasibility:reasons.length?{status:'infeasible',shortfallMinor:totals.shortfallMinor,reasons}:{status:'feasible',shortfallMinor:0,reasons:[]}});
    const proposal=ReplanProposalSchema.parse({id:proposalId,eventId:event.id,ownerId:uid,baseVersion:body.baseVersion,requestedChanges:{budgetMinor:candidate.brief.budgetMinor},candidate:candidateWithFeasibility,diff,preservedLockIds,validation:{schemaVersion:1,rulesVersion:'jashn-rules-v1',checkedAt:now.toISOString()},status:'draft',createdAt:now.toISOString(),expiresAt:new Date(now.getTime()+86400000).toISOString(),appliedVersion:null});
    await ref.collection('proposals').doc(proposalId).create(proposal);
    return reply.code(201).send({proposal});
  });
}

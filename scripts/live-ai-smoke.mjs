// Manually run only after selecting a live project and approving the spending cap.
// Uses the authenticated API, so distributed quotas and draft-only semantics apply.
import { randomUUID } from 'node:crypto';
if(process.env.LIVE_AI_SMOKE_APPROVED!=='true'||!process.env.JASHN_SMOKE_ID_TOKEN) throw new Error('Set approval and a local test-account ID token outside source control.');
const origin=process.env.SMOKE_API_ORIGIN || 'http://127.0.0.1:3001';
const request=async(path,body,key)=>{
  const response=await fetch(origin+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${process.env.JASHN_SMOKE_ID_TOKEN}`,...(body?{'Content-Type':'application/json'}:{}),...(key?{'Idempotency-Key':key}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(65000)});
  if(!response.ok) throw new Error(`API check failed (${response.status}); inspect safe server/UI status.`);
  return response.json();
};
const status=await request('/v1/ai/status');if(!status.enabled) throw new Error('Live generation is disabled.');
const date=new Date();date.setUTCDate(date.getUTCDate()+120);
let passed=0;
for(const type of ['birthday','wedding','community']) {
  try {
    const created=await request('/v1/events',{brief:{name:`Live smoke ${type}`,type,city:'Noida',localDate:date.toISOString().slice(0,10),timezone:'Asia/Kolkata',guests:50,currency:'INR',budgetMinor:5000000,priorities:['Food'],hardRequirements:['Vegetarian menu'],preferences:{}}});
    const result=await request(`/v1/events/${created.event.id}/generations`,{expectedVersion:0},randomUUID());
    if(result.draft.generation.source!=='gemini'||!result.draft.snapshot.overview || !result.draft.snapshot.budgetLines.length || !result.draft.snapshot.tasks.length || !result.draft.snapshot.vendorChecklist.length || !result.draft.snapshot.ideas.length || !result.draft.totals) throw new Error('Not a live complete draft.');
    const saved=await request(`/v1/events/${created.event.id}`);if(saved.plan!==null) throw new Error('Generation unexpectedly accepted a plan.');
    passed++;console.info(`${type}: live draft validated; organizer review still required.`);
  } catch { console.info(`${type}: live check failed; no acceptance requested.`); }
}
console.info(`Live smoke: ${passed}/3 passed; model ${status.model}. No plans auto-accepted.`);
if(passed!==3)process.exitCode=1;

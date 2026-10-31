import { DeletionResponseSchema, EventDetailResponseSchema, EventListResponseSchema, EventResponseSchema } from '@jashn/contracts';
import type { EventBrief } from '@jashn/contracts';
import { GenerationJobsResponseSchema, AiStatusSchema, DraftListResponseSchema, ExtractionResponseSchema, GenerationResponseSchema, ApiErrorSchema, BudgetResponseSchema, ProposalResponseSchema, VersionListResponseSchema, VersionResponseSchema } from '@jashn/contracts';
import type { SaveBudgetRequest } from '@jashn/contracts';
import { auth } from '../auth/firebase';
export class RequestError extends Error { constructor(public status: number, message: string) { super(message); } }
async function request(path: string, method = 'GET', body?: unknown, signal?: AbortSignal, root = '/v1/events', idempotencyKey?: string) {
  const user = auth?.currentUser;
  if (!user) throw new RequestError(401, 'Please sign in again.');
  const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
  const send = async (refresh = false) => fetch(`${base}${root}${path}`, { method, signal: signal || null, headers: { ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}), Authorization: `Bearer ${await user.getIdToken(refresh)}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  let response = await send();
  if (response.status === 401) response = await send(true);
  if (auth?.currentUser?.uid !== user.uid) throw new RequestError(401, 'Your session changed. Please reopen this page.');
  if ([400,422,429,503].includes(response.status)) { const parsed = ApiErrorSchema.safeParse(await response.json()); throw new RequestError(response.status, parsed.success ? parsed.data.error.message : 'Check the submitted values.'); }
  if (!response.ok) throw new RequestError(response.status, response.status === 401 ? 'Your session expired. Sign out and sign in again.' : response.status === 409 ? 'This occasion changed. Reload it before trying again.' : response.status === 404 ? 'Occasion not found.' : 'Could not complete the request. Check your connection and try again.');
  return response.json() as Promise<unknown>;
}
export const eventsApi = {
  async budget(id: string, signal?: AbortSignal) { return BudgetResponseSchema.parse(await request(`/${encodeURIComponent(id)}/budget`, 'GET', undefined, signal)); },
  async saveBudget(id: string, body: SaveBudgetRequest) { return BudgetResponseSchema.parse(await request(`/${encodeURIComponent(id)}/budget`, 'PUT', body)); },
  async deletion(id: string) { return DeletionResponseSchema.parse(await request('/' + encodeURIComponent(id) + '/deletion')); },
  async retryDeletion(id: string) { return DeletionResponseSchema.parse(await request('/' + encodeURIComponent(id) + '/deletion/retry', 'POST')); },
  async list(status: 'active' | 'archived', cursor?: string, signal?: AbortSignal) { return EventListResponseSchema.parse(await request(`?status=${status}&limit=10${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`, 'GET', undefined, signal)); },
  async get(id: string, signal?: AbortSignal) { return EventDetailResponseSchema.parse(await request(`/${encodeURIComponent(id)}`, 'GET', undefined, signal)); },
  async create(brief: EventBrief) { return EventResponseSchema.parse(await request('', 'POST', { brief })); },
  async edit(id: string, expectedVersion: number, brief: EventBrief) { return EventResponseSchema.parse(await request(`/${encodeURIComponent(id)}`, 'PATCH', { expectedVersion, brief })); },
  async archive(id: string, expectedVersion: number, archived: boolean) { return EventResponseSchema.parse(await request(`/${encodeURIComponent(id)}/${archived ? 'unarchive' : 'archive'}`, 'POST', { expectedVersion })); },
  async remove(id: string, expectedVersion: number, confirmationName: string) { return DeletionResponseSchema.parse(await request(`/${encodeURIComponent(id)}`, 'DELETE', { expectedVersion, confirmationName })); },
};

export const aiApi = {
  async jobs(id:string,signal?:AbortSignal) { return GenerationJobsResponseSchema.parse(await request('/'+encodeURIComponent(id)+'/jobs','GET',undefined,signal)); },
  async status(signal?:AbortSignal) { return AiStatusSchema.parse(await request('/ai/status','GET',undefined,signal,'/v1')); },
  async extract(text:string,key:string) { return ExtractionResponseSchema.parse(await request('/briefs/extract','POST',{text},undefined,'/v1',key)); },
  async drafts(id:string,signal?:AbortSignal) { return DraftListResponseSchema.parse(await request(`/${encodeURIComponent(id)}/drafts`,'GET',undefined,signal)); },
  async generate(id:string,expectedVersion:number,key:string) { return GenerationResponseSchema.parse(await request(`/${encodeURIComponent(id)}/generations`,'POST',{expectedVersion},undefined,'/v1/events',key)); },
  async accept(id:string,draftId:string,expectedVersion:number,acknowledgeInfeasible:boolean,key:string) { return EventDetailResponseSchema.parse(await request(`/${encodeURIComponent(id)}/drafts/${encodeURIComponent(draftId)}/accept`,'POST',{expectedVersion,acknowledgeInfeasible},undefined,'/v1/events',key)); },
  async discard(id:string,draftId:string,expectedVersion:number) { return request(`/${encodeURIComponent(id)}/drafts/${encodeURIComponent(draftId)}/discard`,'POST',{expectedVersion}); },
};

export const planningApi = {
  async save(id:string,section:'tasks'|'vendors'|'ideas',method:'POST'|'PUT'|'DELETE',itemId:string,expectedVersion:number,item:unknown,reason:string) {
    return EventDetailResponseSchema.parse(await request(`/${encodeURIComponent(id)}/plan/${section}${method==='POST'?'':'/'+encodeURIComponent(itemId)}`,method,{expectedVersion,...(method==='DELETE'?{}:{item}),reason}));
  },
};

export const replanApi = {
  async generate(id:string,baseVersion:number,changes:{budgetMinor?:number;localDate?:string;guests?:number;hardRequirements?:string[]}) {
    return ProposalResponseSchema.parse(await request(`/${encodeURIComponent(id)}/replans`,'POST',{baseVersion,changes},undefined,'/v1/events',crypto.randomUUID()));
  },
  async get(id:string,proposalId:string,signal?:AbortSignal) {
    return ProposalResponseSchema.parse(await request(`/${encodeURIComponent(id)}/proposals/${encodeURIComponent(proposalId)}`,'GET',undefined,signal));
  },
  async apply(id:string,proposalId:string,expectedVersion:number,acknowledgeInfeasible:boolean) {
    return EventDetailResponseSchema.parse(await request(`/${encodeURIComponent(id)}/proposals/${encodeURIComponent(proposalId)}/apply`,'POST',{expectedVersion,acknowledgeInfeasible},undefined,'/v1/events',crypto.randomUUID()));
  },
  async discard(id:string,proposalId:string,expectedVersion:number) {
    return request(`/${encodeURIComponent(id)}/proposals/${encodeURIComponent(proposalId)}/discard`,'POST',{expectedVersion});
  },
};

export const versionsApi = {
  async list(id:string,cursor?:string,signal?:AbortSignal) {
    return VersionListResponseSchema.parse(await request(`/${encodeURIComponent(id)}/versions?limit=20${cursor?`&cursor=${encodeURIComponent(cursor)}`:''}`, 'GET', undefined, signal));
  },
  async get(id:string,versionId:string,signal?:AbortSignal) {
    return VersionResponseSchema.parse(await request(`/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionId)}`, 'GET', undefined, signal));
  },
  async restore(id:string,versionId:string,baseVersion:number) {
    return ProposalResponseSchema.parse(await request(`/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionId)}/restore-proposals`,'POST',{baseVersion}));
  },
};

import { DeletionResponseSchema, EventDetailResponseSchema, EventListResponseSchema, EventResponseSchema } from '@jashn/contracts';
import type { EventBrief } from '@jashn/contracts';
import { ApiErrorSchema, BudgetResponseSchema } from '@jashn/contracts';
import type { SaveBudgetRequest } from '@jashn/contracts';
import { auth } from '../auth/firebase';
export class RequestError extends Error { constructor(public status: number, message: string) { super(message); } }
async function request(path: string, method = 'GET', body?: unknown, signal?: AbortSignal) {
  const user = auth?.currentUser;
  if (!user) throw new RequestError(401, 'Please sign in again.');
  const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
  const send = async (refresh = false) => fetch(`${base}/v1/events${path}`, { method, signal: signal || null, headers: { Authorization: `Bearer ${await user.getIdToken(refresh)}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  let response = await send();
  if (response.status === 401) response = await send(true);
  if (auth?.currentUser?.uid !== user.uid) throw new RequestError(401, 'Your session changed. Please reopen this page.');
  if (response.status === 400) { const parsed = ApiErrorSchema.safeParse(await response.json()); throw new RequestError(400, parsed.success ? parsed.data.error.message : 'Check the submitted values.'); }
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

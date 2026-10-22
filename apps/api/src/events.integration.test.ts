import { getAuth } from 'firebase-admin/auth';
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { buildApp } from './app.js';
import { firebaseServices } from './firebase.js';

// Integration suite intentionally requires the real local Firebase emulators.
if (process.env.GOOGLE_CLOUD_PROJECT !== 'demo-jashn' || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099' || process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080') throw new Error('Run with .env.emulator.example and local emulators.');
const services = firebaseServices()!;
test('emulator: ownership, persistence, pagination, versions, archive and recursive deletion', async t => {
  const makeUser = async () => {
    const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `phase05-${randomUUID()}@example.test`, password: randomUUID(), returnSecureToken: true }) });
    assert.equal(response.status, 200);
    return await response.json() as { idToken: string; localId: string };
  };
  const [a,b] = await Promise.all([makeUser(),makeUser()]);
  let app = buildApp(services); t.after(async () => { await app.close(); await services.db.recursiveDelete(services.db.collection('users').doc(a.localId)); await services.db.recursiveDelete(services.db.collection('users').doc(b.localId)); });
  const call = (method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string, token?: string, payload?: object) => app.inject({ method, url, ...(token ? { headers: { authorization: `Bearer ${token}` } } : {}), ...(payload ? { payload } : {}) });
  const brief = { name: 'Disposable integration event', type: 'birthday', city: 'Noida', localDate: '2099-02-01', timezone: 'Asia/Kolkata', guests: 50, currency: 'INR', budgetMinor: 5000000, priorities: ['Food'], hardRequirements: ['Vegetarian'], preferences: {} };
  assert.equal((await call('GET','/v1/events')).statusCode,401);
  assert.equal((await call('GET','/v1/events','invalid-token')).statusCode,401);
  assert.equal((await call('POST','/v1/events',a.idToken,{ brief, ownerId: b.localId })).statusCode,400);
  assert.equal((await call('POST','/v1/events',a.idToken,{ brief: { ...brief, localDate:'2000-01-01' } })).statusCode,400);
  const created = await call('POST','/v1/events',a.idToken,{ brief }); assert.equal(created.statusCode,201,created.body);
  const event = created.json().event; const path = `/v1/events/${event.id}`;
  assert.equal(event.ownerId,a.localId); assert.equal(event.revision,0);
  for (const [method,url,payload] of [['GET',path,undefined],['PATCH',path,{ expectedVersion:0,brief }],['POST',`${path}/archive`,{ expectedVersion:0 }],['POST',`${path}/unarchive`,{ expectedVersion:0 }],['DELETE',path,{ expectedVersion:0,confirmationName:brief.name }],['GET',`${path}/deletion`,undefined]] as const) assert.equal((await call(method,url,b.idToken,payload)).statusCode,404);
  assert.equal((await call('GET','/v1/events',b.idToken)).json().events.length,0);
  await app.close(); app=buildApp(services);
  assert.equal((await call('GET',path,a.idToken)).json().event.brief.name,brief.name);
  const edits = await Promise.all([call('PATCH',path,a.idToken,{ expectedVersion:0,brief:{ ...brief,name:'Updated brief' } }),call('PATCH',path,a.idToken,{ expectedVersion:0,brief:{ ...brief,name:'Concurrent brief' } })]);
  assert.deepEqual(edits.map(r=>r.statusCode).sort(),[200,409]);
  const updated = (await call('GET',path,a.idToken)).json().event;
  assert.equal(updated.revision,1);
  assert.equal((await call('POST',`${path}/archive`,a.idToken,{ expectedVersion:1 })).statusCode,200);
  assert.equal((await call('GET','/v1/events?status=active',a.idToken)).json().events.length,0);
  assert.equal((await call('GET','/v1/events?status=archived',a.idToken)).json().events.length,1);
  assert.equal((await call('PATCH',path,a.idToken,{ expectedVersion:2,brief })).statusCode,409);
  assert.equal((await call('POST',`${path}/unarchive`,a.idToken,{ expectedVersion:2 })).statusCode,200);
  for (let i=0;i<2;i++) assert.equal((await call('POST','/v1/events',a.idToken,{ brief })).statusCode,201);
  const first=(await call('GET','/v1/events?limit=2',a.idToken)).json(); assert.equal(first.events.length,2); assert.ok(first.nextCursor);
  const second=(await call('GET',`/v1/events?limit=2&cursor=${first.nextCursor}`,a.idToken)).json(); assert.equal(second.events.length,1); assert.equal(second.nextCursor,null);
  assert.equal(new Set([...first.events,...second.events].map(item=>item.id)).size,3);
  assert.equal((await call('GET',`/v1/events?cursor=${first.nextCursor}`,b.idToken)).statusCode,400);
  assert.equal((await call('GET','/v1/events?limit=51',a.idToken)).statusCode,400);
  const ref=services.db.collection('users').doc(a.localId).collection('events').doc(event.id);
  await ref.collection('plans').doc('nested').collection('tasks').doc('deep').set({ test:true });
  assert.equal((await call('DELETE',path,a.idToken,{ expectedVersion:3,confirmationName:'wrong' })).statusCode,409);
  const originalDelete = services.db.recursiveDelete.bind(services.db);
  services.db.recursiveDelete = async () => { throw new Error('Injected cleanup outage'); };
  try { const failed = await call('DELETE',path,a.idToken,{ expectedVersion:3,confirmationName:updated.brief.name }); assert.equal(failed.json().status,'failed'); }
  finally { services.db.recursiveDelete = originalDelete; }
  assert.equal((await call('GET',path,a.idToken)).statusCode,404);
  assert.equal((await call('PATCH',path,a.idToken,{ expectedVersion:3,brief })).statusCode,404);
  await app.close(); app=buildApp(services);
  assert.equal((await call('GET',`${path}/deletion`,a.idToken)).json().status,'failed');
  assert.equal((await call('POST',`${path}/deletion/retry`,b.idToken)).statusCode,404);
  const removed=await call('POST',`${path}/deletion/retry`,a.idToken); assert.equal(removed.json().status,'deleted',removed.body);
  assert.equal((await ref.get()).exists,false); assert.equal((await ref.collection('plans').doc('nested').collection('tasks').doc('deep').get()).exists,false);
  assert.equal((await call('GET',path,a.idToken)).statusCode,404);
  assert.equal((await call('GET',`${path}/deletion`,a.idToken)).json().status,'deleted');
  assert.equal((await call('DELETE',path,a.idToken,{ expectedVersion:3,confirmationName:updated.brief.name })).json().status,'deleted');
  const direct=await fetch(`http://127.0.0.1:8080/v1/projects/demo-jashn/databases/(default)/documents/users/${a.localId}/events`,{ headers:{ authorization:`Bearer ${a.idToken}` } });
  assert.equal(direct.status,403,'Firestore rules must reject direct client access');
  await getAuth().updateUser(a.localId, { disabled: true });
  assert.equal((await call('GET','/v1/events',a.idToken)).statusCode,401);
});

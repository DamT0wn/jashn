import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiErrorSchema, HealthResponseSchema, LIMITS } from '@jashn/contracts';
import { buildApp } from './app.js';

test('health is public and asserts process liveness only', async t => {
  const app = buildApp(); t.after(() => app.close());
  const response = await app.inject({ method: 'GET', url: '/health' });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(HealthResponseSchema.parse(response.json()), { status: 'ok', service: 'jashn-api', schemaVersion: 1 });
});
test('unimplemented resource routes never fake success', async t => {
  const app = buildApp(); t.after(() => app.close());
  const response = await app.inject({ method: 'GET', url: '/v1/events' });
  assert.equal(response.statusCode, 404);
  assert.equal(ApiErrorSchema.parse(response.json()).error.code, 'NOT_FOUND');
});
test('errors redact internal details and assign server-generated request IDs', async t => {
  const app = buildApp(); t.after(() => app.close());
  app.get('/test-error', async () => { throw new Error('private credential content'); });
  const response = await app.inject({ method: 'GET', url: '/test-error', headers: { 'x-request-id': 'attacker' } });
  assert.equal(response.statusCode, 500);
  const result = ApiErrorSchema.parse(response.json());
  assert.equal(result.error.code, 'INTERNAL_ERROR');
  assert.notEqual(result.error.requestId, 'attacker');
  assert.equal(response.body.includes('credential'), false);
});
test('request payload cap and malformed JSON produce safe errors', async t => {
  const app = buildApp(); t.after(() => app.close());
  app.post('/test-body', async () => ({ ok: true }));
  const large = await app.inject({ method: 'POST', url: '/test-body', payload: { value: 'x'.repeat(LIMITS.bodyBytes) } });
  assert.equal(large.statusCode, 413);
  assert.equal(ApiErrorSchema.parse(large.json()).error.code, 'PAYLOAD_TOO_LARGE');
  const malformed = await app.inject({ method: 'POST', url: '/test-body', headers: { 'content-type': 'application/json' }, payload: '{' });
  assert.equal(malformed.statusCode, 400);
  assert.equal(ApiErrorSchema.parse(malformed.json()).error.code, 'INVALID_INPUT');
});

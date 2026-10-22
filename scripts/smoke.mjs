import assert from 'node:assert/strict';
import { HealthResponseSchema } from '@jashn/contracts';

// Run against npm run dev. No cloud calls, fixtures or test-only server routes.
const origin = process.env.SMOKE_WEB_ORIGIN || 'http://127.0.0.1:5173';
const page = await fetch(origin, { signal: AbortSignal.timeout(5000) });
assert.equal(page.status, 200);
assert.match(await page.text(), /Jashn/);
const response = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(5000) });
assert.equal(response.status, 200);
HealthResponseSchema.parse(await response.json());
const missing = await fetch(`${origin}/api/v1/events`, { signal: AbortSignal.timeout(5000) });
assert.equal(missing.status, 401);
console.log('PASS: web HTML, frontend-origin proxy to API health, and 401 for unauthenticated events.');

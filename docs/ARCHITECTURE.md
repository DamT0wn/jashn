# Architecture — Phase 02

Status: local shell and health API implemented. Cloud integrations and business
rules below are designed, not operational. Scope: [PRODUCT.md](PRODUCT.md).

## Workspace and runtime

Node 24.x and npm 11.x; one root package-lock.json and exact direct dependency
versions. Run commands from the repository root. Shared packages compile before
apps and export generated ESM and declarations; dist is ignored. Dev builds shared
packages once, then watches contracts, planning-rules, API and web together.

| Path | Responsibility |
|---|---|
| apps/web | React 18, Vite 7, TypeScript, Tailwind 3, browser routing; presentation and client validation |
| apps/api | Fastify 5, Node ESM; public liveness now, trusted authorization/data mutations later |
| packages/contracts | Zod 3 strict runtime schemas and inferred TypeScript types shared by web/API |
| packages/planning-rules | Reserved for Phase 06 deterministic money/date/dependency/lock rules; explicitly unimplemented |
| data/templates | Reserved for curated/synthetic event templates; no live prices |
| scripts/smoke.mjs | Checks web HTML and real frontend-origin health proxy against running dev servers |

The browser requests /api/health. Vite strips /api and forwards to the local API
at 127.0.0.1:3001. This avoids needing CORS locally. No database or AI status is
inferred from health. Unknown API routes return a structured 404. The app shell
has loading, failure, timeout and retry states plus honest pending destinations.

## Target deployment and trust boundaries

Firebase Hosting serves static web output. Cloud Run serves the Fastify API;
Firestore holds private event data. Firebase Auth supplies ID tokens. Vertex AI
Gemini is called through @google/genai using server ADC/service identity.
Cloud SDKs are intentionally not installed before their integration phases.

Browser → Firebase sign-in → API ID-token verification and owner check →
Firestore / deterministic validators / Vertex AI → validated response → owner review.

All private records go through the API; deny direct browser Firestore access in
Phase 05. Server SDKs bypass client rules, so every resource route checks owner.
CORS is not authorization. Use same-origin Hosting API rewrites at deployment or
an explicit origin allowlist when origins differ; neither is configured yet.

## Contracts and mutation boundaries

Schemas reject unknown keys, malformed dates/timezones, fractional/unsafe/negative
money and excessive strings/collections. Values are integer paise with explicit
INR. Collection caps: 100 budget lines, 200 tasks, 100 vendors, 50 ideas. The API
body limit is 512 KiB; payloads can hit this limit before individual field maxima.
The same serialized-size ceiling will apply to persisted snapshots in Phase 05/07.

EventBrief is a historical-readable shape. createEventBriefSchema(clock) adds the
creation rule using today's date in the event timezone. Agenda schedules include
offset-bearing timestamps; date-only tasks retain local dates. Phase 06 will add
full dependency graphs, timezone/agenda consistency, financial sums and locks.
Individual safe integers do not guarantee a safe sum; trusted rules must validate
aggregate arithmetic before accepting any plan. No schema result implies feasibility.

PlanSnapshot includes the brief and all five outputs. PlanVersion is an immutable
accepted snapshot; ReplanProposal is a separate candidate with baseVersion,
diff, expiry and validation metadata. These are trusted server record shapes,
not provider or client write permissions. Future provider adapters strip/reconcile
owner, stable IDs, commitments, payments, booked status and acceptance metadata.

Every planning-affecting mutation compares expectedVersion and increments the
canonical event revision. Accepted snapshots use that revision; numbers need not
be contiguous across brief/archive changes. Initial acceptance may occur at a
nonzero event revision and requires currentVersion to be null. Atomic apply checks
the proposal's baseVersion against the event revision. A stale proposal never wins.

## Persistence plan (Phase 05 onward)

Use events/{id} for owner, brief, revision, currentVersion and state. Store bounded
plan snapshots, drafts, proposals, generation jobs and audit records separately.
Keep canonical budget/task/vendor records in scoped subcollections. Accepted
snapshots never overwrite history; current financial records govern restoration.
Event deletion first makes the event inaccessible, then recursively cleans children.

Before implementing writes, define transaction/document-size boundaries and test
that accepted snapshot, canonical data, version and proposal status cannot diverge.
No multi-step partial apply may report success. Query pagination must be bounded
and owner-scoped. See API.md for the route and revision contracts.

## Generation and acceptance (Phase 07 onward)

P0 uses bounded synchronous HTTP generation, resolving the SRS's optional async
design. Persist pending/running/succeeded/failed job state and reserve quota before
calling the provider. Target 30 seconds; hard operation deadline no longer than
60 seconds including at most one repair. Cancellation/deadline must bound provider
work; do not return 202 and detach a background promise.

Persist a validated draft separately and return it only after successful validation.
A distinct owner acceptance request creates the first accepted version. Replanning
similarly produces a separate proposal; apply is a distinct atomic operation.
On reload, job GET is for recovery/observability, not an unbounded polling design.
Reconcile interrupted jobs using a persisted deadline. Rate/quota reservations
must be distributed/atomic across Cloud Run instances. Never silently use fixtures.

Idempotency is scoped to owner, event and operation, with a request hash. Same key
and payload replays the saved outcome; a changed payload conflicts. Concurrent
duplicates cannot start another job or revision. Provider billing exactly-once is
not promised. Accepted proposal IDs also prevent duplicate apply beyond key retry.

## Dependency decisions and limitations

React 18.3.1 and Tailwind 3.4.19 retain the prescribed stack. Vite 7.3.7 and its
React plugin 5.2.0 were chosen within compatible supported major versions, checked
against registry engine/peer metadata. Router 7.18.4 supports React >=18 and replaces
the initially considered v6 because of its reported advisories. ESLint 10 replaces
the deprecated v9; compatible typescript-eslint and React hooks plugins are pinned.

Primary references checked 2026-10-21:
- [Vite requirements](https://vite.dev/guide/)
- [Fastify v5 runtime requirements](https://fastify.dev/docs/v5.10.x/Guides/Migration-Guide-V5/)
- [Tailwind 3 with Vite](https://v3.tailwindcss.com/docs/guides/vite)

Npm registry version/engine/peer metadata supplied the exact pins. See VERIFICATION
for actual install/build results and dependency-audit limitations; do not interpret
these references as evidence of implemented cloud integration.

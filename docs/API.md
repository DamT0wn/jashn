# API contract v1

Only GET /health is implemented in Phase 02. Every /v1 route below is a planned
contract, not a working endpoint. Unimplemented paths return 404, never fake data.
The local web origin uses /api as a proxy prefix; the API itself does not.

## Common rules

JSON bodies only; maximum 512 KiB. Shared schemas are in packages/contracts/src.
Reject unknown input keys. All /v1 operations require Authorization: Bearer <Firebase
ID token>; token verification and owner checks will be installed with Phase 05.
Owner/audit fields come from server context, never submitted identity values.
Missing and non-owned resources share a generic 404. Archive permits read/export,
unarchive and confirmed deletion, but blocks planning mutations and generation.

Each event has revision (nonnegative safe integer) and currentVersion (nullable
accepted revision). Create starts at revision 0, currentVersion null. Mutation
bodies carry expectedVersion; replan generation carries baseVersion. On success,
planning mutations advance revision and return it. Accepted plans snapshot the
resulting revision. Stale checks return 409, never silently overwrite. Planning
changes to a brief with an accepted plan go through proposals, not direct PATCH.

Require UUID Idempotency-Key on generation, initial acceptance, replan, apply and
restore proposal creation. Scope to owner/event/operation and hash normalized input.
Same key/body returns the existing job/outcome; changed input returns 409. An in-flight
duplicate returns 409 with the job reference when available, not a new provider call.

## Routes

| Method / path | Body or query | Success / behavior | Phase |
|---|---|---|---|
| GET /health | None; public | 200 `{status:"ok",service:"jashn-api",schemaVersion:1}`; process liveness only | 02 implemented |
| POST /v1/events | `{brief: EventBrief}` | 201 `{event}` with server ID/owner/revision 0; clock-aware creation validation | 05 |
| GET /v1/events | `status=active\|archived`, `limit` 1–50 (default 20), optional opaque cursor <=2048 chars | 200 `{events,nextCursor}`; caller-owned only | 05 |
| GET /v1/events/:id | None | 200 `{event,plan}`; plan null before initial acceptance | 05 |
| PATCH /v1/events/:id | `{expectedVersion,brief}` | 200 `{event}`; accepted-plan-affecting changes require replan; pre-plan brief edits advance revision | 05 |
| POST /v1/events/:id/archive | `{expectedVersion}` | 200 `{event}`; sets archived, advances revision, invalidates proposals | 05 |
| POST /v1/events/:id/unarchive | `{expectedVersion}` | 200 `{event}`; active again, new revision | 05 |
| DELETE /v1/events/:id | `{expectedVersion,confirmationName}` matching displayed event | 200 `{eventId,status:"deleting"}` after durable tombstone; cleanup retryable and observable | 05 |
| GET /v1/events/:id/deletion | None | 200 `{eventId,status:"deleting"\|"deleted"\|"failed"}` from owner-scoped deletion record | 05 |
| POST /v1/briefs/extract | `{text}` <=5000 chars | 200 `{draft,missingFields,uncertainties}`; absent required fields null, never invented; separately confirmed before event save | 07 |
| POST /v1/events/:id/generations | GeneratePlanRequest `{expectedVersion}` | 201 `{jobId,draft}` after bounded synchronous validation/persistence; no accepted-plan mutation | 07 |
| GET /v1/jobs/:jobId | None | 200 `{job}` including state, eventId, deadline and result reference or safe error | 07 |
| GET /v1/events/:id/drafts/:draftId | None | 200 `{draft}` with baseVersion, snapshot, generation metadata and state | 07 |
| POST /v1/events/:id/drafts/:draftId/accept | AcceptDraftRequest `{expectedVersion,acknowledgeInfeasible}` | 200 `{event,plan}`; checks draft baseVersion and no existing accepted plan, atomic first acceptance | 07 |
| POST /v1/events/:id/drafts/:draftId/discard | `{expectedVersion}` | 200 `{draftId,status:"discarded"}`; event/accepted plan unchanged | 07 |
| POST /v1/events/:id/budget-lines | `{expectedVersion,line}` excluding server-owned ID/audit | 201 `{event,plan}`; validated revision | 06 |
| PATCH /v1/events/:id/budget-lines/:lineId | `{expectedVersion,changes}` allowlisted amounts/lock/provenance | 200 `{event,plan}`; totals validated server-side | 06 |
| DELETE /v1/events/:id/budget-lines/:lineId | `{expectedVersion}` | 200 `{event,plan}`; reject unresolved obligations/links | 06 |
| POST /v1/events/:id/budget-lines/:lineId/payment-corrections | `{expectedVersion,paidMinor,reason}` | 200 `{event,plan}`; owner-recorded correction, audit, explicit overpayment flag; no money transferred | 06 |
| PATCH /v1/events/:id/contingency | `{expectedVersion,contingencyMinor}` | 200 `{event,plan}`; validated revision | 06 |
| POST /v1/events/:id/tasks | `{expectedVersion,task}` without ID | 201 `{event,plan}` | 08 |
| PATCH /v1/events/:id/tasks/:taskId | `{expectedVersion,changes}` | 200 `{event,plan}`; dependencies/status/date/lock checks | 08 |
| DELETE /v1/events/:id/tasks/:taskId | `{expectedVersion}` | 200 `{event,plan}`; reject unresolved dependencies/completed dependents | 08 |
| POST /v1/events/:id/vendors | `{expectedVersion,vendor}` without ID | 201 `{event,plan}`; manual records only | 08 |
| PATCH /v1/events/:id/vendors/:vendorId | `{expectedVersion,changes}` | 200 `{event,plan}`; booked means organizer-recorded | 08 |
| DELETE /v1/events/:id/vendors/:vendorId | `{expectedVersion}` | 200 `{event,plan}`; resolve links first | 08 |
| POST /v1/events/:id/vendors/:vendorId/apply-quote | `{expectedVersion,budgetLineId,confirmed:true}` | 200 `{event,plan}`; explicit linkage updates one commitment without double-counting | 08 |
| PATCH /v1/events/:id/ideas/:ideaId | `{expectedVersion,status}` saved/dismissed | 200 `{event,plan}`; no implicit financial change | 08 |
| POST /v1/events/:id/replans/extract | `{text,baseVersion}` | 200 `{draftChanges,uncertainties}` for confirmation | 09 |
| POST /v1/events/:id/replans | ReplanRequest `{baseVersion,changes}` | 201 `{jobId,proposal}` after synchronous generation and validation; protected cost conflicts can return 422 | 09 |
| GET /v1/events/:id/proposals/:proposalId | None | 200 `{proposal}` including candidate, diff, locks, expiry and state | 09 |
| POST /v1/events/:id/proposals/:proposalId/apply | ApplyProposalRequest `{expectedVersion,acknowledgeInfeasible}` | 200 `{event,plan}`; atomic owner/status/expiry/base checks; identical successful retry replays | 09 |
| POST /v1/events/:id/proposals/:proposalId/discard | `{expectedVersion}` | 200 `{proposalId,status:"discarded"}`; accepted plan unchanged | 09 |
| GET /v1/events/:id/versions | cursor, limit 1–50 | 200 `{versions,nextCursor}` | 09 |
| GET /v1/events/:id/versions/:versionId | None | 200 `{plan}`; immutable history | 09 |
| POST /v1/events/:id/versions/:versionId/restore-proposals | `{baseVersion}` | 201 `{proposal}` reconciled with current financial obligations; apply uses normal proposal route | 09 |
| GET /v1/events/:id/export | required versionId | 200 `{plan,exportedAt,historical}`; browser print view, no server-PDF promise | 10 |

Mutation field allowlists and additional request/response runtime schemas must be
implemented together with each route. Phase 02 already exports core domain types,
create/generate/accept/replan/apply envelopes and safe errors. Do not pass a trusted
PlanVersion or ReplanProposal schema directly to an untrusted write endpoint.

## Generation lifecycle and concurrency

Generation persists a separate draft. Job states: pending → running → succeeded
or failed. Hard deadline <=60 seconds, maximum one bounded repair. If the HTTP
connection fails, an owned job GET recovers the persisted outcome; expired running
jobs become failed/retryable. No 202 plus detached promise. Polling is not required
for the normal happy path. Initial acceptance is explicit and idempotent.

Replan status: draft → applied/discarded/expired. Default expiry is creation +24h;
base-version changes make apply invalid immediately. Apply stores the accepted
revision, event brief and canonical plan atomically and marks the proposal applied.
Replay of an already applied proposal returns its saved result before stale-version
checks, after owner and request-identity verification. Discard never increments the
event revision. Historical restore is a newly reviewed proposal, not ledger rollback.

## Error envelope

`{ "error": { "code": "INVALID_INPUT", "message": "...", "requestId": "...", "fields": [{ "path": "brief.guests", "message": "..." }] } }`

Fields is optional and bounded. requestId is server-generated, not trusted from
client headers. Never return raw stack traces/provider errors or record private
prompt content in logs. Future errors may add a bounded typed job reference for
recovery; extend ApiErrorSchema with that route implementation.

| HTTP | Code / meaning |
|---|---|
| 400 | INVALID_INPUT |
| 401 | UNAUTHENTICATED |
| 403 | FORBIDDEN (only when no private existence is disclosed) |
| 404 | NOT_FOUND; absent or non-owned record |
| 409 | VERSION_CONFLICT or PROPOSAL_EXPIRED; includes state/idempotency conflict |
| 413 | PAYLOAD_TOO_LARGE |
| 422 | INFEASIBLE; protected minimum cannot meet cap or candidate violates rules |
| 429 | USAGE_LIMIT |
| 503 | PROVIDER_UNAVAILABLE; timeout/invalid generation, accepted state preserved |
| 500 | INTERNAL_ERROR; generic safe message |

Acknowledged infeasible plans may be retained with a persistent shortfall label
only if structurally valid (FRS BR-07). They cannot be labeled feasible. Business
validation and these protected routes remain future work, not Phase 02 claims.

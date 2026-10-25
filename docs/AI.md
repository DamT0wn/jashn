# Phase 07 AI setup and verification

Status: local/mock implementation complete. Live Vertex verification is deferred
by user request; future setup needs project, location, ADC and a test-spend cap. No live requests have been executed.

## Configuration

Use the Google Gen AI SDK (@google/genai 2.31.0) with Vertex AI and ADC/service
identity. No browser key, production fake fallback or automatic provider migration.
A real Firebase project and an authenticated test account are also required for
the live API journey. Never combine emulator configuration with live generation.

Server-only settings in the ignored root .env:
- GOOGLE_CLOUD_PROJECT: selected live project (not demo-jashn).
- GOOGLE_CLOUD_LOCATION: explicitly selected supported Vertex location.
- GEMINI_MODEL: gemini-3.8-flash (provisional pin; NOT yet project/live verified).
- GENERATION_ENABLED=true only after setup and the spending decision.
- GENERATION_DAILY_LIMIT: per-user daily provider-call reservation units (1–100).
- GENERATION_GLOBAL_DAILY_LIMIT: global daily units (1–1000).
- GENERATION_CONCURRENCY: concurrent global leases (1–10); also one per user.

Each operation reserves TWO units, including its possible repair, with no refund.
Thus limits below two permit no operations. Daily periods use UTC. Quotas bound
request counts, not currency spend; select conservative limits for the approved
budget. Requests have a total 45-second deadline, max 8192 output tokens, max one
validation repair, no SDK transport retry, and 48 kB sanitized input. Failed/crashed
requests cannot replace the accepted plan; expired leases release capacity.

The candidate model was selected from official lifecycle documentation during
implementation. Availability and structured-output compatibility must still be
verified in the chosen project before calling it a tested pin:
https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions
https://googleapis.github.io/js-genai/release_docs/index.html

## Review and persistence

Brief extraction preserves missing values and requires organizer review. Drafts
expire after 24 hours. Review shows all five outputs and server-calculated totals.
Acceptance rechecks ownership, active status, canonical revision, expiry, financial
protection and timeline rules. Infeasible drafts require explicit acknowledgement.
Acceptance is transactional and idempotent. Subsequent budget edits update both
the accepted snapshot/version and ledger. Replacement planning is Phase09.

Templates live in apps/api/src/ai/pipeline.ts. Generation sends selected planning
fields, not organizer name, raw brief, notes or contact records. Contact/known-key
redaction and instruction-pattern rejection are defense layers, not a universal
secret detector or semantic proof. Human review of cultural/dietary requirements
and assumptions remains necessary. Estimates are not quotes or availability checks.

## Reproducible checks

npm run test: repeatable explicit fake tests; never proves live Gemini.
npm run test:integration: real local Firebase emulators plus explicit test provider.
The integration suite covers isolation, stale/expired draft rejection, explicit and
idempotent acceptance, persisted budget versions, quotas, timeout, invalid outputs,
crash expiry, missing extraction values and deletion while generation is pending.

After live setup and spend approval, set LIVE_AI_SMOKE_APPROVED=true and a short-lived
JASHN_SMOKE_ID_TOKEN in the local process environment (never source or chat), then
run npm run smoke:ai:live. Default API origin is http://127.0.0.1:3001; optionally
set SMOKE_API_ORIGIN. It creates three test occasions and unaccepted drafts. It
checks overview, budget, timeline, vendors, ideas, totals and gemini provenance.
Review the actual outputs and record model, date and pass denominator. It does not
accept plans or delete records. Keep the test events available for review.

Current live denominator: 0/3 attempted; blocked, not a passing gate.

## 2026-10-25 user-approved mock mode
Live verification is deferred by the user's explicit request, not a requirement for
current testing. Set MOCK_GENERATION_ENABLED=true only with demo-jashn and both
localhost emulators. GENERATION_ENABLED must remain false. Production rejects mock
configuration. Local mock limits are 100 user units/day, 1000 global/day, concurrency
4 (plus one request per user), using the same distributed reservation path.
Mock plans use fixed illustrative values, synthetic provenance, zero token usage,
and warnings that suitability has not been evaluated. They require review and
acknowledgement. The UI disables text extraction and directs users to structured
fields. No paid provider is contacted. Live setup above is future work only.

# Current state

Updated 2026-10-23. Phase 06 local/emulator gate complete. Next: Phase 07 live AI.
Repository E:/jashan/jashn; previous checkpoint 56c81f2; latest via git log -1.

Implemented: landing, synthetic samples, Firebase identity and owner-isolated event
lifecycle, plus persisted manual budget ledgers. GET/PUT /v1/events/:id/budget uses
strict schemas and transactions checking owner, active status and canonical revision.
Server computes exact paise totals, contingency once, outstanding, credit, protected
minimum and shortfalls. Confirmed corrections require a reason; all ledger saves
retain before/after audit records. Child writes respect deletion barriers.

The budget editor creates/edits/removes eligible items, records payments and locks,
shows saved server totals, and requires acknowledgement of budget overruns. No
payment is transferred. A manual ledger does not create an accepted plan. Accepted
plan budget writes are deliberately blocked until canonical integration in Phase 07/08.

Planning-rules includes safe sums, financial/lock preservation, dependency DAG and
completion checks, timed/date-only ordering, event-relative phases, explicit clock,
overdue/blocked IDs, and locked-task preservation. Task persistence/UI is Phase 08.

Verified: 33 unit/contract tests; emulator suite covering two-account isolation,
versions, correction audit, budget persistence/restart, shortfall acknowledgement,
archive protection and recursive ledger/history deletion. Browser save/reload,
correction rejection/confirmation, shortfall, keyboard checkbox and 360px layout.
Typecheck, lint, build and local smoke pass; evidence under docs/evidence/phase-06-*.

Live Firebase Google/recovery delivery and cloud storage remain unverified. Local
.env uses demo-jashn emulators; stopping them resets accounts/data by default.
No live AI, replan/history UI, export or deployment. No secrets or cloud spend added.
Prior dependency audit remains unresolved (4 high production entries in unused
client Firestore/gRPC tree); offline lock update is not a fresh security audit.
Build retains ~540 kB chunk warning. Landing media rights remain unverified.

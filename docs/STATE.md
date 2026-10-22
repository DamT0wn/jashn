# Current state

Updated 2026-10-22 (Asia/Calcutta). Phase 05 local/emulator gate complete;
live Firebase verification pending. Phase 06 deterministic rules is next.
Repository E:/jashan/jashn; main; previous checkpoint 92a5195.

Implemented: landing and synthetic sample workspace; Firebase Auth email/password,
Google popup integration, recovery and sign-out UI; protected /app routes; strict
owner-scoped server Firestore event create/list/get/edit/archive/restore/delete.
Saved briefs survive browser reload and API restart. Explicit revisions prevent
stale/concurrent overwrites. Durable deletion records support recursive cleanup
retries after failure/restart. Browser Firestore reads/writes denied by rules.

Verified: 24 automated tests, typecheck, full build, lint, local smoke, and a real
Firebase emulator integration suite with two-user isolation, persisted reads,
pagination, archive/edit restrictions, concurrent version conflicts, nested deletion,
injected cleanup failure/retry and disabled-token rejection. Browser sign-in,
create/review/save, reload, edit, archive/restore, sign-out and recovery request
verified. Screenshots under docs/evidence/phase-05-*. See VERIFICATION.md.

Not verified live: Google provider popup, real email delivery, real Firebase cloud
identity/storage. No project/provider/region/service identity configured. Follow
FIREBASE.md before claiming cloud integration complete. Local .env uses demo-jashn
emulators; no secrets. Stopping emulators resets their data/accounts by default.

Not implemented: trusted budget engine, live AI, editable plans, replan/history,
export or deployment. Non-event planned API routes remain unavailable.

Dependencies: Firebase web 13.1.0/Admin 14.5.0/CLI 15.34.1 added, root lockfile kept.
Audit: 4 high production dependency entries from unused browser Firestore/gRPC
subtree; full tree 16 (10 high/6 moderate), including CLI and Tailwind tooling.
No client Firestore code is imported. This is not a production release gate pass.
Web build warns about a ~533 kB chunk. Landing media rights remain unverified.

Current local sessions: emulators 39718, dev 51222 if still active; web :5173,
API :3001, Auth :9099, Firestore :8080. Latest checkpoint via git log -1.
Next: Phase 06 only; preserve owner checks, revision transactions and deletion
barriers for all new child-resource writes. No synthetic fallback for API failures.

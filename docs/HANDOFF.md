# Latest handoff

2026-10-22. Phase 05 local/emulator gate complete, cloud verification pending.
Previous checkpoint 92a5195; find latest with git log -1. Local only; no deployment.

Read FIREBASE.md for exact setup and missing external steps. Local .env (ignored)
contains demo-jashn emulator settings, not credentials. npm.cmd run emulators needs
Java 21+ (installed Java26); npm.cmd run dev serves web/API. Emulator data resets
on emulator restart; browser reload/API restart retain records while it runs.
Current sessions: emulators 39718, dev 51222, if still active.

Server: firebase.ts verifies Admin ID tokens with revocation checks, rejects unsafe
emulator configurations. events.ts owns strict request parsing, owner-specific
Firestore paths plus owner checks, transaction revision/status checks, paginated
lists, and durable deletion with awaited recursive cleanup/retry endpoint. Shared
EventRecord and lifecycle schemas added. Direct client Firestore denied by rules.

Client: auth/Auth.tsx and firebase.ts provide auth/configuration/route guards.
workspace/api.ts sends/refreshed Firebase ID tokens and validates responses.
SavedEvents.tsx implements list/detail/edit/archive/restore and named deletion
confirmation, plus recovery for an already-confirmed failed deletion after reload.
Wizard accepts initial brief and async confirmation; preserves inputs on errors.
Account changes remount private views; responses from a previous account rejected.
Old draft fixture helpers remain unused by private routes. /demo stays public.

Checks passed: typecheck/build/lint, 24 tests, emulator integration and local smoke.
Browser: email sign-in,save/reload/edit,archive/reload/restore,sign-out,recovery request,
delete dialog guard/cancel. Actual recursive deletion and retry verified by API
integration, not the browser destructive-confirm button. Evidence in VERIFICATION.
Google popup implemented but not provider-verified; real email/cloud unverified.
Audit: 4 high production entries via unused client Firestore/gRPC subtree; full tree: 16.
Build has a 533 kB chunk warning. Address dependencies before release; no forced downgrade.

Next Phase06 deterministic money/date/dependency rules. Read PROMPTS/API/PRODUCT.
All new mutations must enforce owner/status/revision and deletion barriers. Existing
accepted-plan brief edits are rejected so future changes must use proposals.
Do not claim Phase05 cloud gate passed or proceed to live deployment without setup.

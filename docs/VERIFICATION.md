# Verification evidence

## Phase 00 — 2026-10-21 (Asia/Calcutta)

- `git status --short` before changes: clean; `git ls-files`: README.md only.
- `git log -1 --oneline`: baseline 2de94be Initial commit.
- `git branch --show-current`: main.
- `node --version`: v24.16.0; `npm.cmd --version`: 11.13.0.
- PowerShell `Get-FileHash` comparison of each supplied source against its docs
  copy: all three SHA-256 hashes match (FRS, SRS, PROMPTS).
- `git diff --check`: passed; Git emitted an LF/CRLF normalization warning only.
- Documentation review: STATE and HANDOFF identify Phase 01 and its exact next
  deliverable; TASKS contains all 14 phases and individual JFR-001–049 entries.
- No app exists: build, typecheck, lint, application tests, browser checks,
  persistence and live generation were not run and are not claimed as passed.

Gate result: Phase 00 documentation foundation complete. This is not an MVP
implementation or release gate. Source document assertions are requirements,
not independently verified technical facts or observed product capabilities.
- Staged full `git diff --cached --check`: flagged four existing Markdown hard
  line breaks (two trailing spaces) in the supplied FRS metadata, lines 3–6.
  Preserved intentionally to retain the verbatim source. This full check is not
  a clean pass; these are inherited formatting findings, not application defects.
- Staged whitespace check excluding the three unchanged source specs: passed.

## Phase 01 — 2026-10-21 (Asia/Calcutta)

- Baseline `git status --short`: clean; latest commit c45d1f8 on main.
- Reviewed PRODUCT against Phase 01 gate: three personas, required inputs, core
  journey including acceptance, P0/exclusions, demo and eight stories are explicit.
- PowerShell documentation checks: exactly eight AS-01–08 rows; all eight linked
  from TASKS; relative file-link targets in PRODUCT/TASKS/README exist. Passed.
- PowerShell arithmetic check: original 50,000 INR, candidate 40,000 INR,
  flexible envelope 16,000 INR, fixed-cost shortfall 5,000 INR. Passed. This checks
  documented example numbers only, not an implemented budget validator.
- `git diff --exit-code -- docs/FRS.md docs/SRS.md docs/PROMPTS.md`: passed;
  canonical source documents unchanged.
- `git diff --check`: passed, with only Git line-ending normalization warnings.
- No application tests/builds or live checks run; no executable application exists.

Gate result: Phase 01 scope freeze complete. All functional stories remain
unimplemented. Phase 02 architecture/contracts/runnable skeleton is next.

## Phase 02 — 2026-10-21 (Asia/Calcutta)

Baseline: dcfb4c6 on main, clean before scaffolding. Node 24.16.0/npm 11.13.0.

| Check | Actual result |
|---|---|
| npm registry version/engine/peer queries | Exact compatible direct pins selected; React 18/Tailwind 3 retained |
| npm.cmd install --cache E:\jashan\.npm-cache | Passed; root lockfile created, then updated for patched router/supported lint tooling |
| npm.cmd ci --cache E:\jashan\.npm-cache --fetch-retries=1 --fetch-timeout=30000 | Passed; 318 packages installed, 323 audited from root lockfile |
| npm.cmd run typecheck | Passed all four workspaces plus tsconfig.tests.json |
| npm.cmd run build | Passed shared packages, compiled Node API and Vite web production build; web JS 247.17 kB / gzip 76.31 kB |
| npm.cmd run test | 15 passed, 0 failed, 0 skipped |
| npm.cmd run lint | Passed with --max-warnings 0 |
| npm.cmd run dev | Web 127.0.0.1:5173 and API :3001 started; both shared watchers report 0 errors |
| npm.cmd run smoke | Passed web HTML, actual frontend-origin /api/health proxy, unimplemented events 404 |
| npm.cmd audit --omit=dev --json --cache E:\jashan\.npm-cache | Passed: zero production-dependency advisories |
| Browser (in-app) | Home visibly reports API connected; Workspace and Samples navigate to honest pending screens; no warning/error console entries |
| git diff --check | Passed for edited documentation; final staged check also performed before checkpoint |
| git diff --exit-code -- docs/FRS.md docs/SRS.md docs/PROMPTS.md | Passed; supplied source specs unchanged |

Focused tests cover malformed/oversized briefs, unsupported currency/timezone,
unsafe/nonfinite/fractional/negative money, null vs zero commitment, real calendar
validation, local-time creation boundary, required versions, ID injection, timed
agenda shape, dependency self-reference/duplicates, estimate provenance, range
ordering, required output collections, repeated IDs, explicit infeasibility
acknowledgement, proposal expiry/apply-state shape, API error redaction, generated
request IDs, body limit, malformed JSON, health and honest missing routes.
These are contract/basic API checks, not Phase 06 money/graph validators or live AI.

Browser flow evidence:
- UI trigger: home mount starts bounded GET /api/health.
- Client/API: npm smoke confirms the real Vite proxy forwards to Fastify /health.
- API response: shared HealthResponse parses status/service/schemaVersion.
- UI result: "API connected · local service is responding."
- Screenshot: [phase-02-shell.png](evidence/phase-02-shell.png).
- React checklist: effect cancels on unmount and timeout; errors are recoverable;
  status has a live region; links/buttons are semantic, focus-visible and skip link
  present; generated HTML injection is not used. No animations require review yet.

Initial issues corrected:
- Schema text helper inferred literal 2000 instead of number; annotated number.
- Fastify error handler receives unknown; safely narrowed statusCode.
- Router 6 audit advisories: replaced with compatible patched Router 7.18.4.
- Deprecated ESLint 9: replaced with compatible ESLint 10/plugin versions.
- Sandbox registry lookup ENOTFOUND and localhost EACCES/browser timeout: approved
  network-enabled install/dev/smoke resolved connectivity; no security setting changed.
- One install was not executed because automatic approval review hit a usage limit;
  user requested continuation and the later approved retry completed successfully.

Known limitations:
- Full npm audit still reports 7 build-time advisories: 5 high and 2 moderate,
  in Tailwind 3's braces/selector-parser dependency chain. The registry offered no
  patched braces release; proposed direct fix changes Tailwind to v4, contrary to
  the required stack. Findings are not suppressed; revisit before Phase 11 release.
- No Firebase/Firestore/Vertex integration, event persistence, full budget/date
  business rules or protected resource routes yet. No cloud or release claim.
- No multi-width layout gate, browser outage/retry simulation, cloud performance
  test or deployment verification performed in this phase. Those remain later work.

Gate: Phase 02 passed (clean install, typecheck/builds, focused malformed-input
coverage and frontend-to-health connection). Phase 03 is next. The running local
preview is for review; no public endpoint was deployed.

## Phase 03 — 2026-10-21 (Asia/Calcutta)

Baseline 679ed43; no unrelated working-tree changes.

- npm.cmd run typecheck: passed all workspaces and test types.
- npm.cmd run build -w @jashn/web: passed; JS 392.22 kB / gzip 123.94 kB.
  API/shared builds also passed before the initial web compile correction.
- npm.cmd run lint: passed, zero warnings.
- npm.cmd run test: 16 passed, 0 failed. New media-policy coverage checks no
  automatic loading for reduced/unknown motion, save-data, paused/failed/offscreen
  conditions, plus explicit play opt-in without bypassing failure.
- Browser visually inspected 360x800, 768x1024, 1440x1000, 1920x1080. No horizontal
  overflow or clipped wordmark/cards. Full screenshots saved in evidence/phase-03-*.
- Mobile menu expanded; Escape collapsed it and returned focus to the menu button.
- Pause feature video changed to Play; Play resumed. Hero pause exposed the static
  fallback. Feature video absent before viewport approach (only hero video in DOM),
  then loaded/played near Features. Both remote videos and all three icons loaded.
- Primary CTA opened /app/new. Budget/timeline/ideas links opened the corresponding
  /demo?tab= query and displayed honest unavailable sample status. Features and
  How it works anchors navigated correctly. Navigation hrefs map to real IDs/routes.
- Fixed Windows case-insensitive module collision (Media.tsx versus media.ts) by
  renaming component to AmbientVideo.tsx. The console retains one historical module
  error from before this fix; subsequent rendered navigation/build checks succeeded.
- Fixed double-baseline scroll text and pause-control stale state after visual review.
- React review: hooks remain unconditional; effects clean up; motion preferences
  suppress transforms/highlight animation; media has explicit controls; no generated
  HTML or essential scroll-dependent text. No new dependencies or lockfile changes.

Limits: OS-level reduced-motion/save-data and network-failure injection were not
browser-emulated; verified through media-policy tests/source review instead. No
claim of a full accessibility audit. Reference asset licensing remains unverified.
Full P0 app functionality and Phase 04 sample plans are not implemented yet.

Phase 03 gate complete. Next: Phase 04 workspace/wizard and labeled fixtures.

## Phase 04 — 2026-10-22

Passed npm.cmd run typecheck, full build (API/shared/web), lint, 22 tests and smoke.
Six new workspace tests verify synthetic provenance and exact fixture totals,
event-local dates across day/leap boundaries, safe INR conversion, invalid briefs,
explicit preference preservation, repository isolation and abort behavior.

Browser verification used localhost development servers (session 7463), without
credentials. At desktop width 1440: empty submit showed errors and focused name;
valid Noida birthday brief (2030-02-01, 50 guests, INR 50000.50), priorities and
vegetarian requirement reached review and explicit confirmation. The local draft
appeared in occasions; reload cleared it and showed missing state. No plan was
invented. Birthday/wedding/community selectors and Overview/Budget/Timeline/
Vendors/Ideas/Replan were inspected. Replan accurately states unavailable.

At width 360, mobile navigation, community timeline and wizard errors were
inspected; document scroll width matched viewport (360). At width 768, budget
rows/navigation were inspected; document/client width both 753 (scrollbar).
Unknown sample/section URLs show recovery content; empty occasions returns after
reload. Query tab links select the matching section. Screenshots:
- evidence/phase-04-desktop.png
- evidence/phase-04-mobile-timeline.png
- evidence/phase-04-mobile-wizard.png
- evidence/phase-04-tablet-budget.png

Limits: fixtures are read-only examples, not trusted engine or real quotes.
Generic loading/error/retry handling exists; browser rejection/retry injection was
not performed. No authentication, data persistence, live AI or replan verification
is claimed. Phase 04 gate passed; production acceptance stories remain incomplete.
Prior dependency advisories/media-rights limitations remain unchanged.

## Phase 05 — 2026-10-22

Story: signed-in browser confirms a brief → authenticated Fastify route →
owner-scoped Firestore → validated response → persisted event view.

| Boundary | Evidence |
|---|---|
| UI/account | Email login, sign-out, recovery request, protected deep link inspected; mobile recovery screenshot |
| Browser → API | Wizard save returned generated event ID; edit changed guest count50→60 and revision0→1 |
| API → Firestore | Real local emulators; event survives API instance restart; no fixture adapter in private routes |
| Data → UI | Browser reload retained brief; archive revision2 persisted on reload; restore revision3 shown |
| Isolation | B receives404 on A read/edit/archive/unarchive/delete/deletion/retry; own list empty |
| Validation | Missing/invalid tokens401, unknown owner input400, past creation date400, limit51 rejected |
| Concurrency | Two edits at revision0 yield200/409; accepted stale writes never overwrite |
| Deletion | Nested subcollection removed; wrong-name delete409; injected cleanup outage persists failed status; restart then owner retry succeeds; repeated DELETE replays |
| Rules/session | Direct authenticated Firestore REST access403; disabled Auth user token401; production/emulator mix rejected |

Commands: typecheck, full build, lint, 24 standard tests; test:integration (one
comprehensive emulator suite); smoke (web HTML, proxied health, unauthenticated401).
Evidence: phase-05-saved-event.png (1440 width) and phase-05-mobile-recovery.png
(360 width). Delete dialog was opened, disabled confirmation checked, and cancelled;
API integration performed test deletion. Recovery request was accepted locally;
no password reset or real email delivery was performed. Google popup is wired but
not tested with a real provider. Browser session/token failure messages are generic.

Local emulators are official Firebase components, not provider fakes. Verification
covers emulator persistence across browser/API reload, not emulator process restart
or cloud service behavior. See FIREBASE.md for required external configuration.

Dependency audit on 2026-10-22: production: 4 high entries via firebase→client
Firestore→@grpc/grpc-js1.9.16; no browser Firestore imports. Admin dependency uses
patched 1.14.6. Full tree: 16 (10 high/6 moderate), also CLI and prior Tailwind tooling.
A root gRPC override did not replace the workspace client subtree and was removed;
no ineffective override or forced Firebase downgrade is claimed as remediation.
Release must re-evaluate these dependencies. Web build warns at ~533 kB minified.

## Phase 06 — Deterministic rules and manual ledger (2026-10-22)

PASS local/emulator gate. 33 automated tests cover integer/aggregate bounds, exact
rupee conversion and display, null versus zero commitments, partial payments,
contingency once, overpayment credit, protected minimum shortfalls, corrections,
AI protection, missing/cyclic/later prerequisites, blocked completion, event-local
midnight, timed instants, event-relative phases and locked tasks.

Real Firebase emulator integration verifies owner isolation, stale revision refusal,
server totals, correction confirmation/reason and before/after audit, acknowledged
shortfall, persisted reload/API restart, archived write denial and recursive removal
of ledger/audit children. Existing identity/deletion tests still pass. This is not
cloud/provider evidence. Typecheck, lint, build and local smoke passed.

Browser: disposable local account, INR18,000 commitment + INR1,000 reserve projects
INR19,000; INR5,000 paid leaves INR13,000 outstanding after reload. Reduction without
confirmation rejected; reason + confirmation saves INR4,000 paid / INR14,000 due.
INR40,000 reserve gives INR58,000 forecast and INR8,000 acknowledged shortfall,
persisting after reload. Checkbox keyboard interaction and corrected pointer hit
area checked. 360px controls fit; desktop summary inspected. No console errors.
Evidence: evidence/phase-06-budget-desktop.png and phase-06-budget-mobile.png.
Transient development rebuild request failure recovered after reload; full-page
mobile capture unavailable, so captured the mobile controls viewport instead.

React checklist applied: labeled inputs/fieldsets, keyboard controls, bounded rows,
abortable reads, account-remount isolation, explicit error states and retained edits
on failed save. No new UI dependency. Prior security audit remains unresolved;
offline npm lock update reporting zero is not treated as a security audit.

Boundary: full accepted-plan feasibility/AI integration, proposal staleness at apply,
user-facing history and persisted task editing remain Phase07–09. The ledger is
manual pre-plan state, not a fake accepted draft. Build chunk warning remains.

Checkpoint resumed 2026-10-23: final typecheck/lint/build rerun after interruption.
The desktop image shows saved-event context; the mobile image shows ledger controls.
Numerical save/reload evidence above was observed in browser accessibility state,
not inferred from these screenshots. The previous browser tab closed on interruption.

## 2026-10-25 — Festive visual refresh
- npm run build: PASS (existing >500 kB bundle-size warning remains).
- npm run lint: PASS.
- No financial, authorization or persistence behavior changed by this visual work.
- Browser: desktop hero and 360px landing/sample workspace inspected; mobile menu opens and sample navigation works. Decorative garland does not enter accessibility tree. Screenshot: evidence/festive-desktop.png.

## 2026-10-25 — Phase07 local/mock verification
- User explicitly deferred live testing; live requests: 0/3 attempted.
- 41 unit/contract tests pass, including emulator-only mock configuration guards.
- Emulator suite: 10 pass (8 provider unit cases repeated by imports, 2 integration
  scenarios). Added exact draft totals, synthetic provenance and expired acceptance.
- Integration also verifies owner isolation, generation vs acceptance separation,
  duplicate acceptance, canonical budget/version persistence, stale discard,
  invalid output, timeout, distributed quota, crash expiry and delete-in-flight.
- Lint, application build, local web/API smoke pass. Bundle >500 kB warning remains.
- Initial integration attempt failed because Oracle Java shim exited; direct JDK
  restart resolved it. No live provider or cloud persistence inference.
- Browser: generated a fresh local mock through the normal API, confirmed synthetic
  provenance and server total INR 1,100 (including INR 100 reserve), reviewed both
  acknowledgement checkboxes, accepted revision 1, and reloaded. Accepted plan,
  synthetic ledger source and INR 48,900 remaining persisted without errors.
  Evidence: docs/evidence/phase-07-mock-accepted.png. Local data only.
- Final application build and test TypeScript check pass. No live calls made.

## Phase08 intermediate checkpoint - 2026-10-25
Typecheck and lint pass after fixing initial editor wiring and optional prop types.
No Phase08 integration/browser gate claimed yet. User requested commit/push now;
CRUD, lock/dependency, quote correction and persistence tests remain next work.

## 2026-10-25 static UI verification
Browser checked at 1440px and 360px. DOM/style inspection: zero video elements,
zero elements with CSS animation or nonzero transition duration; scroll behavior
is auto. Hero, text and CTA remain legible. Evidence: evidence/static-desktop.png.
- Build and lint pass. Web bundle is now 432.62 kB; previous >500 kB warning no longer appears.

## 2026-10-25 - Phase08 local/mock gate
- PASS: 42 unit/contract tests, including timezone display and same-day overdue work.
- PASS: 3 distinct emulator integration scenarios. Shared AI fixtures now live in
  test-fixtures.ts so integration no longer re-runs 8 imported unit cases.
- Phase08 scenario covers all nine CRUD routes for unauthenticated/nonowner denial,
  task cycles/referenced deletion/blocked completion, separate reasoned unlock,
  stale revision rejection, vendor quote reductions, idea saved/dismissed states,
  hard-requirement preservation, API restart persistence, immutable revision count,
  archive rejection and explicit quote application without duplicate budget lines.
- PASS: typecheck, lint, production build (436.14 kB web JS), web/API smoke.
  Smoke needed local-network sandbox permission after EACCES; retry passed.
- Browser: changed task title/status and reloaded (revision 2); saved a shortlisted
  synthetic vendor with INR 1,200 quote and budget link, reloaded (revision 3).
  Confirmed quote application updated the existing line (revision 4), paid stayed
  zero, projected cost INR 1,300 including INR 100 reserve. Saved idea (revision 5),
  reloaded and verified saved status and unchanged INR 1,300 total.
- Mobile 360px: editor fields fit, document width 345px, no horizontal overflow.
  DOM/style inspection found zero videos, CSS animations or nonzero transitions.
- Evidence: evidence/phase-08-desktop.png and evidence/phase-08-mobile.png.
- Scope: localhost Firebase emulators/mock provider only; zero live model calls.
  Stale manual edits are rejected; future proposal apply tests belong to Phase09.

## 2026-10-31 mock prototype continuation
User prioritizes a fast mock-only working model and screenshot submission criteria.
Existing uncommitted Phase09 implementation preserved; fixed lint/hook failures.
Proposal apply now revalidates against the current snapshot and synchronizes the
event brief. Restore candidates also pass protected-state/timeline validation.
42 existing tests and lint pass; these do not establish the new Phase09 gate.
Phase09 integration/browser verification and export remain pending. Submission
copy and video outline are in SUBMISSION-DRAFT.md; hosting/video/post not completed.

## 2026-10-31 working mock model checkpoint
Mock proposal generation/review/apply/discard and history are wired. Restore
proposals reach the review controls and revalidate current financial/task locks.
Apply synchronizes event brief, canonical snapshot, ledger and immutable version.
Export renders current or historical version content with a print/PDF action.
Demo account/occasion bootstrap: npm.cmd run demo:seed; see QUICK-DEMO.md.

Verified: 43 unit/contract tests; 4 emulator integration scenarios; build/lint and
web/API smoke pass. Replan test checks apply retry, stale rejection, discard,
history and restore. Locked 20000 food/4000 photography survive 50000-to-40000;
impossible cap is flagged. Browser generated/applied a 40000 mock cap, reloaded
revision 2 and checked history plus export content. Screenshot:
evidence/mock-model-export.png. Browser found ID redaction corrupting numeric UUID
segments; structural identifiers now survive while free text remains redacted.
Mock scaling no longer inflates flexible estimates to exhaust available budget.

Local prototype checkpoint only: full release matrix, actual print pagination,
hosted deployment, video and submission remain unverified/incomplete. No live
model requests, external booking, payments, social post or submission performed.

## One-click mock login
Added Enter mock workspace on the local emulator login screen. Creates the local
demo account if absent, otherwise signs into it; uses normal emulator tokens and
owner checks. Hidden outside guarded development emulator mode. Browser verified
sign-out then one-click login, with existing demo occasion retained.

## Vercel services configuration
Added root vercel.json for api/web, explicit workspace builds, API prefix stripping
and SPA deep links. No bindings: static browser calls only. See VERCEL.md. User
confirmation of names/public paths/bindings pending; no deployment performed.

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

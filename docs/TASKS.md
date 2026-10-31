# Phase backlog

Updated 2026-10-22. Complete gates in order; checked planning work is not evidence
of implemented functionality. Detailed phase requirements: [PROMPTS.md](PROMPTS.md).

- [x] **00 — Repository audit and handoff:** preserve specs; inspect existing code;
  add operating instructions, status, decisions, environment and verification.
  Gate: repository files identify current state and next task without chat history.
- [x] **01 — Scope freeze:** write PRODUCT.md; define personas, inputs, P0/exclusions,
  dynamic birthday demo and eight acceptance stories. Gate: explicit MVP and demo.
- [x] **02 — Architecture/contracts/skeleton:** shared schemas; API design; web/API
  health connection; root lockfile and scripts. Gate: clean install, typecheck,
  builds, schema rejection tests and frontend-to-health verification pass.
- [x] **03 — Landing:** Hero/About/Features; routes, motion controls and fallbacks.
  Gate: 360/768/1440/1920 layouts and navigation verified; build/typecheck pass.
- [x] **04 — Workspace/wizard:** shared input validation; tabs and three synthetic
  samples. Gate: mobile/desktop navigation and honest fixture behavior verified.
- [x] **05 — Identity/events (local/emulator gate; cloud verification pending):** Firebase auth/recovery; owner API; persistent CRUD,
  archive and recursive deletion. Gate: reload persistence, two-user isolation,
  unauthenticated rejection, pagination/archive/delete checks; label emulator evidence.
- [x] **06 — Planning rules (local/emulator gate):** paise ledger; payments, contingency, locks, dates,
  dependencies and versioned edits. Gate: meaningful invariant tests and server totals.
- [ ] **07 — Live AI:** extraction; validated draft; explicit acceptance; bounded
  requests, jobs and distributed quotas. Gate: live outputs plus failure checks;
  provider fakes cannot satisfy live verification.
- [x] **08 — Editing (local/mock):** persisted task/vendor/idea workflows and all plan outputs.
  Gate: refresh retains edits; authorization and stale writes verified. Proposal apply checks follow in 09.
- [ ] **09 — Replan/history:** proposal diff, discard, atomic/idempotent apply and
  safe restore. Gate: 50,000-to-40,000 INR demo preserves locks; impossible cap,
  stale apply and duplicate requests tested.
- [ ] **10 — Export/journey:** selected-version print and complete persisted journey.
  Gate: fresh-session flow, deep links, failure handling and print preview verified.
- [ ] **11 — Release verification:** focused automated/browser/accessibility checks;
  30 evaluation briefs and honest live denominators. Gate: no critical money,
  isolation or data-loss defects; required P0 checks verified in RELEASE.md.
- [ ] **12 — Google Cloud:** deployment assets, identity, cost controls, deploy and
  hosted smoke checks. Gate: hosted P0 journey and concrete rollback instructions;
  missing access/spending decisions block deployment, not local preparation.
- [ ] **13 — Submission:** accurate README, architecture, script/assets and checklist.
  Gate: accessible deployment and recorded evidence; human-only recording/submission
  steps remain explicit until actually done.

## Phase 01 acceptance-story links

Scope baseline: [PRODUCT.md](PRODUCT.md). Stories are defined, not implemented.

| Story | Scheduled work | Status |
|---|---|---|
| [AS-01 Identity and event lifecycle](PRODUCT.md#eight-acceptance-stories) | 05, 11–12 | Emulator lifecycle/isolation verified; live gate pending |
| [AS-02 Confirmed brief and initial draft](PRODUCT.md#eight-acceptance-stories) | 04, 07 | Brief confirmation implemented; generation pending |
| [AS-03 Budget and payment arithmetic](PRODUCT.md#eight-acceptance-stories) | 06 | Manual ledger and deterministic rules verified locally |
| [AS-04 Editable tasks, vendors and ideas](PRODUCT.md#eight-acceptance-stories) | 06, 08 | Local editing and reload verified; Phase08 integration/browser evidence |
| [AS-05 Locked-budget replan](PRODUCT.md#eight-acceptance-stories) | 09 | Not implemented |
| [AS-06 Conflicts and history](PRODUCT.md#eight-acceptance-stories) | 09 | Not implemented |
| [AS-07 Journey and export](PRODUCT.md#eight-acceptance-stories) | 10, 12 | Not implemented |
| [AS-08 Accessible samples and recovery](PRODUCT.md#eight-acceptance-stories) | 03–04, 07, 11–12 | Samples and form recovery implemented; full gate pending |

## Functional traceability

JFR-001–049 are not yet implemented end-to-end. Phase 02 adds contract/API-shell
foundations and 15 tests, but no full functional acceptance story has passed. Update each row with concrete files and evidence as work lands. P1 IDs
050–055 are deferred. See FRS section 10 for AT-01–16 acceptance scenarios.

| Requirement | Status | Files / evidence | Blocker |
|---|---|---|---|
| JFR-001 | Implemented landing | landing/Landing.tsx; Phase 03 browser evidence | None |
| JFR-002 | Synthetic public samples implemented | workspace/fixtures.ts, PlanView.tsx; Phase 04 browser evidence | No live generation claimed |
| JFR-003 | Firebase Auth UI/server token verification implemented | auth/Auth.tsx; firebase.ts; FIREBASE.md | Live provider verification pending |
| JFR-004 | Not implemented | None | Await scheduled phase |
| JFR-005 | Not implemented | None | Await scheduled phase |
| JFR-006 | Validated wizard and persisted brief implemented | Wizard.tsx; events.ts; emulator/browser evidence | Live Firebase verification pending |
| JFR-007 | Not implemented | None | Await scheduled phase |
| JFR-008 | Not implemented | None | Await scheduled phase |
| JFR-009 | Not implemented | None | Await scheduled phase |
| JFR-010 | Not implemented | None | Await scheduled phase |
| JFR-011 | Not implemented | None | Await scheduled phase |
| JFR-012 | Not implemented | None | Await scheduled phase |
| JFR-013 | Not implemented | None | Await scheduled phase |
| JFR-014 | Not implemented | None | Await scheduled phase |
| JFR-015 | Shape validation only | packages/contracts/src/index.ts; contracts.test.ts | Business rules/live generation in 06–07 |
| JFR-016 | Not implemented | None | Await scheduled phase |
| JFR-017 | Not implemented | None | Await scheduled phase |
| JFR-018 | Not implemented | None | Await scheduled phase |
| JFR-019 | Manual ledger implemented | BudgetEditor.tsx; events.ts; rules.test.ts; Phase06 evidence | Accepted-plan/history UI integration later |
| JFR-020 | Manual ledger implemented | BudgetEditor.tsx; events.ts; rules.test.ts; Phase06 evidence | Accepted-plan/history UI integration later |
| JFR-021 | Manual ledger implemented | BudgetEditor.tsx; events.ts; rules.test.ts; Phase06 evidence | Accepted-plan/history UI integration later |
| JFR-022 | Manual ledger implemented | BudgetEditor.tsx; events.ts; rules.test.ts; Phase06 evidence | Accepted-plan/history UI integration later |
| JFR-023 | Manual ledger implemented | BudgetEditor.tsx; events.ts; rules.test.ts; Phase06 evidence | Accepted-plan/history UI integration later |
| JFR-024 | Manual ledger implemented | BudgetEditor.tsx; events.ts; rules.test.ts; Phase06 evidence | Accepted-plan/history UI integration later |
| JFR-025 | Implemented locally | PlanEditor.tsx, QuoteReview.tsx, planning.ts; Phase08 integration/browser evidence | Replanning guarantees verified in Phase09 |
| JFR-026 | Implemented locally | PlanEditor.tsx, QuoteReview.tsx, planning.ts; Phase08 integration/browser evidence | Replanning guarantees verified in Phase09 |
| JFR-027 | Implemented locally | PlanEditor.tsx, QuoteReview.tsx, planning.ts; Phase08 integration/browser evidence | Replanning guarantees verified in Phase09 |
| JFR-028 | Implemented locally | PlanEditor.tsx, QuoteReview.tsx, planning.ts; Phase08 integration/browser evidence | Replanning guarantees verified in Phase09 |
| JFR-029 | Implemented locally | PlanEditor.tsx, QuoteReview.tsx, planning.ts; Phase08 integration/browser evidence | Replanning guarantees verified in Phase09 |
| JFR-030 | Implemented locally | PlanEditor.tsx, QuoteReview.tsx, planning.ts; Phase08 integration/browser evidence | Replanning guarantees verified in Phase09 |
| JFR-031 | Implemented locally | PlanEditor.tsx, QuoteReview.tsx, planning.ts; Phase08 integration/browser evidence | Replanning guarantees verified in Phase09 |
| JFR-032 | Implemented locally | PlanEditor.tsx, QuoteReview.tsx, planning.ts; Phase08 integration/browser evidence | Replanning guarantees verified in Phase09 |
| JFR-033 | Not implemented | None | Await scheduled phase |
| JFR-034 | Not implemented | None | Await scheduled phase |
| JFR-035 | Not implemented | None | Await scheduled phase |
| JFR-036 | Not implemented | None | Await scheduled phase |
| JFR-037 | Not implemented | None | Await scheduled phase |
| JFR-038 | Not implemented | None | Await scheduled phase |
| JFR-039 | Not implemented | None | Await scheduled phase |
| JFR-040 | Not implemented | None | Await scheduled phase |
| JFR-041 | Not implemented | None | Await scheduled phase |
| JFR-042 | Not implemented | None | Await scheduled phase |
| JFR-043 | Not implemented | None | Await scheduled phase |
| JFR-044 | Not implemented | None | Await scheduled phase |
| JFR-045 | Not implemented | None | Await scheduled phase |
| JFR-046 | Not implemented | None | Await scheduled phase |
| JFR-047 | Not implemented | None | Await scheduled phase |
| JFR-048 | Landing implemented | AmbientVideo.tsx; media-policy.test.ts; DESIGN.md | Full app accessibility gate later |
| JFR-049 | Not implemented | None | Await scheduled phase |

## User-requested visual refinement — 2026-10-25
- [x] Warm festive palette, welcoming hero copy, static garland and consistent workspace accents.
- Phase07 remains open; no live Gemini verification claimed.

## 2026-10-25 scope decision and Phase07 checkpoint
User explicitly requested mock placeholders now and deferred live AI until later.
- [x] Phase07 local/mock: extraction contract, validated drafts, server totals,
  review/accept/discard, durable jobs, quotas, timeout/repair, owner/version safety.
- [x] Explicit local mock provider; synthetic provenance; production guard;
  mock extraction disabled in UI to avoid implying language understanding.
- [ ] Deferred live gate: Vertex project/model availability and three-event live smoke.
- Next: Phase08 editing, using accepted snapshots and canonical revision transactions.

## Phase08 in progress - 2026-10-25
Initial accepted-plan CRUD and editor UI implemented; functional gate remains open.
User requested an intermediate GitHub checkpoint before more implementation.

- [x] 2026-10-25 user request: remove motion throughout the interface and retain
  a static, flowing festive layout. Phase08 remains open.

## Phase08 completed - 2026-10-25
- [x] Owner-checked CRUD for accepted tasks, vendors and ideas, immutable revisions.
- [x] Dependencies, locks, correction reasons, archive and stale-write protection.
- [x] Explicit quote-to-budget confirmation; ideas never silently alter costs.
- [x] Task/vendor/idea reload persistence and static 360px editor checked.
- [x] 42 unit tests; 3 distinct emulator integration scenarios; build/lint/typecheck/smoke.
- Next: Phase09 proposal lifecycle/history; live AI remains deferred.

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

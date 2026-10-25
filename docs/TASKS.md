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
- [ ] **08 — Editing:** persisted task/vendor/idea workflows and all plan outputs.
  Gate: refresh retains edits; authorization and stale-proposal behavior verified.
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
| [AS-04 Editable tasks, vendors and ideas](PRODUCT.md#eight-acceptance-stories) | 06, 08 | Not implemented |
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
| JFR-025 | Not implemented | None | Await scheduled phase |
| JFR-026 | Schedule validators implemented | planning-rules/src/index.ts; rules.test.ts | Persisted timeline UI in Phase08 |
| JFR-027 | Not implemented | None | Await scheduled phase |
| JFR-028 | Not implemented | None | Await scheduled phase |
| JFR-029 | Not implemented | None | Await scheduled phase |
| JFR-030 | Not implemented | None | Await scheduled phase |
| JFR-031 | Not implemented | None | Await scheduled phase |
| JFR-032 | Not implemented | None | Await scheduled phase |
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

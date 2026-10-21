# Phase backlog

Updated 2026-10-21. Complete gates in order; checked planning work is not evidence
of implemented functionality. Detailed phase requirements: [PROMPTS.md](PROMPTS.md).

- [x] **00 — Repository audit and handoff:** preserve specs; inspect existing code;
  add operating instructions, status, decisions, environment and verification.
  Gate: repository files identify current state and next task without chat history.
- [ ] **01 — Scope freeze:** write PRODUCT.md; define personas, inputs, P0/exclusions,
  dynamic birthday demo and eight acceptance stories. Gate: explicit MVP and demo.
- [ ] **02 — Architecture/contracts/skeleton:** shared schemas; API design; web/API
  health connection; root lockfile and scripts. Gate: clean install, typecheck,
  builds, schema rejection tests and frontend-to-health verification pass.
- [ ] **03 — Landing:** Hero/About/Features; routes, motion controls and fallbacks.
  Gate: 360/768/1440/1920 layouts and navigation verified; build/typecheck pass.
- [ ] **04 — Workspace/wizard:** shared input validation; tabs and three synthetic
  samples. Gate: mobile/desktop navigation and honest fixture behavior verified.
- [ ] **05 — Identity/events:** Firebase auth/recovery; owner API; persistent CRUD,
  archive and recursive deletion. Gate: reload persistence, two-user isolation,
  unauthenticated rejection, pagination/archive/delete checks; label emulator evidence.
- [ ] **06 — Planning rules:** paise ledger; payments, contingency, locks, dates,
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

## Functional traceability

Every JFR-001–049 is currently **not implemented**. No app source or test evidence
exists. Update each row with concrete files and evidence as work lands. P1 IDs
050–055 are deferred. See FRS section 10 for AT-01–16 acceptance scenarios.

| Requirement | Status | Files / evidence | Blocker |
|---|---|---|---|
| JFR-001 | Not implemented | None | Await scheduled phase |
| JFR-002 | Not implemented | None | Await scheduled phase |
| JFR-003 | Not implemented | None | Await scheduled phase |
| JFR-004 | Not implemented | None | Await scheduled phase |
| JFR-005 | Not implemented | None | Await scheduled phase |
| JFR-006 | Not implemented | None | Await scheduled phase |
| JFR-007 | Not implemented | None | Await scheduled phase |
| JFR-008 | Not implemented | None | Await scheduled phase |
| JFR-009 | Not implemented | None | Await scheduled phase |
| JFR-010 | Not implemented | None | Await scheduled phase |
| JFR-011 | Not implemented | None | Await scheduled phase |
| JFR-012 | Not implemented | None | Await scheduled phase |
| JFR-013 | Not implemented | None | Await scheduled phase |
| JFR-014 | Not implemented | None | Await scheduled phase |
| JFR-015 | Not implemented | None | Await scheduled phase |
| JFR-016 | Not implemented | None | Await scheduled phase |
| JFR-017 | Not implemented | None | Await scheduled phase |
| JFR-018 | Not implemented | None | Await scheduled phase |
| JFR-019 | Not implemented | None | Await scheduled phase |
| JFR-020 | Not implemented | None | Await scheduled phase |
| JFR-021 | Not implemented | None | Await scheduled phase |
| JFR-022 | Not implemented | None | Await scheduled phase |
| JFR-023 | Not implemented | None | Await scheduled phase |
| JFR-024 | Not implemented | None | Await scheduled phase |
| JFR-025 | Not implemented | None | Await scheduled phase |
| JFR-026 | Not implemented | None | Await scheduled phase |
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
| JFR-048 | Not implemented | None | Await scheduled phase |
| JFR-049 | Not implemented | None | Await scheduled phase |

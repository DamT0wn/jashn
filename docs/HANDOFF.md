# Latest handoff

2026-10-25: Phase07 local/mock implementation complete; live AI explicitly deferred
by the user. Continue with Phase08 editing next. Do not enable cloud generation or
claim live Gemini passed. See AI.md for eventual setup and smoke instructions.

Current local preview uses MOCK_GENERATION_ENABLED=true and demo-jashn emulators.
This is an explicit provider, not a fallback. Production/live/emulator-mismatch
configuration fails closed. Mock output is synthetic with fixed costs and warnings;
structured forms remain the input route. All mock drafts still pass real schema,
financial, timeline, quota, owner, revision and acceptance rules.

Acceptance writes event revision, immutable version, canonical current snapshot,
budget ledger, draft status and idempotent action result in one transaction. Budget
saves after acceptance update the same canonical plan/version and ledger. Phase08
must use that same transactional version discipline for task/vendor/idea mutations.
Never recreate event children after deletion. Keep owner checks on every resource.

AI source: apps/api/src/ai/{provider,mock,pipeline,routes}. UI: AiPlanning,
BriefExtraction, BudgetEditor, SavedEvents. Contracts include drafts, jobs, extraction.
Draft totals are calculated server-side at generation and read, including old drafts
without stored totals. Manual budget provenance stays untouched when mock outputs
are labeled synthetic. No replacement generation once an accepted plan exists.

Tests: npm run test (41); npm run test:integration (10 including 8 repeated provider
unit cases); npm run lint; npm run build; npm run smoke. Direct JDK path is needed
for reliable local emulator launch: C:/Program Files/Java/jdk-26.0.1/bin before the
Oracle shim in PATH. Build during dev can restart API mid-request: finish builds,
then reload browser before acceptance verification. Local test accounts are disposable.

Still deferred: actual live output quality, semantic requirements evaluation,
provider/schema compatibility in the selected cloud project, release audit, chunk
splitting, media rights, hosted verification. Do not treat mock evidence as live proof.

## Phase08 interrupted checkpoint
User requested commit/push first. planning.ts and PlanEditor.tsx contain initial
Phase08 implementation. Next: test new CRUD authorization/version/dependencies,
locks, quote corrections, retained budgets and reload persistence; verify UI and
fix any defects. Do not treat compile/lint checks as completed functional gate.

## Static appearance handoff
Do not reintroduce motion: user explicitly requested a fully static experience.
Landing uses StaticScene.tsx and Typography.tsx; framer-motion was uninstalled.
Phase08 functional verification remains pending from the prior checkpoint.

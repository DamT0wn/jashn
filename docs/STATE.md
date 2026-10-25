# Current state

Updated 2026-10-25. Phase07 local/mock scope complete; browser acceptance and reload verified.
User explicitly deferred live AI and requested mock placeholders until the app is
more mature. Next implementation phase: 08 editing. Live AI is not a completed gate.

Implemented: festive landing/workspace, synthetic samples, Firebase auth and
owner-isolated event lifecycle, manual budgets, deterministic money/timeline rules,
validated generation drafts, explicit transactional acceptance and immutable plan
versions. Accepted budget edits keep the canonical plan and ledger synchronized.

AI pipeline: real Vertex adapter prepared (not live verified), explicit emulator-only
mock provider, null-preserving extraction, curated checklists, schema/rule validation,
one repair, bounded timeout/output, durable jobs and atomic distributed quotas.
Draft review includes all five outputs, server totals, expiry and acknowledgement.
Failures and stale revisions cannot replace accepted work. No automatic booking,
payment, outreach, acceptance or replacement occurs.

Local .env uses demo-jashn emulators and MOCK_GENERATION_ENABLED=true. Mock plans are
marked synthetic and deliberately flag unevaluated requirements. Text extraction
is disabled in the mock UI; use structured fields. No live model calls or spending.
Emulator records are local and reset when emulators restart unless exported.

Verification: 41 unit/contract tests; 10 emulator-run tests (8 repeated provider
unit tests plus 2 end-to-end integration scenarios); lint and build pass. Application and test TypeScript checks pass.
Existing >500 kB web bundle warning remains. See VERIFICATION and AI.md.

Deferred: live Firebase provider/recovery/cloud checks, live Gemini (0/3 attempted),
task/vendor/idea editing (08), replan/history UI (09), export and deployment.
Model pin gemini-3.8-flash is provisional until live project verification. Previously
recorded dependency advisories and landing media rights still require release review.

## Phase08 work-in-progress checkpoint - 2026-10-25
User requested committing and pushing all work before continuing. Added manual
accepted-plan item create/update/delete routes and a tabbed PlanEditor for tasks,
vendors and ideas. Revision/owner checks, task unlock reason, quote correction
reason and immutable version writes are wired. Phase08 is NOT complete: targeted
integration tests, browser verification, review of edge cases and final gate remain.
Resume that work before declaring editing ready. Live AI stays deferred/mock-only.

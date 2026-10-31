# Current state

Updated 2026-10-25. Phase08 editing complete for local/mock scope. Next: Phase09
replanning, proposal diff and version history. Live AI remains explicitly deferred.

Implemented: static festive landing/workspace, synthetic samples, Firebase auth,
owner-isolated events, manual budgets, deterministic money/timeline rules,
validated mock drafts and explicit acceptance, immutable accepted revisions.
Overview, Budget, Timeline, Vendors and Ideas now use the accepted plan. Owners can
create/edit/delete eligible tasks/vendors/ideas; locks, dependency validation,
quote correction reasons and optimistic revision checks protect saved records.
Vendor quotes require a separate confirmed action to update an existing budget
line. Saving ideas never changes spending. Every edit advances the canonical
revision; Phase09 must reject proposals based on older revisions at apply time.

Verified: 42 unit/contract tests, 3 distinct emulator integration scenarios,
typecheck, lint, build and web/API smoke pass. Browser task/vendor/idea edits and
reload persistence pass; quote application preserves payments and avoids duplicate
costs. Mobile editor checked at 360px. See VERIFICATION.md for evidence.

User preferences: mock placeholders only; no live AI calls/spend. Fully static UI:
no video, animations, hover movement or smooth scrolling. Keep warm festive style.
Local .env uses demo-jashn emulators and MOCK_GENERATION_ENABLED=true. Mock output
is synthetic and does not evaluate requirements. Emulator data resets on restart
unless exported. Production/live/emulator-mismatch configurations fail closed.

Deferred: live Firebase/cloud checks, live Gemini (0/3 attempted), proposal apply
and history (09), export and deployment. Model pin remains provisional. Release
dependency audit and asset rights review remain pending. Current web bundle is
436.14 kB, with no previous >500 kB warning.

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

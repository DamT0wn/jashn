# Latest handoff

2026-10-23: Phase 06 local/emulator gate complete. Next Phase 07 only.
Previous checkpoint 56c81f2; latest via git log -1. No push/deployment performed.

Read STATE, TASKS, PROMPTS Phase07 and FIREBASE setup. The existing dev/emulator
processes were reachable on :5173/:3001/:9099/:8080 during verification. Local data
resets with emulator restart. Browser shows a disposable budget verification event.

New shared BudgetLedger/SaveBudget/BudgetResponse contracts and planning-rules
package implement deterministic arithmetic and timeline/protection checks. Tests
are rules.test.ts plus existing workspace conversion tests. money() now formats
BigInt paise exactly, including negative remaining forecast and MAX_SAFE_INTEGER.

API events.ts adds transactional GET/PUT budget, canonical revision increments and
budgetHistory/{revision} before/after records with actor/time/reason/confirmations.
BudgetEditor uses the revision returned with its ledger, never blindly updates it
from a later parent event, and handles 409 by explicit reload. Full ledger saves
are atomic; invalid corrections leave storage unchanged. Accepted plans currently
block this route; archive/deletion barriers remain enforced.

IMPORTANT Phase07 integration: manual ledgers exist before accepted plans. Initial
AI generation must read this ledger, preserve stable IDs/locks/commitments/payments,
and never fabricate records. Initial acceptance must atomically reconcile it with
the accepted snapshot and revision. Do not leave two independent writable budgets.
Use validateProtectedBudget/Tasks and budgetTotals/validateTimeline at generation
validation AND acceptance. The current pure validators alone do not prove live AI.
Pass event date and clock explicitly to timeline validation. Date-only dependencies
on the same date are allowed; timed pairs compare actual end/start instants.

Phase08 adds persisted task/vendor/idea editing and owner-facing audit/history views;
Phase09 adds proposal expiry/apply/restore. Current audit records are server-side
history, not a shipped history browser. No vendor links can exist in manual ledgers
because accepted-plan editing is blocked. Reconcile links before enabling it.

Verification: 33 automated tests, real emulator integration, browser persisted
financial journey + 360px controls, typecheck/lint/build/smoke. No browser console
errors. A transient reload error during shared-package watch rebuild cleared on
reload after build completion; no lost saved data. Full-page mobile capture failed;
viewport capture succeeded. Screenshots in docs/evidence/phase-06-*.

Remaining external gates: live Google provider/recovery email/Firebase cloud,
Vertex configuration and live provider testing. Existing dependency advisories,
chunk-size warning and media rights still pending release work.

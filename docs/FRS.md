# Jashn — Functional Requirements Specification

**Tagline:** Plan the joy.  
**Version:** 1.0  
**Date:** 21 October 2026  
**Prepared for:** Utkarsh Kumar Rai  
**Status:** Proposed implementation baseline; requirements are not claims of implemented functionality.

## 1. Purpose and document relationships

This FRS defines what users can do in Jashn, how the application responds, the information it accepts and produces, and how each function will be accepted. It supports implementation and verification by Astra, Codex or another coding agent.

Companion documents:

- **Jashn_Plan_and_SRS.md:** product scope, architecture, non-functional targets and technical constraints.
- **Jashn_Agent_Prompt_Playbook.md:** phased implementation and coding-agent handoff process.
- **This FRS:** functional behavior, business rules, exceptions and acceptance criteria.

Place this file at `docs/FRS.md` in the implementation repository. Keep existing SRS IDs unchanged; this document uses the separate `JFR-xxx` namespace. Record future changes in `docs/DECISIONS.md` and update affected requirements, contracts and tests together.

The user's later dark cinematic frontend direction supersedes the SRS's earlier light palette. This FRS follows the playbook: black/charcoal surfaces, warm cream text, Almarai, Instrument Serif accents and restrained animation. Detailed visual implementation remains in the playbook.

New clarifications in this FRS—field limits, archived-event behavior, proposal expiry, payment corrections and explicit initial-plan acceptance—are proposed defaults. They make implementation testable without expanding the MVP into a marketplace or accounting system.

## 2. Product scope

Jashn helps an organizer plan weddings, birthdays and community events from an event brief. It produces an editable budget, preparation timeline, event-day agenda, vendor checklist and personalized ideas. Its distinguishing function is replanning when circumstances change while preserving commitments and showing the user a proposed change before applying it.

**P0, required for MVP:** public landing/sample experience; sign-in; owner-isolated event management; confirmed event briefs; AI draft generation; manual plan editing; budget rules; task/vendor management; replanning; version history; print export; recoverable errors and usage controls.

**P1, later:** collaborative access, guest RSVP, quote extraction, calendar export, Hindi generated output and source-backed vendor discovery.

**Excluded from P0:** vendor accounts, automated outreach, bookings, payments processing, public sharing of private plans, custom ML training and autonomous purchases. Recording a payment means manually recording money paid elsewhere.

## 3. Actors and permissions

| Actor | Permitted actions | Restrictions |
|---|---|---|
| Visitor | Read landing page; inspect labeled synthetic sample plans; start sign-in | Cannot read private events or save a personal event anonymously |
| Organizer/owner | Create and manage own events; generate/review/apply plans; export; delete | Cannot access another owner's records by guessing IDs |
| AI service | Return proposed brief fields, plans and revisions | Cannot authorize access, confirm payments, book vendors or accept its own proposals |
| System | Validate, persist, calculate, enforce versions/limits and display outcomes | Must not silently substitute demo output for live AI |

No in-app administrative role is required in P0. Future collaborators are not implicitly authorized by knowing an event URL.

## 4. Main workflows

### 4.1 Create a plan

Visitor selects Start planning → authenticates → enters a brief → confirms required fields → saves event → requests generation → reviews draft, assumptions and feasibility → explicitly accepts → uses the workspace.

If the user declines the draft, the saved event remains and the draft does not become an accepted plan. The organizer may edit their brief and request another draft within usage limits.

### 4.2 Replan an existing event

Owner requests a change → confirms extracted changes → system reads current version and protected items → system checks basic feasibility → AI proposes permitted changes → system validates → user reviews old/new values → applies or discards.

Applying a proposal creates a new accepted version. Generation and discard do not mutate the current accepted plan. Conflicting edits require a refreshed proposal.

### 4.3 Manual changes

Owner edits an amount/task/vendor → system validates ownership, values and expected version → system saves a consistent revision → workspace refreshes → previous proposals are recognized as stale.

A clear Save action or equivalent explicit control is required for financial edits. Failed saves must not appear successful. Unsaved values remain available for correction where possible.

## 5. Functional requirements and acceptance criteria

All requirements in sections 5.1–5.10 are P0 unless explicitly marked otherwise. “Shall” means required for acceptance. Tests refer to actual observed behavior, not visual placeholders.

### 5.1 Public experience and identity

| ID | Required behavior | Acceptance criterion |
|---|---|---|
| JFR-001 | The landing page shall present Jashn's purpose, Hero/About/Features sections and working navigation. | Every navigation item resolves to its intended section/route; no studio biography or unsupported product claim remains. |
| JFR-002 | Visitors shall inspect birthday, wedding and community sample plans without creating an account. | Each sample is visibly synthetic; its budget/timeline/ideas links open the correct view; it exposes no private user data. |
| JFR-003 | The application shall support Google sign-in and email/password registration/sign-in. | Successful authentication opens the intended protected destination; invalid credentials show a recoverable error. |
| JFR-004 | Email/password users shall request password recovery; signed-in users shall sign out. | Recovery displays a non-enumerating acknowledgement; sign-out clears private UI state and protected navigation requires sign-in. |
| JFR-005 | Every private operation shall authenticate and authorize the caller. | User B cannot read, mutate, generate for, inspect history of, or export user A's event, including nested resource IDs. |

### 5.2 Event lifecycle and brief

| ID | Required behavior | Acceptance criterion |
|---|---|---|
| JFR-006 | Owners shall create an event from validated required fields and optional preferences. | Valid data persists after reload; missing/invalid fields prevent save with field-level explanations. |
| JFR-007 | Owners shall list and reopen their events with pagination and active/archived filtering. | Only owned events appear; opening a record restores its saved brief and current plan. |
| JFR-008 | Owners shall edit their brief; changes affecting an accepted plan shall trigger a review/replan flow. | Changing guest count, date, budget or hard preferences cannot leave a supposedly validated old plan silently inconsistent. Changes remain pending until validated/applied with the plan. |
| JFR-009 | Owners shall archive and unarchive events. | Archived events remain viewable/exportable but cannot be edited/generated/replanned until unarchived; active listing excludes them by default. |
| JFR-010 | Owners shall delete an event after an explicit confirmation identifying the event. | Deleted event becomes inaccessible immediately; associated versions, proposals and child records are removed within the SRS deletion target. Failures remain visible/retryable. |
| JFR-011 | Natural-language brief extraction shall return a reviewable form. | Unspecified required values stay empty; the system never invents a date, city, guest count or budget to bypass confirmation. |
| JFR-012 | The application shall accept English and Hindi/Hinglish briefs with English output in P0. | Input text is preserved; uncertain interpretations are presented for confirmation; user-confirmed structured values govern generation. |

### 5.3 AI draft generation and acceptance

| ID | Required behavior | Acceptance criterion |
|---|---|---|
| JFR-013 | A confirmed brief shall generate a structured draft containing overview, budget, timeline, vendor checklist and personalized ideas. | All five required outputs are present or the response is rejected as incomplete; model/provider errors do not create a successful draft. |
| JFR-014 | The system shall expose assumptions, estimates and feasibility before acceptance. | Costs without a confirmed source are visibly estimates; missing evidence never becomes a verified vendor quote. |
| JFR-015 | The system shall validate generated structure and business rules before offering acceptance. | Invalid amounts, broken dependencies, violated locks or missing mandatory fields cannot pass acceptance; a bounded repair may be attempted. |
| JFR-016 | The organizer shall explicitly accept the initial plan. | Acceptance creates the first accepted version exactly once; review/decline leaves the event without an accepted plan. |
| JFR-017 | Generated content shall respect confirmed hard requirements and explain negotiable trade-offs. | Vegetarian/accessibility requirements and locked items remain intact in the applicable evaluation scenarios; infeasibility is reported instead of ignored. |
| JFR-018 | Generation shall display truthful progress, completion or failure. | The UI does not invent percentage progress or keep a permanently running state after a known timeout; failed generation preserves the last accepted plan. |

### 5.4 Budget management

| ID | Required behavior | Acceptance criterion |
|---|---|---|
| JFR-019 | Owners shall add, edit and remove eligible budget lines, including allocation, estimate and provenance. | Valid edits persist and totals recalculate; a committed/paid line cannot disappear through a simple delete action. |
| JFR-020 | Owners shall record confirmed total commitments and payment totals manually. | A partial payment does not increase projected event cost; payments remain distinguishable from unpaid commitments and estimates. |
| JFR-021 | Owners shall lock/unlock eligible line assumptions and identify protected commitments. | AI proposals cannot alter locked values or confirmed financial records; explicit owner corrections are separately confirmed and recorded. |
| JFR-022 | The budget shall show projected cost, contingency, remaining forecast and outstanding confirmed payments. | Values match the formulas in section 7, including null versus zero committed cost. |
| JFR-023 | A budget overrun shall be shown without fabricated savings. | Negative remaining budget is displayed as a shortfall; a plan above the cap is not labeled within budget. |
| JFR-024 | Financial corrections shall be explicit and auditable. | Reducing a recorded commitment/payment requires a reason and confirmation; the prior value remains in history. Overpayment is shown as credit/refund due, not a negative payable. |

### 5.5 Timeline and tasks

| ID | Required behavior | Acceptance criterion |
|---|---|---|
| JFR-025 | Owners shall create/edit/delete eligible tasks and change status, due date, priority and dependencies. | Changes persist; dangling references/cycles are rejected; deleting a referenced task requires explicit dependency resolution. |
| JFR-026 | The timeline shall distinguish preparation tasks from timed event-day agenda items. | Date-only tasks remain on their intended local date; timed items display the event timezone consistently. |
| JFR-027 | The overview shall highlight next actions, overdue tasks and blocked dependencies. | A dependent task cannot be marked complete while a prerequisite is incomplete; overdue incomplete tasks are identifiable; completed tasks are not presented as overdue work. |
| JFR-028 | Fixed tasks and infeasible lead times shall remain visible during planning. | A late-start event flags missed preparation windows; replanning cannot silently move a locked task or make impossible deadlines appear completed. |

### 5.6 Vendors and ideas

| ID | Required behavior | Acceptance criterion |
|---|---|---|
| JFR-029 | Vendor checklists shall provide categories, required-by dates and questions/documents to request. | A generated event includes actionable vendor checklist entries even when no real vendor is selected. |
| JFR-030 | Owners shall add/edit manual vendor details and status. | Researching/contacted/shortlisted/booked changes persist; booking is labeled organizer-recorded and triggers no external action. |
| JFR-031 | Vendor quote values shall have explicit provenance and budget linkage. | A quote in vendor notes does not silently change the budget; applying it to a linked budget line requires confirmation and avoids duplicate counting. |
| JFR-032 | Ideas shall show relevance to preferences and estimated cost implications. | An idea can be saved/dismissed; applying a cost-affecting idea creates a reviewable change rather than silently increasing accepted spend. |

### 5.7 Replanning and history

| ID | Required behavior | Acceptance criterion |
|---|---|---|
| JFR-033 | Owners shall request budget, guest-count or date changes in structured or natural-language form. | Extracted changes are shown for confirmation; ambiguous instructions do not mutate the event. |
| JFR-034 | The system shall detect conflicts between requested constraints and protected commitments. | When fixed minimum cost exceeds the requested cap, it reports the exact minimum shortfall and feasible decision options. |
| JFR-035 | Replanning shall produce a separate validated proposal with an impact comparison. | Old/new totals, added/removed/modified items, preserved priorities and risks are visible; the accepted plan remains unchanged. |
| JFR-036 | Owners shall apply or discard a proposal. | Apply atomically creates one new accepted revision and updates its brief/plan together; discard changes neither. |
| JFR-037 | Apply shall enforce ownership, base version, expiry and idempotency. | A stale, expired, discarded or unauthorized proposal cannot apply; retrying an already successful apply returns its existing result without another revision. |
| JFR-038 | Owners shall view accepted version history and restore eligible prior content. | Restore produces a newly validated proposal/revision; it does not overwrite history or roll back current payments/commitments silently. |

### 5.8 Export

| ID | Required behavior | Acceptance criterion |
|---|---|---|
| JFR-039 | Owners shall open a print view of a selected accepted version. | Event details, timezone, budget, tasks, vendors, ideas, assumptions, version and export time match the selected snapshot. |
| JFR-040 | Print view shall support browser print/save as PDF. | Controls, videos and noise overlays are omitted; content remains legible without clipped tables; UI accurately describes browser-based export. |
| JFR-041 | Historical export shall distinguish historical data from current obligations. | A previous version is visibly labeled historical and does not imply its payment totals are current. |

### 5.9 Errors, persistence and usage controls

| ID | Required behavior | Acceptance criterion |
|---|---|---|
| JFR-042 | Save failures and concurrency conflicts shall preserve authoritative data and communicate next steps. | A failed request never displays Saved; stale edits return a refresh/review action instead of overwriting another accepted change. |
| JFR-043 | AI quotas and temporary outages shall have recoverable states. | Limited users receive a clear limit/retry message; existing plans remain readable, manually editable and exportable. |
| JFR-044 | Duplicate generation requests shall be recognized using request identity. | Retrying the same logical request does not create duplicate accepted versions or uncontrolled duplicate jobs; provider-level exactly-once billing is not promised. |
| JFR-045 | Interrupted generation shall terminate visibly or become retryable. | Stale running jobs are reconciled; a reload can show the owned job outcome; no detached work is reported as completed without a result. |
| JFR-046 | Important state-changing actions shall record actor, time, entity and resulting version. | Financial corrections, accepted revisions, archive/delete and restores can be explained from recorded metadata without logging secrets. |

### 5.10 Functional accessibility and demo honesty

| ID | Required behavior | Acceptance criterion |
|---|---|---|
| JFR-047 | Core actions shall be operable using keyboard and accessible form controls. | Users can create/review/apply/export with visible focus, readable errors and meaningful labels; animated character text has a coherent accessible equivalent. |
| JFR-048 | Media and animations shall have usable fallback behavior. | Reduced-motion users can read all content; decorative video failure does not block navigation; video can be paused. |
| JFR-049 | Sample and real environments shall remain distinguishable. | Demo data is labeled; a missing live provider never causes sample output to masquerade as a successful live generation. |

## 6. Input and output contracts

### 6.1 Proposed P0 input defaults

These are validation defaults to put in shared constants. Changing them requires updating UI/API validation and tests together.

| Field | Required | Rule |
|---|---|---|
| Event name | Yes | Trimmed, 1–120 characters |
| Event type | Yes | wedding, birthday or community |
| City | Yes | Trimmed, 1–100 characters; no location inference from profile |
| Event date | Yes | Valid calendar date, today or later in event timezone at creation; past existing events remain viewable |
| Timezone | Yes | Valid IANA identifier; suggested Asia/Kolkata must be visible/confirmable |
| Guest count | Yes | Integer 1–100,000; unusually large events may receive a planning-complexity warning |
| Currency | Yes | INR only in P0 |
| Budget cap | Yes | Positive INR amount with at most 2 decimal places; converted exactly to paise; stored value and all sums must be safe integers |
| Brief text | Optional | At most 5,000 characters; extraction never bypasses confirmation |
| Preferences/notes | Optional | At most 2,000 characters per text field |
| Cost/payment values | As applicable | Non-negative; no NaN, infinity, excessive decimals or unsafe integer conversion |
| Task/vendor/idea title | As applicable | Trimmed, 1–160 characters |
| IDs, owner, version, audit fields | System | Never trusted merely because the client supplied them |

For a new event with an unrealistic budget, permit an honest infeasibility result rather than inventing feasible costs. Post-event tasks such as cleanup may occur after the event if explicitly classified; do not reject every post-event date indiscriminately.

### 6.2 Required plan content

| Object | Required content |
|---|---|
| Plan | ID/version, linked event, overview, assumptions, feasibility, warnings, generation metadata |
| Budget line | Stable ID, category, allocation, estimate, nullable commitment, paid amount, provenance, lock |
| Timeline task | Stable ID, title, preparation/agenda/post-event kind, due date/time, dependencies, priority, status, lock |
| Vendor entry | Stable ID, category, questions, required-by date, optional manually entered contact/quote, provenance and status |
| Idea | Stable ID, title, description, preference match, estimated cost effect, saved/dismissed state |
| Proposal | ID, owner/event association, base version, requested changes, candidate plan, diff, validation result, expiry and state |

IDs supplied by AI must be reconciled with canonical records. AI cannot authoritatively set owner, payments, commitments, booked status or accepted-version metadata.

## 7. Business rules

| ID | Rule |
|---|---|
| BR-01 | All monetary computation uses integer paise and explicit INR; no mixed currencies in P0. |
| BR-02 | Projected line cost = committed total if non-null, otherwise estimated total. Zero is a valid confirmed value and is not treated as missing. |
| BR-03 | Projected event total = sum of projected line costs + visible contingency reserve, counted once. |
| BR-04 | Remaining forecast = cap − projected total. Outstanding confirmed = sum(max(commitment − paid, 0)) for committed lines. |
| BR-05 | Paid totals are informational cash movements and are not added again to projected cost. Record a commitment before recording payment against a line. |
| BR-06 | Paid amount above commitment produces an explicit overpayment/credit flag. Refunds/corrections are owner-recorded with reason and history; no refund is executed by Jashn. |
| BR-07 | A feasible label requires all hard constraints and budget checks to pass. An infeasible draft may be saved/accepted only with an explicit acknowledgement and persistent shortfall label; structural invalidity cannot be accepted. |
| BR-08 | AI cannot alter locks, payments or confirmed commitments. Owners may correct records explicitly; changing financial obligations does not imply cancellation with the real vendor. |
| BR-09 | Manual planning changes and accepted proposals increment canonical version. Every previously based proposal is checked again before apply. |
| BR-10 | Generation is proposal-only. Initial acceptance, replacement and historical restore require explicit owner action. |
| BR-11 | Task dependencies form an acyclic graph. A prerequisite scheduled after its dependent is invalid; incomplete prerequisites block completion. |
| BR-12 | Preserve event timezone and date-only semantics; overdue/infeasible lead times are warnings requiring attention, not silently repaired dates. |
| BR-13 | “Booked” and “paid” are organizer records. They do not establish external availability, contract validity or payment verification. |
| BR-14 | Proposal validity defaults to 24 hours and always ends if its base version is obsolete. Display expiration; never apply an expired proposal silently. |
| BR-15 | History restore selects prior planning content, reconciles current financial obligations and hard constraints, then creates a new version through review. |
| BR-16 | Application quotas must apply consistently across backend instances. Configured limits are operational settings; no unlimited fallback on quota failure. |

Example, synthetic: ₹50,000 cap; food ₹20,000 and photography ₹4,000 locked. Reducing the cap to ₹40,000 leaves ₹16,000 for all other projected costs including contingency. The system can propose adjustments within that amount; it cannot promise that real vendors will accept the estimates. If fixed costs already total ₹45,000, the new cap has a minimum ₹5,000 shortfall before additional flexible costs.

## 8. State transitions

| Entity | States and transitions | Guard |
|---|---|---|
| Event | Active ↔ archived; active/archived → deleting → deleted | Owner only; archived blocks mutations except unarchive/delete; deleting blocks use |
| Generation job | Pending → running → succeeded or failed; stale running → failed/retryable | Auth/ownership, quota reservation, bounded attempt count |
| Draft | Generated → accepted or discarded | Schema/business validation; confirmed base version; explicit owner action |
| Replan proposal | Draft → applied, discarded or expired | Valid base version and ownership; stale proposals visibly unusable even before expiry |
| Task | To do ↔ in progress ↔ done | Dependency guards; changing prerequisites invalidates affected completion assumptions for review |
| Vendor | Researching ↔ contacted ↔ shortlisted ↔ booked | Explicit organizer entry; leaving booked requires acknowledgement and does not cancel a real booking |
| Version | Immutable accepted snapshot | Restoring makes a new version; existing snapshot is never overwritten |

For P0 task consistency, reject reopening/deleting a prerequisite of a completed dependent until the organizer explicitly reopens or unlinks affected dependent tasks. This prevents silently leaving logically completed work with unmet prerequisites.

## 9. Exceptions and recovery

| Condition | User-facing behavior | Data behavior |
|---|---|---|
| Required brief value missing | Highlight missing field; retain other entries | No generation request accepted |
| Authentication expired | Request sign-in and preserve safe unsaved form data where possible | No unauthorized save |
| Event absent/not owned | Generic unavailable/not-found response | No existence or private-content disclosure |
| Invalid generated plan | Explain generation could not produce a valid draft; offer retry/manual work | Last accepted version unchanged |
| Budget infeasible | Show shortfall and negotiable options | Can retain explicitly infeasible content; cannot label it feasible |
| Quota exhausted | Explain usage limit and retry/reset information if known | Existing saved-plan functions remain available |
| Network/save failure | Show unsaved state and retry | No false success; duplicate mutation identity preserved |
| Version conflict | Ask user to refresh/review current version | No overwrite of newer accepted data |
| Print blocked/cancelled | Keep export view open and offer browser-print guidance | No claim that a PDF was saved |
| Deletion cleanup failure | Keep deletion pending and support retry | Event remains inaccessible; no silent orphan success |

## 10. Acceptance scenarios

| Test | Given / When / Then | Requirements |
|---|---|---|
| AT-01 | Given a visitor, when opening sample budget/timeline links, then the correct labeled sample tab opens without exposing private data. | 001–002, 049 |
| AT-02 | Given valid sign-in, when creating and reloading an event, then confirmed brief fields persist and only the owner can access them. | 003–007 |
| AT-03 | Given “plan a birthday in Noida” with no budget/date/guest count, when extracting a brief, then missing fields remain unconfirmed and generation is blocked. | 006, 011–012 |
| AT-04 | Given a complete brief, when live generation succeeds, then all required outputs and assumptions appear; accepting creates the first version once. | 013–018 |
| AT-05 | Given an estimated ₹20,000 food line with ₹18,000 confirmed commitment and ₹5,000 paid, then projected cost is ₹18,000 and outstanding is ₹13,000, not ₹23,000. | 019–024 |
| AT-06 | Given a dependency A→B, when completing B before A or creating B→A, then completion/cycle changes are rejected with an explanation. | 025–028 |
| AT-07 | Given a manually entered vendor quote, when viewing it, then no budget cost changes until explicit linkage/confirmation and no vendor is contacted. | 029–032 |
| AT-08 | Given ₹50,000 cap with food/photography locked, when proposing ₹40,000, then locks remain intact and a diff appears before apply. | 033–036 |
| AT-09 | Given fixed costs ₹45,000, when requesting a ₹40,000 cap, then minimum ₹5,000 shortfall is shown without invented savings. | 023, 034 |
| AT-10 | Given two tabs with the same base version, when tab A saves and tab B applies its old proposal, then tab B receives a conflict and no data is overwritten. | 037, 042 |
| AT-11 | Given a successful apply, when retrying the identical request, then the same accepted revision is returned with no duplicate revision. | 036–037, 044 |
| AT-12 | Given new payments after an older plan, when restoring that plan, then current financial records remain protected and a reviewed new revision is created. | 024, 038 |
| AT-13 | Given a selected historical version, when printing, then output matches that snapshot and is marked historical rather than current financial state. | 039–041 |
| AT-14 | Given a provider timeout/quota failure, then saved plans remain available and no fake generated result or permanently running job appears. | 018, 043–045, 049 |
| AT-15 | Given an archived event, then view/export work but editing requires unarchive; confirmed deletion removes access and child records. | 009–010 |
| AT-16 | Given keyboard-only/reduced-motion use or failed video loading, then all planning/navigation actions and readable content remain available. | 047–048 |

Numbers in the requirement column use the `JFR-` prefix. Build test evidence against these scenarios, including observed outputs and environment (fixture/emulator/live). A failed or unexecuted live scenario is not a pass.

## 11. Traceability to SRS and implementation phases

| FRS range | Related SRS requirements | Playbook phase |
|---|---|---|
| JFR-001–002 | P0 sample experience; UX screens | 03–04 |
| JFR-003–005 | FR-01 | 05 |
| JFR-006–012 | FR-02, FR-03, FR-16 | 04–05, 07 |
| JFR-013–018 | FR-04, FR-05, FR-10, FR-15 | 07 |
| JFR-019–024 | FR-06, FR-07 | 06 |
| JFR-025–028 | FR-08 | 06, 08 |
| JFR-029–032 | FR-09, FR-10 | 08 |
| JFR-033–038 | FR-11, FR-12, FR-13 | 09 |
| JFR-039–041 | FR-14 | 10 |
| JFR-042–046 | FR-01, FR-15; usage/reliability targets | 05–11 |
| JFR-047–049 | Accessibility targets; honest demo behavior | 03–04, 10–13 |

Ideation/contracts in phases 00–02 establish this baseline. Phase 11 verifies behavior; phase 12 must verify it again on the hosted environment where environment differences matter; phase 13 documents only working capabilities.

## 12. Deferred functional requirements

| ID | Priority | Future behavior | Minimum acceptance gate when scheduled |
|---|---|---|---|
| JFR-050 | P1 | Owner invites editor/viewer collaborators | Enforce permissions on all operations; revocation removes access |
| JFR-051 | P1 | Organizer collects RSVP responses | Scoped invite identity, duplicate-response handling and accurate counts |
| JFR-052 | P1 | Extract vendor quotes from uploaded documents | Source/page provenance and owner review before updating costs |
| JFR-053 | P1 | Export calendar entries | Preserve timezone and avoid duplicate entries on updated exports |
| JFR-054 | P1 | Generate Hindi output | Preserve monetary/date semantics and validate language quality |
| JFR-055 | P1 | Discover vendor listings | Show source/time; do not imply confirmed availability or prices |

These are not required for P0 completion and must not consume implementation effort before the current phase's gate passes.

## 13. Completion and change control

P0 is functionally complete only when JFR-001–049 have implemented behavior and acceptance evidence, all critical owner-isolation/money/versioning tests pass, and the full hosted journey works with real authentication, persistence and generation. Synthetic fixtures remain useful test aids but do not prove a live integration.

Maintain a small requirement checklist in `docs/TASKS.md`: requirement ID, implementation status, relevant files, test/evidence and blocker. Preserve these IDs when switching coding agents. Update `docs/STATE.md` and `docs/HANDOFF.md` after each phase; do not mark future features complete from their screen designs alone.

The SRS retains responsibility for performance, security architecture and operational targets. Deployment spending limits, actual model/region availability and submission deadline remain external configuration/confirmation items; this FRS does not invent their values.

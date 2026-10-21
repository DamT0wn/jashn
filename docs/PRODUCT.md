# Jashn — Plan the joy.

Phase 01 build brief · 2026-10-21 · Scope baseline for P0 implementation.
This document defines intended behavior, not shipped functionality. Detailed
requirements remain in [FRS.md](FRS.md) and [SRS.md](SRS.md); phase gates and
implementation status live in [TASKS.md](TASKS.md).

## Problem and audience

Celebration organizers juggle budgets, tasks, vendor questions and changing plans
across disconnected notes. Jashn turns a confirmed brief into one editable plan
and explains how a change affects costs and tasks while protecting priorities.
The initial product is a responsive web app for individual organizers in India,
with one owner per event, INR currency and English interface/output. English and
Hindi/Hinglish brief input is supported; uncertain extraction requires confirmation.

| Persona | Main need | Successful outcome |
|---|---|---|
| Birthday host | Organize a small celebration without losing control of costs | A clear budget, activities, shopping/tasks and event-day schedule |
| Wedding organizer | Coordinate dependencies and already agreed commitments | Practical milestones and changes that preserve booked/locked items |
| Community organizer | Balance attendance, accessibility and shared resources | An accessible event plan, vendor questions and actionable run sheet |

## Inputs and confirmation

| Input | Requirement |
|---|---|
| Name | Required, trimmed 1–120 characters |
| Type | Required: birthday, wedding or community |
| City | Required, trimmed 1–100 characters; never inferred from profile |
| Local event date | Required, valid calendar date, today or later in the event timezone when created |
| IANA timezone | Required; visibly suggest Asia/Kolkata and allow confirmation/change |
| Guests | Required integer, 1–100,000 |
| Currency and budget | Required INR and positive amount, at most two decimal places; exact safe integer paise |
| Brief text | Optional, at most 5,000 characters |
| Preferences and notes | Optional, at most 2,000 characters per text field |

Optional structured details include venue status, indoor/outdoor setting, theme,
priorities, dietary/accessibility/cultural preferences and fixed commitments.
Hard requirements must be distinguished from negotiable preferences. Do not infer
culture/religion from a name or collect unnecessary guest contacts. Missing fields
from free text stay empty; generation requires the organizer's confirmed values.
Future schema work must bound arrays, identifiers and total payload sizes as well
as these fields. Past saved events remain readable; overdue tasks remain visible.

## Core journey

1. Explore the landing page or a clearly labeled synthetic sample; sign in to
   create a personal event using Google or email/password.
2. Enter a structured or natural-language brief, review extracted details and
   explicitly confirm required fields before saving the event.
3. Request a structured draft: overview, budget, preparation/event-day timeline,
   vendor checklist and personalized ideas. Review assumptions and feasibility.
4. Explicitly accept the initial draft to create the first accepted version.
   Declining a draft leaves the saved brief intact without an accepted plan.
5. Edit costs, tasks, vendors and ideas; explicitly save financial changes.
   Server validation and version checks govern every planning-affecting edit.
6. Request and confirm a budget/date/guest change. Review a separate proposal
   showing before/after amounts, preserved locks, changes, risks and assumptions.
7. Apply or discard. Apply creates one new accepted revision atomically; discard
   leaves the plan unchanged. Stale/expired proposals require fresh review.
8. Reopen saved work, inspect history and print the selected version with its
   timestamp, assumptions and estimate labels using browser print/save-to-PDF.

## Frozen P0 scope

- Cinematic Hero/About/Features landing and public synthetic birthday, wedding
  and community samples; responsive, keyboard-accessible UI with reduced motion.
- Google and email/password authentication, password recovery and sign-out;
  owner-isolated event create/list/reopen/edit/archive/unarchive/delete.
- Brief extraction/confirmation and live Vertex AI Gemini drafts with all five
  outputs, provenance, assumptions, feasibility and explicit initial acceptance.
- Editable Overview, Budget, Timeline, Vendors and Ideas workspace. Track
  allocations, estimates, commitments, manual payment records, contingency and
  locks; task dates/dependencies/status; manual vendor records; saved ideas.
- Versioned replanning with diff, apply/discard, history and reviewed restore.
  Preserve current obligations during restore; never restore an obsolete ledger.
- Print export, recoverable validation/network/auth/provider errors, bounded
  usage, saved work during AI outages, server authorization and safe text rendering.
- Google Cloud deployment and hosted verification; truthful demo/submission
  materials describing only verified capabilities.

All JFR-001–049 remain required. The eight stories below organize acceptance;
they do not replace detailed FRS criteria or reduce the release checklist.

## Excluded from P0

Collaboration/invites, RSVP, live vendor search/marketplace, guest/vendor accounts,
automated messaging or bookings, payment processing, quote/document uploads,
calendar export, Hindi generated output, public private-plan sharing, custom ML,
fine-tuning, vector search without a real retrieval need, and optional infrastructure
such as Kubernetes/Jenkins. Manual recording of payments made elsewhere stays in
P0; Jashn never transfers money or establishes real-world booking availability.
Wedding and community fixtures are created in Phase 04, not this planning phase.

## Differentiating demo

Synthetic brief: “Plan a vegetarian birthday in Noida for 50 guests with an INR
50,000 budget, 30 days from today.” Use name “Noida birthday” and confirm
Asia/Kolkata. The fixture factory must accept a controllable clock, take today's
calendar date in that timezone and add 30 calendar days. Do not store a fixed
future date or use UTC milliseconds as a substitute for local calendar arithmetic.
Fixture code and wedding/community samples are deferred to implementation.

The signature request is: **“Reduce the budget by 20%, but keep food and
photography unchanged.”** Confirm the new INR 40,000 cap before proposing changes.

| Category | Original INR | Candidate INR | Protection |
|---|---:|---:|---|
| Venue | 12,000 | 8,000 | Flexible estimate |
| Food | 20,000 | 20,000 | Locked |
| Decor | 6,000 | 3,000 | Flexible estimate |
| Photography | 4,000 | 4,000 | Locked |
| Activities | 3,000 | 1,000 | Flexible estimate |
| Contingency | 5,000 | 4,000 | Visible reserve |
| Total | 50,000 | 40,000 | 20% reduction |

These are synthetic planning estimates, not market prices or promised vendor
offers. A user-entered confirmed quote carries its provenance; the system never
implies independent verification. Live AI is not required to reproduce these exact
flexible amounts, but every accepted feasible proposal must satisfy the same rules.

Server code reads canonical locks/commitments, computes protected cost and checks
the candidate against stable IDs. Food and photography consume INR 24,000, leaving
INR 16,000 including contingency. A candidate that changes/removes locked content
or financial obligations is rejected. Payments are never added again to forecast
cost. The model cannot write the accepted plan. Apply checks owner, version,
expiry and idempotency in one atomic operation.

If protected fixed costs instead total INR 45,000, report a **minimum INR 5,000
shortfall** against the INR 40,000 cap before any further flexible costs. Offer
raising the cap or organizer-reviewed changes to commitments/priorities; never
invent savings or silently unlock items. A structurally valid infeasible plan may
be accepted only with explicit acknowledgement and a persistent shortfall label,
as FRS BR-07 permits; it must never be marked feasible.

## Eight acceptance stories

These are planned acceptance targets. None has passed implementation verification.

| ID | Story and observable acceptance | Traceability | Phases |
|---|---|---|---|
| AS-01 | As an organizer, I sign in, save and reopen my confirmed event; a second account cannot access it. Archive blocks edits while preserving view/export, and confirmed deletion removes access and child records. | SRS FR-01/02/16; FRS AT-02/15, JFR-003–010 | 05, 11–12 |
| AS-02 | As a host, I confirm an extracted brief; missing date, guests or budget stays unset and blocks generation. A valid live draft shows all five outputs and assumptions; explicit initial acceptance creates exactly one version. | SRS FR-03/04/05/10; FRS AT-03/04, JFR-011–017 | 04, 07 |
| AS-03 | As an organizer, I edit costs and locks and get exact totals: an INR 18,000 commitment with INR 5,000 paid projects INR 18,000 and leaves INR 13,000 outstanding. Overpayments/corrections are explicit; contingency is counted once. | SRS FR-06/07; FRS AT-05, JFR-019–024 | 06 |
| AS-04 | As an organizer, I save task, vendor and idea edits and see them after reload. Cycles and completion before prerequisites fail; vendor quotes affect costs only after explicit linkage, and saved ideas cannot silently change the budget. | SRS FR-08/09/10; FRS AT-06/07, JFR-025–032 | 06, 08 |
| AS-05 | As a host, I request the 20% reduction, see a complete diff and unchanged food/photography locks, then apply or discard. A protected INR 45,000 minimum against INR 40,000 reports at least INR 5,000 shortfall. | SRS FR-07/11; FRS AT-08/09, JFR-023/033–036 | 09 |
| AS-06 | As an organizer using two tabs, I cannot apply a stale or expired proposal. Retrying apply creates no duplicate revision; historical restore creates a reviewed new version preserving current commitments/payments. | SRS FR-12/13; FRS AT-10/11/12, JFR-037/038/042/044 | 09 |
| AS-07 | As an organizer, I export the selected version after the complete persisted journey. Print includes all outputs, estimate labels, version and timestamp; historical exports are clearly historical. | SRS FR-14; FRS AT-13, JFR-039–041 | 10, 12 |
| AS-08 | As a visitor/owner, I can navigate at 360px and with a keyboard/reduced motion, explore labeled synthetic samples, and retain saved/manual work when generation times out or hits quota. No fallback impersonates live AI. | SRS FR-15 and NFR-05/06/07/08; FRS AT-01/14/16, JFR-018/043–049 | 03–04, 07, 11–12 |

## Measurable demo and release goals

| Goal | Required evidence |
|---|---|
| One complete hosted birthday journey | Fresh sign-in → confirmed brief → live draft → accept → edit → replan → apply → reload → print; record actual environment and result |
| Five usable generated outputs | Overview, budget, timeline, vendor checklist and ideas all present and editable where specified |
| Correct reduction | Synthetic totals INR 50,000 → INR 40,000; both locked amounts unchanged; accepted state persists after reload |
| Honest infeasibility | Fixed-cost case reports minimum INR 5,000 shortfall and no feasible-success label |
| No accidental replacement | Discard preserves version; stale/expired apply fails; identical retry creates one revision |
| Isolation and failure recovery | Two-account resource denial plus timeout/invalid-output/quota cases preserve accepted work |
| Usable presentation | 360/768/1440 layouts, keyboard/reduced-motion checks and selected-version print preview pass; landing also checked at 1920 |

These are targets, not measured results. Distinguish fixture, emulator and live
evidence. The SRS performance and 30-brief evaluation targets remain release work;
a short demo cannot establish them. Record observed latency rather than promise
provider response times. Prepare the suggested three-minute script in Phase 13,
subject to the actual portal rules; no submission result is promised.

## Assumptions and next boundary

Deadline, team size/capacity, approved cloud budget, project/region/model and portal
requirements are unknown. Local planning is unblocked. Follow the existing Google
Cloud architecture and dark cinematic design; exact versions/contracts are Phase 02.
Before spending or deployment, resolve access and budget using the environment
record. Changes to this scope must be recorded in DECISIONS and affected requirements.

Phase 01 gate: problem/personas, inputs, journey, P0/exclusions, demo and eight
traceable stories are explicit. Next: runnable skeleton and shared contracts.

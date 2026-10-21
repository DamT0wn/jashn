# Jashn — Plan the joy.

## Product plan and Software Requirements Specification

Version 1.0 • 21 October 2026 • Prepared for Utkarsh Kumar Rai

Status: proposed implementation specification, not a claim of a deployed product. The name is a creative recommendation; trademark and domain availability have not been checked.

## 1. Challenge and product thesis

The supplied screenshot identifies PromptWars Challenge 5, Celebration & Event Planner: create a GenAI-powered assistant that helps users organize weddings, birthdays and community events using budgets, timelines, vendor checklists and personalized ideas. It also states that GenAI and a submission video are mandatory and that no GCP credits will be provided. The screenshot's countdown is not treated as a verified deadline; confirm the submission time in the portal.

Jashn turns a short event brief into an actionable, editable event workspace. Its distinctive feature is constraint-aware replanning: when guests, budget, date or priorities change, it proposes a versioned update with an understandable impact summary, preserves locked commitments, and asks the user to apply the changes.

Positioning: “From one idea to a celebration you can actually organize.”

Jashn means celebration and fits the initial Indian audience without limiting the product to weddings. Alternatives: Gatherly (community focus), UtsavFlow (planning focus), and MomentMint (broader consumer positioning). These are suggestions, not availability-verified brands.

### Working assumptions

- Build a responsive web application first, optimized for mobile use.
- Initial market: individual and community organizers in India; INR is the only MVP currency. Store currency explicitly for expansion.
- English interface; English and Hindi/Hinglish planning input. English generated output is required; Hindi output is a stretch goal.
- One owner per event in MVP. Collaborative editing, guest accounts and vendor accounts follow later.
- Roadmap assumes roughly 10 focused build days. A solo part-time developer should allow approximately 2–3 weeks; actual portal deadline overrides this assumption.
- Use synthetic or consenting demo data. Real bookings, payments and automated vendor outreach are out of scope.

## 2. Users and goals

| Persona | Need | Successful outcome |
|---|---|---|
| Birthday host | Plan quickly within a small budget | Clear costs, shopping/tasks, activities and schedule |
| Wedding organizer | Coordinate many dependencies and fixed commitments | Structured milestones and protected booked items |
| Community organizer | Balance attendance, accessibility and resources | Volunteer/task checklist and workable event-day run sheet |

Primary job: “Help me decide what to do, what it may cost, and what I need to complete next.”

## 3. Scope and priorities

### P0 — submission MVP

1. Google/email authentication and owner-isolated event storage.
2. Event wizard plus free-text brief extraction and confirmation.
3. Structured AI plan: overview, budget, timeline, vendor checklist and personalized ideas.
4. Editable dashboard: money totals, tasks, vendor statuses and event details.
5. What-if replanning with locked items, change preview, explicit apply and version history.
6. Save/reopen event and print-friendly plan export.
7. Input validation, budget/date checks, generation failure recovery and usage limits.
8. Three clearly labeled sample events, deployed URL and required demo video.

### P1 — after P0 is stable

Collaborator invitations with editor/viewer roles; guest count and RSVP management; quote upload/extraction; calendar export; Hindi output; lightweight evidence-backed vendor discovery; in-app reminders.

### P2 — production expansion

Verified vendor marketplace, opt-in external notifications, payment integrations, seating plans, multi-function weddings, image mood boards, professional planner workspaces and consented analytics.

Excluded from MVP: autonomous purchases, contacting vendors, live availability guarantees, trained custom recommendation models, fine-tuning, Kubernetes, microservice proliferation and a vector database without a retrieval need.

## 4. User experience

### Core flow

Sign in → create event → confirm extracted details → generate draft → review assumptions → edit budget/tasks/vendors → simulate a change → compare impact → apply revision → export.

Required brief fields: event type, name, event date, IANA timezone, city, guest count and total budget. Optional: venue status, indoor/outdoor, theme, dietary requirements, accessibility needs, priority categories, cultural preferences and fixed commitments. Never infer culture or religion from a name; ask for relevant preferences.

The system asks only for missing essential information. A vague prompt must lead to confirmation questions, not invented dates or budgets.

### Screens

| Screen | Main content and actions |
|---|---|
| Home | Value proposition, example plan, create event |
| My events | Event cards, dates, spend overview and reopen |
| Create event | Short wizard, natural-language brief, confirmation |
| Overview | Days remaining, budget remaining, next tasks and assumptions |
| Budget | Allocations, estimates, commitments, payments, locks and warnings |
| Timeline | Preparation checklist, dependencies, event-day agenda |
| Vendors | Required categories, questions to ask, quotes and manual status |
| Ideas | Personalized themes/activities with approximate cost implications |
| Replan | Change request, before/after preview, warnings, apply/discard |
| Export | Print-friendly selected plan version with estimate labels |

Visual direction: warm ivory background, plum text, marigold accents, readable cards and restrained celebration illustrations. Prioritize useful data and clear actions. Mobile tabs should remain reachable without wide tables.

## 5. Functional requirements

“Shall” denotes a testable requirement. P0 must ship; P1 is a later release.

| ID | Priority | Requirement | Acceptance criterion |
|---|---|---|---|
| FR-01 | P0 | The system shall authenticate users and authorize every event operation. | A second user cannot read, mutate or export another owner's event using its ID. |
| FR-02 | P0 | Users shall create, edit, archive and delete events. | Valid input persists after reload; invalid date, guest count or budget produces field-level errors. |
| FR-03 | P0 | AI shall extract brief fields for user confirmation. | Unspecified required fields remain unset; no plan starts before required fields are confirmed. |
| FR-04 | P0 | Generation shall return all five challenge outputs. | Every accepted plan includes budget, timeline, vendor checklist, personalized ideas and overview. |
| FR-05 | P0 | Plans shall expose assumptions and estimate provenance. | Estimated amounts are distinguishable from user-entered quotes and confirmed costs. |
| FR-06 | P0 | Users shall edit budget lines and record commitments/payments. | Totals recompute without an LLM call; partial payments do not double-count cost. |
| FR-07 | P0 | Users shall lock budget items and fixed tasks. | Replanning cannot silently change or delete locked content. |
| FR-08 | P0 | Tasks shall support due date, priority, status and dependencies. | Cycles, missing dependency IDs and impossible date ordering are rejected. |
| FR-09 | P0 | Vendor checklists shall support category, contact notes and status. | Users can move a manually entered vendor from researching to contacted, shortlisted or booked. |
| FR-10 | P0 | AI shall personalize ideas to explicit preferences. | Hard requirements such as vegetarian food are preserved in evaluated outputs. |
| FR-11 | P0 | Replanning shall create a separate proposal with an impact diff. | Current plan remains unchanged until apply; discard leaves it unchanged. |
| FR-12 | P0 | Applying a proposal shall check the base version. | A proposal based on an outdated plan returns a conflict and requires regeneration/review. |
| FR-13 | P0 | Previous accepted plan versions shall remain available. | Users can view prior versions; restoring creates a new revision and does not erase history. |
| FR-14 | P0 | Users shall export the selected plan using browser print/save as PDF. | Export includes event details, version/date, budget, tasks, vendor checklist and estimate labels. |
| FR-15 | P0 | AI failures shall preserve saved work. | Timeout, quota failure or invalid output displays recovery options without replacing the last valid plan. |
| FR-16 | P0 | Users shall be able to delete their event data. | Event, subcollections and derived exports are removed; provider backup/log retention is disclosed separately. |
| FR-17 | P1 | Owners shall invite editors/viewers. | Role enforcement works on all endpoints; revoked access ceases immediately. |
| FR-18 | P1 | Users shall upload a vendor quote for extraction. | Extracted amounts/source page are reviewed before becoming confirmed costs. |
| FR-19 | P1 | Vendor discovery shall show source and retrieval date. | Discovery never represents an unconfirmed listing as available or booked. |
| FR-20 | P1 | The system shall export calendar items. | Event timezone and rescheduled task dates remain correct in an imported calendar. |

## 6. Budget and scheduling rules

Use integer paise, never floating-point rupees. All records carry currency. Reject mixed currencies in MVP.

For each budget line keep allocation, estimatedCost, committedCost (nullable) and paidAmount. Projected line cost equals committedCost when known, otherwise estimatedCost. Committed cost represents total agreed cost, not only the unpaid balance. Paid amounts are tracked separately and never added again to projected cost.

- Projected total = sum(projected line costs) + contingency reserve.
- Remaining forecast budget = budget cap − projected total.
- Outstanding confirmed payments = sum(max(committedCost − paidAmount, 0)) for committed lines.
- An overpayment requires explicit correction/refund handling; do not silently hide it.
- A feasible proposal must keep projected total within the cap and all hard constraints satisfied.
- A useful partial plan may be saved with an explicit infeasible flag and quantified shortfall; it must not be labeled within budget.
- Contingency is visible and configurable; it is not an untracked extra fee.
- Preserve user edits, booked vendors, paid commitments and locks. Reducing a commitment requires a user-confirmed change, not AI rewriting.

### Replanning algorithm

1. Read current version, requested changes and locks.
2. Separate hard requirements from negotiable preferences.
3. Calculate fixed minimum cost and available flexible budget in code.
4. If fixed minimum exceeds the new cap, return the exact shortfall and options; do not manufacture savings.
5. Ask Gemini for alternative flexible allocations/tasks and explanations within the remaining envelope.
6. Validate arithmetic, required categories, date dependencies, IDs and all locks.
7. Produce before/after totals, modified lines, removed tasks, new risks and preserved commitments.
8. Save as a proposal; apply atomically only if baseVersion still matches.

For scheduling, store event-local date/time and IANA timezone, plus UTC timestamps where appropriate. Distinguish date-only tasks from timed agenda items. A task whose due date has passed is flagged overdue/urgent; moving it silently to today is not sufficient. A late-start wedding plan must state which normal milestones are no longer feasible.

### Demonstration numbers — synthetic, not market quotes

| Category | Original | Revised |
|---|---:|---:|
| Venue | ₹12,000 | ₹8,000 |
| Food — locked | ₹20,000 | ₹20,000 |
| Decor | ₹6,000 | ₹3,000 |
| Photography — locked | ₹4,000 | ₹4,000 |
| Activities | ₹3,000 | ₹1,000 |
| Contingency | ₹5,000 | ₹4,000 |
| Total | ₹50,000 | ₹40,000 |

This example illustrates a 20% budget reduction. In the app, cheaper venue/decor amounts remain estimates awaiting quotes. Do not claim these prices are attainable in Noida without evidence.

## 7. AI design

Use Gemini through Vertex AI and the Google Gen AI SDK. Select a currently available, generally available, cost-efficient model supported in the chosen project/region, verify structured-output support, then pin the tested model ID in configuration. Do not hard-code an unverified future/latest model name in the SRS.

Use a small, explicit workflow rather than autonomous agents:

Brief extraction → confirmation → template selection → structured generation → schema validation → deterministic constraint checks → optional bounded repair → review.

Gemini responsibilities: understand natural language, suggest personalized themes/activities, draft timelines/checklists, explain trade-offs and propose changes. Application responsibilities: authentication, persistence, calculations, date checks, constraints, permissions, approvals and external side effects.

### Output contract

Plan fields: schemaVersion, eventId, baseVersion, summary, assumptions[], budgetLines[], contingencyMinor, tasks[], vendorChecklist[], ideas[], warnings[], feasibility.

Budget line fields: id, category, allocationMinor, estimatedCostMinor, sourceType and rationale. Existing committed costs, payments and locks are supplied by the backend and reconciled against canonical records; model output is never authoritative for them.

Task fields: id, title, dueDate, kind, dependencyIds[], priority and rationale. Vendor checklist fields: category, requiredBy, questions[], documentsToRequest[] and estimatedRange with sourceType. Ideas include title, description, preferenceMatch and estimatedCostImpact.

Use structured JSON output plus server-side schema/business validation. Schema-conforming JSON alone does not establish truth, budget feasibility or safety.

### Generation controls

- Send only necessary event fields; exclude guest contact lists and credentials.
- Treat user text and any future uploaded quote as data, not instructions that can override system rules.
- Limit prompt size, output tokens, execution time and retries. Maximum one repair attempt for invalid output in MVP.
- Any generation-time tool access is read-only and allowlisted. No tool sends messages, books vendors or mutates the accepted plan.
- Preserve prompt version, model ID, latency, token counts and validation outcome for evaluation. Avoid logging full private prompts by default.
- If provider access fails, allow manual editing and clearly labeled sample plans. Never present a cached demo as a live generated answer.

### LangChain, retrieval and ML decisions

Direct SDK calls are sufficient for P0. LangChain is optional if reusable retrieval/tool pipelines become necessary; adding it is not itself a differentiator. A future LangGraph-style workflow can manage longer approval-driven flows, after evaluating operational need.

Use curated event templates and checklist data first. Add retrieval only when there is a real document collection: approved planning guides or user-uploaded contracts. Retrieve with event/owner authorization and cite document/page provenance. Do not use retrieval to invent vendor stock or availability.

No custom ML training is needed for the hackathon. Later, consented quote history could support cost estimates with uncertainty intervals, evaluated separately by city, event type and guest count. No accuracy claim should be made before evaluation.

## 8. Proposed Google Cloud architecture

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + TypeScript + Vite, Tailwind | Familiar stack, responsive static application |
| Frontend hosting | Firebase Hosting | Serves static frontend; avoids needing SSR for this MVP |
| Identity | Firebase Authentication | Google/email sign-in and token-based identity |
| API | Node.js + TypeScript + Fastify on Cloud Run | One containerized backend for CRUD, validation and AI |
| Generation | Vertex AI Gemini through @google/genai | Google-focused model access and structured generation |
| Database | Cloud Firestore | Event documents and scoped subcollections |
| Files, P1 | Cloud Storage | Private quote uploads and generated documents |
| Secrets | Secret Manager | Third-party secrets if later needed |
| Build/release | Cloud Build + Artifact Registry | Build/test container and deploy versioned images |
| Observability | Cloud Logging and Monitoring | Error, latency and usage visibility |

Browser → Firebase sign-in → API with ID token → owner/role authorization → Firestore and/or Vertex AI → validated response → browser review.

The backend uses its Cloud Run service identity for Google APIs; avoid exported service-account keys. Prefer a consistent supported region after checking Firestore location, Cloud Run and model availability. Do not promise India-only processing until the selected services/model endpoint are verified to support it.

All event data accesses go through the API in P0. Deny direct browser Firestore access. The server SDK bypasses Firestore client rules, so authorization must be implemented and tested in the API on every request. Restrict CORS and verify tokens; CORS is not authorization.

Do not introduce Firebase App Hosting unless changing to a framework that needs it. Its billing requirement differs from simply serving static files. Cloud Run and Vertex AI still need billing arrangements for this architecture; assume no free credits.

## 9. Data model

| Path/entity | Key fields |
|---|---|
| users/{uid} | displayName, createdAt, locale, preferences |
| events/{eventId} | ownerId, name, type, city, localDate, timezone, guests, currency, budgetMinor, currentVersion, status |
| events/.../budgetLines/{id} | category, allocationMinor, estimatedCostMinor, committedCostMinor, paidMinor, locked, sourceType |
| events/.../tasks/{id} | title, dueDate, dependencies, status, priority, locked |
| events/.../vendors/{id} | category, manuallyEnteredName, contact, status, quoteMinor, source |
| events/.../plans/{versionId} | snapshot, schemaVersion, assumptions, feasibility, createdAt, promptVersion, modelId |
| events/.../proposals/{id} | baseVersion, requestedChanges, diff, validatedCandidate, status, expiresAt |
| events/.../audit/{id} | actorId, action, entityId, timestamp, requestId |
| generationJobs/{id} | ownerId, eventId, state, attemptCount, errorCode, usage, resultReference |
| templates/{id} | eventType, checklist, constraints, templateVersion |

Use bounded document sizes and separate subcollections rather than an indefinitely growing event document. Plan snapshots exclude unrelated personal information. Index event owner+updated time and task status+due date as needed. Event deletion must explicitly delete subcollections; deleting a parent document is not enough.

Generation job states: pending → running → succeeded or failed; proposal states: draft → applied, discarded or expired. Accepted plan updates and version increments are transactional. Use idempotency keys for generation submission and proposal apply; retries must not create duplicate accepted revisions.

## 10. API contract

All protected routes accept Authorization: Bearer <Firebase ID token>. Use server-side validation and authorization before reading or writing event contents.

| Method/path | Purpose |
|---|---|
| POST /v1/events | Create confirmed event brief |
| GET /v1/events | List caller's events with pagination |
| GET/PATCH/DELETE /v1/events/:id | Read, update or delete owned event |
| POST /v1/briefs/extract | Extract a draft brief for confirmation |
| POST /v1/events/:id/generations | Start plan generation; return jobId |
| GET /v1/jobs/:jobId | Authorized polling of job result |
| PATCH /v1/events/:id/budget-lines/:lineId | Edit amounts or lock with expectedVersion |
| PATCH /v1/events/:id/tasks/:taskId | Edit task/status with expectedVersion |
| POST/PATCH /v1/events/:id/vendors[/:vendorId] | Add/update manual vendor records |
| POST /v1/events/:id/replans | Generate proposal from change request and baseVersion |
| POST /v1/events/:id/proposals/:proposalId/apply | Atomically apply accepted proposal |
| GET /v1/events/:id/versions | List historical plan versions |
| GET /v1/events/:id/export | Return print-view data for selected version |

For a single-process MVP, generation can be a bounded synchronous request with a persisted job record. Do not return immediately and rely on an untracked background promise in a request-based Cloud Run container. If using a true 202 asynchronous API, add Cloud Tasks and a private authenticated worker handler, with idempotency and retries; this is a deliberate scope increase.

Errors: 400 invalid input; 401 unauthenticated; 403 unauthorized; 404 missing resource (avoid existence disclosure across owners); 409 stale version; 422 infeasible/invalid proposal where appropriate; 429 usage limit; 503 provider unavailable. Return safe error codes and request IDs, never secrets or raw stack traces.

## 11. Non-functional requirements

These are proposed acceptance targets, not measured results.

| ID | Requirement | Verification |
|---|---|---|
| NFR-01 | Warm CRUD API p95 below 1 second under 20 concurrent demo users, excluding third-party latency | Small load test with recorded region and test conditions |
| NFR-02 | Target complete AI proposal within 30 seconds for standard brief; configured timeout no longer than 60 seconds | Measure generation latency and graceful timeout behavior |
| NFR-03 | No cross-user event data exposure | Integration tests covering every resource route |
| NFR-04 | Every accepted plan passes arithmetic and locked-field invariants | Automated deterministic validators |
| NFR-05 | Works at 360 px mobile width and desktop; key flows keyboard accessible | Browser tests and manual accessibility review |
| NFR-06 | Saved work remains readable/editable during AI outages | Simulated provider failure |
| NFR-07 | User inputs and generated text cannot execute script | Escaped rendering; no unsanitized generated HTML |
| NFR-08 | Usage is bounded | Per-user/IP rate limits, concurrent-job limits, output-token limits and configurable daily generation quota |
| NFR-09 | Demo deletion removes active event records and derived files within 24 hours | Deletion job verification; document backup retention separately |
| NFR-10 | Deployments are repeatable and reversible | Versioned images, health check, rollback rehearsal |

Production availability SLOs, backup retention and recovery targets must be agreed before a public commercial launch. An early target could be daily backups and a tested restore procedure; do not claim these are configured in the prototype.

## 12. Security, privacy and trust

Minimize personal data, especially guest contact details, children's information and dietary/health information. Collect only planning-relevant preferences. Make AI processing visible. Avoid publicly accessible exports by default. P1 share links require expiry, revocation and scope restrictions.

Use TLS, least-privilege service accounts, restricted storage access, sanitized text rendering and redacted logs. Rate-limit generation server-side. Keep model credentials out of browser code. Apply dependency scanning and avoid long-lived cloud keys in CI.

Vendor estimates are planning assumptions. A “booked” state is explicitly recorded by the organizer, not inferred from AI. Any future sending, booking or payment action requires a separate explicit user confirmation with recipient, amount and terms displayed.

## 13. Cost and deployment plan

Do not assume free credits or describe the stack as free. Obtain the current selected-model token rates and service-region rates before deployment. Estimate monthly cost as:

AI input tokens × input rate + AI output tokens × output rate + Cloud Run compute/network + Firestore operations/storage + build/image storage + any files/optional APIs.

Example workload for sizing, not a price quote: 100 event plans × (one initial generation + two replans) = 300 generation requests. If each averages 3,000 input and 3,000 output tokens, that is approximately 900,000 input and 900,000 output tokens, before retries and brief extraction. Measure actual usage and replace assumptions.

Start with Cloud Run minimum instances 0 and a deliberately small maximum instance count. Bound per-user daily requests and total application generation quota, output tokens and repair attempts. Add budget notifications and an application kill switch for generation; budget alerts alone are not a guaranteed spending cap. Account for build, storage, database and other service costs even when generation is disabled.

Deployment sequence: create separate development/demo configuration → enable required APIs and billing → select compatible locations/model → create least-privilege service identity → configure Firestore and Auth → build/test container → deploy API → configure frontend API URL → deploy Hosting → smoke-test with two users → record demo. Roll back to a prior tested Cloud Run image if needed.

Use Docker and Cloud Build for your DevOps demonstration. Jenkins, Kubernetes and Terraform are not MVP prerequisites. Add Terraform after the deployment shape stabilizes if time permits.

## 14. Implementation roadmap

| Day | Work | Exit condition |
|---|---|---|
| 1 | Scope, UI sketch, types/schema, repo, cloud access/model probe | One authenticated model request; sample structured output validates |
| 2 | Auth, event CRUD, authorization, responsive shell | Owner can create/reopen event; cross-owner access rejected |
| 3 | Wizard, template data, brief extraction | Required fields confirmed before generation |
| 4 | Generation pipeline, validators, error states | Three event types generate valid editable drafts |
| 5 | Budget ledger, contingency, commitments/payments, locks | Deterministic totals and infeasibility cases pass |
| 6 | Timeline, task dependencies and vendor checklist | User can manage all core challenge outputs |
| 7 | Replanning, diff, transactional apply and history | Budget-change demo preserves locks and rejects stale versions |
| 8 | Print export, mobile polish, seeded demo scenarios | Complete happy path from brief to exported plan |
| 9 | Evaluation suite, authorization tests, deployment and cost controls | Critical tests pass on hosted demo |
| 10 | Video, README, architecture slide, final submission | Video and deployed URL work from a fresh session |

If time shrinks, cut P1 features first. Keep structured generation, editable plans, arithmetic validation and one excellent replan demonstration. For a team: split frontend, API/AI, and QA/deployment responsibilities around shared schemas; merge daily.

Suggested repository: apps/web, apps/api, packages/contracts, packages/planning-rules, data/templates, evals, docs, and deployment. Share validation schemas/types across browser and API, while keeping all authorization and trusted arithmetic server-side.

## 15. Testing and evaluation

### Deterministic tests

Budget rounding, partial payments, commitments, contingency, locked items, guest count changes, impossible budgets, timezone conversions, past dates, dependency cycles, stale versions, duplicate apply requests and deletion cleanup.

### AI evaluation set

Prepare 30 briefs: ten wedding, ten birthday and ten community examples. Include mixed languages, low budgets, urgent dates, conflicting requirements, missing information and injection-like text. Mark expected hard constraints and required checklist categories. Track first-pass JSON validity separately from post-repair success.

Proposed gates: 100% of accepted outputs pass hard validators; at least 90% of evaluation requests produce an acceptable proposal within one repair; at least 80% of the reviewed plans score 4/5 or better for relevance and actionable detail. These are targets to measure, not achieved scores. Record infeasible cases as correct when the system identifies the conflict rather than pretending success.

### End-to-end acceptance scenarios

1. Birthday in Noida, 50 guests, ₹50,000: confirm brief, generate all outputs, edit and export.
2. Reduce to ₹40,000 with food/photography locked: preserve locks and show a complete change diff.
3. Fixed commitments exceed ₹40,000: display exact shortfall and alternatives.
4. Wedding in seven days: flag missed normal lead times and identify urgent decisions.
5. Community event with accessibility/vegetarian requirements: preserve requirements through replan.
6. Two tabs update the same event: reject stale proposal apply without data loss.
7. Another account requests an event ID: deny read, write, history and export access.
8. Gemini returns an invalid output or times out: maintain last accepted plan and manual editing.

Only call the MVP complete when the deployed, persisted user journey passes these scenarios, not merely when screenshots look finished.

## 16. Hackathon demo and submission

Suggested 3-minute narrative, subject to the portal's actual video requirements:

- 0:00–0:20: Planning is scattered across chats, budgets and checklists.
- 0:20–0:55: Enter the birthday brief and show structured plan generation.
- 0:55–1:20: Open budget, timeline, vendor questions and personalized ideas.
- 1:20–2:00: Reduce budget 20%, lock food/photography and review the change proposal.
- 2:00–2:20: Apply, reload, show version history and export.
- 2:20–2:40: Show one impossible-budget case to demonstrate honest constraint handling.
- 2:40–3:00: Explain Gemini + Google Cloud architecture and next steps.

Use a prerecorded fallback only if labeled clearly; do not simulate live AI without disclosure. Demo vendor records and prices must be visibly synthetic. Submit source/README if requested, deployed link, video, architecture diagram and known limitations. Verify current portal rules and deadline before final upload.

Pitch: “Jashn transforms an event idea into an editable plan—and when real life changes, it shows how to adapt the budget, timeline and checklist without losing your priorities.”

## 17. Risks and next decisions

| Risk | Mitigation |
|---|---|
| Hallucinated vendor prices | Label estimates; use manual confirmed quotes; preserve source provenance |
| AI changes booked commitments | Server-side lock checks and immutable accepted history |
| Growing scope | Freeze P0; postpone marketplace, payments and collaborative editing |
| Model quota/latency | Probe on day one, cap requests, bounded retries and clear failure states |
| Cloud spend | Meter tokens/operations, quotas and generation kill switch |
| Deadline ambiguity | Verify portal timestamp; do not infer from screenshot countdown |
| Name conflicts | Check domain, app and trademark availability before public branding |

Decisions still needed before implementation: actual deadline and team capacity; approved cloud spending ceiling; chosen project/region/model availability; whether a formal PDF/DOCX submission is required. These do not block using this specification as the initial backlog.

## 18. Primary technical references

Checked during preparation on 21 October 2026. Service availability and billing must be rechecked at deployment.

- Google Gen AI SDK overview: https://cloud.google.com/vertex-ai/generative-ai/docs/sdks/overview
- Vertex AI structured JSON example: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/samples/generativeaionvertexai-gemini-controlled-generation-response-schema-2
- Vertex AI function calling: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/function-calling
- Firebase pricing plans: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- Firebase App Hosting costs: https://firebase.google.com/docs/app-hosting/costs
- Cloud Run pricing: https://cloud.google.com/run/pricing

Architecture, priorities, targets, roadmap and sample budgets above are design recommendations. They are not provider guarantees or measured product results.

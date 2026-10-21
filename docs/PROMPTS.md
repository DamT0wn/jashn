# Jashn — phased coding-agent prompt playbook

Prepared for Utkarsh Kumar Rai • 21 October 2026

Use with Astra, Codex, or another coding agent. This is a prompt pack, not an implemented application. It builds on Jashn_Plan_and_SRS.md. The new cinematic design direction below overrides the earlier SRS's ivory/plum/marigold visual direction; functional requirements remain unchanged.

## How to use this without losing context

1. Keep ONE canonical Git repository. Add the SRS as docs/SRS.md and this playbook as docs/PROMPTS.md. If these files are unavailable to the agent, attach them rather than expecting it to remember another chat.
2. Start with the Universal Session Prompt, then paste Phase 00. In subsequent sessions paste the Universal Session Prompt and only the current phase prompt. Do not paste this entire playbook every time.
3. Run one phase at a time. A phase can span several short sessions. Ask the agent to finish one independently verifiable slice and checkpoint it before credits run out.
4. Before switching agents, use the Handoff Prompt. Save the files and commit a checkpoint. If the next agent runs on another machine, push to your chosen private remote or transfer a clean source archive plus the checkpoint notes. A local commit alone does not transfer files.
5. Start the new agent with the Resume Prompt. Both agents must use the same branch/commit or a clearly recorded continuation. Do not let two agents edit the same working tree simultaneously.
6. Advance only when the phase's acceptance gate passes. A screenshot is not evidence of database persistence or working AI.

Both agents can execute every phase. Choose whichever has credits; continuity comes from repository files, shared schemas and recorded evidence, not model-specific chat memory. Keep secrets in environment/secret storage and reconfigure them separately when moving environments.

### Phase map

| Phase | Outcome | Depends on |
|---|---|---|
| 00 | Repository handoff system and existing-work audit | SRS |
| 01 | Idea, user flow and MVP frozen | 00 |
| 02 | Architecture, contracts and project skeleton | 01 |
| 03 | Cinematic Jashn landing page | 02 |
| 04 | App workspace and event wizard with labeled fixtures | 02–03 |
| 05 | Authentication and persistent event CRUD | 04 |
| 06 | Budget and scheduling rules | 05 |
| 07 | Live Gemini plan generation | 06 |
| 08 | Editable timeline, vendor checklist and ideas | 07 |
| 09 | What-if replanning, approval and history | 08 |
| 10 | Export and complete journey integration | 09 |
| 11 | Security, accessibility and release verification | 10 |
| 12 | Google Cloud deployment and hosted smoke tests | 11 |
| 13 | Demo video script and submission package | 12 |

These are work units, not guaranteed one-day assignments. If a phase is too large, checkpoint a subtask; keep the same phase active.

## Universal Session Prompt — paste at the start of a new agent session

```text
You are implementing Jashn, a GenAI celebration/event planner for weddings,
birthdays and community events. Work in the existing repository.

First read applicable repository instructions, docs/STATE.md,
docs/HANDOFF.md and the relevant docs/TASKS.md entry. Read only the relevant
SRS, architecture and contract sections needed for this phase. If these
files do not exist, execute Phase 00 before implementation.

Operating rules:
- Repository code, tests and current documents are the source of truth.
  Never assume access to another agent's conversation or local files.
- Inspect git status and existing implementation before editing. Preserve
  unrelated user work; do not overwrite an existing application or reset Git.
- Execute ONLY the requested phase or its next unfinished subtask.
- Continue normal reversible implementation decisions without repeatedly
  asking me. Ask only for genuinely missing credentials, access, product
  decisions that cannot be inferred, or necessary external-action authority.
- Do not change framework, package manager, public API, money units or data
  schema casually. Record necessary changes and update consumers together.
- No unsolicited rewrites, optional features, parallel agents or elaborate
  infrastructure. Never bypass repository instructions or approval controls.
- Keep production data access and trusted validation server-side.
- No fake success messages, fake live AI, invented vendor quotes or claims
  that a test passed when it was not run. Label fixture/demo data visibly.
- Never commit secrets, .env files, credentials or customer data.
- Use the lockfile. Check current primary documentation when SDK/service
  details are uncertain; record relevant decisions once rather than repeatedly
  researching stable decisions in every session.
- Run focused meaningful checks for your changes. Do not spend tokens on
  repeated broad audits when the remaining risk is already resolved.
- At phase end, update STATE, TASKS, HANDOFF, and verification evidence.
  Summarize changed behavior, checks actually run, unresolved blockers and
  the exact next task. Keep the final report concise.

Core product invariant: AI proposes plans; code validates money, dates,
permissions and locks; the organizer approves plan replacements.

I will now provide the phase to execute.
```

## Phase 00 — portable project memory and audit

```text
Execute Phase 00: establish a resumable project workspace for Jashn.

Inspect the repository, git status, existing package files and instructions.
If code already exists, map it to the SRS instead of rebuilding it. If there
is no Git repository, initialize one without altering unrelated files.
Use the provided Jashn SRS as docs/SRS.md and this pack as docs/PROMPTS.md.

Create or carefully extend:
1. AGENTS.md: short project operating instructions, paths to project memory,
   commands and critical invariants. Preserve any existing instructions.
2. docs/STATE.md: current phase/subtask, implemented capabilities, mocked
   capabilities, blocked capabilities, stack, last verified checkpoint and
   next action. Aim for under 100 lines.
3. docs/TASKS.md: phases 00–13 with small checkboxes and acceptance gates.
4. docs/HANDOFF.md: latest session checkpoint, changed files, actual command
   results, incomplete edits, environment prerequisites and next exact step.
5. docs/DECISIONS.md: concise dated architecture/product decisions, rationale
   and explicit superseded decisions.
6. docs/ENVIRONMENT.md: variable names, purpose, server/client distinction,
   acquisition/setup instructions and configured/missing status. No values
   for secrets. Record project IDs/regions only when known.
7. docs/VERIFICATION.md: phase, command, date, result and limitations.

Keep these files lean. Do not create multiple competing status documents.
Record that the user wants a dark cinematic Prisma-inspired Jashn design,
which supersedes the older SRS's light-color visual direction.

Gate: a new agent can identify the next task from repository files alone.
Do not implement application features in this phase. Finish with a checkpoint.
```

## Phase 01 — ideation and scope freeze

```text
Execute Phase 01: convert the existing SRS into a focused build brief.
Keep the chosen product name Jashn and tagline “Plan the joy.”

Write docs/PRODUCT.md covering the problem, three user personas, required
inputs, core journey, P0 scope, excluded features and measurable demo goals.
The core journey is brief → confirm details → structured plan → manual edits
→ budget-change proposal → compare → apply → export.

The differentiating demo is: “Reduce the budget by 20%, but keep food and
photography unchanged.” Explain how code preserves locks and reports an
impossible budget honestly. Vendor prices are estimates until user-confirmed.

P0: authentication, event CRUD, Gemini-generated budgets/timelines/vendor
checklists/personalized ideas, editable workspace, versioned replanning,
print export, failure states and deployment. Keep collaboration, live vendor
search, payments, messaging, quote uploads and custom ML outside P0.

Use a synthetic birthday brief: Noida, 50 guests, INR 50,000, vegetarian,
with an event date 30 days after the current date. Do not hard-code a date
that will become invalid in tests. Add wedding and community fixtures later.

Record assumptions about deadline, team size and cloud budget as unknown
unless provided. Do not invent a deadline or promise hackathon results.
Define 8 concise acceptance stories from the SRS and link them to TASKS.

Gate: the MVP, demo story, required inputs and excluded features are explicit.
Finish this planning phase without building optional features.
```

## Phase 02 — architecture, contracts and runnable skeleton

```text
Execute Phase 02: create a runnable, minimal project skeleton and contracts.

Preferred stack for a new repo:
- React 18 + Vite + TypeScript + Tailwind CSS 3.
- framer-motion, lucide-react, client-side routing.
- Node.js + TypeScript + Fastify API.
- Firebase Auth, Firestore, Firebase Hosting, Cloud Run.
- Vertex AI Gemini through @google/genai, implemented in Phase 07.
- npm workspaces and ONE root lockfile unless the repo already has a working
  package-manager convention. Pin compatible versions; do not blindly install
  latest packages or switch to Tailwind 4 syntax.

Prefer apps/web, apps/api, packages/contracts, packages/planning-rules,
data/templates and docs. Adapt to an existing healthy structure if needed.
Create build, typecheck, lint, test and dev scripts that actually run.

Define shared runtime validation schemas and TypeScript types for EventBrief,
BudgetLine, Task, VendorChecklistItem, Idea, PlanVersion, ReplanProposal and
ApiError. Use safe integer paise, explicit INR currency, IANA timezone,
stable IDs, baseVersion/expectedVersion, estimate provenance and locks.
Define safe maximum input sizes and reject malformed/negative values.

Write docs/ARCHITECTURE.md and docs/API.md with concrete routes, auth,
versioning and error contracts. Include explicit generation/acceptance routes
so saving an initial draft and replacing an existing plan are unambiguous.
Implement a health route and a web shell. Do not stub successful cloud calls.

Choose bounded synchronous generation for P0: the HTTP request waits for the
validated result with timeout; store job status for observability/recovery.
Do not return 202 and launch an unreliable detached background promise.
Document this as the resolution of the SRS's optional async design.

Create .env.example with placeholders and .gitignore. Identify which Firebase
client configuration is public and which server credentials must remain private.

Gate: clean install, typecheck and builds pass; frontend reaches health route;
schemas have focused malformed-input coverage. Record exact commands.
```

## Phase 03 — full frontend design prompt, adapted from Prisma

Paste this whole phase when building the landing page. It preserves the supplied visual structure, fonts, animation components and media references while changing the product content to Jashn. The URLs are user-provided references, not verified licensed assets or guaranteed available media.

```text
Execute Phase 03: build Jashn's polished landing page using the following
Prisma-inspired creative direction. Implement it in the existing web app.
The product is Jashn, an AI event planner—not a creative studio. No Marcus
Chen biography, studio claims, fake testimonials, customer logos or awards.

TECH STACK
React 18, Vite, TypeScript, Tailwind CSS 3, framer-motion, lucide-react.
Respect existing compatible versions and the root lockfile.

DESIGN
Three primary sections: Hero, About and Features. Dark, moody, cinematic,
with warm cream typography. Keep the dramatic editorial layout and inset
rounded video hero. Avoid generic gradients everywhere or a standard SaaS
template look. Route working CTAs to /app/new or a labeled sample at /demo.
Those destinations may be simple honest shells until Phase 04.

FONTS
Load Almarai weights 300,400,700,800 and Instrument Serif italic in index.html.
Set the global default in index.css:
* { font-family: 'Almarai', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; }
In tailwind.config.js extend colors.primary='#DEDBC8' and
fontFamily.serif=['"Instrument Serif"','serif'].
Make serif overrides work despite the universal font declaration.
Use readable local/system fallbacks when Google Fonts cannot load.

COLOR SYSTEM
Global background #000000; About card #101010; feature cards #212121.
Main text #E1E0CC using inline style where specified.
Tailwind primary #DEDBC8, including text-primary and text-primary/70.
Secondary text gray-400/gray-500, adjusted if necessary for readable contrast.
Navbar links rgba(225,224,204,0.8), hover #E1E0CC.

CUSTOM CSS
Create .noise-overlay with an inline SVG data URI using feTurbulence
type='fractalNoise', baseFrequency=.85, numOctaves=3.
Create .bg-noise similarly with baseFrequency=.9, numOctaves=4.
Noise layers are decorative, aria-hidden and pointer-events-none.

HERO
Full-height inset section: p-4 md:p-6; inner container rounded-2xl
md:rounded-[2rem], overflow-hidden. Aim for h-screen on large displays,
but use min-height/svh and content-safe sizing on mobile so nothing clips.

Video reference:
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4
Centralize the provided asset URLs in one configuration file.
Set autoPlay loop muted playsInline, object-cover. Overlay noise opacity .7,
mix-blend-overlay, and bg-gradient-to-b from-black/30 via-transparent
to-black/60. Provide a static fallback and visible play/pause control.

Navbar: absolute top center, black pill hanging from top edge, rounded-b-2xl
md:rounded-b-3xl, px-4 py-2 md:px-8. Use five product-relevant links:
“Our story”, “How it works”, “Features”, “Sample plan”, “Start planning”.
Map each to a real anchor or route; How it works can target content inside
About without adding a fourth primary section.
text-[10px] sm:text-xs md:text-sm;
gap-3 sm:gap-6 md:gap-12 lg:gap-14. Keep mobile tap targets usable and
collapse navigation accessibly if needed rather than overflow the viewport.

Hero content bottom aligned using a 12-column desktop grid: 8 columns for
the giant Jashn wordmark, 4 for description and CTA. Stack on small screens.
Wordmark uses WordsPullUp, font-medium, leading-[.85], tracking-[-.07em],
color #E1E0CC. Starting size scale:
text-[26vw] sm:text-[24vw] md:text-[22vw] lg:text-[20vw]
xl:text-[19vw] 2xl:text-[20vw]. Adjust only enough to fit the five-letter
Jashn wordmark and avoid clipping. Preserve the dominant visual scale.
showAsterisk adds a decorative superscript after the final n, not after a
hard-coded 'a'. Use absolute top-[.65em] -right-[.3em] text-[.31em] as a
starting position and verify visually with the new wordmark.

Description:
“From birthdays to weddings and community gatherings, Jashn turns your
ideas into a clear budget, thoughtful timeline and celebration that feels
like you.”
text-primary/70 text-xs sm:text-sm md:text-base, line-height 1.2 or higher
if needed for readability. Fade up y:20, delay .5s, ease [.16,1,.3,1].

CTA “Plan your celebration”: bg-primary rounded-full, black text,
font-medium, text-sm sm:text-base. Right-side black circle w-9 h-9
sm:w-10 sm:h-10 with cream ArrowRight. Hover gap increases to gap-3;
circle group-hover:scale-110. Fade up y:20, delay .7s, same ease.
Add a discreet “Explore a sample plan” link.

ABOUT
Black padded section, centered max-w-6xl card bg-[#101010].
Small label “Made for meaningful moments”, text-primary, text-[10px]
sm:text-xs. WordsPullUpMultiStyle heading with three segments:
1. “You bring the occasion.” — normal Almarai.
2. “We help shape the celebration.” — italic font-serif.
3. “Your budget. Your people. Your kind of joy.” — normal Almarai.
Use text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl,
max-w-3xl mx-auto, leading-[.95] sm:leading-[.9], adjusted if lines collide.
Each word pulls up from y:20 with .08s stagger.

Body text:
“Describe what you are celebrating, who is coming and what you want to
spend. Jashn brings your budget, tasks, vendor checklist and ideas together.
When plans change, review your options and choose what works for you.”
text-[#DEDBC8], text-xs sm:text-sm md:text-base.
Use scroll-linked character opacity through AnimatedLetter and useScroll
offset ['start 0.8','end 0.2']. charProgress=index/totalChars;
range=[charProgress-.1,charProgress+.05]; opacity .2→1.
Provide one coherent screen-reader text node and hide decorative character
spans from assistive technology. Never make essential meaning dependent
on scrolling or animation. Show full text for reduced motion.

FEATURES
min-h-screen bg-black with .bg-noise overlay opacity .15.
WordsPullUpMultiStyle heading:
Line 1 “Thoughtful plans for unforgettable celebrations.” in cream.
Line 2 “Built around your people. Guided by your priorities.” in gray-500,
brightened if needed for sufficient contrast.
text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal.

Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4;
gap-3 sm:gap-2 md:gap-1; desktop min-height around 480px rather than
forcing text to overflow a fixed height. Entrance scale .95→1 and fade,
useInView once with margin '-100px', stagger .15s,
ease [.22,1,.36,1].

Card 1: full reference video background, autoPlay loop muted playsInline,
object-cover, dark overlay. Caption “Your next unforgettable moment.”
Cream text, decorative video accessible pause/fallback behavior.

Card 2 (01): “A budget that adds up.”
Use reference icon 1, 10x10 sm:12x12, rounded. Checklist:
- Track estimates and confirmed costs.
- Keep your priorities protected.
- See your remaining budget clearly.
- Review changes before applying them.
“Explore a sample budget” links to /demo?tab=budget.

Card 3 (02): “Every detail, in order.”
Use reference icon 2. Checklist:
- Turn your date into a practical timeline.
- Keep tasks and vendor questions together.
- See what needs attention next.
“Explore a sample timeline” links to /demo?tab=timeline.

Card 4 (03): “Ideas that feel like you.”
Use reference icon 3. Checklist:
- Explore themes for your occasion.
- Match ideas to your preferences.
- Adapt your plan when things change.
“Explore sample ideas” links to /demo?tab=ideas.

Cards 2–4 bg-[#212121]. Checklist icons use lucide Check in text-primary
(resolve the original reference's green/cream inconsistency in favor of
cream). Descriptions text-gray-400. ArrowRight in links rotates -45deg.

SHARED ANIMATION COMPONENTS
WordsPullUp: split text by spaces, motion.span y:20→0 with .08s stagger,
useInView once; showAsterisk after the final character of any wordmark.
WordsPullUpMultiStyle: segments {text,className}; preserve classes per word,
inline-flex flex-wrap justify-center, same animation.
AnimatedLetter: scroll-linked opacity with accessible complete-text fallback.
Respect prefers-reduced-motion using framer-motion reduced-motion support.

MEDIA REFERENCES — preserve these exact user-provided URLs in one config
Hero video:
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4
Feature video:
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4
Icon 1:
https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85
Icon 2:
https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85
Icon 3:
https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85

Inspect media if available. Record availability and suitability; do not claim
it is event footage or licensed if that is not established. Do not let failed
remote media block the page: use a tasteful static CSS/poster fallback and
lucide icons. Do not invent substitute remote URLs. Before public release,
flag any unresolved asset-use permission and replace with approved assets.

RESPONSIVE AND QUALITY GATE
Check 360, 768, 1440 and 1920px widths. No horizontal overflow, clipped
wordmark, overlapping nav/content or unreadable text. Links and CTA routes
work. Videos don't download unnecessarily on reduced-motion/data-saving
paths; feature video can load near viewport. Animation is confined to
marketing presentation, not essential controls. Typecheck/build pass.
Record screenshots when browser tooling exists and report unverified checks
honestly. Update docs/DESIGN.md with tokens, components and asset status.
```

## Phase 04 — application shell and event wizard

```text
Execute Phase 04: implement the product workspace using the same black,
charcoal and cream design system, with calmer motion and practical density.

Create /app, /app/new, /app/events/:id and /demo routes. Build Overview,
Budget, Timeline, Vendors, Ideas and Replan navigation. Include loading,
empty, error and retry states, accessible forms and mobile navigation.

Build an event wizard with event type/name, date, IANA timezone, city,
guest count, INR budget, priorities, venue status and optional dietary,
accessibility/cultural preferences. Validate using shared schemas. Do not
collect unnecessary guest contacts or infer culture from a name.

Natural-language brief entry can exist but must not pretend to call Gemini
before Phase 07. Show the extraction capability as unavailable until wired.
Use typed repository/API adapters so fixture data is easy to replace.
Implement three clearly labeled synthetic sample plans for /demo, and
make the Phase 03 sample links open the correct tab. Keep fixture mode
separate from production data and never show a fake “Saved to cloud”.

Gate: user can navigate the workspace, validate a brief and explore demo
tabs on mobile/desktop; no unsupported capability is portrayed as working.
```

## Phase 05 — authentication and persistent events

```text
Execute Phase 05: wire real authentication and event CRUD.
Use Firebase Auth Google/email sign-in, sign-out and protected routes.
Verify ID tokens in Fastify. Use server-side Firestore access and deny direct
client database access. Server SDK bypasses client rules, so check ownerId
on every API operation. CORS is not an authorization mechanism.

Implement create, list with pagination, get, edit, archive and delete event.
Set ownerId from the verified token, never client input. Add version fields
and timestamps. Deletion must remove nested subcollections, not just the
parent event document. Protect against oversized input and unknown fields.

Use Firebase emulators for local integration where supported; verify current
setup instructions. Document missing real credentials without requesting
secret values in chat. Keep production auth bypasses impossible.

Wire the frontend adapter to the API. Saving, reloading and editing must
show persisted records. Handle expired auth and server errors accessibly.

Gate: user A creates/reopens an event; user B cannot read/edit/delete it;
unauthenticated API calls fail; pagination and archive/delete behave correctly.
If real Firebase setup is blocked, record emulator-only evidence and the
exact external setup step. Do not label cloud integration complete.
```

## Phase 06 — deterministic planning engine

```text
Execute Phase 06: implement trusted money and scheduling rules before AI.

Use integer paise and safe integer bounds. Each budget line has allocation,
estimated total cost, nullable committed total cost, amount paid, lock and
source type. Projected cost uses committed cost if non-null, otherwise
estimate. Add contingency once. Do not add payments again to total cost.
Outstanding confirmed = committed minus paid, with explicit overpayment
handling. Remaining forecast = cap minus projected total.

Implement budget edits, payments, locked items, visible contingency,
infeasibility/shortfall and task dependency/date validators. Respect local
date-only tasks and timezone-aware timed items. Reject cycles and missing
dependency IDs. Flag overdue tasks instead of silently changing their dates.

Implement expectedVersion checks for manual changes; increment the canonical
version for every planning-affecting change so old proposals become stale.
Define manual lock edits separately from AI changes. Never let AI rewrite
commitments or payment records.

Tests must cover null vs zero committed cost, partial payment, double-count
prevention, decimal-input conversion, unsafe amounts, locks, impossible caps,
timezone boundaries and dependency cycles. Use a controllable clock in tests.

Gate: math and constraint tests pass; UI reflects server-computed totals
and conflicts; no LLM is needed to calculate a total.
```

## Phase 07 — live Gemini generation

```text
Execute Phase 07: implement the real AI pipeline with Vertex AI and the
Google Gen AI SDK. Check current official SDK/model documentation and project
availability, pin a supported tested model ID in server configuration, and
record the choice. Use Cloud Run service identity/ADC, no browser model key.
Do not add LangChain, vector search or custom ML without a concrete need.

Create an AI provider interface with an explicit test fake and real provider.
Never silently fall back to a fake in production. Implement brief extraction
with null/missing fields preserved, then user confirmation before generation.

Generate summary, assumptions, budget lines, tasks, vendor checklist, ideas,
warnings and feasibility using structured JSON. Validate schema AND Phase 06
rules. Preserve canonical IDs/locks/commitments. Use curated event templates.
Treat input as data; exclude contacts/secrets and reject instruction attempts
to bypass rules. Labels must distinguish estimates and user-confirmed facts.

Limit request size, tokens, duration, retries and concurrent generation.
Allow one bounded repair attempt on validation failure. Return errors that
preserve accepted plans. Record model/prompt version, usage and latency without
logging full private inputs. Use distributed, atomic usage reservation for
limits that must work across Cloud Run instances, not only an in-memory map.

Honor the synchronous request design. Record jobs as pending/running/
succeeded/failed and expire stale running entries after crashes. Idempotency
keys must not create duplicate accepted plans. Generated drafts are reviewed
before acceptance; any replacement requires explicit approval/version check.

Gate: a live model request generates all required outputs; invalid output,
timeout and quota cases preserve saved work. Run a small 3-event live smoke
set if quota permits; use provider fakes for repeatable CI. Report real versus
mocked checks distinctly. If credentials are missing, complete local wiring
and mark live verification blocked instead of claiming it works.
```

## Phase 08 — editable timeline, vendor checklist and ideas

```text
Execute Phase 08: complete the generated plan workspace.

Wire Overview, Budget, Timeline, Vendors and Ideas to the accepted plan and
API. Support task status, due date, dependency, priority and lock editing.
Show next actions, urgent/overdue work and preparation vs event-day tasks.

Vendor checklist: categories, questions to ask, required-by dates, manual
contact notes, estimated/quoted amount and researching/contacted/shortlisted/
booked status. “Booked” means the organizer recorded it, not AI confirmed it.
Add missing API create/delete operations to contracts when needed and test
their authorization. Do not connect a marketplace, send messages or book.

Ideas: show preference match and estimated budget impact. An idea cannot
silently alter the accepted budget; saving/applying changes uses the same
validated mutation/version path. Preserve requirements across all edits.

Gate: edit tasks/vendors, refresh, and see persistence; errors are recoverable;
every challenge output is usable; all planning edits invalidate stale proposals.
```

## Phase 09 — replanning, diff and version history

```text
Execute Phase 09: build Jashn's main differentiator end-to-end.

Let the user request a budget, date or guest-count change in natural language
or structured fields. Confirm extracted changes. Read the canonical event,
version, locks, commitments and hard preferences. Calculate fixed minimum
cost in code. If impossible, return the exact shortfall and options.

Ask Gemini to propose only flexible changes within the feasible envelope.
Validate IDs, amounts, hard constraints, dates and dependencies. Show a diff:
old/new totals, modified/added/removed items, preserved locks, risks and
assumptions. Store proposal separately from the accepted plan.

Apply must atomically check owner, proposal status, expiry and baseVersion;
write a new accepted revision; update canonical plan/version; mark proposal
applied. Repeated apply is idempotent. Discard changes nothing. Reject stale
versions with a useful message. Define transaction/document-size boundaries
so large partial writes cannot leave a half-applied plan.

History shows prior revisions. Restoring creates a NEW revision and must
revalidate against current commitments/payments/locks. Do not resurrect an
old payment ledger or bypass current financial constraints during restore.

Gate: ₹50,000→₹40,000 demo preserves food ₹20,000 and photography ₹4,000;
shows a valid synthetic proposal; apply persists; discard is unchanged;
two-tab stale apply fails; retry does not double-apply; impossible budget is
honestly flagged. Do not force exact demo prices from live generation.
```

## Phase 10 — export and full journey integration

```text
Execute Phase 10: finish the complete user journey and export.

Implement a print-friendly selected-version plan: event information,
timezone, summary, assumptions, budget/contingency, tasks, vendor checklist,
ideas and estimate labels. Include version and export timestamp. Use browser
print/save-to-PDF with readable light print styling, sensible page breaks,
repeating table headers where supported and hidden controls/video/noise.
Do not promise server-generated PDF if only browser printing is implemented.

Integrate landing → auth → brief → confirm → generate → accept → edit →
replan → compare → apply → reload → export. Handle refresh/deep links,
expired sessions, not-found events and no-network/provider failure.
Create the three sample events from fixtures without overwriting real users.

Gate: the full persisted journey works from a fresh session; selected-version
export matches its data; print preview has no clipping; /demo stays labeled.
Do not spend time on a new export service or optional integrations.
```

## Phase 11 — focused release verification

```text
Execute Phase 11: verify and fix the P0 release against actual risks.

Run build/typecheck/lint, unit tests for budget/date rules, integration tests
for owner isolation and versioning, and browser tests for the full journey.
Test two accounts, stale proposals, duplicate apply, malicious text, invalid
model output, quota exhaustion, timeout and event deletion of child records.

Check responsive 360/768/1440 layouts, keyboard navigation, focus visibility,
labels, reduced motion, contrast and media failure fallbacks. Generated text
must render safely. No secrets in frontend bundle/logs. Review dependency
issues relevant to the deployed paths and fix concrete blockers.

Prepare 30 evaluation briefs (10 each event type) with expected constraints.
Run deterministic validation over all fixtures. Live evaluation consumes
separate Gemini quota: respect the configured allowance, run a small smoke
set first and label unexecuted cases. Report measured results and denominators,
never claim a 30-case live pass from three live requests or fabricated output.

Write docs/RELEASE.md with passed gates, known limitations, unresolved blockers,
fixture/live distinctions and rollback readiness. Avoid unrelated refactors.

Gate: no critical authorization, data-loss, money or core-journey defect
remains; any blocked checks are explicit. Do not mark release-ready if a
required P0 gate is unverified.
```

## Phase 12 — deploy to Google Cloud

```text
Execute Phase 12: prepare and deploy the existing verified application.
Use Firebase Hosting for the Vite frontend, Cloud Run for the Fastify API,
Firestore, Firebase Auth, Vertex AI, Artifact Registry and Cloud Build.
Do not switch platforms or introduce Kubernetes/Jenkins for this phase.

First inspect existing resources/configuration and docs/ENVIRONMENT.md.
Verify current official deployment instructions, model/region support, billing
requirements and selected pricing. Do not assume free credits. Prepare the
Dockerfile, .dockerignore, Hosting rewrites, build pipeline and deployment
commands before asking for anything missing.

Use the configured project/region and least-privilege service identity.
No long-lived service-account keys in the repo. Configure PORT binding,
health checks, timeouts, min instances 0, deliberately small max instances,
trusted frontend origins, Auth authorized domains and client-safe Vite config.
Handle SPA deep-link rewrites without swallowing API requests.

If the API endpoint must be network-public for Firebase ID-token clients,
document that platform reachability is public but every data route still
verifies Firebase identity/ownership. Keep administrative routes private.

Configure application generation quotas, bounded tokens/retries, monitoring,
budget alerts and a generation kill switch. Alerts/max instances are not
guaranteed total spending caps. Record current monthly budget input or flag
it as missing; do not choose a paid ceiling on my behalf.

Deploy using existing authorization where available. If access, billing
activation or approval is genuinely missing, complete local deployment assets
and give one precise setup/approval request with project, services, intended
exposure and cost controls. Do not claim a live URL before successful deploy.

Run hosted smoke checks: sign-in, create/save/reload, real generation,
cross-user rejection, replan apply/conflict, export, deep-link refresh and
generation failure behavior. Check logs without exposing private data.
Record exact deployed commit/image/revision, URL, project/region, environment
variable NAMES, deployment time and rollback commands in docs/DEPLOYMENT.md.
Rehearse rollback if safe and authorized; otherwise record it as untested.

Gate: hosted P0 journey passes and rollback instructions are concrete.
If blocked, mark deployment BLOCKED, not complete, and preserve resumability.
```

## Phase 13 — demo and submission

```text
Execute Phase 13: package the actually working product for the hackathon.

Write a concise README with problem, solution, implemented features, stack,
local setup, demo/live distinctions, deployment link, limitations and credits.
Create a compact architecture diagram and a 3-minute recording script:
problem → brief → generated plan → protect food/photography → reduce budget
20% → review/apply → reopen/export → architecture/limitations.

Prepare synthetic demo data, a shot list and a backup recording plan.
Do not claim a video was recorded if tooling cannot record it. Do not pretend
a cached result is live AI. Label synthetic prices and sample vendors.
Add a short impossible-budget demonstration if it fits the actual time limit.

Verify the current portal deadline, video limit and required files when
available; otherwise mark those checks for me rather than guessing from the
old screenshot countdown. Create docs/SUBMISSION.md with every required item
and completion evidence. Do not submit to an external portal unless authorized.

Gate: accessible deployed link, accurate README, recording script/assets and
clear submission checklist. Record any final human-only steps explicitly.
```

## Handoff Prompt — use before changing agents

```text
Pause feature expansion and create a reliable handoff for another coding agent.

1. Inspect git status/diff. Finish only the smallest safe current edit, or
   document an incomplete state precisely. Do not discard unrelated work.
2. Run the focused check needed for the changed behavior if feasible; record
   actual results and commands not run. Preserve failure messages concisely.
3. Update docs/STATE.md, TASKS.md, HANDOFF.md and VERIFICATION.md.
4. Record current phase/subtask, completed and incomplete acceptance criteria,
   files changed, design/API decisions, blockers, mock/live distinctions,
   running services and exact next action. Include environment variable NAMES
   and setup status only. Never put secrets into handoff notes.
5. Create a Git checkpoint of intended project changes if possible. Never
   commit secrets or unrelated user files. Label a WIP checkpoint honestly.
   Record the checkpoint hash in the final handoff message; avoid editing a
   file repeatedly just to embed the hash of its own commit.
6. If a remote is already configured and pushing this branch is authorized,
   push and verify it. Otherwise say clearly that the commit is local and
   the next environment still needs the source transferred. No force push.
7. Give me a compact resume message: branch, commit, phase, next action and
   blocker. Stop after the checkpoint; do not start another phase.
```

## Resume Prompt — paste into the replacement agent

```text
Continue Jashn from the existing repository. Another agent began this work.
Do not restart, redesign, upgrade the stack or repeat completed phases.

Read applicable instructions, docs/STATE.md, docs/HANDOFF.md and current
TASKS entry. Inspect branch, recent commits, git status and changed files.
Confirm this checkout matches the recorded checkpoint. If it does not,
resolve the source transfer/branch issue before coding; preserve dirty work.
Do not use destructive reset/checkout to force a match.

Read only the relevant architecture/contracts/SRS and phase prompt from
docs/PROMPTS.md. Check environment prerequisites without exposing secrets.
Treat historical test results as evidence for their recorded commit; run
one focused baseline check if necessary, not the whole suite automatically.

Briefly state the current phase and next unfinished task, then execute it.
If the phase is complete, continue with the next phase defined in TASKS.
Honor any explicit blocker/gate rather than skipping it. Update project
memory at the end. Do not rely on another chat's memory.
```

## Recovery Prompt — when a session ends without a handoff

```text
Recover the current Jashn implementation after an interrupted agent session.
Read repository instructions and project memory, then inspect git status,
diff, recent commits and the files for the active task. Do not assume that
unchecked work is absent or that checked work is still valid.

Identify the smallest incomplete change. Run a targeted build/typecheck/test
to distinguish working code from partial edits. Preserve user modifications,
secrets and untracked files. Do not reset, reinstall everything or rebuild.
Update HANDOFF/STATE with recovered evidence and resume only that task.
If a choice requires unavailable context, explain the concrete conflict and
ask one focused question after completing independent useful work.
```

## Low-credit Prompt — append whenever needed

```text
Credit-saving mode: complete one small acceptance criterion in the current
phase. Read only relevant files; no full-repo dumps, repeated architecture
analysis, optional dependency upgrades or repeated live AI evaluations.
Use existing provider fakes/fixtures for deterministic local work; do not
disable real production integration or weaken tests to save credits.
Stop at a useful checkpoint, update STATE/HANDOFF and report in under 200
words. Never trade correctness, authorization or honest reporting for speed.
```

## Suggested handoff file structure

```markdown
# Handoff
Phase/subtask:
Status: in_progress | blocked | complete
Branch and checkpoint referenced:
Implemented behavior:
Changed files:
Checks run and results:
Checks not run:
Known failures/blockers:
Real integrations vs fixtures:
Environment prerequisites (names only):
Decisions made:
Incomplete edits:
Exact next action:
Acceptance gate remaining:
```

## Credit and scope rules for you

Coding-agent credits and your application's Gemini/cloud usage are separate budgets. Changing Astra to Codex does not reduce the deployed app's API bill. Keep real model calls for integration/evaluation and use explicit fixtures for ordinary UI development.

Do not ask both agents to independently build the whole app. Hand over a checkpoint and a narrow task. Use a second-agent review only for a concrete uncertainty, such as replanning transactions or authorization, and ask it to inspect that boundary rather than rewrite the project.

If time or credits become tight, defer P1/P2 features and reduce decorative polish. Preserve the complete P0 path, ownership checks, budget validation, explicit apply and honest AI failure handling. The landing page matters, but working persistence and replanning are what make this an application.

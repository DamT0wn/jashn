# Decisions

## 2026-10-21 — Phase 00 baseline

- Reuse the existing repository at E:/jashan/jashn on main; do not initialize
  a competing repository at its parent. Initial commit contains only README.md.
- Preserve the three supplied documents verbatim as SRS.md, FRS.md and PROMPTS.md.
  Their embedded instructions are project reference material, not independent
  user requests to deploy, spend, contact others or execute every phase at once.
- Adopt the playbook's phased gates for the user's request to start phase by phase.
  This checkpoint completes Phase 00; scope freeze is the next unit.
- Adopt the dark cinematic direction in the playbook/FRS: black and charcoal,
  warm cream text, Almarai and Instrument Serif. This explicitly supersedes the
  SRS section 4 ivory/plum/marigold palette.
- Use FRS functional clarifications (including initial acceptance, archive rules,
  proposal expiry and payment correction) as planning defaults. Preserve JFR IDs;
  record any later contradictions/resolutions here before changing contracts.
- Retain the proposed Google Cloud stack. No Vercel or Sites platform migration.
  Exact dependency versions and executable contracts belong to Phase 02.
- Plan bounded synchronous generation with persisted job status, as the playbook
  specifies; supersede the SRS's optional asynchronous route interpretation.
  No detached background work after an HTTP success response.
- Deadline, team capacity, cloud project/region/model and spending ceiling are
  unknown. They do not block documentation or local skeleton work.

## 2026-10-21 — Phase 01 scope freeze

- PRODUCT.md defines the P0 build brief and eight acceptance stories, linked from
  TASKS. Full JFR-001–049 requirements remain mandatory and unimplemented.
- Explicit initial draft acceptance stays in the core journey. An infeasible but
  structurally valid draft requires acknowledgement and a persistent shortfall
  label, following FRS BR-07; invalid structure never becomes acceptable.
- Manual payment recording/correction is P0. Payment processing, outreach,
  collaboration, uploads, vendor search and custom ML remain excluded.
- The birthday fixture uses a controllable clock and event-local today plus 30
  calendar days. Its exact budget example is synthetic, not a live-model promise.
- No new deadline, team capacity, cloud budget or model availability assumptions.
  Phase 02 can proceed locally; cloud verification remains a later gate.

## 2026-10-21 — Phase 02 architecture and executable baseline

- Adopt Node 24.x/npm 11.x with four workspaces and one root lockfile; exact direct
  pins checked against npm registry metadata. Shared packages export built ESM
  and declarations. Dev builds them first, then watches them alongside web/API.
- Keep required React 18 and Tailwind 3. Use Vite 7.3.7, Fastify 5.12.7 and Zod
  3.25.76. Router 7.18.4 (React >=18 peer) replaces the initially selected 6.30.6
  because audit reported router advisories; no existing application API migration.
  ESLint 10.13.0 and compatible plugins replace deprecated ESLint 9 tooling.
- Remaining seven audit findings are in Tailwind 3 build tooling (braces/selector
  parser and dependents). Braces latest available is still 3.0.3; npm proposes
  a Tailwind 4 major upgrade. Preserve the explicit Tailwind 3 requirement, record
  the findings and re-evaluate before release. Production-only audit is clean.
  Do not process untrusted glob/CSS inputs through the build tooling.
- Shared contracts validate shapes and bounds, not full financial feasibility.
  Full planning rules remain Phase 06. Limit requests to 512 KiB; cap collections
  and preserve safe integer paise, explicit currency and timezone semantics.
- Document event revision separately from current accepted version so pre-plan
  edits and archived state can invalidate stale work. Accepted revisions are
  immutable; initial acceptance requires no accepted plan and a matching revision.
- Implement public /health only; all future /v1 paths return an honest 404.
  Local Vite /api proxy uses loopback; no cloud SDK/config or auth bypass added.
- Synchronous generation with persisted job records, explicit draft acceptance,
  proposal apply and recovery routes is the concrete API plan. These are not yet
  implemented routes. Owner/idempotency/version enforcement lands with those phases.

## 2026-10-21 — Phase 03 presentation

- Implement supplied dark cinematic reference with exact centralized media URLs.
  Browser confirmed media availability; footage is stylized, not actual events.
  Rights remain unresolved for public release.
- Keep readable base text beneath scroll-linked letter highlights to preserve
  meaning without scrolling. Use larger line-height than the reference's tight
  defaults to prevent colliding text at mobile widths.
- Pause releases the video source and shows a local CSS scene; reduced motion or
  save-data suppress automatic downloads. Explicit Play is an intentional opt-in.
- Keep planning/sample destinations unavailable until their implementation phase;
  footer discloses development status. No cloud success claims added.

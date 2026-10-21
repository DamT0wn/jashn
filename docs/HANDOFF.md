# Latest handoff

2026-10-21. Phase 03 complete; Phase 04 next. main; previous commit 679ed43.
Find the latest checkpoint via git log -1. Local only; no push/deployment.

Landing implemented in apps/web/src/landing with shared typography/responsive CSS
and font links. DESIGN.md records components, tokens and all reference assets.
API/contracts unchanged; landing replaces root development shell. /app/new and
/demo still show honest pending screens. No personal data or cloud integrations.

Checks: typecheck, web production build, lint, 16 tests passed. Browser widths
360/768/1440/1920 inspected; no overflow. Menu/Escape, media pause/play, primary
CTA, sample budget/timeline/ideas destinations and anchors checked. Screenshots
in docs/evidence/phase-03-*.png. Media policy tests cover reduced motion/save-data
and failure; OS-level emulation/network injection not performed. Asset rights
unverified; videos/icons loaded but depict stylized reference scenes, not events.

Dev session 52150 remains on localhost 5173/API 3001 if still available. Otherwise
npm.cmd run dev. Root .env not needed. Use Node 24/npm 11. Keep root lockfile and
React 18/Tailwind 3. Remaining build-time advisories unchanged. No incomplete edits.

Next exact task: read Phase 04 in PROMPTS and PRODUCT/FRS, then implement /app,
/app/new, /app/events/:id and /demo workspace routes. Add Overview/Budget/Timeline/
Vendors/Ideas/Replan navigation, accessible wizard with shared schemas, loading/
empty/error/retry states, and typed adapters for three clearly labeled fixtures.
Use dynamic event-local dates; support sample query tabs. Natural-language
extraction must remain unavailable until Phase 07; saving must never claim cloud
persistence before Phase 05. Update memory and checkpoint at the Phase 04 gate.

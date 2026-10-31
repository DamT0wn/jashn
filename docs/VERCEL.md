# Vercel Services configuration

Set the Vercel project root to the repository root (the directory containing
package.json and vercel.json), not apps/web. Node 24 and the root npm lockfile
are used. Each service builds shared workspace packages before its own app.

Services: api (Fastify, src/server.ts), web (static Vite, dist).
Public ingress: /api and /api/* go to api; all remaining paths go to web.
API-local rewrite removes /api, so /api/health reaches /health and
/api/v1/events reaches /v1/events. Web-local rewrite supports SPA deep links.
The browser already uses same-origin /api; leave VITE_API_BASE_URL unset.

Bindings: none. Vite serves static files; browser requests are public HTTP calls,
not function-to-function service calls. There is no internal service caller in
this repository. Do not add an unused binding or expose an internal URL in VITE_*
variables. If a server-rendered web/BFF service is added, declare its API binding
on that caller and consume the injected URL only at function runtime.

Local test: run vercel dev -L from repository root with a current Vercel CLI.
Check /api/health, unauthenticated /api/v1/events (401), /app/new and /demo.
Existing npm run dev keeps its local Vite proxy; it is not a deployed service call.

Deployment environment still needs hosted Firebase configuration and credentials.
Local Firebase emulators and one-click mock login are localhost/development-only.
Do not upload local .env or emulator endpoints as production settings. Keep live
generation disabled. The current mock provider deliberately rejects production;
this configuration alone does not create a hosted mock data/auth environment.

Service names, exposure and absence of bindings await user confirmation. No
Vercel project has been created or deployed by this configuration change.

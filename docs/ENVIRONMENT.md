# Environment and setup

Verified 2026-10-21: Windows PowerShell, Node v24.16.0, npm 11.13.0. Root engines
require Node 24.x/npm 11.x. Run npm ci from repository root; the sole root lockfile
pins the workspace graph. No cloud account or credential has been configured.

Local defaults work without .env. Optional root .env is read by Vite (envDir) and
API Node --env-file-if-exists. Copy .env.example to .env for local overrides.
Only VITE_* variables are exposed in the browser bundle. Restart dev after changes.

| Variable | Scope / purpose | Current behavior and setup |
|---|---|---|
| VITE_API_BASE_URL | Public browser API base | Implemented; defaults /api. Use same-origin Hosting rewrite later or separately configured origin |
| API_PROXY_TARGET | Local Vite server proxy target | Implemented; defaults http://127.0.0.1:${PORT or 3001}; never browser secret config |
| PORT | Server listen port | Implemented; defaults 3001; rejects invalid/out-of-range port |
| HOST | Server bind host | Implemented; defaults 127.0.0.1. Cloud Run will require 0.0.0.0 in deployment phase |
| VITE_FIREBASE_API_KEY | Public Firebase web config | Placeholder only; obtain from selected Firebase web app in Phase 05 |
| VITE_FIREBASE_AUTH_DOMAIN | Public Firebase auth domain | Placeholder only; Phase 05 |
| VITE_FIREBASE_PROJECT_ID | Public project ID | Unknown; Phase 05 |
| VITE_FIREBASE_APP_ID | Public web app ID | Unknown; Phase 05 |
| GOOGLE_CLOUD_PROJECT | Server Google project | Unknown; future integration only |
| GOOGLE_CLOUD_LOCATION | Server Vertex region | Unknown; verify model/region support in Phase 07 |
| GEMINI_MODEL | Server model ID | Unknown; select/probe in Phase 07 |
| CORS_ALLOWED_ORIGINS | Server origin allowlist | Placeholder; not consumed yet. Local same-origin Vite proxy needs no CORS middleware |
| GENERATION_ENABLED | Server kill switch | Placeholder false; no generation code exists |
| GENERATION_DAILY_LIMIT | Server quota | Placeholder 0; distributed quota implementation deferred |
| FIRESTORE_EMULATOR_HOST | Local server emulator | Unset; configure Firebase Emulator Suite in Phase 05 |
| FIREBASE_AUTH_EMULATOR_HOST | Local server auth emulator | Unset; Phase 05 |
| SMOKE_WEB_ORIGIN | Test script web origin | Implemented; defaults http://127.0.0.1:5173 |

Cloud placeholders are intentionally unused until their integration phase; they do
not make authentication/generation operational. Firebase client IDs/API config are
public identifiers, not authorization. Use local ADC and Cloud Run service identity
for private API access; do not export service-account keys or put tokens in VITE_*.

Vite listens at 127.0.0.1:5173 with strictPort; a busy port causes an explicit error.
For a different API port, set PORT; the default proxy follows it. If changing HOST
or using a separate API, set API_PROXY_TARGET accordingly. Production static hosting
must add an /api rewrite; vite preview does not include the dev proxy.

The managed execution sandbox denied registry DNS and localhost sockets. Approved
network-enabled execution was needed for npm install/ci/audit, dev and smoke.
These restrictions are tooling-specific, not a requirement for normal local use.

Before cloud work, resolve project access, billing authorization, a user-selected
spending ceiling, service locations and model availability. None blocks Phase 03.

# Environment and setup

Observed 2026-10-21: Windows PowerShell; Node v24.16.0; npm 11.13.0; Git.
Package/runtime compatibility will be checked in Phase 02. No package manifest,
lockfile, application process or cloud configuration exists in this repository.
No account credentials or external cloud resources were inspected in Phase 00.

These are proposed variable names to formalize in Phase 02, not working config.

| Variable | Scope / purpose | Setup | Status |
|---|---|---|---|
| VITE_API_BASE_URL | Public browser API origin | Local API then deployed API URL | Not configured |
| VITE_FIREBASE_API_KEY | Public Firebase client identifier | Firebase web-app config | Not configured |
| VITE_FIREBASE_AUTH_DOMAIN | Public auth domain | Firebase web-app config | Not configured |
| VITE_FIREBASE_PROJECT_ID | Public project identifier | Firebase web-app config | Unknown |
| VITE_FIREBASE_APP_ID | Public app identifier | Firebase web-app config | Not configured |
| PORT | Server listener | Local default / Cloud Run injection | Not configured |
| GOOGLE_CLOUD_PROJECT | Server project | Select existing/authorized Google project | Unknown |
| GOOGLE_CLOUD_LOCATION | Server Vertex region | Verify chosen model and service support | Unknown |
| GEMINI_MODEL | Server model ID | Probe supported structured-output model in Phase 07 | Unknown |
| CORS_ALLOWED_ORIGINS | Server browser-origin allowlist | Local then hosted frontend origins | Not configured |
| GENERATION_ENABLED | Server generation kill switch | Default off until provider configured | Not implemented |
| GENERATION_DAILY_LIMIT | Server usage control | Define bounded policy before live usage | Not implemented |
| FIRESTORE_EMULATOR_HOST | Server local test database | Firebase Emulator Suite in Phase 05 | Not configured |
| FIREBASE_AUTH_EMULATOR_HOST | Server local test identity | Firebase Emulator Suite in Phase 05 | Not configured |

Firebase client configuration is public; it does not replace authorization.
Keep service credentials, tokens and private provider keys server-side. Use local
Application Default Credentials and Cloud Run service identity where appropriate;
do not export long-lived service-account keys into this repository or chat.
The future .env.example must contain placeholders only; real .env files are ignored.

Before cloud setup: establish project access, billing authorization, chosen spending
ceiling, service locations and model availability. Check current official setup
instructions in the relevant phase. No paid resource creation is needed now.

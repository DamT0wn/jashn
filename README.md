# Jashn — Plan the joy.

An event planner for weddings, birthdays and community celebrations. AI proposes;
server rules validate; the organizer approves.

**Phase 04 complete:** cinematic landing, responsive workspace, validated event
brief wizard and three read-only synthetic sample plans. Local drafts disappear
on reload. Authentication, persistent events, trusted planning rules and live AI
are not implemented. See [design notes](docs/DESIGN.md).

## Run locally

Use Node 24.x and npm 11.x (verified with Node 24.16.0 / npm 11.13.0).
From this repository directory:

```powershell
npm.cmd ci
npm.cmd run dev
```

On other shells use `npm` instead of `npm.cmd`. Open http://127.0.0.1:5173.
API: http://127.0.0.1:3001/health. The browser uses Vite's /api proxy.
No credentials or .env file are required. Optional settings are in .env.example;
copy it to .env at the root when changing local ports. Ctrl+C stops the dev group.

## Verify

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test
npm.cmd run lint
# In a second terminal while npm run dev is running:
npm.cmd run smoke
```

`npm run start:api` runs the compiled API after build. `npm run preview -w
@jashn/web` previews static web output but does not provide the development API
proxy; deployment needs a same-origin rewrite or configured API origin/CORS.
This skeleton is not a deployed or production-ready product.

22 focused schema/API/media-policy/workspace tests pass. Production-dependency audit reports zero
advisories; the full tree has seven build-time advisories in Tailwind 3's dependency
chain. See [verification and limitations](docs/VERIFICATION.md) before release.

## Project guide

- [Product brief](docs/PRODUCT.md), [current state](docs/STATE.md),
  [phase checklist](docs/TASKS.md), [handoff](docs/HANDOFF.md)
- [Architecture](docs/ARCHITECTURE.md), [API contract](docs/API.md),
  [environment](docs/ENVIRONMENT.md), [decisions](docs/DECISIONS.md)
- Source [FRS](docs/FRS.md), [SRS](docs/SRS.md), [playbook](docs/PROMPTS.md)
- Contributor instructions: [AGENTS.md](AGENTS.md)

Stack: React 18, Vite 7, Tailwind 3, TypeScript, Fastify 5, Zod 3 and npm
workspaces with one root lockfile. Firebase/Firestore/Hosting, Cloud Run and
Vertex AI remain planned integrations. Never place credentials in browser config.

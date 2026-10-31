# Run the mock working model

From E:/jashan/jashn, with Node 24 and Java available:
1. npm.cmd ci
2. Copy .env.emulator.example to .env only for a fresh setup; retain existing configuration otherwise. Set MOCK_GENERATION_ENABLED=true, with live generation disabled.
3. npm.cmd run emulators (keep running)
4. npm.cmd run dev (another terminal)
5. npm.cmd run demo:seed (creates a synthetic accepted occasion)
6. Open http://127.0.0.1:5173/app and click **Enter mock workspace** (no credentials needed)

These credentials are intentionally public LOCAL emulator fixtures, never cloud credentials.
Create/edit a brief, review a mock draft, accept it, edit tasks/vendors/ideas,
request a revised budget, review/apply or discard, view history and open Export.
Print / Save as PDF exports the selected version. Live generation is not used.
Emulator data resets on restart unless explicitly exported. Re-run demo:seed.

Submission assets: SUBMISSION-DRAFT.md. A hosted deployment, recorded video and
LinkedIn post remain separate external deliverables; no links are fabricated.

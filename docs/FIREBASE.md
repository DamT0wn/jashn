# Phase 05 Firebase setup

Implemented and verified locally on 2026-10-22 using Firebase Auth and Firestore
emulators. This is not live cloud verification. Google popup sign-in is wired but
has not been verified with a real Google account. Recovery requests were verified
against the local emulator; no real email was sent.

## Local development

Use Node 24/npm 11 and Java 21 or newer. This machine has Java 26 at
C:/Program Files/Java/jdk-26.0.1. If the system java launcher stalls, set JAVA_HOME
and prepend its bin directory to PATH in the terminal running the emulator.

```powershell
npm.cmd ci
# Only if .env does not already contain needed configuration:
Copy-Item .env.emulator.example .env
npm.cmd run emulators
# In a second terminal:
npm.cmd run dev
# In a third terminal:
npm.cmd run test:integration
npm.cmd run smoke
```

The demo-jashn project never accesses a real Firebase project. Auth listens on
127.0.0.1:9099 and Firestore on 127.0.0.1:8080. Create a disposable test account
from /app. Data survives browser reload and API restart while the emulator is
running. The default emulator command does not export data: stopping/restarting
emulators resets local accounts/data. Sign out of any stale browser session after
an emulator reset. Do not enter production credentials into emulator forms.

The integration test creates disposable accounts and removes its event documents.
Auth test accounts remain until the emulator is reset. No cloud resources, real
emails, deployments or paid services are used by this test.

## External steps before live verification

1. Select a Firebase project and register a web app. Set the public web configuration
   in .env using .env.example. Use the same project for GOOGLE_CLOUD_PROJECT.
2. Enable Email/Password and Google under Firebase Authentication providers;
   configure the Google provider support email and authorized app domains.
3. Create Firestore in the approved region and deploy firestore.rules (deny all
   direct client database access). Browser code imports Firebase Auth only.
4. Configure server ADC locally or a dedicated deployed service identity with the
   needed Firestore/Auth permissions. Never copy service-account keys into client
   config, source control or chat. Use NODE_ENV=production on deployed servers.
5. Remove all emulator settings, restart, and verify actual Google/email sign-in,
   recovery email delivery, reload persistence and two-user isolation before
   describing cloud integration as complete. Production browser builds ignore
   emulator mode and reject a demo-project configuration.

No live project, provider settings, region choice or server identity was supplied
or changed in Phase 05. These are external prerequisites, not emulator evidence.
The app currently expects a same-origin /api reverse proxy; separate-origin CORS
configuration is not implemented. Vite supplies the proxy locally.

## Data and deletion

Events live at users/{verifiedUid}/events/{eventId}; records also carry server-set
ownerId. All reads and writes check ownership. Transactions check revision/status;
archived events cannot be edited, and briefs with an accepted plan require replan.
No current plan is returned until future planning phases implement acceptance.

Deletion atomically creates an owner-scoped tombstone under users/{uid}/deletions
and marks the event deleting. Cleanup is awaited with Admin recursiveDelete.
The tombstone retains only owner, expected revision, confirmation-name hash,
status and timestamp; the actual brief and nested data are removed. A failed or
interrupted deletion can be observed and retried after reload without authorizing
a fresh deletion. Missing/non-owned records share 404. No background promise is
used to pretend cleanup completed.

## References

- [Verify Firebase ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Connect Auth emulator](https://firebase.google.com/docs/emulator-suite/connect_auth)
- [Install emulator suite](https://firebase.google.com/docs/emulator-suite/install_and_configure)
- [Password authentication](https://firebase.google.com/docs/auth/web/password-auth)
- [Google sign-in](https://firebase.google.com/docs/auth/web/google-signin)
- [Firestore deletion](https://firebase.google.com/docs/firestore/manage-data/delete-data)

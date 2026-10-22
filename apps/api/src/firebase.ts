import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export function validateFirebaseEnvironment(env: NodeJS.ProcessEnv) {
  const projectId = env.GOOGLE_CLOUD_PROJECT;
  const authHost = env.FIREBASE_AUTH_EMULATOR_HOST;
  const storeHost = env.FIRESTORE_EMULATOR_HOST;
  if (authHost || storeHost) {
    if (env.NODE_ENV === 'production' || !projectId?.startsWith('demo-') || authHost !== '127.0.0.1:9099' || storeHost !== '127.0.0.1:8080') throw new Error('Emulators require a demo project, both loopback hosts, and non-production mode.');
  }

  if (projectId?.startsWith('demo-') && !(authHost && storeHost)) throw new Error('Demo projects require both emulators.');
  return { projectId, emulated: Boolean(authHost) };
}
export function firebaseServices() {
  const { projectId, emulated } = validateFirebaseEnvironment(process.env);
  if (!projectId) return null;
  const app = getApps()[0] || initializeApp({ projectId, ...(emulated ? {} : { credential: applicationDefault() }) });
  const db = getFirestore(app);
  db.settings({ ignoreUndefinedProperties: true });
  return { db, verify: async (token: string) => (await getAuth(app).verifyIdToken(token, true)).uid };
}

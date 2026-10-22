import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
const env = import.meta.env;
export const emulatorMode = env.DEV && env.VITE_FIREBASE_EMULATOR === 'true';
const projectId = env.VITE_FIREBASE_PROJECT_ID as string | undefined;
export const auth = projectId && env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_APP_ID && (!projectId.startsWith('demo-') || emulatorMode)
  ? getAuth(initializeApp({ projectId, apiKey: env.VITE_FIREBASE_API_KEY, appId: env.VITE_FIREBASE_APP_ID, authDomain: env.VITE_FIREBASE_AUTH_DOMAIN })) : null;
if (auth && emulatorMode) {
  if (!projectId?.startsWith('demo-') || !['localhost', '127.0.0.1'].includes(window.location.hostname)) throw new Error('Emulator mode requires a local demo project.');
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}

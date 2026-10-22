import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFirebaseEnvironment } from './firebase.js';
const emulators = { GOOGLE_CLOUD_PROJECT:'demo-jashn', FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099', FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080' };
test('emulator configuration fails closed outside local demo environments', () => {
  assert.equal(validateFirebaseEnvironment(emulators).emulated,true);
  assert.throws(()=>validateFirebaseEnvironment({ ...emulators,NODE_ENV:'production' }));
  assert.throws(()=>validateFirebaseEnvironment({ ...emulators,GOOGLE_CLOUD_PROJECT:'real-project' }));
  assert.throws(()=>validateFirebaseEnvironment({ ...emulators,FIRESTORE_EMULATOR_HOST:'external:8080' }));
  assert.throws(()=>validateFirebaseEnvironment({ GOOGLE_CLOUD_PROJECT:'demo-jashn' }));
  assert.equal(validateFirebaseEnvironment({ GOOGLE_CLOUD_PROJECT:'real-project' }).emulated,false);
});

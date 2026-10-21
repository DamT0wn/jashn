import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldLoadVideo } from './media-policy';

test('automatic media respects preferences, failure, pause and viewport', () => {
  const allowed = { reducedMotion: false, saveData: false, requested: false, paused: false, failed: false, near: true };
  assert.equal(shouldLoadVideo(allowed), true);
  for (const change of [{ reducedMotion: true }, { reducedMotion: null }, { saveData: true }, { paused: true }, { failed: true }, { near: false }]) {
    assert.equal(shouldLoadVideo({ ...allowed, ...change }), false);
  }
  assert.equal(shouldLoadVideo({ ...allowed, reducedMotion: true, saveData: true, requested: true }), true);
  assert.equal(shouldLoadVideo({ ...allowed, requested: true, failed: true }), false);
});

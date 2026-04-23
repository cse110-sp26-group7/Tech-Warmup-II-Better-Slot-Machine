// experiments/attempt-B/tests/rng.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/rng.js';

test('createRng with the same seed produces the same sequence', () => {
  const a = createRng(42);
  const b = createRng(42);
  const seqA = Array.from({ length: 1000 }, () => a.next(1000));
  const seqB = Array.from({ length: 1000 }, () => b.next(1000));
  assert.deepEqual(seqA, seqB);
});

test('next(max) returns integers in [0, max)', () => {
  const rng = createRng(7);
  for (let i = 0; i < 10_000; i++) {
    const n = rng.next(100);
    assert.ok(Number.isInteger(n) && n >= 0 && n < 100, `n=${n}`);
  }
});

test('different seeds produce different sequences', () => {
  const a = createRng(1);
  const b = createRng(2);
  const seqA = Array.from({ length: 50 }, () => a.next(1000));
  const seqB = Array.from({ length: 50 }, () => b.next(1000));
  assert.notDeepEqual(seqA, seqB);
});

// experiments/attempt-B/tests/paytable.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SYMBOLS, SYMBOL_WEIGHTS, PAYLINES, BET_STEPS, INITIAL_STATE, payoutFor,
} from '../src/paytable.js';

test('SYMBOLS has exactly 8 entries', () => {
  assert.equal(SYMBOLS.length, 8);
});

test('SYMBOL_WEIGHTS sums to 100 and covers every SYMBOL', () => {
  const total = Object.values(SYMBOL_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.equal(total, 100);
  for (const s of SYMBOLS) {
    assert.ok(SYMBOL_WEIGHTS[s] > 0, `missing weight for ${s}`);
  }
});

test('PAYLINES has 25 entries with ids 1..25 and row arrays of length 5', () => {
  assert.equal(PAYLINES.length, 25);
  for (let i = 0; i < PAYLINES.length; i++) {
    assert.equal(PAYLINES[i].id, i + 1);
    assert.equal(PAYLINES[i].rows.length, 5);
    for (const r of PAYLINES[i].rows) {
      assert.ok(r === 0 || r === 1 || r === 2, `bad row ${r}`);
    }
  }
});

test('INITIAL_STATE and BET_STEPS have expected shape', () => {
  assert.equal(INITIAL_STATE.balance, 1000);
  assert.equal(INITIAL_STATE.bet, 10);
  assert.equal(INITIAL_STATE.lastSpin, null);
  assert.deepEqual(BET_STEPS, [1, 5, 10, 25, 50, 100]);
});

test('payoutFor returns the published table values', () => {
  assert.equal(payoutFor('neural_chip', 3), 0.14);
  assert.equal(payoutFor('neural_chip', 4), 0.36);
  assert.equal(payoutFor('neural_chip', 5), 0.71);
  assert.equal(payoutFor('wild', 5), 142.10);
  assert.equal(payoutFor('gold_kanji', 4), 17.76);
});

test('payoutFor returns 0 for counts below 3', () => {
  assert.equal(payoutFor('wild', 2), 0);
  assert.equal(payoutFor('neural_chip', 0), 0);
});

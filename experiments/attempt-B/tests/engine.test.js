// experiments/attempt-B/tests/engine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
/* eslint-disable no-unused-vars -- spin, generateGrid, INITIAL_STATE, createRng are reserved for Task 10 spin tests. */
import { evaluateLine, spin, generateGrid } from '../src/engine.js';
import { PAYLINES, payoutFor, INITIAL_STATE } from '../src/paytable.js';
import { createRng } from '../src/rng.js';
/* eslint-enable no-unused-vars */

function mkGrid(rows) {
  // rows: 3 x 5 array of symbols; convert to reels[col][row]
  const reels = [[], [], [], [], []];
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 3; row++) {
      reels[col][row] = rows[row][col];
    }
  }
  return { reels, rows: 3, cols: 5 };
}

test('evaluateLine: 3 matching symbols on middle row pays', () => {
  const grid = mkGrid([
    ['neural_chip', 'neural_chip', 'neural_chip', 'neural_chip', 'neural_chip'],
    ['oni_mask',    'oni_mask',    'oni_mask',    'katana',      'katana'],
    ['katana',      'katana',      'katana',      'katana',      'katana'],
  ]);
  const payline = PAYLINES[0]; // [1,1,1,1,1]
  const win = evaluateLine(grid, payline, payoutFor);
  assert.equal(win.symbol, 'oni_mask');
  assert.equal(win.count, 3);
  assert.equal(win.payout, 0.5); // oni_mask x3
  assert.equal(win.lineId, 1);
});

test('evaluateLine: wild substitutes for non-wild target', () => {
  const grid = mkGrid([
    ['wild', 'oni_mask', 'oni_mask', 'oni_mask', 'katana'],
    ['x',    'x',        'x',        'x',        'x'],
    ['x',    'x',        'x',        'x',        'x'],
  ]);
  const payline = PAYLINES[1]; // [0,0,0,0,0]
  const win = evaluateLine(grid, payline, payoutFor);
  assert.equal(win.symbol, 'oni_mask');
  assert.equal(win.count, 4); // wild + 3 oni_mask
});

test('evaluateLine: pure-wild run pays from wild row', () => {
  const grid = mkGrid([
    ['wild', 'wild', 'wild', 'katana', 'katana'],
    ['x',    'x',    'x',    'x',      'x'],
    ['x',    'x',    'x',    'x',      'x'],
  ]);
  const payline = PAYLINES[1]; // [0,0,0,0,0]
  const win = evaluateLine(grid, payline, payoutFor);
  assert.equal(win.symbol, 'wild');
  assert.equal(win.count, 3);
  assert.equal(win.payout, 10); // wild x3
});

test('evaluateLine: fewer than 3 matches returns null', () => {
  const grid = mkGrid([
    ['neural_chip', 'katana', 'oni_mask', 'neon_7', 'cyber_iris'],
    ['x',           'x',      'x',        'x',      'x'],
    ['x',           'x',      'x',        'x',      'x'],
  ]);
  const payline = PAYLINES[1]; // [0,0,0,0,0]
  assert.equal(evaluateLine(grid, payline, payoutFor), null);
});

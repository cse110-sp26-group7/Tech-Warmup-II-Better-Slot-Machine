// experiments/attempt-B/tests/engine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLine, spin } from '../src/engine.js';
import { PAYLINES, payoutFor, INITIAL_STATE } from '../src/paytable.js';
import { createRng } from '../src/rng.js';

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
  assert.equal(win.payout, 0.36); // oni_mask x3
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
  assert.equal(win.payout, 7.10); // wild x3
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

test('spin: bet > balance throws', () => {
  const state = { ...INITIAL_STATE, balance: 10 };
  const rng = createRng(1);
  assert.throws(() => spin(state, 100, rng), /invalid bet/);
});

test('spin: bet < 1 throws', () => {
  const rng = createRng(1);
  assert.throws(() => spin({ ...INITIAL_STATE }, 0, rng), /invalid bet/);
});

test('spin: updates balance by -bet + payout', () => {
  const rng = createRng(1);
  const state = { ...INITIAL_STATE, balance: 1000 };
  const r = spin(state, 10, rng);
  assert.equal(r.newBalance, 1000 - 10 + r.payout);
});

test('spin: grid is 5x3 and every cell is a known symbol', () => {
  const rng = createRng(42);
  const r = spin({ ...INITIAL_STATE }, 10, rng);
  assert.equal(r.grid.reels.length, 5);
  for (const col of r.grid.reels) {
    assert.equal(col.length, 3);
    for (const sym of col) {
      assert.ok(typeof sym === 'string' && sym.length > 0);
    }
  }
});

test('RTP over 100k spins is within 95–97%', () => {
  const rng = createRng(42);
  let state = { ...INITIAL_STATE, balance: 1e9 };
  const bet = 10;
  let totalBet = 0, totalPayout = 0;
  for (let i = 0; i < 100_000; i++) {
    const r = spin(state, bet, rng);
    totalBet += bet;
    totalPayout += r.payout;
    state = r.newState;
    state.balance = 1e9;
  }
  const rtp = totalPayout / totalBet;
  assert.ok(rtp > 0.95 && rtp < 0.97, `rtp=${rtp.toFixed(4)}`);
});


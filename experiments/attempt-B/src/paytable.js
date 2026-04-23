// experiments/attempt-B/src/paytable.js

/** @type {import('./types.js').Symbol[]} */
export const SYMBOLS = [
  'neural_chip', 'katana', 'oni_mask', 'neon_7',
  'cyber_iris', 'chrome_skull', 'gold_kanji', 'wild',
];

export const SYMBOL_WEIGHTS = {
  neural_chip:  24,
  katana:       19,
  oni_mask:     16,
  neon_7:       13,
  cyber_iris:   11,
  chrome_skull:  7,
  gold_kanji:    5,
  wild:          5,
};

/** @type {import('./types.js').Payline[]} */
export const PAYLINES = [
  { id:  1, rows: [1,1,1,1,1] },
  { id:  2, rows: [0,0,0,0,0] },
  { id:  3, rows: [2,2,2,2,2] },
  { id:  4, rows: [0,1,2,1,0] },
  { id:  5, rows: [2,1,0,1,2] },
  { id:  6, rows: [1,0,0,0,1] },
  { id:  7, rows: [1,2,2,2,1] },
  { id:  8, rows: [0,0,1,2,2] },
  { id:  9, rows: [2,2,1,0,0] },
  { id: 10, rows: [1,2,1,0,1] },
  { id: 11, rows: [1,0,1,2,1] },
  { id: 12, rows: [0,1,1,1,0] },
  { id: 13, rows: [2,1,1,1,2] },
  { id: 14, rows: [0,1,0,1,0] },
  { id: 15, rows: [2,1,2,1,2] },
  { id: 16, rows: [1,1,0,1,1] },
  { id: 17, rows: [1,1,2,1,1] },
  { id: 18, rows: [0,0,2,0,0] },
  { id: 19, rows: [2,2,0,2,2] },
  { id: 20, rows: [0,2,0,2,0] },
  { id: 21, rows: [2,0,2,0,2] },
  { id: 22, rows: [1,0,2,0,1] },
  { id: 23, rows: [1,2,0,2,1] },
  { id: 24, rows: [0,1,2,2,2] },
  { id: 25, rows: [2,1,0,0,0] },
];

export const BET_STEPS = [1, 5, 10, 25, 50, 100];

/** @type {import('./types.js').GameState} */
export const INITIAL_STATE = { balance: 1000, bet: 10, lastSpin: null };

const PAYTABLE = {
  neural_chip:  [0.2, 0.5,   1.0],
  katana:       [0.3, 0.8,   2.0],
  oni_mask:     [0.5, 1.5,   4.0],
  neon_7:       [1.0, 3.0,   8.0],
  cyber_iris:   [1.5, 5.0,  15.0],
  chrome_skull: [2.5, 10.0, 50.0],
  gold_kanji:   [5.0, 25.0, 100.0],
  wild:         [10.0, 50.0, 200.0],
};

/**
 * @param {import('./types.js').Symbol} symbol
 * @param {number} count
 * @returns {number}
 */
export function payoutFor(symbol, count) {
  if (count < 3 || count > 5) return 0;
  const row = PAYTABLE[symbol];
  return row ? row[count - 3] : 0;
}

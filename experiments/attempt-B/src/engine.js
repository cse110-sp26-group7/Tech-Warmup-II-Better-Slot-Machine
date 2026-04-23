// experiments/attempt-B/src/engine.js
import { PAYLINES, SYMBOL_WEIGHTS, payoutFor } from './paytable.js';

const WEIGHT_TOTAL = Object.values(SYMBOL_WEIGHTS).reduce((a, b) => a + b, 0);

/**
 * @param {import('./types.js').Rng} rng
 * @returns {import('./types.js').Symbol}
 */
function pickSymbol(rng) {
  let r = rng.next(WEIGHT_TOTAL);
  for (const [sym, w] of Object.entries(SYMBOL_WEIGHTS)) {
    if (r < w) return /** @type {import('./types.js').Symbol} */ (sym);
    r -= w;
  }
  throw new Error('pickSymbol fell through');
}

/**
 * @param {import('./types.js').Rng} rng
 * @returns {import('./types.js').Grid}
 */
export function generateGrid(rng) {
  const reels = [[], [], [], [], []];
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 3; row++) {
      reels[col][row] = pickSymbol(rng);
    }
  }
  return { reels, rows: 3, cols: 5 };
}

/**
 * @param {import('./types.js').Grid} grid
 * @param {import('./types.js').Payline} payline
 * @param {typeof payoutFor} payoutForFn
 * @returns {import('./types.js').Win | null}
 */
export function evaluateLine(grid, payline, payoutForFn) {
  const path = payline.rows.map((row, col) => grid.reels[col][row]);

  // Candidate A: leading wild run (count of consecutive wilds from reel 0).
  let wildCount = 0;
  for (const sym of path) {
    if (sym === 'wild') wildCount++;
    else break;
  }

  // Candidate B: substituted target run — target is path[0], or the first
  // non-wild in path when path[0] is wild. Walk extends while symbol matches
  // target OR is a wild.
  let target = path[0];
  if (target === 'wild') {
    const firstNonWild = path.find(s => s !== 'wild');
    target = firstNonWild ?? 'wild';
  }
  let subCount = 0;
  for (const sym of path) {
    if (sym === target || sym === 'wild') subCount++;
    else break;
  }

  // Pick whichever candidate pays more. Tie-breaks favor the substituted run
  // (natural, since wild runs only apply when path[0] is wild).
  const wildPay = wildCount >= 3 ? payoutForFn('wild', wildCount) : 0;
  const subPay = subCount >= 3 ? payoutForFn(target, subCount) : 0;

  if (wildPay === 0 && subPay === 0) return null;
  if (wildPay > subPay) {
    return { lineId: payline.id, symbol: 'wild', count: wildCount, payout: wildPay };
  }
  return { lineId: payline.id, symbol: target, count: subCount, payout: subPay };
}

/**
 * @param {import('./types.js').GameState} state
 * @param {number} bet
 * @param {import('./types.js').Rng} rng
 * @returns {import('./types.js').SpinResult}
 */
export function spin(state, bet, rng) {
  if (!Number.isInteger(bet) || bet < 1 || bet > state.balance) {
    throw new Error('invalid bet');
  }
  const grid = generateGrid(rng);
  const wins = PAYLINES
    .map(pl => evaluateLine(grid, pl, payoutFor))
    .filter(Boolean)
    .map(w => ({ ...w, payout: w.payout * bet }));
  const payout = wins.reduce((s, w) => s + w.payout, 0);
  const newBalance = state.balance - bet + payout;
  const spinResult = {
    grid, wins, payout, newBalance,
    newState: { balance: newBalance, bet, lastSpin: null },
  };
  spinResult.newState.lastSpin = spinResult;
  return spinResult;
}

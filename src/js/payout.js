/**
 * Payout Module
 * Handles payout calculation for winning paylines
 */

import { getSymbolById } from './reels.js';
import { getPaylineSymbols } from './paylines.js';

/** Number of reels in the grid */
const REEL_COUNT = 5;

/** Number of visible rows per reel */
const ROW_COUNT = 3;

/** Minimum consecutive matching symbols required for a payout */
const MIN_WIN_MATCH = 3;

/**
 * Divisor used in the payout formula — equal to REEL_COUNT so that
 * a symbol's `value` represents the 5-of-a-kind payout and shorter
 * matches are scaled proportionally.
 */
const PAYOUT_DIVISOR = 5;

/** Free-spin awards for scatter counts of 5, 4, or 3 */
const FREE_SPINS_FOR_FIVE_SCATTERS = 25;
const FREE_SPINS_FOR_FOUR_SCATTERS = 15;
const FREE_SPINS_FOR_THREE_SCATTERS = 10;

/** Minimum scatter count required to trigger the free-spin bonus */
const MIN_SCATTER_TO_TRIGGER = 3;

/**
 * Evaluates a single payline and returns both the payout and the number of
 * consecutive matching symbols from the leftmost reel. Sibling to
 * {@link calculatePayout} but surfaces the match count so callers
 * (e.g. payline highlight rendering) don't have to recompute it.
 *
 * @param {string[]} paylineSymbols - Array of 5 symbol IDs along the payline
 * @param {number} betAmount - The per-line bet amount
 * @returns {{ payout: number, matchCount: number }}
 *   `payout` is the payout amount (0 if no win). `matchCount` is the number
 *   of consecutive matching symbols from reel 0 on winning lines, 0 otherwise.
 * @throws {Error} If parameters are invalid
 */
export function evaluatePayline(paylineSymbols, betAmount) {
  // Validate payline symbols array
  if (!Array.isArray(paylineSymbols) || paylineSymbols.length !== REEL_COUNT) {
    throw new Error('paylineSymbols must be an array of exactly 5 symbol IDs');
  }

  // Validate bet amount
  if (typeof betAmount !== 'number' || betAmount <= 0) {
    throw new Error('betAmount must be a positive number');
  }

  // Validate all symbols exist
  for (let i = 0; i < paylineSymbols.length; i++) {
    const symbol = getSymbolById(paylineSymbols[i]);
    if (!symbol) {
      throw new Error(`Unknown symbol ID: ${paylineSymbols[i]}`);
    }
  }

  // Find the base symbol (first non-wild symbol)
  let baseSymbol = null;
  for (const symbolId of paylineSymbols) {
    const symbol = getSymbolById(symbolId);
    if (!symbol.isWild) {
      baseSymbol = symbol;
      break;
    }
  }

  // If all symbols are wild, use the highest value
  if (!baseSymbol) {
    baseSymbol = { id: 'WILD', value: 1000 };
  }

  // Count consecutive matching symbols from the left
  let matchCount = 0;
  for (const symbolId of paylineSymbols) {
    const symbol = getSymbolById(symbolId);

    // Symbol matches if it's the base symbol or a wild
    if (symbol.id === baseSymbol.id || symbol.isWild) {
      matchCount++;
    } else {
      break; // Stop at first non-matching symbol
    }
  }

  // Need at least MIN_WIN_MATCH matching symbols for a win
  if (matchCount < MIN_WIN_MATCH) {
    return { payout: 0, matchCount: 0 };
  }

  // Calculate payout: (baseValue / PAYOUT_DIVISOR) × matchCount × betAmount
  // Ensures 5-of-a-kind pays the full value, scaled proportionally.
  const payout = (baseSymbol.value / PAYOUT_DIVISOR) * matchCount * betAmount;

  return { payout, matchCount };
}

/**
 * Calculates the payout for a single payline based on matching symbols.
 * Thin wrapper over {@link evaluatePayline} preserved for backwards
 * compatibility with tests and any caller that only needs the amount.
 *
 * @param {string[]} paylineSymbols - Array of 5 symbol IDs along the payline
 * @param {number} betAmount - The bet amount for this payline
 * @returns {number} The payout amount (0 if no win)
 * @throws {Error} If parameters are invalid
 */
export function calculatePayout(paylineSymbols, betAmount) {
  return evaluatePayline(paylineSymbols, betAmount).payout;
}

/**
 * Checks for scatter symbol trigger and calculates free spins
 * 3+ Neural Chip symbols anywhere on reels trigger free spins bonus
 * @param {string[][]} matrix - 2D symbol matrix where each inner array is a reel column
 * @returns {number} Number of free spins to award (0 if no trigger)
 * @throws {Error} If matrix is invalid
 */
export function checkScatterTrigger(matrix) {
  // Validate matrix
  if (!Array.isArray(matrix) || matrix.length !== REEL_COUNT) {
    throw new Error('Matrix must be an array of 5 reels');
  }

  for (let i = 0; i < matrix.length; i++) {
    if (!Array.isArray(matrix[i]) || matrix[i].length < ROW_COUNT) {
      throw new Error(`Reel ${i} must have at least 3 rows`);
    }
  }

  // Count NEURAL_CHIP symbols anywhere on the matrix
  let scatterCount = 0;
  for (let reelIndex = 0; reelIndex < matrix.length; reelIndex++) {
    for (let rowIndex = 0; rowIndex < matrix[reelIndex].length; rowIndex++) {
      if (matrix[reelIndex][rowIndex] === 'NEURAL_CHIP') {
        scatterCount++;
      }
    }
  }

  // Return free spins based on scatter count
  if (scatterCount >= REEL_COUNT) {
    return FREE_SPINS_FOR_FIVE_SCATTERS;
  }
  if (scatterCount >= MIN_SCATTER_TO_TRIGGER + 1) {
    return FREE_SPINS_FOR_FOUR_SCATTERS;
  }
  if (scatterCount >= MIN_SCATTER_TO_TRIGGER) {
    return FREE_SPINS_FOR_THREE_SCATTERS;
  }

  // No bonus if fewer than 3 scatters
  return 0;
}

/**
 * @typedef {Object} WinningPayline
 * @property {number} index - 0-based payline index in the PAYLINES array
 * @property {number} matchCount - Number of consecutive matching symbols from reel 0
 */

/**
 * Evaluates all paylines and calculates total payout.
 *
 * @param {string[][]} matrix - 2D symbol matrix where each inner array is a reel column
 * @param {number[][]} paylines - Array of paylines, each payline is 5 row indices
 * @param {number} betAmount - Bet amount per payline
 * @returns {{ totalPayout: number, winningPaylines: WinningPayline[] }}
 *   Winners carry their `index` and `matchCount` so callers (e.g.
 *   payline highlight rendering) can truncate lines at the match boundary.
 * @throws {Error} If parameters are invalid
 */
export function evaluateAllPaylines(matrix, paylines, betAmount) {
  // Validate parameters
  if (!Array.isArray(matrix)) {
    throw new Error('matrix must be an array');
  }

  if (!Array.isArray(paylines)) {
    throw new Error('paylines must be an array');
  }

  if (typeof betAmount !== 'number' || betAmount <= 0) {
    throw new Error('betAmount must be a positive number');
  }

  let totalPayout = 0;
  const winningPaylines = [];

  // Evaluate each payline
  for (let i = 0; i < paylines.length; i++) {
    const payline = paylines[i];

    // Get symbols along this payline
    const paylineSymbols = getPaylineSymbols(matrix, payline);

    // Evaluate this payline (single pass: match count + payout)
    const { payout, matchCount } = evaluatePayline(paylineSymbols, betAmount);

    if (payout > 0) {
      totalPayout += payout;
      winningPaylines.push({ index: i, matchCount });
    }
  }

  return {
    totalPayout,
    winningPaylines,
  };
}

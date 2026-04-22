/**
 * Payout Module
 * Handles payout calculation for winning paylines
 */

import { getSymbolById } from './reels.js';
import { getPaylineSymbols } from './paylines.js';

/**
 * Calculates the payout for a single payline based on matching symbols
 * @param {string[]} paylineSymbols - Array of 5 symbol IDs along the payline
 * @param {number} betAmount - The bet amount for this payline
 * @returns {number} The payout amount (0 if no win)
 * @throws {Error} If parameters are invalid
 */
export function calculatePayout(paylineSymbols, betAmount) {
  // Validate payline symbols array
  if (!Array.isArray(paylineSymbols) || paylineSymbols.length !== 5) {
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

  // Need at least 3 matching symbols for a win
  if (matchCount < 3) {
    return 0;
  }

  // Calculate payout based on match count
  // Formula: (baseValue / 5) × matchCount × betAmount
  // This ensures 5-of-a-kind pays the full value, scaled proportionally
  const baseValue = baseSymbol.value;
  const payout = (baseValue / 5) * matchCount * betAmount;

  return payout;
}

/**
 * Evaluates all paylines and calculates total payout
 * @param {string[][]} matrix - 2D symbol matrix where each inner array is a reel column
 * @param {number[][]} paylines - Array of paylines, each payline is 5 row indices
 * @param {number} betAmount - Bet amount per payline
 * @returns {{totalPayout: number, winningPaylines: number[]}} Object containing total payout and winning payline indices
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

    // Calculate payout for this payline
    const payout = calculatePayout(paylineSymbols, betAmount);

    // If this payline wins, add to total and track the index
    if (payout > 0) {
      totalPayout += payout;
      winningPaylines.push(i);
    }
  }

  return {
    totalPayout,
    winningPaylines,
  };
}

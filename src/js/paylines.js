/**
 * Paylines Module
 * Defines the 25 fixed paylines for a 5-reel × 3-row slot machine grid
 */

/**
 * @typedef {number[]} Payline
 * Array of 5 row indices (0=top, 1=middle, 2=bottom) indicating which row to read on each reel
 */

/**
 * All 25 paylines for the DATA HEIST slot machine
 * Grid layout:
 *   Reel: 0  1  2  3  4
 *   Row 0: □  □  □  □  □  (top)
 *   Row 1: □  □  □  □  □  (middle)
 *   Row 2: □  □  □  □  □  (bottom)
 *
 * @type {Payline[]}
 */
export const PAYLINES = [
  // Payline 1-3: Straight horizontal lines
  [1, 1, 1, 1, 1], // Line 1: Middle row (straight)
  [0, 0, 0, 0, 0], // Line 2: Top row (straight)
  [2, 2, 2, 2, 2], // Line 3: Bottom row (straight)

  // Payline 4-5: V-shapes
  [0, 1, 2, 1, 0], // Line 4: V-shape (top to bottom to top)
  [2, 1, 0, 1, 2], // Line 5: Inverted V-shape (bottom to top to bottom)

  // Payline 6-9: Zigzag patterns
  [0, 1, 0, 1, 0], // Line 6: Zigzag starting top
  [1, 0, 1, 0, 1], // Line 7: Zigzag starting middle
  [2, 1, 2, 1, 2], // Line 8: Zigzag starting bottom
  [1, 2, 1, 2, 1], // Line 9: Zigzag starting middle-bottom

  // Payline 10-13: Diagonal and stepped patterns
  [0, 0, 1, 2, 2], // Line 10: Top-left to bottom-right diagonal
  [2, 2, 1, 0, 0], // Line 11: Bottom-left to top-right diagonal
  [1, 0, 0, 0, 1], // Line 12: Dip to top
  [1, 2, 2, 2, 1], // Line 13: Dip to bottom

  // Payline 14-17: W and M shapes
  [1, 1, 0, 1, 1], // Line 14: Middle row with center top-spike
  [1, 1, 2, 1, 1], // Line 15: Middle row with center bottom-spike
  [0, 2, 0, 2, 0], // Line 16: Wide W-shape
  [2, 0, 2, 0, 2], // Line 17: Wide M-shape

  // Payline 18-21: Stepped patterns
  [0, 0, 0, 1, 2], // Line 18: Step down right
  [2, 2, 2, 1, 0], // Line 19: Step up right
  [0, 1, 2, 2, 2], // Line 20: Step down left
  [2, 1, 0, 0, 0], // Line 21: Step up left

  // Payline 22-25: Complex zigzag patterns
  [1, 0, 2, 0, 1], // Line 22: Complex zigzag 1
  [1, 2, 0, 2, 1], // Line 23: Complex zigzag 2
  [0, 2, 1, 2, 0], // Line 24: V-bottom-middle
  [2, 0, 1, 0, 2], // Line 25: Inverted V-top-middle
];

/**
 * Extracts the symbols along a given payline from a symbol matrix
 * @param {string[][]} matrix - 2D symbol matrix where each inner array represents a reel column
 *                               Matrix format: matrix[reelIndex][rowIndex]
 * @param {Payline} payline - Array of 5 row indices indicating which row to read on each reel
 * @returns {string[]} Array of 5 symbol IDs along the payline
 * @throws {Error} If matrix or payline is invalid
 */
export function getPaylineSymbols(matrix, payline) {
  // Validate matrix
  if (!Array.isArray(matrix) || matrix.length !== 5) {
    throw new Error('Matrix must be an array of 5 reels');
  }

  // Validate each reel has at least 3 rows
  for (let i = 0; i < matrix.length; i++) {
    if (!Array.isArray(matrix[i]) || matrix[i].length < 3) {
      throw new Error(`Reel ${i} must have at least 3 rows`);
    }
  }

  // Validate payline
  if (!Array.isArray(payline) || payline.length !== 5) {
    throw new Error('Payline must be an array of 5 row indices');
  }

  // Validate each row index is 0, 1, or 2
  for (let i = 0; i < payline.length; i++) {
    const rowIndex = payline[i];
    if (typeof rowIndex !== 'number' || rowIndex < 0 || rowIndex > 2) {
      throw new Error(`Payline row index at position ${i} must be 0, 1, or 2`);
    }
  }

  // Extract symbols along the payline
  const symbols = [];
  for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
    const rowIndex = payline[reelIndex];
    const symbol = matrix[reelIndex][rowIndex];
    symbols.push(symbol);
  }

  return symbols;
}

/**
 * UI Module
 * Handles rendering of game UI elements including symbols, controls, and displays
 */

import { getSymbolById } from './reels.js';

/**
 * Unicode character representations for each symbol
 * @type {Object<string, string>}
 */
const SYMBOL_UNICODE = {
  WILD: 'W',
  GOLD_KANJI: '金',
  CHROME_SKULL: '☠',
  CYBER_IRIS: '◎',
  KATANA: '⚔',
  NEON_7: '7',
  DIAMOND: '◆',
  BELL: '♦',
  BAR: '▬',
  CHERRY: '●',
};

/**
 * CSS variable names for neon colors for each symbol
 * Maps symbol ID to CSS custom property name
 * @type {Object<string, string>}
 */
const SYMBOL_COLOR_VARS = {
  WILD: '--color-neon-pink',
  GOLD_KANJI: '--color-symbol-gold',
  CHROME_SKULL: '--color-neon-purple',
  CYBER_IRIS: '--color-neon-cyan',
  KATANA: '--color-neon-cyan',
  NEON_7: '--color-neon-yellow-green',
  DIAMOND: '--color-neon-cyan',
  BELL: '--color-neon-yellow-green',
  BAR: '--color-text-win',
  CHERRY: '--color-text-loss',
};

/**
 * Renders a symbol matrix to the DOM
 * Updates all cells in the 5×3 reel grid with styled symbol divs
 * @param {string[][]} matrix - 2D array of symbol IDs where matrix[reelIndex][rowIndex]
 * @returns {void}
 * @throws {Error} If matrix is invalid or DOM elements don't exist
 */
export function renderSymbolMatrix(matrix) {
  // Validate matrix
  if (!Array.isArray(matrix) || matrix.length !== 5) {
    throw new Error('Matrix must be an array of 5 reels');
  }

  for (let i = 0; i < matrix.length; i++) {
    if (!Array.isArray(matrix[i]) || matrix[i].length !== 3) {
      throw new Error(`Reel ${i} must have exactly 3 rows`);
    }
  }

  // Get the reels grid container
  const reelsGrid = document.getElementById('reels-grid');
  if (!reelsGrid) {
    throw new Error('Reel grid container (#reels-grid) not found in DOM');
  }

  // Get all reel columns
  const reelColumns = reelsGrid.querySelectorAll('.reel-column');
  if (reelColumns.length !== 5) {
    throw new Error('Expected 5 reel columns in the DOM');
  }

  // Iterate through each reel and each row
  for (let reelIndex = 0; reelIndex < matrix.length; reelIndex++) {
    const reelColumn = reelColumns[reelIndex];
    const reel = matrix[reelIndex];

    // Get all cells in this reel column
    const cells = reelColumn.querySelectorAll('.reel-cell');
    if (cells.length !== 3) {
      throw new Error(`Reel column ${reelIndex} should have 3 cells`);
    }

    // Render each symbol in the reel
    for (let rowIndex = 0; rowIndex < reel.length; rowIndex++) {
      const symbolId = reel[rowIndex];
      const cell = cells[rowIndex];

      // Get symbol metadata
      const symbol = getSymbolById(symbolId);
      if (!symbol) {
        throw new Error(`Unknown symbol ID: ${symbolId}`);
      }

      // Clear the cell
      cell.innerHTML = '';
      cell.className = 'reel-cell';

      // Add symbol-specific class for animation targeting
      cell.classList.add(`symbol-${symbol.id.toLowerCase()}`);

      // Get the Unicode character and color variable
      const unicodeChar = SYMBOL_UNICODE[symbolId];
      const colorVar = SYMBOL_COLOR_VARS[symbolId];

      if (!unicodeChar || !colorVar) {
        throw new Error(`Missing Unicode or color mapping for symbol: ${symbolId}`);
      }

      // Create the symbol element
      const symbolDiv = document.createElement('div');
      symbolDiv.className = 'symbol';
      symbolDiv.setAttribute('aria-label', symbol.displayName);
      symbolDiv.textContent = unicodeChar;

      // Get the color value from CSS variable
      const colorValue = getComputedStyle(document.documentElement)
        .getPropertyValue(colorVar)
        .trim();

      // Apply color-specific styling
      symbolDiv.style.color = colorValue;
      symbolDiv.style.textShadow = `0 0 10px ${colorValue}`;
      cell.style.borderColor = colorValue;
      cell.style.boxShadow = `0 0 8px ${colorValue}`;

      // Append symbol to cell
      cell.appendChild(symbolDiv);
    }
  }
}

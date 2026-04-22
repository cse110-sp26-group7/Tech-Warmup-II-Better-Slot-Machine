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
 * Updates the balance display with the current player balance
 * @param {number} balance - The current balance in Crypto-Credits
 * @returns {void}
 * @throws {Error} If balance is not a valid number or DOM element not found
 */
export function renderBalance(balance) {
  if (typeof balance !== 'number' || balance < 0) {
    throw new Error('Balance must be a non-negative number');
  }

  const balanceDisplay = document.getElementById('balance-display');
  if (!balanceDisplay) {
    throw new Error('Balance display element (#balance-display) not found in DOM');
  }

  balanceDisplay.textContent = Math.floor(balance).toString();
}

/**
 * Updates the bet display with the current bet amount
 * @param {number} bet - The current bet amount in Crypto-Credits
 * @returns {void}
 * @throws {Error} If bet is not a valid number or DOM element not found
 */
export function renderBet(bet) {
  if (typeof bet !== 'number' || bet <= 0) {
    throw new Error('Bet must be a positive number');
  }

  const betDisplay = document.getElementById('bet-display');
  if (!betDisplay) {
    throw new Error('Bet display element (#bet-display) not found in DOM');
  }

  betDisplay.textContent = Math.floor(bet).toString();
}

/**
 * Shows or hides the win amount display
 * Displays in neon green if amount > 0, hides if 0
 * @param {number} amount - The win amount to display (0 to hide)
 * @returns {void}
 * @throws {Error} If amount is not a valid number or DOM elements not found
 */
export function renderWin(amount) {
  if (typeof amount !== 'number' || amount < 0) {
    throw new Error('Win amount must be a non-negative number');
  }

  const winDisplay = document.getElementById('win-display');
  const winAmount = document.getElementById('win-amount');

  if (!winDisplay || !winAmount) {
    throw new Error('Win display elements not found in DOM');
  }

  if (amount > 0) {
    winAmount.textContent = Math.floor(amount).toString();
    winDisplay.classList.add('active');
  } else {
    winDisplay.classList.remove('active');
    winAmount.textContent = '0';
  }
}

/**
 * Draws neon pink highlights connecting winning symbols across reels
 * Creates SVG lines from each winning payline
 * @param {number[]} winningPaylineIndices - Array of winning payline indices (0-24)
 * @param {number[]} paylines - Array of payline definitions (each is array of 5 row indices)
 * @returns {void}
 * @throws {Error} If parameters are invalid or DOM elements not found
 */
export function renderPaylineHighlight(winningPaylineIndices, paylines) {
  if (!Array.isArray(winningPaylineIndices)) {
    throw new Error('Winning payline indices must be an array');
  }

  if (!Array.isArray(paylines) || paylines.length !== 25) {
    throw new Error('Paylines must be an array of 25 paylines');
  }

  // Remove existing highlight overlay if present
  const existingOverlay = document.getElementById('payline-highlight-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // If no winning paylines, return early
  if (winningPaylineIndices.length === 0) {
    return;
  }

  // Get the reel area to determine dimensions for SVG
  const reelArea = document.querySelector('.reel-area');
  const reelsGrid = document.getElementById('reels-grid');

  if (!reelArea || !reelsGrid) {
    throw new Error('Reel area elements not found in DOM');
  }

  // Create SVG overlay
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'payline-highlight-overlay';
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.pointerEvents = 'none';

  const reelAreaRect = reelArea.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${reelAreaRect.width} ${reelAreaRect.height}`);

  // Get reel cells for positioning
  const reelCells = reelsGrid.querySelectorAll('.reel-cell');
  const cellsByReel = [];

  for (let i = 0; i < 5; i++) {
    cellsByReel[i] = [];
    for (let j = 0; j < 3; j++) {
      cellsByReel[i][j] = reelCells[i * 3 + j];
    }
  }

  // Draw lines for each winning payline
  winningPaylineIndices.forEach((paylineIndex) => {
    if (paylineIndex < 0 || paylineIndex >= paylines.length) {
      return;
    }

    const payline = paylines[paylineIndex];
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    const points = [];

    // Calculate center points for each reel on this payline
    for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
      const rowIndex = payline[reelIndex];
      const cell = cellsByReel[reelIndex][rowIndex];

      if (cell) {
        const cellRect = cell.getBoundingClientRect();
        const x = cellRect.left - reelAreaRect.left + cellRect.width / 2;
        const y = cellRect.top - reelAreaRect.top + cellRect.height / 2;
        points.push(`${x},${y}`);
      }
    }

    polyline.setAttribute('points', points.join(' '));
    polyline.setAttribute('stroke', 'var(--color-neon-pink)');
    polyline.setAttribute('stroke-width', '3');
    polyline.setAttribute('fill', 'none');
    polyline.style.filter = 'drop-shadow(0 0 8px var(--color-neon-pink))';

    svg.appendChild(polyline);
  });

  // Position SVG relative to reels-grid
  reelsGrid.parentElement.style.position = 'relative';
  reelsGrid.parentElement.appendChild(svg);
}

/**
 * Shows or hides the free spins counter
 * @param {number} count - Number of free spins remaining (0 to hide)
 * @returns {void}
 * @throws {Error} If count is not a valid number or DOM elements not found
 */
export function renderFreeSpinsCounter(count) {
  if (typeof count !== 'number' || count < 0 || !Number.isInteger(count)) {
    throw new Error('Free spins count must be a non-negative integer');
  }

  const counter = document.getElementById('free-spins-counter');
  const countDisplay = document.getElementById('free-spins-count');

  if (!counter || !countDisplay) {
    throw new Error('Free spins counter elements not found in DOM');
  }

  if (count > 0) {
    countDisplay.textContent = count.toString();
    counter.style.display = 'block';
  } else {
    counter.style.display = 'none';
  }
}

/**
 * Enables or disables the spin button and updates its label
 * @param {boolean} isSpinning - Whether the reels are currently spinning
 * @returns {void}
 * @throws {Error} If isSpinning is not a boolean or DOM element not found
 */
export function setSpinButtonState(isSpinning) {
  if (typeof isSpinning !== 'boolean') {
    throw new Error('isSpinning must be a boolean');
  }

  const spinBtn = document.getElementById('spin-btn');
  if (!spinBtn) {
    throw new Error('Spin button (#spin-btn) not found in DOM');
  }

  if (isSpinning) {
    spinBtn.disabled = true;
    spinBtn.textContent = 'SPINNING...';
  } else {
    spinBtn.disabled = false;
    spinBtn.textContent = 'SPIN';
  }
}

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

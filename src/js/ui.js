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
  NEURAL_CHIP: '⚡',
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
  NEURAL_CHIP: '--color-neon-yellow-green',
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
 * Celebrates a win with animations scaled to win size
 * Small (1-2x bet): symbol pulse + quick count-up
 * Medium (3-9x bet): payline flash + symbol pulse + dramatic count-up
 * Big (10x+ bet): full-screen overlay with glitch effect + data-rain
 * @param {number} amount - The win payout amount
 * @param {number[]} winningPaylineIndices - Array of winning payline indices
 * @param {number} currentBet - Current bet amount (for calculating multiplier)
 * @returns {Promise<void>} Promise that resolves when celebration completes
 * @throws {Error} If parameters are invalid
 */
export function celebrateWin(amount, winningPaylineIndices, currentBet) {
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Win amount must be a positive number');
  }

  if (!Array.isArray(winningPaylineIndices)) {
    throw new Error('Winning payline indices must be an array');
  }

  if (typeof currentBet !== 'number' || currentBet <= 0) {
    throw new Error('Current bet must be a positive number');
  }

  return new Promise((resolve) => {
    // Calculate win multiplier
    const multiplier = amount / currentBet;

    // Determine win size and apply celebration
    if (multiplier >= 10) {
      celebrateBigWin(amount, resolve);
    } else if (multiplier >= 3) {
      celebrateMediumWin(amount, resolve);
    } else {
      celebrateSmallWin(amount, resolve);
    }
  });
}

/**
 * Celebrates a small win with symbol pulse and quick count-up
 * @private
 * @param {number} amount - Win amount
 * @param {Function} resolve - Promise resolve callback
 * @returns {void}
 */
function celebrateSmallWin(amount, resolve) {
  const reelsGrid = document.getElementById('reels-grid');
  const symbols = reelsGrid.querySelectorAll('.symbol');

  // Add pulse animation class
  symbols.forEach((symbol) => {
    symbol.classList.add('symbol-pulse-animate');
  });

  // Create CSS animation class dynamically
  const style = document.createElement('style');
  style.textContent = `
    .symbol-pulse-animate {
      animation: symbolPulse 0.6s ease-in-out;
    }
  `;
  document.head.appendChild(style);

  // Count up the win amount
  countUpWin(amount, 600);

  // Remove animation after it completes
  setTimeout(() => {
    symbols.forEach((symbol) => {
      symbol.classList.remove('symbol-pulse-animate');
    });
    style.remove();
    resolve();
  }, 700);
}

/**
 * Celebrates a medium win with payline flash, symbol pulse, and dramatic count-up
 * @private
 * @param {number} amount - Win amount
 * @param {Function} resolve - Promise resolve callback
 * @returns {void}
 */
function celebrateMediumWin(amount, resolve) {
  const reelsGrid = document.getElementById('reels-grid');
  const symbols = reelsGrid.querySelectorAll('.symbol');
  const paylineOverlay = document.getElementById('payline-highlight-overlay');

  // Add animations
  symbols.forEach((symbol) => {
    symbol.classList.add('symbol-pulse-animate');
  });

  if (paylineOverlay) {
    paylineOverlay.classList.add('payline-flash-animate');
  }

  // Create CSS animation classes dynamically
  const style = document.createElement('style');
  style.textContent = `
    .symbol-pulse-animate {
      animation: symbolPulse 0.5s ease-in-out;
    }
    .payline-flash-animate polyline {
      animation: paylineFlash 0.8s ease-in-out;
    }
  `;
  document.head.appendChild(style);

  // Dramatic count-up
  countUpWin(amount, 1200);

  // Remove animations after they complete
  setTimeout(() => {
    symbols.forEach((symbol) => {
      symbol.classList.remove('symbol-pulse-animate');
    });
    if (paylineOverlay) {
      paylineOverlay.classList.remove('payline-flash-animate');
    }
    style.remove();
    resolve();
  }, 1400);
}

/**
 * Celebrates a big win with full-screen overlay and glitch effect
 * @private
 * @param {number} amount - Win amount
 * @param {Function} resolve - Promise resolve callback
 * @returns {void}
 */
function celebrateBigWin(amount, resolve) {
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.className = 'big-win-overlay';

  // Create data-rain background
  const dataRain = document.createElement('div');
  dataRain.className = 'data-rain';

  // Generate falling data characters
  for (let i = 0; i < 20; i++) {
    const rainChar = document.createElement('div');
    rainChar.className = 'rain-char';
    rainChar.textContent = ['0', '1', '$', '#', '@', '%'].random
      ? ['0', '1', '$', '#', '@', '%'][Math.floor(Math.random() * 6)]
      : '█';
    rainChar.style.left = `${Math.random() * 100}%`;
    rainChar.style.animationDelay = `${Math.random() * 0.5}s`;
    rainChar.style.animationDuration = `${1.5 + Math.random() * 0.5}s`;
    rainChar.style.animation = 'dataRain 2s linear forwards';
    dataRain.appendChild(rainChar);
  }

  // Create content box
  const content = document.createElement('div');
  content.className = 'big-win-content';

  const text = document.createElement('div');
  text.className = 'big-win-text';
  text.textContent = 'SYSTEM BREACH';

  const subText = document.createElement('div');
  subText.style.fontSize = '1.5rem';
  subText.style.color = 'var(--color-neon-yellow-green)';
  subText.style.marginBottom = '2rem';
  subText.textContent = 'BIG WIN';

  const amountDisplay = document.createElement('div');
  amountDisplay.className = 'big-win-amount';
  amountDisplay.textContent = '0';

  content.appendChild(text);
  content.appendChild(subText);
  content.appendChild(amountDisplay);

  // Add glitch animation to content
  const style = document.createElement('style');
  style.textContent = `
    .big-win-content.glitch {
      animation: glitchBorder 0.6s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);

  content.classList.add('glitch');

  overlay.appendChild(dataRain);
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // Count up the big win amount
  const startTime = Date.now();
  const duration = 2000;

  const animateCount = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentAmount = Math.floor(amount * progress);
    amountDisplay.textContent = currentAmount.toString();

    if (progress < 1) {
      requestAnimationFrame(animateCount);
    }
  };

  animateCount();

  // Remove overlay after celebration
  setTimeout(() => {
    content.classList.remove('glitch');
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease-out';

    setTimeout(() => {
      overlay.remove();
      style.remove();
      resolve();
    }, 500);
  }, 3000);
}

/**
 * Animates count-up of win amount
 * @private
 * @param {number} amount - Final amount to count to
 * @param {number} duration - Animation duration in ms
 * @returns {void}
 */
function countUpWin(amount, duration) {
  const winAmount = document.getElementById('win-amount');
  if (!winAmount) {
    return;
  }

  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentAmount = Math.floor(amount * progress);
    winAmount.textContent = currentAmount.toString();

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  animate();
}

/**
 * Animates the reel spin with staggered stops and glow effects
 * Each reel spins for 800ms total, stopping left-to-right with 150ms stagger
 * Returns a Promise that resolves when all reels have stopped
 * @returns {Promise<void>} Promise that resolves when animation completes
 * @throws {Error} If reel elements not found in DOM
 */
export function animateReelSpin() {
  return new Promise((resolve) => {
    const reelsGrid = document.getElementById('reels-grid');
    if (!reelsGrid) {
      throw new Error('Reel grid container (#reels-grid) not found in DOM');
    }

    const reelColumns = reelsGrid.querySelectorAll('.reel-column');
    if (reelColumns.length !== 5) {
      throw new Error('Expected 5 reel columns in the DOM');
    }

    // Configuration
    const spinDuration = 800; // ms
    const staggerDelay = 150; // ms between reel stops
    const glowDuration = 300; // ms

    // Create promises for each reel's animation completion
    const reelPromises = Array.from(reelColumns).map((column, index) => {
      return new Promise((reelResolve) => {
        const delay = index * staggerDelay;

        // Set up the spin animation with delay
        column.style.animation = `reelSpin ${spinDuration}ms ease-in-out ${delay}ms forwards`;

        // When spin animation ends, trigger glow
        const handleSpinEnd = () => {
          column.removeEventListener('animationend', handleSpinEnd);

          // Apply glow effect
          column.style.animation = `reelGlow ${glowDuration}ms ease-in-out forwards`;

          // Wait for glow to finish
          const handleGlowEnd = () => {
            column.removeEventListener('animationend', handleGlowEnd);
            column.style.animation = 'none';
            column.style.transform = 'translateY(0)';
            column.style.filter = 'blur(0px)';
            reelResolve();
          };

          column.addEventListener('animationend', handleGlowEnd, { once: true });
        };

        column.addEventListener('animationend', handleSpinEnd, { once: true });
      });
    });

    // Resolve main promise when all reels are done
    Promise.all(reelPromises).then(resolve);
  });
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

/**
 * Data Heist - Main Entry Point
 * Orchestrates the spin flow and game initialization
 */

import * as State from './state.js';
import * as RNG from './rng.js';
import { REEL_STRIPS } from './reels.js';
import { PAYLINES } from './paylines.js';
import { evaluateAllPaylines } from './payout.js';
import {
  animateReelSpin,
  celebrateWin,
  renderSymbolMatrix,
  renderBalance,
  renderBet,
  renderWin,
  renderPaylineHighlight,
  renderFreeSpinsCounter,
  setSpinButtonState,
} from './ui.js';

/**
 * Global game state
 * @type {State.GameState}
 */
let gameState = State.INITIAL_STATE;

/**
 * Increases the bet by 1 (up to 100 per line)
 * @returns {void}
 */
function increaseBet() {
  const currentBetPerLine = gameState.currentBet / 25;
  if (currentBetPerLine < 100) {
    gameState = State.setBet(gameState, currentBetPerLine + 1);
    renderBet(gameState.currentBet);
    updateBetButtonStates();
  }
}

/**
 * Decreases the bet by 1 (minimum 1 per line)
 * @returns {void}
 */
function decreaseBet() {
  const currentBetPerLine = gameState.currentBet / 25;
  if (currentBetPerLine > 1) {
    gameState = State.setBet(gameState, currentBetPerLine - 1);
    renderBet(gameState.currentBet);
    updateBetButtonStates();
  }
}

/**
 * Sets the bet to maximum (100 per line)
 * @returns {void}
 */
function setMaxBet() {
  gameState = State.setBet(gameState, 100);
  renderBet(gameState.currentBet);
  updateBetButtonStates();
}

/**
 * Updates the disabled state of bet control buttons
 * Buttons are disabled when spinning or at limits
 * @returns {void}
 */
function updateBetButtonStates() {
  const betMinusBtn = document.getElementById('bet-minus-btn');
  const betPlusBtn = document.getElementById('bet-plus-btn');
  const maxBetBtn = document.getElementById('max-bet-btn');
  const currentBetPerLine = gameState.currentBet / 25;

  // Disable when spinning
  const shouldDisableAll = gameState.isSpinning;

  // Disable minus at minimum
  if (betMinusBtn) {
    betMinusBtn.disabled = shouldDisableAll || currentBetPerLine <= 1;
  }

  // Disable plus at maximum
  if (betPlusBtn) {
    betPlusBtn.disabled = shouldDisableAll || currentBetPerLine >= 100;
  }

  // Disable max bet button when spinning or already at max
  if (maxBetBtn) {
    maxBetBtn.disabled = shouldDisableAll || currentBetPerLine >= 100;
  }
}

/**
 * Auto-spin spin count options (in order)
 * @type {number[]}
 */
const AUTO_SPIN_OPTIONS = [0, 10, 25, 50, 100];

/**
 * Toggles auto-spin to the next option in the cycle
 * OFF → 10 → 25 → 50 → 100 → OFF
 * @returns {void}
 */
function toggleAutoSpin() {
  const currentCount = gameState.autoSpinCount;
  const currentIndex = AUTO_SPIN_OPTIONS.indexOf(currentCount);
  const nextIndex = (currentIndex + 1) % AUTO_SPIN_OPTIONS.length;
  const nextCount = AUTO_SPIN_OPTIONS[nextIndex];

  gameState = State.setAutoSpin(gameState, nextCount);
  updateAutoSpinDisplay();

  // If turning on auto-spin, start the spin loop
  if (nextCount > 0 && !gameState.isSpinning) {
    executeSpin();
  }
}

/**
 * Updates the auto-spin counter display
 * Shows remaining spins if active, empty if off
 * @returns {void}
 */
function updateAutoSpinDisplay() {
  const counter = document.getElementById('auto-spin-counter');
  if (!counter) {
    return;
  }

  if (gameState.autoSpinCount > 0) {
    counter.textContent = `(${gameState.autoSpinCount})`;
    counter.style.display = 'inline-block';
  } else {
    counter.textContent = '';
    counter.style.display = 'none';
  }
}

/**
 * Checks if auto-spin should stop based on stop conditions
 * Returns true if any stop condition is met
 * @returns {boolean} True if auto-spin should stop
 */
function shouldStopAutoSpin() {
  // Stop if balance is zero
  if (gameState.balance === 0) {
    return true;
  }

  // Stop if balance drops below current bet
  if (gameState.balance < gameState.currentBet) {
    return true;
  }

  // Note: Bonus round check would go here when bonus features are implemented
  // For now, we'll assume no bonus rounds

  return false;
}

/**
 * Initializes the game when the page loads
 * Sets up event listeners and renders initial UI
 * @returns {void}
 */
function initializeGame() {
  const spinBtn = document.getElementById('spin-btn');
  const betMinusBtn = document.getElementById('bet-minus-btn');
  const betPlusBtn = document.getElementById('bet-plus-btn');
  const maxBetBtn = document.getElementById('max-bet-btn');
  const autoSpinBtn = document.getElementById('auto-spin-btn');

  if (spinBtn) {
    spinBtn.addEventListener('click', executeSpin);
  }

  if (betMinusBtn) {
    betMinusBtn.addEventListener('click', decreaseBet);
  }

  if (betPlusBtn) {
    betPlusBtn.addEventListener('click', increaseBet);
  }

  if (maxBetBtn) {
    maxBetBtn.addEventListener('click', setMaxBet);
  }

  if (autoSpinBtn) {
    autoSpinBtn.addEventListener('click', toggleAutoSpin);
  }

  // Render initial state
  renderBalance(gameState.balance);
  renderBet(gameState.currentBet);
  renderWin(0);
  renderFreeSpinsCounter(0);
  updateBetButtonStates();
  updateAutoSpinDisplay();
}

/**
 * Executes a single spin of the reels
 * Handles the complete spin sequence: validation, RNG, rendering, payouts, and auto-spin
 * @async
 * @returns {Promise<void>}
 */
async function executeSpin() {
  try {
    // Step 1: Validate player can afford the bet
    if (gameState.balance < gameState.currentBet) {
      showErrorMessage('Insufficient balance for this bet!');
      return;
    }

    // Step 2: Deduct bet from balance and update state
    gameState = State.placeBet(gameState, gameState.currentBet);

    // Step 3: Set isSpinning = true and disable spin button
    gameState = State.recordSpin(
      gameState,
      0,
    );
    gameState = { ...gameState, isSpinning: true };
    setSpinButtonState(true);
    updateBetButtonStates();

    // Step 4: Call RNG to generate symbol matrix
    const symbolMatrix = RNG.generateSymbolMatrix(REEL_STRIPS, 3);

    // Step 5: Trigger reel spin animation
    await animateReelSpin();

    // Step 6: Render the resulting symbol matrix
    renderSymbolMatrix(symbolMatrix);

    // Step 7: Evaluate all paylines and calculate total payout
    const { totalPayout, winningPaylines } = evaluateAllPaylines(
      symbolMatrix,
      PAYLINES,
      gameState.currentBet,
    );

    // Draw payline highlights if there are wins
    if (winningPaylines.length > 0) {
      renderPaylineHighlight(winningPaylines, PAYLINES);
    }

    // Step 8: Record spin in state
    gameState = State.recordSpin(gameState, totalPayout);

    // Step 9: If payout > 0, trigger win animation
    if (totalPayout > 0) {
      await celebrateWin(totalPayout, winningPaylines, gameState.currentBet);
    }

    // Step 10: Update displays
    renderBalance(gameState.balance);
    renderWin(totalPayout);
    updateLastSpinsPanel(totalPayout);

    // Step 11: Set isSpinning = false and re-enable spin button
    gameState = { ...gameState, isSpinning: false };
    setSpinButtonState(false);
    updateBetButtonStates();

    // Step 12: If auto-spin is active, check stop conditions and recurse
    if (gameState.autoSpinCount > 0) {
      // Check if auto-spin should stop
      if (shouldStopAutoSpin()) {
        // Stop auto-spin immediately
        gameState = State.setAutoSpin(gameState, 0);
        updateAutoSpinDisplay();

        // Show appropriate message
        if (gameState.balance === 0) {
          showErrorMessage('Auto-spin stopped: Balance is zero!');
        } else if (gameState.balance < gameState.currentBet) {
          showErrorMessage('Auto-spin stopped: Insufficient balance!');
        }
      } else {
        // Decrement counter and recurse
        gameState = State.decrementAutoSpin(gameState);
        updateAutoSpinDisplay();

        // Wait 500ms before next auto-spin
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Recursively call executeSpin for next auto-spin
        await executeSpin();
      }
    }
  } catch (_error) {
    // Handle any errors during spin
    gameState = { ...gameState, isSpinning: false };
    setSpinButtonState(false);
    showErrorMessage('An error occurred during the spin. Please try again.');
  }
}

/**
 * Shows an error message to the player
 * Displays message in neon red and auto-hides after 3 seconds
 * @param {string} message - The error message to display
 * @returns {void}
 */
function showErrorMessage(message) {
  // Create error message element
  const errorMsg = document.createElement('div');
  errorMsg.className = 'error-message';
  errorMsg.textContent = message;
  errorMsg.style.position = 'fixed';
  errorMsg.style.top = '50%';
  errorMsg.style.left = '50%';
  errorMsg.style.transform = 'translate(-50%, -50%)';
  errorMsg.style.backgroundColor = 'var(--color-bg-card)';
  errorMsg.style.border = '2px solid var(--color-text-loss)';
  errorMsg.style.color = 'var(--color-text-loss)';
  errorMsg.style.padding = '2rem';
  errorMsg.style.borderRadius = '8px';
  errorMsg.style.zIndex = '1000';
  errorMsg.style.textShadow = '0 0 10px var(--color-text-loss)';
  errorMsg.style.animation = 'fadeInOut 3s ease-in-out forwards';

  document.body.appendChild(errorMsg);

  // Remove after 3 seconds
  setTimeout(() => {
    errorMsg.remove();
  }, 3000);
}

/**
 * Updates the last spins history panel
 * Adds the latest spin result to the history list
 * @param {number} payout - The payout amount from the spin
 * @returns {void}
 */
function updateLastSpinsPanel(payout) {
  const historyList = document.getElementById('spin-history-list');
  if (!historyList) {
    return;
  }

  // Create history item
  const item = document.createElement('div');
  item.className = 'spin-history__item';
  item.style.padding = '0.5rem';
  item.style.backgroundColor = 'var(--color-bg-panel)';
  item.style.borderRadius = '4px';
  item.style.fontSize = '0.85rem';
  item.style.marginBottom = '0.25rem';

  const payoutText = payout > 0
    ? `Win: +${Math.floor(payout)}`
    : 'Loss: 0';

  item.textContent = payoutText;
  item.style.color = payout > 0
    ? 'var(--color-text-win)'
    : 'var(--color-text-loss)';

  // Add to top of history
  historyList.insertBefore(item, historyList.firstChild);

  // Keep only last 10 spins
  while (historyList.children.length > 10) {
    historyList.removeChild(historyList.lastChild);
  }
}

/**
 * Wires up game event listeners and renders initial UI
 * Called when DOM is ready
 */
document.addEventListener('DOMContentLoaded', initializeGame);

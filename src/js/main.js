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
 * Initializes the game when the page loads
 * Sets up event listeners and renders initial UI
 * @returns {void}
 */
function initializeGame() {
  const spinBtn = document.getElementById('spin-btn');
  const betMinusBtn = document.getElementById('bet-minus-btn');
  const betPlusBtn = document.getElementById('bet-plus-btn');
  const maxBetBtn = document.getElementById('max-bet-btn');

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

  // Render initial state
  renderBalance(gameState.balance);
  renderBet(gameState.currentBet);
  renderWin(0);
  renderFreeSpinsCounter(0);
  updateBetButtonStates();
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

    // Step 12: If auto-spin is active, decrement and recurse
    if (gameState.autoSpinCount > 0) {
      gameState = State.decrementAutoSpin(gameState);

      // Wait 500ms before next auto-spin
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Recursively call executeSpin for next auto-spin
      await executeSpin();
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

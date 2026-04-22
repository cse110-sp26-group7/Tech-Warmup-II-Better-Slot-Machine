/**
 * State Management Module
 * Provides immutable state management for the DATA HEIST slot machine
 */

/**
 * @typedef {Object} GameState
 * @property {number} balance - Player's current balance in Crypto-Credits
 * @property {number} currentBet - Current bet amount per spin
 * @property {boolean} isSpinning - Whether the reels are currently spinning
 * @property {number} lastWin - Payout amount from the last spin
 * @property {number} totalSpins - Total number of spins played
 * @property {number} autoSpinCount - Number of auto-spins remaining (0 = off)
 * @property {number} freeSpinsRemaining - Number of free spins remaining (0 = not in bonus)
 */

/**
 * Initial game state
 * @type {GameState}
 */
export const INITIAL_STATE = {
  balance: 10000,
  currentBet: 25,
  isSpinning: false,
  lastWin: 0,
  totalSpins: 0,
  autoSpinCount: 0,
  freeSpinsRemaining: 0,
};

/**
 * Creates a new state object with the given updates
 * @private
 * @param {GameState} state - Current state
 * @param {Partial<GameState>} updates - Properties to update
 * @returns {GameState} New state object
 */
function updateState(state, updates) {
  return { ...state, ...updates };
}

/**
 * Sets the bet amount without deducting from balance
 * Used for adjusting the bet display before spinning
 * @param {GameState} state - Current game state
 * @param {number} amount - Bet amount to set (per line, will be multiplied by 25 paylines)
 * @returns {GameState} New state with updated currentBet
 * @throws {Error} If bet amount is invalid
 */
export function setBet(state, amount) {
  if (typeof amount !== 'number') {
    throw new Error('Bet amount must be a positive number');
  }

  if (amount < 1 || amount > 100) {
    throw new Error('Bet per line must be between 1 and 100');
  }

  return updateState(state, {
    currentBet: amount * 25,
  });
}

/**
 * Places a bet and deducts it from the balance
 * @param {GameState} state - Current game state
 * @param {number} amount - Bet amount to place
 * @returns {GameState} New state with updated balance and currentBet
 * @throws {Error} If bet amount is invalid or exceeds balance
 */
export function placeBet(state, amount) {
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Bet amount must be a positive number');
  }

  if (amount > state.balance) {
    throw new Error('Insufficient balance for this bet');
  }

  return updateState(state, {
    balance: state.balance - amount,
    currentBet: amount,
    isSpinning: true,
  });
}

/**
 * Records the result of a spin, updating balance with payout
 * @param {GameState} state - Current game state
 * @param {number} payout - Payout amount from the spin
 * @returns {GameState} New state with updated balance, lastWin, and totalSpins
 * @throws {Error} If payout is not a valid number
 */
export function recordSpin(state, payout) {
  if (typeof payout !== 'number' || payout < 0) {
    throw new Error('Payout must be a non-negative number');
  }

  return updateState(state, {
    balance: state.balance + payout,
    lastWin: payout,
    totalSpins: state.totalSpins + 1,
    isSpinning: false,
  });
}

/**
 * Sets the number of auto-spins to perform
 * @param {GameState} state - Current game state
 * @param {number} count - Number of auto-spins to perform (0 to disable)
 * @returns {GameState} New state with updated autoSpinCount
 * @throws {Error} If count is not a valid non-negative integer
 */
export function setAutoSpin(state, count) {
  if (typeof count !== 'number' || count < 0 || !Number.isInteger(count)) {
    throw new Error('Auto-spin count must be a non-negative integer');
  }

  return updateState(state, {
    autoSpinCount: count,
  });
}

/**
 * Decrements the auto-spin counter by 1
 * @param {GameState} state - Current game state
 * @returns {GameState} New state with decremented autoSpinCount (minimum 0)
 */
export function decrementAutoSpin(state) {
  return updateState(state, {
    autoSpinCount: Math.max(0, state.autoSpinCount - 1),
  });
}

/**
 * Sets the number of free spins remaining
 * @param {GameState} state - Current game state
 * @param {number} count - Number of free spins to award
 * @returns {GameState} New state with updated freeSpinsRemaining
 * @throws {Error} If count is not a valid non-negative integer
 */
export function setFreeSpins(state, count) {
  if (typeof count !== 'number' || count < 0 || !Number.isInteger(count)) {
    throw new Error('Free spins count must be a non-negative integer');
  }

  return updateState(state, {
    freeSpinsRemaining: count,
  });
}

/**
 * Decrements the free spins counter by 1
 * @param {GameState} state - Current game state
 * @returns {GameState} New state with decremented freeSpinsRemaining (minimum 0)
 */
export function decrementFreeSpins(state) {
  return updateState(state, {
    freeSpinsRemaining: Math.max(0, state.freeSpinsRemaining - 1),
  });
}

/**
 * Resets the game state to initial values
 * @param {GameState} _state - Current game state (ignored, for consistency)
 * @returns {GameState} New state reset to initial values
 */
export function resetGame(_state) {
  return { ...INITIAL_STATE };
}

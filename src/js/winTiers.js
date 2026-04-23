/**
 * Win Tier Classification Module
 * Shared logic for classifying win sizes used by both main.js and ui.js
 */

/**
 * Classifies a spin payout into a win tier used for sound and animation.
 * Compares against the total bet to determine if a win is big, medium, or small.
 *
 * @param {number} totalPayout - Total payout from the spin
 * @param {number} currentBet - Current total bet amount (all paylines)
 * @returns {'big'|'medium'|'small'} Win tier
 */
export function classifyWinLevel(totalPayout, currentBet) {
  if (totalPayout >= currentBet * 2) {
    return 'big';
  }
  if (totalPayout >= currentBet * 1) {
    return 'medium';
  }
  return 'small';
}

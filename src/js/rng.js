/**
 * Random Number Generator Module
 * Provides cryptographically fair random number generation using Web Crypto API
 */

/**
 * Generates a cryptographically secure random integer within an inclusive range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer between min and max (inclusive)
 * @throws {Error} If min > max or if arguments are not valid numbers
 */
export function getRandomInt(min, max) {
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('Both min and max must be numbers');
  }

  if (min > max) {
    throw new Error('min must be less than or equal to max');
  }

  const range = max - min + 1;
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);

  // Use modulo bias elimination by generating a new random number
  // if the result would fall in the biased range
  const maxValidValue = Math.floor(0xffffffff / range) * range;

  let randomValue = randomBuffer[0];
  while (randomValue >= maxValidValue) {
    crypto.getRandomValues(randomBuffer);
    randomValue = randomBuffer[0];
  }

  return min + (randomValue % range);
}

/**
 * Spins the reels and returns random stop positions for each reel
 * @param {Array<Array<string>>} reelStrips - Array of reel strips, where each strip is an array of symbols
 * @returns {number[]} Array of random stop indices, one for each reel
 * @throws {Error} If reelStrips is not a valid array or contains empty strips
 */
export function spinReels(reelStrips) {
  if (!Array.isArray(reelStrips) || reelStrips.length === 0) {
    throw new Error('reelStrips must be a non-empty array');
  }

  const stopIndices = [];

  for (let i = 0; i < reelStrips.length; i++) {
    const reelStrip = reelStrips[i];

    if (!Array.isArray(reelStrip) || reelStrip.length === 0) {
      throw new Error(`Reel strip at index ${i} must be a non-empty array`);
    }

    const stopIndex = getRandomInt(0, reelStrip.length - 1);
    stopIndices.push(stopIndex);
  }

  return stopIndices;
}

/**
 * Generates a 2D matrix of symbols based on random reel stops
 * @param {Array<Array<string>>} reelStrips - Array of reel strips, where each strip is an array of symbols
 * @param {number} rows - Number of visible rows in the symbol matrix
 * @returns {Array<Array<string>>} 2D array where each inner array represents a reel column with visible symbols
 * @throws {Error} If arguments are invalid or if rows exceeds any reel strip length
 */
export function generateSymbolMatrix(reelStrips, rows) {
  if (!Array.isArray(reelStrips) || reelStrips.length === 0) {
    throw new Error('reelStrips must be a non-empty array');
  }

  if (typeof rows !== 'number' || rows <= 0) {
    throw new Error('rows must be a positive number');
  }

  // Validate that all reel strips have enough symbols
  for (let i = 0; i < reelStrips.length; i++) {
    const reelStrip = reelStrips[i];
    if (!Array.isArray(reelStrip) || reelStrip.length < rows) {
      throw new Error(
        `Reel strip at index ${i} must have at least ${rows} symbols`,
      );
    }
  }

  const stopIndices = spinReels(reelStrips);
  const symbolMatrix = [];

  for (let reelIndex = 0; reelIndex < reelStrips.length; reelIndex++) {
    const reelStrip = reelStrips[reelIndex];
    const stopIndex = stopIndices[reelIndex];
    const reelColumn = [];

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      // Wrap around if we go past the end of the reel strip
      const symbolIndex = (stopIndex + rowIndex) % reelStrip.length;
      reelColumn.push(reelStrip[symbolIndex]);
    }

    symbolMatrix.push(reelColumn);
  }

  return symbolMatrix;
}

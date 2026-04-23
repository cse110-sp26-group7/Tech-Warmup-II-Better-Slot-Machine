/**
 * @typedef {'neural_chip'|'katana'|'oni_mask'|'neon_7'|'cyber_iris'|'chrome_skull'|'gold_kanji'|'wild'} Symbol
 */

/**
 * Reel grid. reels[col][row] — 5 columns x 3 rows. row 0 = top.
 * @typedef {{ reels: Symbol[][], rows: 3, cols: 5 }} Grid
 */

/**
 * A fixed payline as a 5-element array of row indices (0-2).
 * @typedef {{ id: number, rows: [number, number, number, number, number] }} Payline
 */

/** @typedef {{ lineId: number, symbol: Symbol, count: 3|4|5, payout: number }} Win */

/**
 * @typedef {{
 *   grid: Grid,
 *   wins: Win[],
 *   payout: number,
 *   newBalance: number,
 *   newState: GameState
 * }} SpinResult
 */

/** @typedef {{ balance: number, bet: number, lastSpin: SpinResult | null }} GameState */

/** @typedef {{ next: (max: number) => number, readonly seed: number }} Rng */

export {}; // module marker; no runtime exports

/**
 * Reels Module
 * Defines the DATA HEIST cyberpunk symbol set and reel strip configurations
 */

/**
 * @typedef {Object} Symbol
 * @property {string} id - Unique symbol identifier
 * @property {string} displayName - Human-readable symbol name
 * @property {string} cyberpunkLabel - Cyberpunk-themed description
 * @property {number} value - Relative symbol value for payout calculation
 * @property {boolean} isWild - Whether this symbol acts as a wild
 */

/**
 * Wild symbol - Glitch W
 * Substitutes for all symbols except Scatter and Bonus
 * Appears on reels 2, 3, 4 only
 * @type {Symbol}
 */
export const WILD = {
  id: 'WILD',
  displayName: 'Glitch W',
  cyberpunkLabel: 'Reality Fracture',
  value: 0,
  isWild: true,
};

/**
 * Gold Kanji symbol - 金 (Gold/Money)
 * Top pay - Megacorp vault seal
 * @type {Symbol}
 */
export const GOLD_KANJI = {
  id: 'GOLD_KANJI',
  displayName: 'Gold Kanji',
  cyberpunkLabel: 'Megacorp Vault Seal',
  value: 1000,
  isWild: false,
};

/**
 * Chrome Skull symbol
 * Top pay - Black-ICE defense node
 * @type {Symbol}
 */
export const CHROME_SKULL = {
  id: 'CHROME_SKULL',
  displayName: 'Chrome Skull',
  cyberpunkLabel: 'Black-ICE Defense Node',
  value: 1000,
  isWild: false,
};

/**
 * Cyber Iris symbol
 * High pay - Ocular implant
 * @type {Symbol}
 */
export const CYBER_IRIS = {
  id: 'CYBER_IRIS',
  displayName: 'Cyber Iris',
  cyberpunkLabel: 'Ocular Implant',
  value: 500,
  isWild: false,
};

/**
 * Katana symbol
 * High pay - Ronin's blade
 * @type {Symbol}
 */
export const KATANA = {
  id: 'KATANA',
  displayName: 'Katana',
  cyberpunkLabel: 'Ronin\'s Blade',
  value: 500,
  isWild: false,
};

/**
 * Neon 7 symbol
 * High pay - Lucky protocol 777
 * @type {Symbol}
 */
export const NEON_7 = {
  id: 'NEON_7',
  displayName: 'Neon 7',
  cyberpunkLabel: 'Lucky Protocol 777',
  value: 500,
  isWild: false,
};

/**
 * Diamond symbol
 * Mid pay - Encrypted gem
 * @type {Symbol}
 */
export const DIAMOND = {
  id: 'DIAMOND',
  displayName: 'Diamond',
  cyberpunkLabel: 'Encrypted Gem',
  value: 250,
  isWild: false,
};

/**
 * Bell symbol
 * Mid pay - Intrusion alert
 * @type {Symbol}
 */
export const BELL = {
  id: 'BELL',
  displayName: 'Bell',
  cyberpunkLabel: 'Intrusion Alert',
  value: 250,
  isWild: false,
};

/**
 * BAR symbol
 * Low pay - Data bar
 * @type {Symbol}
 */
export const BAR = {
  id: 'BAR',
  displayName: 'BAR',
  cyberpunkLabel: 'Data Bar',
  value: 100,
  isWild: false,
};

/**
 * Cherry symbol
 * Low pay - Red data node
 * @type {Symbol}
 */
export const CHERRY = {
  id: 'CHERRY',
  displayName: 'Cherry',
  cyberpunkLabel: 'Red Data Node',
  value: 50,
  isWild: false,
};

/**
 * Neural Chip symbol (Scatter)
 * Bonus trigger - Grants free spins when 3+ land anywhere
 * @type {Symbol}
 */
export const NEURAL_CHIP = {
  id: 'NEURAL_CHIP',
  displayName: 'Neural Chip',
  cyberpunkLabel: 'Neural Access Chip',
  value: 0,
  isWild: false,
};

/**
 * Array of all symbols in the game
 * @type {Symbol[]}
 */
export const SYMBOLS = [
  WILD,
  GOLD_KANJI,
  CHROME_SKULL,
  CYBER_IRIS,
  KATANA,
  NEON_7,
  DIAMOND,
  BELL,
  BAR,
  CHERRY,
  NEURAL_CHIP,
];

/**
 * Reel strip 1 (leftmost reel)
 * No wild symbols on reel 1
 * @type {string[]}
 */
const REEL_1 = [
  'CHERRY', 'BAR', 'CHERRY', 'DIAMOND', 'BAR', 'CHERRY',
  'BELL', 'BAR', 'DIAMOND', 'CHERRY', 'BAR', 'NEON_7',
  'CHERRY', 'BAR', 'DIAMOND', 'BELL', 'BAR', 'NEURAL_CHIP',
  'KATANA', 'BAR', 'CHERRY', 'DIAMOND', 'BELL', 'CHERRY',
  'BAR', 'CYBER_IRIS', 'CHERRY', 'BAR', 'NEURAL_CHIP', 'CHERRY',
  'CHROME_SKULL', 'CHERRY', 'BAR', 'DIAMOND', 'CHERRY', 'BAR',
  'GOLD_KANJI', 'CHERRY', 'BAR', 'BELL',
];

/**
 * Reel strip 2
 * Includes wild symbols
 * @type {string[]}
 */
const REEL_2 = [
  'CHERRY', 'BAR', 'DIAMOND', 'CHERRY', 'NEURAL_CHIP', 'WILD',
  'CHERRY', 'BELL', 'BAR', 'CHERRY', 'DIAMOND', 'BAR',
  'CHERRY', 'NEON_7', 'BAR', 'CHERRY', 'DIAMOND', 'WILD',
  'BAR', 'CHERRY', 'BELL', 'DIAMOND', 'NEURAL_CHIP', 'BAR',
  'KATANA', 'CHERRY', 'BAR', 'DIAMOND', 'CHERRY', 'WILD',
  'BAR', 'CHERRY', 'CYBER_IRIS', 'DIAMOND', 'CHERRY', 'BAR',
  'CHROME_SKULL', 'CHERRY', 'BAR', 'DIAMOND', 'CHERRY', 'WILD',
  'BAR', 'GOLD_KANJI', 'CHERRY', 'BELL',
];

/**
 * Reel strip 3 (center reel)
 * Includes wild symbols
 * @type {string[]}
 */
const REEL_3 = [
  'BAR', 'CHERRY', 'DIAMOND', 'BAR', 'WILD', 'NEURAL_CHIP',
  'BELL', 'BAR', 'CHERRY', 'DIAMOND', 'CHERRY', 'BAR',
  'NEON_7', 'CHERRY', 'BAR', 'DIAMOND', 'WILD', 'CHERRY',
  'BAR', 'BELL', 'CHERRY', 'NEURAL_CHIP', 'BAR', 'CHERRY',
  'KATANA', 'BAR', 'CHERRY', 'DIAMOND', 'WILD', 'CHERRY',
  'BAR', 'CYBER_IRIS', 'CHERRY', 'DIAMOND', 'BAR', 'CHERRY',
  'CHROME_SKULL', 'BAR', 'CHERRY', 'DIAMOND', 'WILD', 'CHERRY',
  'GOLD_KANJI', 'BAR', 'CHERRY', 'BELL',
];

/**
 * Reel strip 4
 * Includes wild symbols
 * @type {string[]}
 */
const REEL_4 = [
  'CHERRY', 'BAR', 'DIAMOND', 'CHERRY', 'NEURAL_CHIP', 'BAR',
  'CHERRY', 'BELL', 'DIAMOND', 'CHERRY', 'BAR', 'DIAMOND',
  'CHERRY', 'NEON_7', 'BAR', 'CHERRY', 'WILD', 'DIAMOND',
  'CHERRY', 'BAR', 'BELL', 'CHERRY', 'NEURAL_CHIP', 'BAR',
  'KATANA', 'CHERRY', 'DIAMOND', 'BAR', 'CHERRY', 'WILD',
  'CYBER_IRIS', 'CHERRY', 'BAR', 'DIAMOND', 'CHERRY', 'BAR',
  'CHROME_SKULL', 'CHERRY', 'DIAMOND', 'BAR', 'CHERRY', 'WILD',
  'GOLD_KANJI', 'CHERRY', 'BAR', 'BELL',
];

/**
 * Reel strip 5 (rightmost reel)
 * No wild symbols on reel 5
 * @type {string[]}
 */
const REEL_5 = [
  'CHERRY', 'BAR', 'CHERRY', 'DIAMOND', 'BAR', 'CHERRY',
  'BELL', 'BAR', 'DIAMOND', 'CHERRY', 'NEURAL_CHIP', 'NEON_7',
  'CHERRY', 'DIAMOND', 'BAR', 'CHERRY', 'BELL', 'DIAMOND',
  'CHERRY', 'BAR', 'KATANA', 'CHERRY', 'NEURAL_CHIP', 'BAR',
  'CHERRY', 'BELL', 'BAR', 'CHERRY', 'DIAMOND', 'CYBER_IRIS',
  'CHERRY', 'BAR', 'DIAMOND', 'CHERRY', 'BAR', 'CHROME_SKULL',
  'CHERRY', 'DIAMOND', 'BAR', 'CHERRY', 'GOLD_KANJI', 'BAR',
  'CHERRY', 'DIAMOND', 'BELL',
];

/**
 * Array of all reel strips (5 reels)
 * @type {string[][]}
 */
export const REEL_STRIPS = [REEL_1, REEL_2, REEL_3, REEL_4, REEL_5];

/**
 * Retrieves a symbol object by its ID
 * @param {string} id - The symbol ID to look up
 * @returns {Symbol|undefined} The symbol object, or undefined if not found
 */
export function getSymbolById(id) {
  return SYMBOLS.find((symbol) => symbol.id === id);
}

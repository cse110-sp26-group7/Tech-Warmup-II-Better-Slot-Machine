// experiments/attempt-B/src/rng.js

/**
 * Mulberry32 PRNG. Deterministic when seeded.
 * @param {number} [seed]
 * @returns {import('./types.js').Rng}
 */
export function createRng(seed = Date.now()) {
  let s = seed >>> 0;
  return {
    next(max) {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) % max;
    },
    get seed() { return s; },
  };
}

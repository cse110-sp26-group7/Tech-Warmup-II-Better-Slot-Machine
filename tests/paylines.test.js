/**
 * Paylines Module Tests
 */

import { PAYLINES, getPaylineSymbols } from '../src/js/paylines.js';

describe('Paylines Module', () => {
  describe('PAYLINES definition', () => {
    test('exports exactly 25 paylines', () => {
      expect(PAYLINES).toHaveLength(25);
    });

    // Regression guard for the Phase 8C bug: paylines 6/14 and 8/15 were
    // identical duplicates, causing the same pattern to be paid twice per
    // spin and leaving only 23 genuinely unique payline shapes.
    test('all paylines are unique', () => {
      const serialized = PAYLINES.map((payline) => JSON.stringify(payline));
      const unique = new Set(serialized);
      expect(unique.size).toBe(PAYLINES.length);
    });

    test('each payline has 5 row indices in the range [0, 2]', () => {
      PAYLINES.forEach((payline) => {
        expect(payline).toHaveLength(5);
        payline.forEach((row) => {
          expect(Number.isInteger(row)).toBe(true);
          expect(row).toBeGreaterThanOrEqual(0);
          expect(row).toBeLessThanOrEqual(2);
        });
      });
    });
  });

  describe('getPaylineSymbols', () => {
    const matrix = [
      ['A0', 'A1', 'A2'],
      ['B0', 'B1', 'B2'],
      ['C0', 'C1', 'C2'],
      ['D0', 'D1', 'D2'],
      ['E0', 'E1', 'E2'],
    ];

    test('extracts symbols along a straight middle-row payline', () => {
      const result = getPaylineSymbols(matrix, [1, 1, 1, 1, 1]);
      expect(result).toEqual(['A1', 'B1', 'C1', 'D1', 'E1']);
    });

    test('extracts symbols along a V-shape payline', () => {
      const result = getPaylineSymbols(matrix, [0, 1, 2, 1, 0]);
      expect(result).toEqual(['A0', 'B1', 'C2', 'D1', 'E0']);
    });

    test('throws on a payline with an out-of-range row index', () => {
      expect(() => getPaylineSymbols(matrix, [0, 1, 3, 1, 0])).toThrow();
    });

    test('throws on a payline that is not exactly 5 elements long', () => {
      expect(() => getPaylineSymbols(matrix, [1, 1, 1])).toThrow();
    });
  });
});

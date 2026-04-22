/**
 * Payout Module Tests
 * Test-driven development for the payout calculation logic
 */

import { calculatePayout, checkScatterTrigger } from '../src/js/payout.js';

describe('Payout Module - calculatePayout', () => {
  describe('5 of a kind payouts', () => {
    test('should pay correct amount for 5 Gold Kanji symbols at minimum bet', () => {
      const paylineSymbols = [
        'GOLD_KANJI',
        'GOLD_KANJI',
        'GOLD_KANJI',
        'GOLD_KANJI',
        'GOLD_KANJI',
      ];
      const betAmount = 1;
      const expectedPayout = 1000;

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });

    test('should pay correct amount for 5 Cherry symbols at minimum bet', () => {
      const paylineSymbols = ['CHERRY', 'CHERRY', 'CHERRY', 'CHERRY', 'CHERRY'];
      const betAmount = 1;
      const expectedPayout = 50;

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });

    test('should pay correct amount for 5 Chrome Skull symbols at minimum bet', () => {
      const paylineSymbols = [
        'CHROME_SKULL',
        'CHROME_SKULL',
        'CHROME_SKULL',
        'CHROME_SKULL',
        'CHROME_SKULL',
      ];
      const betAmount = 1;
      const expectedPayout = 1000;

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });
  });

  describe('3 of a kind payouts', () => {
    test('should pay for 3 of a kind starting from reel 1', () => {
      const paylineSymbols = ['KATANA', 'KATANA', 'KATANA', 'CHERRY', 'BAR'];
      const betAmount = 1;
      const expectedPayout = 300; // 500 * 3/5

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });

    test('should NOT pay for 3 of a kind not starting from reel 1', () => {
      const paylineSymbols = ['CHERRY', 'KATANA', 'KATANA', 'KATANA', 'BAR'];
      const betAmount = 1;
      const expectedPayout = 0;

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });

    test('should NOT pay for 3 matching symbols with gap in between', () => {
      const paylineSymbols = ['DIAMOND', 'DIAMOND', 'CHERRY', 'DIAMOND', 'BAR'];
      const betAmount = 1;
      const expectedPayout = 0;

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });
  });

  describe('Wild symbol substitution', () => {
    test('should substitute Wild to complete 5 of a kind', () => {
      const paylineSymbols = ['NEON_7', 'WILD', 'NEON_7', 'NEON_7', 'NEON_7'];
      const betAmount = 1;
      const expectedPayout = 500;

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });

    test('should substitute multiple Wilds to complete a match', () => {
      const paylineSymbols = ['CYBER_IRIS', 'WILD', 'CYBER_IRIS', 'WILD', 'CYBER_IRIS'];
      const betAmount = 1;
      const expectedPayout = 500;

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });

    test('should treat Wild as highest value symbol when all Wilds', () => {
      const paylineSymbols = ['WILD', 'WILD', 'WILD', 'WILD', 'WILD'];
      const betAmount = 1;
      const expectedPayout = 1000;

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });

    test('should substitute Wild for 3 of a kind', () => {
      const paylineSymbols = ['BELL', 'WILD', 'BELL', 'CHERRY', 'BAR'];
      const betAmount = 1;
      const expectedPayout = 150; // 250 * 3/5

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });
  });

  describe('No match scenarios', () => {
    test('should return 0 for no matching symbols', () => {
      const paylineSymbols = ['CHERRY', 'BAR', 'DIAMOND', 'BELL', 'NEON_7'];
      const betAmount = 1;
      const expectedPayout = 0;

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });

    test('should return 0 for only 2 matching symbols', () => {
      const paylineSymbols = ['BAR', 'BAR', 'DIAMOND', 'BELL', 'CHERRY'];
      const betAmount = 1;
      const expectedPayout = 0;

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });
  });

  describe('Bet multiplier scaling', () => {
    test('should scale payout with bet amount - 2x bet for same symbols', () => {
      const paylineSymbols = ['DIAMOND', 'DIAMOND', 'DIAMOND', 'DIAMOND', 'DIAMOND'];
      const betAmount1 = 1;
      const betAmount2 = 2;

      const payout1 = calculatePayout(paylineSymbols, betAmount1);
      const payout2 = calculatePayout(paylineSymbols, betAmount2);
      expect(payout2).toBe(payout1 * 2);
    });

    test('should scale payout with bet amount - 10x bet for same symbols', () => {
      const paylineSymbols = ['KATANA', 'KATANA', 'KATANA', 'CHERRY', 'BAR'];
      const betAmount1 = 1;
      const betAmount10 = 10;

      const payout1 = calculatePayout(paylineSymbols, betAmount1);
      const payout10 = calculatePayout(paylineSymbols, betAmount10);
      expect(payout10).toBe(payout1 * 10);
    });

    test('should handle fractional bet amounts correctly', () => {
      const paylineSymbols = ['BELL', 'BELL', 'BELL', 'BELL', 'BELL'];
      const betAmount = 0.5;
      const expectedPayout = 125; // 250 * 0.5

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });
  });

  describe('4 of a kind payouts', () => {
    test('should pay for 4 of a kind starting from reel 1', () => {
      const paylineSymbols = ['CYBER_IRIS', 'CYBER_IRIS', 'CYBER_IRIS', 'CYBER_IRIS', 'BAR'];
      const betAmount = 1;
      const expectedPayout = 400; // 500 * 4/5

      const payout = calculatePayout(paylineSymbols, betAmount);
      expect(payout).toBe(expectedPayout);
    });

    test('should pay more for 5 of a kind than 4 of a kind', () => {
      const symbolId = 'NEON_7';
      const fourOfKind = [symbolId, symbolId, symbolId, symbolId, 'CHERRY'];
      const fiveOfKind = [symbolId, symbolId, symbolId, symbolId, symbolId];
      const betAmount = 1;

      const payout4 = calculatePayout(fourOfKind, betAmount);
      const payout5 = calculatePayout(fiveOfKind, betAmount);
      expect(payout5).toBeGreaterThan(payout4);
    });
  });

  describe('Edge cases and validation', () => {
    test('should handle invalid bet amount (negative)', () => {
      const paylineSymbols = ['CHERRY', 'CHERRY', 'CHERRY', 'CHERRY', 'CHERRY'];
      const betAmount = -1;

      expect(() => calculatePayout(paylineSymbols, betAmount)).toThrow();
    });

    test('should handle invalid bet amount (zero)', () => {
      const paylineSymbols = ['CHERRY', 'CHERRY', 'CHERRY', 'CHERRY', 'CHERRY'];
      const betAmount = 0;

      expect(() => calculatePayout(paylineSymbols, betAmount)).toThrow();
    });

    test('should handle invalid payline symbols array (wrong length)', () => {
      const paylineSymbols = ['CHERRY', 'CHERRY', 'CHERRY'];
      const betAmount = 1;

      expect(() => calculatePayout(paylineSymbols, betAmount)).toThrow();
    });

    test('should handle unknown symbol ID gracefully', () => {
      const paylineSymbols = ['UNKNOWN', 'CHERRY', 'CHERRY', 'CHERRY', 'CHERRY'];
      const betAmount = 1;

      expect(() => calculatePayout(paylineSymbols, betAmount)).toThrow();
    });
  });

  describe('checkScatterTrigger', () => {
    test('should not trigger bonus with 2 Neural Chips', () => {
      const matrix = [
        ['CHERRY', 'NEURAL_CHIP', 'BAR'],
        ['BAR', 'CHERRY', 'BELL'],
        ['DIAMOND', 'BAR', 'NEURAL_CHIP'],
        ['CHERRY', 'BELL', 'DIAMOND'],
        ['BAR', 'CHERRY', 'CHERRY'],
      ];

      const freeSpins = checkScatterTrigger(matrix);
      expect(freeSpins).toBe(0);
    });

    test('should trigger 10 free spins with exactly 3 Neural Chips', () => {
      const matrix = [
        ['CHERRY', 'NEURAL_CHIP', 'BAR'],
        ['BAR', 'CHERRY', 'BELL'],
        ['DIAMOND', 'BAR', 'NEURAL_CHIP'],
        ['CHERRY', 'BELL', 'NEURAL_CHIP'],
        ['BAR', 'CHERRY', 'CHERRY'],
      ];

      const freeSpins = checkScatterTrigger(matrix);
      expect(freeSpins).toBe(10);
    });

    test('should trigger 15 free spins with exactly 4 Neural Chips', () => {
      const matrix = [
        ['NEURAL_CHIP', 'NEURAL_CHIP', 'BAR'],
        ['BAR', 'CHERRY', 'BELL'],
        ['DIAMOND', 'BAR', 'NEURAL_CHIP'],
        ['CHERRY', 'BELL', 'NEURAL_CHIP'],
        ['BAR', 'CHERRY', 'CHERRY'],
      ];

      const freeSpins = checkScatterTrigger(matrix);
      expect(freeSpins).toBe(15);
    });

    test('should trigger 25 free spins with 5 Neural Chips', () => {
      const matrix = [
        ['NEURAL_CHIP', 'NEURAL_CHIP', 'BAR'],
        ['BAR', 'CHERRY', 'NEURAL_CHIP'],
        ['DIAMOND', 'BAR', 'NEURAL_CHIP'],
        ['CHERRY', 'BELL', 'NEURAL_CHIP'],
        ['BAR', 'CHERRY', 'CHERRY'],
      ];

      const freeSpins = checkScatterTrigger(matrix);
      expect(freeSpins).toBe(25);
    });

    test('should return 25 free spins when scatter count exceeds 5', () => {
      const matrix = [
        ['NEURAL_CHIP', 'NEURAL_CHIP', 'NEURAL_CHIP'],
        ['BAR', 'NEURAL_CHIP', 'NEURAL_CHIP'],
        ['DIAMOND', 'BAR', 'NEURAL_CHIP'],
        ['CHERRY', 'BELL', 'CHERRY'],
        ['BAR', 'CHERRY', 'CHERRY'],
      ];

      const freeSpins = checkScatterTrigger(matrix);
      expect(freeSpins).toBe(25);
    });

    test('should validate matrix structure', () => {
      const invalidMatrix = [
        ['CHERRY', 'BAR'],
        ['BAR', 'CHERRY'],
      ];

      expect(() => checkScatterTrigger(invalidMatrix)).toThrow();
    });

    test('should count scatters anywhere on the reels', () => {
      const matrix = [
        ['NEURAL_CHIP', 'CHERRY', 'BAR'],
        ['BAR', 'NEURAL_CHIP', 'BELL'],
        ['DIAMOND', 'BAR', 'CHERRY'],
        ['CHERRY', 'BELL', 'DIAMOND'],
        ['NEURAL_CHIP', 'CHERRY', 'CHERRY'],
      ];

      const freeSpins = checkScatterTrigger(matrix);
      expect(freeSpins).toBe(10); // 3 scatters = 10 free spins
    });
  });
});

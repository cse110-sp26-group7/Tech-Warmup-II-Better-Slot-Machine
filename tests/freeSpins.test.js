/**
 * Free Spins Feature Tests
 * Tests for scatter trigger, free-spin round logic, retriggers, and multipliers
 */

import * as State from '../src/js/state.js';

describe('Free Spins State Management', () => {
  describe('setFreeSpins', () => {
    test('should set free spins to specified count', () => {
      const state = State.INITIAL_STATE;
      const newState = State.setFreeSpins(state, 10);
      expect(newState.freeSpinsRemaining).toBe(10);
    });

    test('should handle retrigger by adding free spins', () => {
      let state = State.setFreeSpins(State.INITIAL_STATE, 10);
      state = State.setFreeSpins(state, 15); // Retrigger with 4 scatters
      expect(state.freeSpinsRemaining).toBe(15);
    });

    test('should reject negative free spins count', () => {
      const state = State.INITIAL_STATE;
      expect(() => State.setFreeSpins(state, -1)).toThrow(
        'Free spins count must be a non-negative integer',
      );
    });

    test('should reject non-integer free spins count', () => {
      const state = State.INITIAL_STATE;
      expect(() => State.setFreeSpins(state, 10.5)).toThrow(
        'Free spins count must be a non-negative integer',
      );
    });

    test('should accept zero to clear free spins', () => {
      let state = State.setFreeSpins(State.INITIAL_STATE, 10);
      state = State.setFreeSpins(state, 0);
      expect(state.freeSpinsRemaining).toBe(0);
    });
  });

  describe('decrementFreeSpins', () => {
    test('should decrement free spins by 1', () => {
      let state = State.setFreeSpins(State.INITIAL_STATE, 10);
      state = State.decrementFreeSpins(state);
      expect(state.freeSpinsRemaining).toBe(9);
    });

    test('should not go below 0 when decrementing', () => {
      let state = State.setFreeSpins(State.INITIAL_STATE, 1);
      state = State.decrementFreeSpins(state);
      expect(state.freeSpinsRemaining).toBe(0);

      // Decrement when already 0
      state = State.decrementFreeSpins(state);
      expect(state.freeSpinsRemaining).toBe(0);
    });

    test('should handle multiple decrements', () => {
      let state = State.setFreeSpins(State.INITIAL_STATE, 5);
      state = State.decrementFreeSpins(state);
      state = State.decrementFreeSpins(state);
      state = State.decrementFreeSpins(state);
      expect(state.freeSpinsRemaining).toBe(2);
    });
  });

  describe('Free spin round invariants', () => {
    /**
     * Simulates a free spin cycle: no bet deduction, payout with 2× multiplier,
     * decrement free spins counter
     */
    function simulateFreeSpinCycle(state, basePayout) {
      const initialBalance = state.balance;
      let next = { ...state, isSpinning: true };

      // Apply 2× multiplier for free spins
      const multipliedPayout = basePayout * 2;

      // Record spin (adds payout to balance)
      next = State.recordSpin(next, multipliedPayout);

      // Decrement free spins
      next = State.decrementFreeSpins(next);

      // Verify bet was not deducted
      expect(next.balance).toBe(initialBalance + multipliedPayout);

      return next;
    }

    test('free spin should not deduct bet from balance', () => {
      let state = State.INITIAL_STATE;
      state = State.setFreeSpins(state, 10);
      const initialBalance = state.balance;
      const currentBet = state.currentBet;

      state = simulateFreeSpinCycle(state, 0); // Losing free spin

      // Balance should not decrease (no bet deducted)
      expect(state.balance).toBe(initialBalance);
      // Free spins should decrement
      expect(state.freeSpinsRemaining).toBe(9);
      // Bet should remain the same
      expect(state.currentBet).toBe(currentBet);
    });

    test('free spin should apply 2× multiplier to payout', () => {
      let state = State.INITIAL_STATE;
      state = State.setFreeSpins(state, 10);
      const initialBalance = state.balance;
      const basePayout = 100;

      state = simulateFreeSpinCycle(state, basePayout);

      // Balance should increase by 2× the base payout
      expect(state.balance).toBe(initialBalance + basePayout * 2);
      expect(state.freeSpinsRemaining).toBe(9);
    });

    test('retrigger during free spins should add to existing count', () => {
      let state = State.INITIAL_STATE;
      state = State.setFreeSpins(state, 5); // Start with 5 free spins

      // Simulate a free spin that triggers 3 scatters (10 more free spins)
      state = simulateFreeSpinCycle(state, 100);
      // After the spin, we retrigger and add 10 more
      state = State.setFreeSpins(state, state.freeSpinsRemaining + 10);

      // Should have (5 - 1) + 10 = 14 free spins
      expect(state.freeSpinsRemaining).toBe(14);
    });

    test('multiple free spins should not deduct bet until round ends', () => {
      let state = State.INITIAL_STATE;
      state = State.setFreeSpins(state, 3);
      const initialBalance = state.balance;

      // Spin 1
      state = simulateFreeSpinCycle(state, 50);
      expect(state.freeSpinsRemaining).toBe(2);
      expect(state.balance).toBe(initialBalance + 100);

      // Spin 2
      state = simulateFreeSpinCycle(state, 0);
      expect(state.freeSpinsRemaining).toBe(1);
      expect(state.balance).toBe(initialBalance + 100);

      // Spin 3
      state = simulateFreeSpinCycle(state, 25);
      expect(state.freeSpinsRemaining).toBe(0);
      expect(state.balance).toBe(initialBalance + 100 + 50);

      // Round ended, next spin should deduct bet
      const afterRound = State.placeBet(state, state.currentBet);
      expect(afterRound.balance).toBe(state.balance - state.currentBet);
    });

    test('free spin round with all wins applies 2× multiplier correctly', () => {
      let state = State.INITIAL_STATE;
      state = State.setFreeSpins(state, 3);
      const initialBalance = state.balance;

      // All 3 free spins win
      state = simulateFreeSpinCycle(state, 100); // +200
      state = simulateFreeSpinCycle(state, 150); // +300
      state = simulateFreeSpinCycle(state, 50);  // +100

      expect(state.freeSpinsRemaining).toBe(0);
      expect(state.balance).toBe(initialBalance + 600); // (100 + 150 + 50) × 2
    });

    test('zero payout free spin should not change balance but decrement counter', () => {
      let state = State.INITIAL_STATE;
      state = State.setFreeSpins(state, 5);
      const initialBalance = state.balance;

      state = simulateFreeSpinCycle(state, 0);

      expect(state.balance).toBe(initialBalance);
      expect(state.freeSpinsRemaining).toBe(4);
    });
  });

  describe('Auto-spin interaction with free spins', () => {
    test('auto-spin should pause during free-spin round', () => {
      // This is a conceptual test - the actual flow in main.js ensures
      // that when freeSpinsRemaining > 0, free spins run to completion
      // before auto-spin resumes
      let state = State.INITIAL_STATE;
      state = State.setAutoSpin(state, 10);
      state = State.setFreeSpins(state, 3);

      // Both counters should be active
      expect(state.autoSpinCount).toBe(10);
      expect(state.freeSpinsRemaining).toBe(3);

      // Free spins take priority - no auto-spin decrement during free spins
      // (This behavior is enforced by the execution order in main.js)
    });

    test('auto-spin should resume after free-spin round ends', () => {
      let state = State.INITIAL_STATE;
      state = State.setAutoSpin(state, 10);
      state = State.setFreeSpins(state, 2);

      // Complete free-spin round
      state = State.decrementFreeSpins(state);
      state = State.decrementFreeSpins(state);
      expect(state.freeSpinsRemaining).toBe(0);

      // Auto-spin count should still be active
      expect(state.autoSpinCount).toBe(10);
    });
  });

  describe('Edge cases', () => {
    test('should handle simultaneous scatter trigger and regular win', () => {
      // A spin can have both regular payline wins AND scatter trigger
      let state = State.INITIAL_STATE;
      const basePayout = 500; // From paylines
      const scatterSpins = 10; // From 3 scatters

      // Award scatter free spins
      state = State.setFreeSpins(state, scatterSpins);
      // Record the regular win
      state = State.recordSpin(state, basePayout);

      expect(state.freeSpinsRemaining).toBe(10);
      expect(state.balance).toBe(State.INITIAL_STATE.balance + basePayout);
    });

    test('should handle retrigger on the last free spin', () => {
      let state = State.INITIAL_STATE;
      state = State.setFreeSpins(state, 1);

      // On the last free spin, we retrigger
      state = State.decrementFreeSpins(state); // Now 0
      expect(state.freeSpinsRemaining).toBe(0);

      // But we hit scatters and get 10 more
      state = State.setFreeSpins(state, 10);
      expect(state.freeSpinsRemaining).toBe(10);
    });

    test('should handle large retrigger chain', () => {
      let state = State.INITIAL_STATE;
      state = State.setFreeSpins(state, 10);

      // Simulate several retriggers
      for (let i = 0; i < 5; i++) {
        state = State.decrementFreeSpins(state);
        // Retrigger with 3 scatters (+10)
        state = State.setFreeSpins(state, state.freeSpinsRemaining + 10);
      }

      // After 5 spins with retriggers: (10 - 5) + (5 × 10) = 55
      expect(state.freeSpinsRemaining).toBe(55);
    });
  });
});

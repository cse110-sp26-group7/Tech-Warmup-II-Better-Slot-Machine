/**
 * State Management Module Tests
 * Tests for game state functions including bet adjustment
 */

import * as State from '../src/js/state.js';

describe('State Module', () => {
  describe('setBet', () => {
    test('should set bet to specified amount per line (in increments of 25)', () => {
      const state = State.INITIAL_STATE;
      const newState = State.setBet(state, 50);
      expect(newState.currentBet).toBe(50 * 25);
      expect(newState.currentBet).toBe(1250);
    });

    test('should set bet to 1 per line (minimum)', () => {
      const state = State.INITIAL_STATE;
      const newState = State.setBet(state, 1);
      expect(newState.currentBet).toBe(1 * 25);
      expect(newState.currentBet).toBe(25);
    });

    test('should set bet to 100 per line (maximum)', () => {
      const state = State.INITIAL_STATE;
      const newState = State.setBet(state, 100);
      expect(newState.currentBet).toBe(100 * 25);
      expect(newState.currentBet).toBe(2500);
    });

    test('should reject bet below minimum (0)', () => {
      const state = State.INITIAL_STATE;
      expect(() => State.setBet(state, 0)).toThrow(
        'Bet per line must be between 1 and 100',
      );
    });

    test('should reject bet above maximum (101)', () => {
      const state = State.INITIAL_STATE;
      expect(() => State.setBet(state, 101)).toThrow(
        'Bet per line must be between 1 and 100',
      );
    });

    test('should reject negative bet amount', () => {
      const state = State.INITIAL_STATE;
      expect(() => State.setBet(state, -10)).toThrow(
        'Bet per line must be between 1 and 100',
      );
    });

    test('should reject non-numeric bet amount', () => {
      const state = State.INITIAL_STATE;
      expect(() => State.setBet(state, 'fifty')).toThrow(
        'Bet amount must be a positive number',
      );
    });

    test('should not modify balance when setting bet', () => {
      const state = State.INITIAL_STATE;
      const originalBalance = state.balance;
      const newState = State.setBet(state, 50);
      expect(newState.balance).toBe(originalBalance);
    });

    test('should not change isSpinning state when setting bet', () => {
      const state = State.INITIAL_STATE;
      const newState = State.setBet(state, 50);
      expect(newState.isSpinning).toBe(state.isSpinning);
    });

    test('should increase bet from 1 to 2', () => {
      let state = State.setBet(State.INITIAL_STATE, 1);
      state = State.setBet(state, 2);
      expect(state.currentBet).toBe(2 * 25);
    });

    test('should decrease bet from 100 to 99', () => {
      let state = State.setBet(State.INITIAL_STATE, 100);
      state = State.setBet(state, 99);
      expect(state.currentBet).toBe(99 * 25);
    });

    test('should handle multiple bet adjustments in sequence', () => {
      let state = State.INITIAL_STATE;
      state = State.setBet(state, 10);
      expect(state.currentBet).toBe(250);

      state = State.setBet(state, 25);
      expect(state.currentBet).toBe(625);

      state = State.setBet(state, 50);
      expect(state.currentBet).toBe(1250);
    });
  });

  describe('placeBet', () => {
    test('should deduct bet from balance and set isSpinning to true', () => {
      const state = State.INITIAL_STATE;
      const betAmount = 100;
      const newState = State.placeBet(state, betAmount);

      expect(newState.balance).toBe(state.balance - betAmount);
      expect(newState.currentBet).toBe(betAmount);
      expect(newState.isSpinning).toBe(true);
    });

    test('should reject bet exceeding balance', () => {
      const state = State.INITIAL_STATE;
      const excessiveBet = state.balance + 1;
      expect(() => State.placeBet(state, excessiveBet)).toThrow(
        'Insufficient balance for this bet',
      );
    });
  });

  describe('recordSpin', () => {
    test('should add payout to balance', () => {
      const state = State.INITIAL_STATE;
      const payout = 500;
      const newState = State.recordSpin(state, payout);

      expect(newState.balance).toBe(state.balance + payout);
      expect(newState.lastWin).toBe(payout);
      expect(newState.totalSpins).toBe(1);
      expect(newState.isSpinning).toBe(false);
    });

    test('should record zero payout', () => {
      const state = State.INITIAL_STATE;
      const newState = State.recordSpin(state, 0);

      expect(newState.balance).toBe(state.balance);
      expect(newState.lastWin).toBe(0);
    });
  });
});

// experiments/attempt-B/src/main.js
import { createRng } from './rng.js';
import { spin, generateGrid } from './engine.js';
import { INITIAL_STATE, BET_STEPS } from './paytable.js';
import {
  renderGrid, highlightWins, renderBreakdown, renderHud, renderPaytable,
  setSpinEnabled, setResetVisible, triggerBigWin, triggerUnlucky,
  triggerMystery, wireEvents,
} from './ui.js';
import {
  playSpin, playWin, playBigWin, playMegaWin, playPity, playMystery,
} from './sound.js';

const rng = createRng();

/** @type {import('./types.js').GameState} */
let state = { ...INITIAL_STATE };

// Pity mechanic per User Story 7. Tracked outside engine (engine stays pure).
// Threshold = 10 consecutive zero-payout spins; bonus = 2× bet, disclosed.
const UNLUCKY_STREAK_THRESHOLD = 10;
const UNLUCKY_BONUS_MULT = 2;
let losingStreak = 0;

// Mystery drop per User Story 5. Every N spins regardless of outcome,
// credit a random bonus (1-3× bet). Guarantees at least one "bonus moment"
// per session. Engine untouched — counter lives here.
const MYSTERY_INTERVAL = 20;
let spinCount = 0;

function render(wins = []) {
  renderHud({
    balance: state.balance,
    bet: state.bet,
    lastWin: state.lastSpin?.payout ?? 0,
  });
  renderPaytable(wins);
  setSpinEnabled(state.bet <= state.balance && state.balance > 0);
  setResetVisible(state.balance <= 0);
}

function handleSpin() {
  if (state.bet > state.balance || state.balance <= 0) return;
  playSpin();
  try {
    const result = spin(state, state.bet, rng);
    state = result.newState;
    spinCount += 1;
    renderGrid(result.grid);
    highlightWins(result.wins);
    renderBreakdown(result.wins);
    triggerBigWin(result.payout, state.bet);
    render(result.wins);

    if (result.payout > 0) {
      losingStreak = 0;
      const ratio = result.payout / state.bet;
      if (ratio >= 50) playMegaWin();
      else if (ratio >= 10) playBigWin();
      else playWin();
    } else {
      losingStreak += 1;
      if (losingStreak >= UNLUCKY_STREAK_THRESHOLD) {
        const bonus = state.bet * UNLUCKY_BONUS_MULT;
        state = { ...state, balance: state.balance + bonus };
        triggerUnlucky(bonus);
        playPity();
        losingStreak = 0;
        render(result.wins);
      }
    }

    // Mystery drop — every MYSTERY_INTERVAL spins. Independent of win/loss.
    if (spinCount % MYSTERY_INTERVAL === 0) {
      const mult = 1 + Math.floor(rng.next(3)); // 1, 2, or 3
      const bonus = state.bet * mult;
      state = { ...state, balance: state.balance + bonus };
      triggerMystery(bonus);
      playMystery();
      render(result.wins);
    }
  } catch (err) {
    // eslint-disable-next-line no-console -- design spec §3.5 requires console logging of unexpected engine errors
    console.error('spin failed', err);
    setSpinEnabled(false);
  }
}

function stepBet(dir) {
  const i = BET_STEPS.indexOf(state.bet);
  const next = i === -1
    ? BET_STEPS[0]
    : BET_STEPS[Math.max(0, Math.min(BET_STEPS.length - 1, i + dir))];
  if (next <= state.balance) {
    state = { ...state, bet: next };
    render();
  }
}

function handleMaxBet() {
  const maxAllowed = [...BET_STEPS].reverse().find(b => b <= state.balance);
  if (maxAllowed) {
    state = { ...state, bet: maxAllowed };
    render();
  }
}

function handleReset() {
  state = { ...INITIAL_STATE };
  losingStreak = 0;
  spinCount = 0;
  render();
}

function bootstrap() {
  renderGrid(generateGrid(rng));
  renderBreakdown([]);
  render();
  wireEvents({
    onSpin: handleSpin,
    onBetUp: () => stepBet(1),
    onBetDown: () => stepBet(-1),
    onMaxBet: handleMaxBet,
    onReset: handleReset,
  });

  // Test hooks — preview rare overlay effects without waiting. Safe to remove.
  // Shift+B BIG | Shift+M MEGA | Shift+U UNLUCKY | Shift+Y MYSTERY
  window.addEventListener('keydown', (e) => {
    if (!e.shiftKey) return;
    if (e.key === 'B' || e.key === 'b') {
      triggerBigWin(state.bet * 15, state.bet);
      playBigWin();
    } else if (e.key === 'M' || e.key === 'm') {
      triggerBigWin(state.bet * 75, state.bet);
      playMegaWin();
    } else if (e.key === 'U' || e.key === 'u') {
      triggerUnlucky(state.bet * UNLUCKY_BONUS_MULT);
      playPity();
    } else if (e.key === 'Y' || e.key === 'y') {
      triggerMystery(state.bet * 2);
      playMystery();
    }
  });
}

bootstrap();

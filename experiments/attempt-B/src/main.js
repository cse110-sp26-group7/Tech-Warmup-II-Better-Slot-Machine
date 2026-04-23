// experiments/attempt-B/src/main.js
import { createRng } from './rng.js';
import { spin, generateGrid } from './engine.js';
import { INITIAL_STATE, BET_STEPS } from './paytable.js';
import {
  renderGrid, highlightWins, renderBreakdown, renderHud, renderPaytable,
  setSpinEnabled, setResetVisible, triggerBigWin, wireEvents,
} from './ui.js';
import { playSpin, playWin, playBigWin, playMegaWin } from './sound.js';

const rng = createRng();

/** @type {import('./types.js').GameState} */
let state = { ...INITIAL_STATE };

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
    renderGrid(result.grid);
    highlightWins(result.wins);
    renderBreakdown(result.wins);
    triggerBigWin(result.payout, state.bet);
    render(result.wins);

    if (result.payout > 0) {
      const ratio = result.payout / state.bet;
      if (ratio >= 50) playMegaWin();
      else if (ratio >= 10) playBigWin();
      else playWin();
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

  // Test hooks — let devs trigger BIG/MEGA effects without waiting for a rare RNG roll.
  // Shift+B = BIG WIN preview, Shift+M = MEGA WIN preview. Safe to remove for final build.
  window.addEventListener('keydown', (e) => {
    if (!e.shiftKey) return;
    if (e.key === 'B' || e.key === 'b') {
      triggerBigWin(state.bet * 15, state.bet);
      playBigWin();
    } else if (e.key === 'M' || e.key === 'm') {
      triggerBigWin(state.bet * 75, state.bet);
      playMegaWin();
    }
  });
}

bootstrap();

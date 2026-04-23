// experiments/attempt-B/src/main.js
import { createRng } from './rng.js';
import { spin, generateGrid } from './engine.js';
import { INITIAL_STATE, BET_STEPS } from './paytable.js';
import {
  renderGrid, highlightWins, renderBreakdown, renderHud, renderPaytable,
  setSpinEnabled, setResetVisible, triggerBigWin, wireEvents,
} from './ui.js';

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
  try {
    const result = spin(state, state.bet, rng);
    state = result.newState;
    renderGrid(result.grid);
    highlightWins(result.wins);
    renderBreakdown(result.wins);
    triggerBigWin(result.payout, state.bet);
    render(result.wins);
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
}

bootstrap();

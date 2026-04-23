// experiments/attempt-B/src/ui.js
import { SYMBOLS, PAYLINES, payoutFor } from './paytable.js';

// ----- cached DOM refs -----

const balanceEl = document.getElementById('balance');
const betEl = document.getElementById('bet');
const lastWinEl = document.getElementById('last-win');
const reelsEl = document.getElementById('reels');
const breakdownEl = document.getElementById('breakdown');
const breakdownPanelEl = document.querySelector('.breakdown-panel');
const ptCompactEl = document.getElementById('paytable-compact');
const ptLinesEl = document.getElementById('paytable-lines');
const ptDialogCompactEl = document.getElementById('paytable-dialog-compact');
const ptDialogLinesEl = document.getElementById('paytable-dialog-lines');
const ptDialogEl = document.getElementById('paytable-dialog');
const ptBtnEl = document.getElementById('paytable-btn');
const ptCloseEl = document.getElementById('paytable-close');
const spinBtn = document.getElementById('spin');
const betUpBtn = document.getElementById('bet-up');
const betDownBtn = document.getElementById('bet-down');
const maxBetBtn = document.getElementById('max-bet');
const resetOverlayEl = document.getElementById('reset-overlay');
const resetBtnEl = document.getElementById('reset-btn');
const bigWinEl = document.getElementById('big-win-overlay');
const bigWinLabelEl = document.getElementById('big-win-label');

// ----- render functions -----

/** @param {import('./types.js').Grid} grid */
export function renderGrid(grid) {
  reelsEl.innerHTML = '';
  for (let col = 0; col < grid.cols; col++) {
    const colEl = document.createElement('div');
    colEl.className = 'reel-col';
    for (let row = 0; row < grid.rows; row++) {
      const sym = grid.reels[col][row];
      const cell = document.createElement('div');
      cell.className = `cell sym-${sym}`;
      cell.dataset.col = String(col);
      cell.dataset.row = String(row);
      cell.style.setProperty('--row', String(row));
      cell.innerHTML = `<svg viewBox="0 0 100 100"><use href="src/assets/symbols.svg#sym-${sym}"></use></svg>`;
      colEl.appendChild(cell);
    }
    reelsEl.appendChild(colEl);
  }
}

/** @param {import('./types.js').Win[]} wins */
export function highlightWins(wins) {
  reelsEl.querySelectorAll('.cell.hot').forEach(el => el.classList.remove('hot'));

  const sorted = [...wins].sort((a, b) => b.payout - a.payout || a.lineId - b.lineId);
  sorted.forEach((win, i) => {
    const payline = PAYLINES.find(p => p.id === win.lineId);
    if (!payline) return;
    for (let col = 0; col < win.count; col++) {
      const row = payline.rows[col];
      const cell = reelsEl.querySelector(
        `.cell[data-col="${col}"][data-row="${row}"]`,
      );
      if (cell) {
        cell.style.animationDelay = `${i * 120}ms`;
        cell.classList.add('hot');
      }
    }
  });
}

/** @param {import('./types.js').Win[]} wins */
export function renderBreakdown(wins) {
  breakdownEl.innerHTML = '';

  if (wins.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'bd-empty';
    empty.textContent = '— no wins —';
    breakdownEl.appendChild(empty);
    breakdownPanelEl.classList.remove('visible');
    return;
  }

  const sorted = [...wins].sort((a, b) => b.payout - a.payout || a.lineId - b.lineId);
  for (const w of sorted) {
    const row = document.createElement('div');
    row.className = 'bd-row';
    row.innerHTML = `
      <span>L${String(w.lineId).padStart(2, '0')}</span>
      <span>${w.count}× ${w.symbol}</span>
      <span class="bd-gain">+${w.payout.toFixed(2)}</span>
    `;
    breakdownEl.appendChild(row);
  }

  breakdownPanelEl.classList.add('visible');
}

/** @param {{balance: number, bet: number, lastWin: number}} hud */
export function renderHud({ balance, bet, lastWin }) {
  balanceEl.textContent = balance.toFixed(1);
  betEl.textContent = String(bet);
  lastWinEl.textContent = lastWin > 0 ? `+${lastWin.toFixed(2)}` : '0';
  if (lastWin > 0) {
    lastWinEl.classList.remove('pulse');
    // reflow forces the animation to restart on re-add — CSS-only restart trick
    void lastWinEl.offsetWidth;
    lastWinEl.classList.add('pulse');
  } else {
    lastWinEl.classList.remove('pulse');
  }
}

/** @param {boolean} enabled */
export function setSpinEnabled(enabled) {
  spinBtn.disabled = !enabled;
}

/** @param {import('./types.js').Win[]} wins */
export function renderPaytable(wins) {
  renderPaytableInto(ptCompactEl, ptLinesEl, wins);
  if (ptDialogCompactEl && ptDialogLinesEl) {
    renderPaytableInto(ptDialogCompactEl, ptDialogLinesEl, wins);
  }
}

function renderPaytableInto(compactTarget, linesTarget, wins) {
  compactTarget.innerHTML = '';
  const hitSymbols = new Set(wins.map(w => w.symbol));
  for (const sym of SYMBOLS) {
    const row = document.createElement('div');
    row.className = `pt-row ${hitSymbols.has(sym) ? 'on' : ''}`;
    row.innerHTML = `
      <span class="pt-name">${sym}</span>
      <span class="pt-val">×3 ${payoutFor(sym, 3)}</span>
      <span class="pt-val">×4 ${payoutFor(sym, 4)}</span>
      <span class="pt-val">×5 ${payoutFor(sym, 5)}</span>
    `;
    compactTarget.appendChild(row);
  }

  linesTarget.innerHTML = '';
  const hitLineIds = new Set(wins.map(w => w.lineId));
  for (const pl of PAYLINES) {
    const row = document.createElement('div');
    row.className = `pl-row ${hitLineIds.has(pl.id) ? 'on' : ''}`;
    row.innerHTML = `
      <span>#${String(pl.id).padStart(2, '0')}</span>
      <span>${pl.rows.join('-')}</span>
    `;
    linesTarget.appendChild(row);
  }
}

// ----- event wiring -----

/**
 * @param {{
 *   onSpin: () => void,
 *   onBetUp: () => void,
 *   onBetDown: () => void,
 *   onMaxBet: () => void,
 *   onReset: () => void,
 * }} handlers
 */
export function wireEvents(handlers) {
  spinBtn.addEventListener('click', handlers.onSpin);
  betUpBtn.addEventListener('click', handlers.onBetUp);
  betDownBtn.addEventListener('click', handlers.onBetDown);
  maxBetBtn.addEventListener('click', handlers.onMaxBet);
  resetBtnEl.addEventListener('click', handlers.onReset);
  ptBtnEl.addEventListener('click', () => ptDialogEl.showModal());
  ptCloseEl.addEventListener('click', () => ptDialogEl.close());
}

/** @param {boolean} show */
export function setResetVisible(show) {
  resetOverlayEl.hidden = !show;
}

/**
 * @param {number} payout
 * @param {number} bet
 */
export function triggerBigWin(payout, bet) {
  if (bet <= 0) return;
  const ratio = payout / bet;
  if (ratio < 10) return;

  bigWinEl.classList.remove('active', 'mega');
  // reflow forces the animation to restart on re-add — CSS-only restart trick
  void bigWinEl.offsetWidth;

  if (ratio >= 50) {
    bigWinLabelEl.textContent = 'MEGA WIN';
    bigWinEl.classList.add('active', 'mega');
  } else {
    bigWinLabelEl.textContent = 'BIG WIN';
    bigWinEl.classList.add('active');
  }
}

# DATA HEIST

A cyberpunk-themed 5×3 video slot machine built with vanilla JavaScript, HTML, and CSS — no frameworks, no audio files.

---

## Overview

You are a rogue street runner breaking into megacorp data vaults. Every spin is a *run*; every payout is data exfiltrated from the system. The visual identity draws from Japanese cyberpunk aesthetics — neon on dark, Gold Kanji vault seals, Chrome Skull ICE nodes, and a Glitch Wild that fractures reality.

**Mechanics at a glance:**

- 5 reels × 3 rows, 25 fixed paylines evaluated left-to-right
- 10 paying symbols tiered from Cherry (low) to Gold Kanji / Chrome Skull (top)
- Wild symbol substitutes on reels 2–4
- Neural Chip scatter triggers free spins (3 → 10 spins, 4 → 15, 5 → 25)
- Bet range: 25–2,500 Crypto-Credits per spin (1–100 CC per line × 25 lines)
- Auto-spin with configurable count and automatic stop conditions
- All audio synthesised in real time with the Web Audio API — no external files needed

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm 9 or later

---

## Installation

```bash
npm install
```

Install Playwright's browser binaries the first time (required for e2e tests):

```bash
npx playwright install chromium
```

---

## Running the Game Locally

```bash
npm start
```

Opens `http://localhost:8080` in your default browser. The server serves the `src/` directory statically; no build step is required.

---

## Unit Tests (Jest)

```bash
# Run all unit tests once
npm test

# Run in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

Coverage output is written to `coverage/`. Unit tests live in `tests/` and cover the four pure-logic modules: `payout`, `paylines`, `rng`, and `state`.

---

## End-to-End Tests (Playwright)

```bash
npm run test:e2e
```

Playwright automatically starts the dev server on port 8080, runs the test suite headlessly in Chromium, then shuts the server down. No manual `npm start` is needed beforehand.

The e2e suite (`tests/e2e/slot.spec.js`) covers seven scenarios:

| # | Scenario |
|---|---|
| 1 | Page loads, title visible, balance shows 10 000 |
| 2 | Clicking SPIN deducts the bet and applies any payout |
| 3 | After a spin the 5×3 grid is fully populated (15 symbols) |
| 4 | Bet `+` / `−` buttons adjust the displayed bet value |
| 5 | Auto-spin completes 3+ rounds and updates balance each time |
| 6 | Paytable modal opens and closes correctly |
| 7 | Free-spins counter is hidden when no bonus round is active |

---

## Linting

```bash
# Lint JS source and test files
npm run lint

# Auto-fix lint errors where possible
npm run lint:fix

# Lint HTML files
npm run lint:html

# Lint everything (JS + HTML)
npm run lint:all
```

The ESLint configuration (`.eslintrc.json`) enforces single quotes, required semicolons, no unused variables, and warns on `console` calls. HTMLHint checks the HTML entry point.

---

## Project Structure

```
data-heist/
├── src/
│   ├── index.html          # Game shell and DOM structure
│   ├── css/
│   │   └── styles.css      # All styling — layout, neon effects, animations, responsive rules
│   └── js/
│       ├── main.js         # Entry point: wires event listeners and orchestrates the full spin flow
│       ├── state.js        # Immutable game-state management (balance, bet, spin count, auto-spin)
│       ├── rng.js          # Cryptographically secure RNG via Web Crypto API; generates the symbol matrix
│       ├── reels.js        # Symbol definitions (id, value, isWild) and five reel-strip arrays
│       ├── paylines.js     # 25 payline definitions and the helper that extracts symbols along a payline
│       ├── payout.js       # Payout calculation with wild substitution; scatter trigger; full-grid evaluation
│       ├── ui.js           # All DOM rendering — symbols, balance, bet, win display, animations, paytable modal
│       └── audio.js        # Web Audio API synthesiser — spin buzz, win fanfares, click blip, bonus stinger
├── tests/
│   ├── paylines.test.js    # Unit tests for paylines module
│   ├── payout.test.js      # Unit tests for payout calculation and scatter trigger
│   ├── rng.test.js         # Unit tests for RNG module
│   ├── state.test.js       # Unit tests for state management (setBet, placeBet, recordSpin, auto-spin)
│   └── e2e/
│       └── slot.spec.js    # Playwright end-to-end tests
├── jest.config.js          # Jest configuration (jsdom environment, ES module transform)
├── playwright.config.js    # Playwright configuration (Chromium, auto-starts http-server)
├── .eslintrc.json          # ESLint rules
├── STYLE-GUIDE.md          # Coding conventions for this codebase
└── package.json
```

### Source file responsibilities in detail

| File | Responsibility |
|---|---|
| `main.js` | Top-level coordinator. Handles DOM events, drives the spin sequence (validate → deduct → RNG → animate → evaluate → pay), manages auto-spin loop and error display. No game logic lives here. |
| `state.js` | Pure functions that return new state objects — `setBet`, `placeBet`, `recordSpin`, `setAutoSpin`, `decrementAutoSpin`, `setFreeSpins`. State is never mutated in place. |
| `rng.js` | `getRandomInt` (bias-free via rejection sampling over `Uint32Array`), `spinReels` (random stop index per reel), `generateSymbolMatrix` (builds the 5×3 visible window from stop positions with wrap-around). |
| `reels.js` | Exports the 11 symbol objects (`WILD`, `GOLD_KANJI`, …, `NEURAL_CHIP`), the five reel-strip arrays (`REEL_1`–`REEL_5`), the combined `REEL_STRIPS` array, and `getSymbolById`. |
| `paylines.js` | Exports the `PAYLINES` array (25 patterns of 5 row indices) and `getPaylineSymbols` which extracts the 5 symbols visible along one payline from the matrix. |
| `payout.js` | `calculatePayout` (consecutive-match counting with wild substitution, proportional formula), `checkScatterTrigger` (counts Neural Chips anywhere on the grid), `evaluateAllPaylines` (iterates all 25 paylines). |
| `ui.js` | Every DOM side-effect: `renderSymbolMatrix`, `renderBalance`, `renderBet`, `renderWin`, `renderPaylineHighlight` (SVG overlay), `renderFreeSpinsCounter`, `setSpinButtonState`, `animateReelSpin`, `celebrateWin` (three-tier animations), `openPaytable` / `closePaytable`. |
| `audio.js` | Lazy `AudioContext` initialisation on first user gesture. Exports `playSpinSound` / `stopSpinSound` (sawtooth + LFO loop), `playWinSound` (three-tier fanfare), `playClickSound`, `playBonusSound` (glitch burst + siren sweep + power chord), `setMuted`. |


| Contributor | Role |
|---|---|
| Ethan Carter | UX research, UI design |
| Gabrielle Wang | Frontend development |
| Kareem Nabulsi | Frontend development, state & payout logic, LLM Strategy |
| Michael Marras | User research, game design |
| Nhan Tri Danh | Frontend development |
| Theo Lee | Game design, reel mechanics, audio |
| Thy Doan | Visual identity, CSS, audio assets |

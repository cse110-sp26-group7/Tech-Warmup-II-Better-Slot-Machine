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

## User Needs & Acceptance Coverage

Every feature in **Data Heist** was driven by the personas in [`plan/personas/`](plan/personas/) and the acceptance criteria in [`plan/user-stories/`](plan/user-stories/). We kept returning to those documents throughout development so the build would serve real players with real motivations, not an abstract "user." We tried our best to address as many personas as possible within the scope of this milestone — the mapping below shows where that effort landed, including the places we've flagged honestly as future work rather than silently dropped.

### Personas → Delivered features

| Persona | What they need | How the build addresses it |
|---|---|---|
| **Marcus** — casual casino player | Strong theme, quick to pick up, bonus features, few buttons | Cohesive cyberpunk identity, large prominent **SPIN**, clearly labeled balance/bet, free-spins bonus, win-tier celebrations, SFX toggle |
| **Noah** — online gambler chasing the rush | Fast replay, big animations, bonus rounds, celebratory sounds | **AUTO SPIN**, **MAX BET**, scatter-triggered free spins (10 / 15 / 25) with **2× multiplier**, tiered win animations & audio (`winTiers.js`, `audio.js`) |
| **Bardow** — slot player chasing jackpots | Jackpot thrill; awareness of session to break chase-loss spirals | High-tier win feedback delivers the jackpot rush; **Last Spins** history panel surfaces session reality. *Future:* explicit responsible-gambling limits |
| **Scott** — rational / mathematical player | Understand the math, stretch a small budget | Full **PAYTABLE** modal with every symbol's payout and all **25 paylines** available at any time; precise bet controls (`−` / `+` / MAX BET). *Future:* surface RTP % and volatility |
| **Molly** — senior, budget-conscious | Extended entertainment, stay within a daily budget | 10,000 starting credits + small-step bet controls let a session last; clear win feedback and spin history reinforce entertainment value. *Future:* hard daily-budget cap and promo concept |

### User stories → Status

| # | Story | Status | Where in the build |
|---|---|---|---|
| 1 | Casual player — obvious UI (spin, bet, balance, win reaction) | ✅ Met | `src/index.html` top bar + controls bar + win display |
| 2 | Stealth / privacy mode | ⚠️ Future work | Responsive layout is in place; a dedicated discreet mode was not in this milestone |
| 3 | Paylines drawn on wins | ✅ Met | `src/js/paylines.js` + 25 paylines visualized in the paytable |
| 4 | New player — paytable available at any time | ✅ Met | **PAYTABLE** button + modal |
| 5 | Bonus-feature hunter — regular bonus rounds | ✅ Met | Neural Chip scatter → 10 / 15 / 25 free spins with 2× multiplier |
| 6 | Session tracker — last-spins side panel | ✅ Met | `side-panel--right` / `#spin-history-list` |
| 7 | Unlucky player — sympathetic feedback on dry streaks | ⚠️ Future work | Win tiers shipped; a losing-streak acknowledgement is the natural extension |

**Bottom line:** every one of the five personas informed at least one concrete feature in the shipped code, and five of seven user stories are directly met. The two remaining stories and the three persona-level future-work items above are documented openly so future iterations have a clear starting point.

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

Coverage output is written to `coverage/`. Unit tests live in `tests/` and cover the five pure-logic modules: `payout`, `paylines`, `rng`, `state`, and the `freeSpins` feature (scatter trigger, round logic, retriggers, multipliers).

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
│       ├── audio.js        # Web Audio API synthesiser — spin buzz, win fanfares, click blip, bonus stinger
│       └── winTiers.js     # Shared win-tier classifier (small/medium/big) used by main.js and ui.js
├── tests/
│   ├── paylines.test.js    # Unit tests for paylines module
│   ├── payout.test.js      # Unit tests for payout calculation and scatter trigger
│   ├── rng.test.js         # Unit tests for RNG module
│   ├── state.test.js       # Unit tests for state management (setBet, placeBet, recordSpin, auto-spin)
│   ├── freeSpins.test.js   # Unit tests for the free-spins feature (scatter trigger, round logic, retriggers, 2× multiplier)
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
| `winTiers.js` | Exports `classifyWinLevel(totalPayout, currentBet)` — shared helper that bins a payout into `'small' | 'medium' | 'big'` against the current total bet. Consumed by both `main.js` (audio tier selection) and `ui.js` (celebration animation tier). |


| Contributor | Role |
|---|---|
| Ethan Carter (Leader) | Core slot machine structure & UI principles |
| Gabrielle Wang (Leader) | Analysis of seven prominent slot titles; maintains `research-overview.md`; frontend development |
| Benjamin Signer | App categories, monetization, regulation; final slide deck |
| Johnny Huang | Player engagement features & visuals |
| Theo Lee | Architecture & cyberpunk wireframes / mockups; game design, reel mechanics, audio |
| Michael Marras | Qualitative player interview & persona; final presentation |
| Bishal Khatri | RTP, volatility, near-miss, auto-spin, user stories |
| Kareem Nabulsi | Player demographics & LLM strategy; frontend development; state & payout logic |
| Thy Doan | Slot types & DATA HEIST visual identity package; CSS, audio assets |
| Cindy Zhang | Retention mechanics & monetization patterns |
| Aarnav Gujjari | Explainable AI & regulatory frameworks |
| Nhan Tri Danh (Jack) | Core mechanics, RNG, symbol weighting; frontend development |

See [`plan/research-overview.md`](plan/research-overview.md) for each member's detailed contributions.

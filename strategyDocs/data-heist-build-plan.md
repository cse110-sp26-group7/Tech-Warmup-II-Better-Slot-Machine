# DATA HEIST — Build Plan

A phased prompt plan for building a web-based cyberpunk slot machine, scoped so each prompt is small enough for Claude Code to handle in a single turn.

---

## Phase 0 — Project Scaffold

### Prompt 0A — Initial Setup

> Create a new web-based slot machine project called `data-heist`. Set up the following structure:
>
> ```
> /src
>   index.html
>   /css
>     styles.css
>   /js
>     main.js
>     rng.js
>     reels.js
>     paylines.js
>     payout.js
>     ui.js
>     audio.js
>     state.js
> /tests
>   rng.test.js
>   payout.test.js
>   paylines.test.js
> /assets
>   /symbols
>   /audio
>   /fonts
> package.json
> .eslintrc.json
> .gitignore
> README.md
> ```
>
> Initialize `package.json` with scripts for lint, test, and start. Add ESLint with rules: single quotes, semicolons required, no unused variables, no `console.log` in production. Add Jest for unit testing. Do not write any game logic yet — scaffold only.
> Note: the repo already has a .gitignore and README.md from
> GitHub initialization. Update them if needed rather than
> overwriting them.

**Outcome:** Claude generated full project scaffold with all folders (assets, src, test), package.json, eslintrc, updated gitignore

**Linter Result:** can't run npm run lint:all because it's missing from package.json

**Tests Result:** All 3 test failed (tests will be written in prompt 1D)

**Issues Encountered:** missing lint:all script, all tests failed

**Hand-Edit Required?** No

**Files Changed:** assets, package.json, .eslintrc.json, .gitignore, jest.config.js, src/index.html, tests (paylines.test.js, payout.test.js, rng.test.js)

### Prompt 0B — ESLint + HTML Validation

> Add `htmlhint` to the project for HTML validation and configure it in `.htmlhintrc`. Add a `lint:html` script to `package.json`. Also add a `lint:all` script that runs both ESLint and htmlhint together. Make sure the base `index.html` passes both linters cleanly before we write any game code.

**Outcome:** Claude added lint:all script to package.json

**Linter Result:** passed

**Tests Result:** N/A

**Issues Encountered:** N/A

**Hand-Edit Required?** No

**Files Changed:** package.json

---

## Phase 1 — Core Game Logic (no UI yet)

### Prompt 1A — RNG Module

> In `src/js/rng.js`, implement a cryptographically fair RNG module using `crypto.getRandomValues()`. Export the following with full JSDoc type annotations:
>
> - `getRandomInt(min, max)` — inclusive range
> - `spinReels(reelStrips)` — accepts an array of reel strip arrays and returns a random stop index for each reel
> - `generateSymbolMatrix(reelStrips, rows)` — returns a 2D array of symbols based on random reel stops
>
> Use meaningful names throughout. Write zero UI code here. After writing the module, run ESLint and fix any issues before showing me the result.

**Outcome:** Implements all the functions I asked for in rng.js

**Linter Result:** Passed

**Tests Result:** N/A

**Issues Encountered:** N/A

**Hand-Edit Required?** No

**Files Changed:** src/js/rng.js

### Prompt 1B — Symbol Definitions

> In `src/js/reels.js`, define the DATA HEIST cyberpunk symbol set and reel strips. Symbols should be:
>
> - **Wild (Glitch W)** — wild, substitutes for all symbols except Scatter and Bonus, appears on reels 2, 3, 4 only
> - **Gold Kanji (金)** — top pay, megacorp vault seal
> - **Chrome Skull** — top pay, black-ICE defense node
> - **Cyber Iris** — high pay, ocular implant
> - **Katana** — high pay, ronin's blade
> - **Neon 7** — high pay, lucky protocol 777
> - **Diamond** — mid pay, encrypted gem
> - **Bell** — mid pay, intrusion alert
> - **BAR** — low pay, data bar
> - **Cherry** — low pay, red data node
>
> Define each symbol as a named constant object with `id`, `displayName`, `cyberpunkLabel`, `value`, and `isWild` fields. Define 5 reel strips where high-value symbols appear less frequently than low-value ones. Export `SYMBOLS`, `REEL_STRIPS`, and a `getSymbolById(id)` helper. Add full JSDoc annotations.

### Prompt 1C — Payline Definitions

> In `src/js/paylines.js`, define 25 fixed paylines for a 5-reel × 3-row grid. Each payline should be an array of 5 row indices (0, 1, or 2) representing which row to read on each reel. Include straight lines, V-shapes, zigzags, and diagonal patterns. Export `PAYLINES` as a named constant and a `getPaylineSymbols(matrix, payline)` helper that extracts the 5 symbols a given payline reads from a symbol matrix. Full JSDoc required.

### Prompt 1D — Write Payout Tests FIRST (TDD)

> Before writing the payout logic, write unit tests in `tests/payout.test.js` for a `calculatePayout(paylineSymbols, betAmount)` function. Test cases must cover:
>
> - 5 of a kind (Gold Kanji) at minimum bet
> - 5 of a kind (Cherry) at minimum bet
> - 3 of a kind starting from reel 1
> - 3 of a kind NOT starting from reel 1 (should not pay)
> - Wild (Glitch W) substituting to complete a 5-of-a-kind
> - No match
> - Bet multiplier scaling (same symbols, 2× bet = 2× payout)
>
> Use descriptive test names. Do not write the implementation yet.

### Prompt 1E — Payout Implementation

> Now implement `calculatePayout(paylineSymbols, betAmount)` in `src/js/payout.js` so that all tests in `tests/payout.test.js` pass. Rules: wins only count if matching symbols start from the leftmost reel (reel 0). Wilds substitute for any non-wild symbol. Payout = symbol base value × number of matching symbols × `betAmount`. Export `calculatePayout` and an `evaluateAllPaylines(matrix, paylines, betAmount)` function that returns total payout and an array of winning payline indices. Full JSDoc required. Run tests after — show me the passing output.

### Prompt 1F — State Manager

> In `src/js/state.js`, implement a simple game state module. It should hold and export:
>
> - `balance` (default 10000 Crypto-Credits)
> - `currentBet` (default 25)
> - `isSpinning` (boolean)
> - `lastWin` (number)
> - `totalSpins` (number)
> - `autoSpinCount` (number, 0 = off)
> - `freeSpinsRemaining` (number, 0 = not in bonus)
>
> Export pure functions to update state: `placeBet(amount)`, `recordSpin(payout)`, `setAutoSpin(count)`, `decrementAutoSpin()`, `setFreeSpins(count)`, `decrementFreeSpins()`, `resetGame()`. State should never be mutated directly — only through these functions. Full JSDoc with `@typedef` for the state shape.

---

## Phase 2 — Visual Design (Cyberpunk Theme)

### Prompt 2A — Color System and CSS Variables

> In `src/css/styles.css`, define a CSS custom property system for the DATA HEIST cyberpunk theme. Include:
>
> - **Backgrounds:** main background `#0D0B1A`, card/reel background `#1A1528`, panel background `#12101F`
> - **Neon accents:** `#C8FF00` neon yellow-green (spin button, win highlights), `#FF2D78` neon pink/magenta (wild symbols, payline labels), `#00FFD4` neon cyan (credits display, some symbols), `#B44FFF` neon purple (chrome skull symbol)
> - **Symbol accents:** `#FFD700` neon gold (Gold Kanji symbol)
> - **UI text:** `#FFFFFF` primary white, `#6B6480` muted gray-purple for inactive elements, `#00FF88` win green, `#FF4444` loss red
> - **Border/glow:** `#C8FF00` active reel border on winning row, `#2A2040` subtle dark purple card border
>
> Do not write any layout or component styles yet — variables only. Comment each group clearly.

### Prompt 2B — Base Layout

> Using the CSS variables defined, build the base layout in `index.html` and `styles.css`. The layout should have:
>
> - A full-viewport dark background (`#0D0B1A`) with a subtle scanline or grid texture overlay using CSS only
> - A centered game container (max-width 1100px on desktop, full-width on mobile)
> - A top bar with: game title "DATA_HEIST // VOL.01" on the left using the Google Font "Share Tech Mono" or "Orbitron", balance display on the right
> - A main reel area placeholder (5 columns × 3 rows grid)
> - A controls bar below the reels with placeholders for: balance display, bet controls, spin button, auto-spin button, max bet button
> - A win display area and free-spins counter below the controls
> - A side panel on the left showing payline numbers
> - A side panel on the right showing last spins history
>
> Mobile-first responsive CSS. No JavaScript yet. Validate HTML with htmlhint and lint CSS — show me clean output.

### Prompt 2C — Symbol Rendering

> In `src/js/ui.js`, implement symbol rendering. Each symbol cell in the 5×3 grid should render as a styled div with:
>
> - A themed Unicode character as a placeholder visual (W for Wild/Glitch, 金 for Gold Kanji, ☠ for Chrome Skull, ◎ for Cyber Iris, ⚔ for Katana, 7 for Neon 7, ◆ for Diamond, ♦ for Bell, ▬ for BAR, ● for Cherry)
> - The symbol's `displayName` as a visually hidden label for accessibility (`aria-label`)
> - Color-coded borders and glow matching the symbol's neon accent color from the CSS variable system
> - A CSS class matching the symbol id for future animation targeting
>
> Export a `renderSymbolMatrix(matrix)` function that takes the 2D array from the RNG module and updates the DOM. No spin animation yet — static render only. Full JSDoc.

### Prompt 2D — Controls UI

> In `src/js/ui.js`, add functions to render and update the controls bar. Implement:
>
> - `renderBalance(balance)` — updates the Crypto-Credits balance display
> - `renderBet(bet)` — updates the bet display
> - `renderWin(amount)` — shows win amount in neon green (`#00FF88`) if > 0, hides if 0
> - `renderPaylineHighlight(winningPaylineIndices, matrix)` — draws neon pink (`#FF2D78`) highlights connecting winning symbols across the reels
> - `renderFreeSpinsCounter(count)` — shows or hides the free spins remaining indicator
> - `setSpinButtonState(isSpinning)` — disables/enables and changes label of spin button
>
> All functions must be pure DOM updates with no game logic. Full JSDoc.

---

## Phase 3 — Spin Flow & Animations

### Prompt 3A — Spin Orchestration

> In `src/js/main.js`, implement the core spin loop as an async function `executeSpin()`. The sequence must be:
>
> 1. Validate the player can afford the bet (check state)
> 2. Deduct bet from balance, update state
> 3. Set `isSpinning = true`, disable spin button
> 4. Call RNG to generate a symbol matrix
> 5. Trigger reel spin animation (stubbed for now — just a 1s delay)
> 6. Render the resulting symbol matrix
> 7. Evaluate all paylines, calculate total payout
> 8. Record spin in state
> 9. If payout > 0, trigger win animation (stubbed)
> 10. Update balance display, win display, last spins panel
> 11. Set `isSpinning = false`, re-enable spin button
> 12. If auto-spin is active, decrement counter and recurse after a short delay
>
> Wire the spin button's click event to `executeSpin()`. Full JSDoc. Handle the insufficient-balance case with a visible UI message styled in neon red (`#FF4444`).

### Prompt 3B — Reel Spin Animation

> Replace the stub delay in the spin animation with a real CSS-based reel spin effect. Each of the 5 reels should:
>
> - Blur and scroll upward rapidly for ~800ms (suggest CSS animation with `transform: translateY`)
> - Stagger their stop times left to right (reel 1 stops first, reel 5 stops last, ~150ms apart)
> - Snap to the final symbol matrix values when they stop
> - Flash a brief neon cyan (`#00FFD4`) glow on each reel as it stops
>
> Implement this in `src/css/styles.css` (animation keyframes) and an `animateReelSpin(onComplete)` function in `src/js/ui.js`. The function should return a Promise that resolves when all reels have stopped. Do not use `setTimeout` chains — use Promise-based animation end detection. Run linter after.

### Prompt 3C — Win Celebration Animation

> Implement a `celebrateWin(amount, winningPaylineIndices)` function in `src/js/ui.js`. Behavior should scale with win size:
>
> - **Small win (1–2× bet):** winning symbols pulse neon yellow-green (`#C8FF00`), win amount counts up quickly
> - **Medium win (3–9× bet):** neon pink payline traces flash, symbols pulse, dramatic count-up with synth sound
> - **Big win (10×+ bet):** full-screen overlay with "SYSTEM BREACH — BIG WIN" text in neon green, animated glitch border effect, data-rain CSS animation in background
>
> Use CSS classes toggled by JS — no canvas. All animations must be purely CSS keyframes triggered by class addition. Remove animation classes after they complete using `animationend` event listeners. Full JSDoc.

---

## Phase 4 — Features

### Prompt 4A — Bet Controls

> Implement bet adjustment controls. Add + and − buttons that adjust the bet per line in increments of 1, with a minimum of 1 CC and maximum of 100 CC per line (total bet = line bet × 25 paylines). Add a "MAX BET" button that sets line bet to 100. All three buttons must:
>
> - Update state via `placeBet()`
> - Re-render the bet display showing both line bet and total bet
> - Be disabled appropriately (− disabled at min, + disabled at max, all disabled while spinning)
>
> Write a unit test in a new `tests/state.test.js` covering the boundary conditions. Full JSDoc.

### Prompt 4B — Auto-Spin

> Implement auto-spin. Add an auto-spin button that cycles through options: OFF → 10 → 25 → 50 → 100 → OFF. When active:
>
> - Show a countdown indicator next to the button
> - Continue spinning automatically after each result
> - Stop immediately if: balance drops below current bet, balance reaches zero, a bonus round triggers, or the player clicks the button again
> - Add a 500ms pause between auto-spins so the player can see results
>
> Auto-spin must use the existing `executeSpin()` loop — no duplicate spin logic. Full JSDoc. Add a unit test for the stop conditions.

### Prompt 4C — Neural Chip Scatter Bonus (Free Spins)

> Implement a free-spins bonus round triggered when 3 or more Neural Chip (scatter) symbols land anywhere on the reels. When triggered:
>
> - Show a modal overlay styled as a terminal screen: "ACCESS GRANTED — SYSTEM BREACH — 10 FREE SPINS" with a scrolling green text animation
> - Run 10 free spins automatically (3 scatters = 10, 4 scatters = 15, 5 scatters = 25), using the current bet but not deducting from balance
> - During free spins, all wins are multiplied by 2×. Wilds become expanding wilds (fill the full reel column)
> - Display a free-spin counter in the UI at all times during the bonus
> - After all free spins complete, show total bonus winnings and return to normal play
>
> Implement `checkScatterTrigger(matrix)` in `src/js/payout.js` and `runFreeSpinsRound(bet, spinCount)` in `src/js/main.js`. Full JSDoc. Write a unit test for `checkScatterTrigger` covering 2 scatters (no trigger), 3 scatters (trigger, 10 spins), 4 scatters (trigger, 15 spins), and 5 scatters (trigger, 25 spins).

### Prompt 4D — Paytable Modal

> Add a "PAYTABLE" button that opens a modal showing:
>
> - Each symbol with its Unicode placeholder, cyberpunk name, and payout for 3, 4, and 5 of a kind at the current bet level
> - A note that Wild (Glitch W) substitutes for all symbols except Scatter and Bonus, appears on reels 2–4 only
> - A note that 3+ Neural Chip scatters anywhere triggers free spins with 2× multiplier
> - Payline diagrams showing all 25 paylines numbered and color-coded in neon pink
>
> The modal should be styled as a dark terminal/HUD panel with neon borders. Dismissible by clicking outside it or an X button. No new JS modules needed — add to `ui.js`. Full JSDoc.

---

## Phase 5 — Audio

### Prompt 5A — Audio Module

> In `src/js/audio.js`, implement an audio manager using the Web Audio API. Export:
>
> - `initAudio()` — creates `AudioContext` on first user interaction (required by browsers)
> - `playSpinSound()` — looping electric/digital reel sound during spin
> - `stopSpinSound()` — stops the spin loop
> - `playWinSound(winLevel)` — accepts `'small'`, `'medium'`, or `'big'` and plays a cyberpunk-styled synthesized tone sequence (use oscillators with sawtooth/square waves for a neon/electric feel)
> - `playClickSound()` — short sharp digital UI click feedback
> - `playBonusSound()` — dramatic glitchy synth stinger for the scatter bonus trigger ("ACCESS GRANTED" feel)
> - `setMuted(bool)` — global mute toggle
>
> All sounds should be synthesized with oscillators so no audio files are required. Use sawtooth, square, and sine wave types to create a cyberpunk aesthetic. Full JSDoc. Add a mute button to the UI wired to `setMuted()`.

---

## Phase 6 — End-to-End Tests

### Prompt 6A — Playwright Setup

> Set up Playwright for end-to-end testing. Add it to `package.json` devDependencies and create a `playwright.config.js` targeting Chromium on localhost. Add an `e2e` script to `package.json`. Create `tests/e2e/slot.spec.js` with the following test cases:
>
> - Page loads, title "DATA_HEIST" is visible, balance shows 10000
> - Clicking spin deducts the bet from the balance
> - After a spin, the 5×3 symbol grid is fully populated
> - Bet + and − buttons adjust the displayed bet value
> - Auto-spin runs 3 times and updates the balance each time
> - Paytable modal opens and closes
> - Free spins counter is hidden when not in a bonus round
>
> Tests must use descriptive names and `getByRole` / `getByText` selectors where possible. Run the suite and show me passing output.

---

## Phase 7 — Final Polish & Standards Pass

### Prompt 7A — Full Lint and Doc Pass

> Run `lint:all` across the entire project. Fix every ESLint and htmlhint error. Then audit every exported function in `rng.js`, `reels.js`, `paylines.js`, `payout.js`, `state.js`, `ui.js`, `audio.js`, and `main.js` — any function missing a JSDoc block with `@param` and `@returns` annotations should have one added. Show me the final clean lint output.

### Prompt 7B — Clean Code Audit

> Review the entire codebase for clean code violations. Flag and fix:
>
> - Any function longer than 20 lines that can be split
> - Any magic numbers (replace with named constants)
> - Any logic duplicated in more than one place (extract to a shared helper)
> - Any variable names under 3 characters or that don't describe their purpose
> - Any async operations without try/catch error handling
>
> Show me each change as a before/after diff. Run all tests after to confirm nothing broke.

### Prompt 7C — Consistency Pass

> Read all JS files and identify style inconsistencies — quote style, spacing, comment format, naming convention, error handling pattern. Produce a one-page `STYLE-GUIDE.md` in the repo root that documents the conventions actually used in this codebase, then fix any files that deviate from the majority pattern.

### Prompt 7D — README

> Write a `README.md` for the `data-heist` project. Include: project description and cyberpunk theme overview, how to install dependencies, how to run the game locally, how to run unit tests, how to run Playwright e2e tests, how to run the linter, a brief description of each source file's responsibility, and a credits section. Format it cleanly with Markdown headers and code blocks.

---

## Log Entry Template

Copy this block for every prompt executed:

```markdown
## Entry [N] — [date] [time]

**Phase:** [0–7]
**Prompt used:** [paste prompt]
**Outcome:** [what Claude produced or Did it match what you asked for?]
**Linter result:** [Passed / Failed]
**Tests result:** [Passed / Failed — details]
**Issues encountered:** [anything unexpected]
**Hand-edit required?** Yes / No
→ If yes: [what failed, what you changed manually]
**Files changed:** [list]
**Commit message:** feat/fix/test/docs: [description]
```

---

_Work through these in order and you'll have a fully implemented, linted, tested, documented DATA HEIST cyberpunk slot machine by the deadline. Each prompt is scoped small enough that Claude Code can handle it in a single turn without going off the rails._

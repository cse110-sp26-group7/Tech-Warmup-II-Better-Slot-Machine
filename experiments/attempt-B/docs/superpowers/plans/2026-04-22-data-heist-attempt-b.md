# DATA HEIST — Attempt B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Data Heist slot machine (Attempt B, context-engineered) from scratch under the rules of the design spec, with all deliverables in `experiments/attempt-B/`.

**Architecture:** Vanilla HTML + CSS + ES modules with a pure-core / DOM-layer split. Five modules (`rng`, `paytable`, `engine`, `ui`, `main`) + a types file. Context engineering harness (SPEC + CLAUDE.md + 3 skill files + ai-plan/ai-use-log) authored before any code.

**Tech Stack:** HTML5, CSS3 (CSS custom properties, grid, media queries), ES Modules (no bundler), Node built-in `node --test` runner, ESLint, stylelint, html-validate.

**Spec reference:** `docs/superpowers/specs/2026-04-22-data-heist-attempt-b-design.md`. All `§X.Y` citations below refer to that document.

**Scope guardrail:** Every path in this plan is relative to `experiments/attempt-B/`. Do not read from or write to any directory above `experiments/attempt-B/` (no `plan/`, no `src/` at repo root, no sibling `experiments/attempt-A/`).

---

## Phase A — Context Engineering Harness

Everything in Phase A is authored **before** writing code. The harness files constrain the code generation that follows.

### Task 1: Write `SPEC.md` (lean implementation-facing reference)

**Files:**
- Create: `experiments/attempt-B/SPEC.md`

- [ ] **Step 1: Create the file with the following content**

```markdown
# DATA HEIST — Implementation Spec

This file is the single source of truth for WHAT the game does. The full rationale lives in `docs/superpowers/specs/2026-04-22-data-heist-attempt-b-design.md`; this file is the condensed reference for coding.

## 1. Game Rules

- 5 columns × 3 rows. 25 fixed paylines, evaluated left-to-right.
- Each of the 15 cells is an independent weighted draw; symbol weights are uniform across reels.
- Wild substitutes for any symbol. A pure-wild run pays from the `wild` row of the paytable.
- A line pays when ≥ 3 matching symbols (including wilds) extend from reel 0.

## 2. Symbols (8)

`neural_chip`, `katana`, `oni_mask`, `neon_7`, `cyber_iris`, `chrome_skull`, `gold_kanji`, `wild`.

## 3. Symbol Weights (Σ = 100)

```
neural_chip  24
katana       19
oni_mask     16
neon_7       13
cyber_iris   11
chrome_skull  7
gold_kanji    5
wild          5
```

## 4. Paytable (× bet)

| symbol | ×3 | ×4 | ×5 |
|---|---:|---:|---:|
| neural_chip | 0.2 | 0.5 | 1.0 |
| katana | 0.3 | 0.8 | 2.0 |
| oni_mask | 0.5 | 1.5 | 4.0 |
| neon_7 | 1.0 | 3.0 | 8.0 |
| cyber_iris | 1.5 | 5.0 | 15.0 |
| chrome_skull | 2.5 | 10.0 | 50.0 |
| gold_kanji | 5.0 | 25.0 | 100.0 |
| wild | 10.0 | 50.0 | 200.0 |

## 5. Paylines

25 fixed paths, each a 5-element array of row indices (0 = top, 2 = bottom). Full list in `src/paytable.js`. See design spec §4.4.

## 6. State

- `INITIAL_STATE = { balance: 1000, bet: 10, lastSpin: null }`
- `BET_STEPS = [1, 5, 10, 25, 50, 100]`
- `MAX BET` sets bet to the largest step ≤ balance.
- SPIN disabled when `bet > balance`. RESET overlay when balance = 0.

## 7. RTP

Target 96 ± 1%. Verified with a 100,000-spin Monte Carlo using `createRng(42)`. Tune by scaling paytable values if out of band.

## 8. Differentiators

1. **Payline highlight animation** — acid-green glow sweep on winning rows.
2. **Win breakdown panel** — right sidebar (desktop/tablet) / toast (mobile), renders per-line `<line id> · <count>× <symbol> · +<payout>`.

## 9. Responsive

- ≥ 1024 px: 3-column (paytable | reels | breakdown) + controls bar.
- 640–1023 px: sides stack below reels.
- < 640 px: HUD + reels + bet stepper + spin row; paytable in `<dialog>`; breakdown as toast.

## 10. Out of Scope

Scatter, Free Spins, multipliers, cascading, auto-spin, both-ways pay, session history, sound, accounts.
```

- [ ] **Step 2: Commit**

```bash
git add experiments/attempt-B/SPEC.md
git commit -m "attempt-B: lean implementation SPEC"
```

---

### Task 2: Write `CLAUDE.md` (project-wide rules)

**Files:**
- Create: `experiments/attempt-B/CLAUDE.md`

- [ ] **Step 1: Create the file with the following content**

```markdown
# DATA HEIST — Attempt B Project Instructions

## Authority

- `SPEC.md` is the single source of WHAT the game does. Do not duplicate its content here.
- `research/overview.md` (overview wins on conflict) and `research/visuals_and_assets/cyberpunk/tokens-cyberpunk.html` together define visual identity.
- Before editing any file under `src/` or `tests/`, read the matching skill in `.claude/skills/`.

## Module Boundaries (hard)

- Pure core: `rng.js`, `engine.js`, `paytable.js` — no DOM, no network, no globals, no side effects.
- UI: `ui.js` — DOM writes only. Imports no core module.
- Orchestrator: `main.js` — the ONLY module that imports both core and ui; holds the single mutable `state` variable.
- Dependency direction: `paytable.js ← engine.js ← main.js → ui.js`, with `rng.js ← engine.js` only.

## Coding Style

- ES modules, named exports only (no default exports).
- JSDoc type annotations on all exported functions. Shared types in `src/types.js`.
- Small functions (≲ 30 lines); extract helpers when a function grows.
- No WHAT comments (the code says what). Comments only for non-obvious WHY.
- No duplicate symbol strings, payout logic, or payline paths outside `paytable.js`.

## Testing

- Every pure-core module has a companion test file under `tests/`.
- Use `node --test` only. No Vitest, no Jest, no jsdom.
- Engine tests use `createRng(42)` so expected grids can be hard-coded.

## Linting

- ESLint, stylelint, html-validate. All three MUST pass before declaring any module done.
- `npm run lint` runs all three.

## AI Rules (the experiment)

- Model: Claude Opus 4.7 (1M context). Do not switch mid-run.
- Never commit on behalf of the user. The user commits.
- If a fix fails via prompting twice, the user hand-edits. Log the hand-edit in `ai-use-log.md`.
- Every meaningful turn gets an `ai-use-log.md` entry — file creation, lint fix, test pass, hand-edit, or adversarial review all count.

## Out of Scope

Scatter, Free Spins, multipliers, cascading, auto-spin, both-ways pay, session history, sound, accounts. If a prompt asks for these, reject and point to §10 of SPEC.md.
```

- [ ] **Step 2: Commit**

```bash
git add experiments/attempt-B/CLAUDE.md
git commit -m "attempt-B: project CLAUDE.md (rules + boundaries)"
```

---

### Task 3: Write the three skill files

**Files:**
- Create: `experiments/attempt-B/.claude/skills/slot-engine.md`
- Create: `experiments/attempt-B/.claude/skills/slot-ui.md`
- Create: `experiments/attempt-B/.claude/skills/slot-testing.md`

- [ ] **Step 1: Create `slot-engine.md`**

```markdown
---
name: slot-engine
description: Rules for editing src/rng.js, src/engine.js, src/paytable.js. Invoke before any change to those files.
---

# slot-engine

When editing `src/rng.js`, `src/engine.js`, or `src/paytable.js`:

## Purity

- Pure functions only: input → output. No DOM, no network, no globals, no `console.log` except for explicit debug that is removed before commit.
- No module-level state. RNG state is returned from `createRng`, not stored in the module.

## Signatures (frozen)

- `createRng(seed?: number) → { next(max: number): number, seed: number }`
- `spin(state: GameState, bet: number, rng: Rng) → SpinResult`
- `payoutFor(symbol: Symbol, count: 3|4|5) → number`
- `SpinResult` may gain fields but may not lose or rename them.

## Weighted pick pattern

Use cumulative distribution every time:

```js
function pickSymbol(rng, weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = rng.next(total);
  for (const [sym, w] of Object.entries(weights)) {
    if (r < w) return sym;
    r -= w;
  }
  throw new Error('pickSymbol: fell through');
}
```

## Wild substitution

Lives only inside `evaluateLine`. Do not export it. The target symbol is `path[0]` unless that is wild, in which case the target is the first non-wild in `path` (falling back to `wild` if the entire path is wild). A pure-wild run pays from the `wild` row of the paytable.

## No code change without a test change

If you modify `engine.js`, `rng.js`, or `paytable.js`, the companion test file must be updated in the same commit.
```

- [ ] **Step 2: Create `slot-ui.md`**

```markdown
---
name: slot-ui
description: Rules for editing src/ui.js, src/styles.css, index.html. Invoke before any change to those files.
---

# slot-ui

When editing `src/ui.js`, `src/styles.css`, or `index.html`:

## CSS variables only

- No hex literals in `styles.css` outside the `:root` block. Use `var(--acid)`, `var(--cyan)`, etc.
- The full token list is defined in the `:root` block at the top of `styles.css` per design spec §4.13.

## DOM query caching

- Cache `document.getElementById` / `querySelector` results at module load, not inside render hot paths.
- Bad:
  ```js
  export function renderBalance(n) {
    document.getElementById('bal').textContent = n;
  }
  ```
- Good:
  ```js
  const balEl = document.getElementById('bal');
  export function renderBalance(n) {
    balEl.textContent = n;
  }
  ```

## Idempotent renders

Every `render*` function fully rebuilds its area from its inputs. No partial diffs, no `appendChild` without a preceding clear.

## Responsive is CSS only

- Use CSS media queries. Do not inspect `window.innerWidth` in JS.
- The only allowed JS viewport hook is `<dialog>.showModal()` for the mobile paytable, triggered by a button click.

## Animations are CSS

- `@keyframes` only. No `setInterval`/`setTimeout` chains.
- One `requestAnimationFrame` is acceptable for the spin button's pressed-state feedback if needed; no other timers.

## No imports from core

- `ui.js` imports from `./types.js` only (for JSDoc types). It never imports `engine.js`, `rng.js`, or `paytable.js`.
```

- [ ] **Step 3: Create `slot-testing.md`**

```markdown
---
name: slot-testing
description: Rules for editing files under tests/. Invoke before any change to test files.
---

# slot-testing

When writing or editing files under `tests/`:

## Runner

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
```

No other test runner. No third-party assertion library.

## Determinism

- All RNG-dependent tests use `createRng(42)`.
- Expected grids and wins are hard-coded in the test, derived once from a first green run and then frozen.

## RTP test

```js
test('RTP over 100k spins is within 95–97%', () => {
  const rng = createRng(42);
  let state = { ...INITIAL_STATE, balance: 1e9 };
  const bet = 10;
  let totalBet = 0, totalPayout = 0;
  for (let i = 0; i < 100_000; i++) {
    const r = spin(state, bet, rng);
    totalBet += bet;
    totalPayout += r.payout;
    state = r.newState;
    state.balance = 1e9; // keep solvent
  }
  const rtp = totalPayout / totalBet;
  assert.ok(rtp > 0.95 && rtp < 0.97, `rtp=${rtp}`);
});
```

## No DOM tests

UI is manually smoked. Tests under `tests/` never import `ui.js` or `main.js`.

## One assertion concept per test

Multiple `assert` calls are fine as long as they all support the same claim. Do not pack unrelated claims into one test.
```

- [ ] **Step 4: Commit**

```bash
git add experiments/attempt-B/.claude/skills/
git commit -m "attempt-B: three skill files (engine/ui/testing)"
```

---

### Task 4: Write `ai-plan.md` and seed `ai-use-log.md`

**Files:**
- Create: `experiments/attempt-B/ai-plan.md`
- Create: `experiments/attempt-B/ai-use-log.md`

- [ ] **Step 1: Create `ai-plan.md`**

```markdown
# AI Usage Plan — Attempt B

## Model

Claude Opus 4.7 (1M context). Single model for the entire run.

**Rationale:** Attempt B's hypothesis tests whether a large, coherent context
(SPEC + CLAUDE.md + 3 skills + research) measurably improves generated code.
This requires the model to actually read and weigh all of that context — Opus
1M does so most reliably. Switching models mid-run would introduce a second
variable and muddy the A/B comparison with Attempt A.

## Harness

Claude Code (`claude.ai/code` / CLI). Skill files in `.claude/skills/` auto-scope
by path when editing under `src/` or `tests/`.

## Work Unit

One file per turn where possible. Each turn:

1. Claude loads `SPEC.md` + `CLAUDE.md` + the path-matching skill.
2. Claude produces the file end-to-end.
3. Theo runs `npm test` + `npm run lint` and reports results.
4. If broken: Claude fixes via prompt. If two prompt fixes fail, Theo hand-edits.
5. Theo commits. An entry is appended to `ai-use-log.md`.

## Hand-Edit Policy

Allowed only after two failed prompt-based fix attempts. Each hand-edit gets a
log entry with file path, line range, and the reason prompting failed.

## Adversarial Check

Every 5 turns, prompt Claude: "Review the last 5 commits against `SPEC.md` and
`CLAUDE.md`. Report contradictions." Log the response as its own turn.
```

- [ ] **Step 2: Create `ai-use-log.md`**

```markdown
# AI Use Log — Attempt B

## Entry template

```
## Turn N — YYYY-MM-DD HH:MM — <file or task>

Prompt intent: <one line>
Context loaded: <SPEC, CLAUDE.md, skill:X>
Result: <summary, files changed>
Lint / tests: <pass/fail; what was fixed>
Hand-edit: <none | file:lines, reason>
Learning: <one line — what worked or did not>
```

## Turn 1 — 2026-04-22 <HH:MM> — harness bootstrap

Prompt intent: Generate the initial context engineering harness (SPEC.md, CLAUDE.md, three skill files, ai-plan.md) from the approved design document.
Context loaded: docs/superpowers/specs/2026-04-22-data-heist-attempt-b-design.md
Result: Files listed above created and committed (see git log).
Lint / tests: N/A (no code yet).
Hand-edit: none
Learning: Spec-first scaffolding produces the harness without guessing. Every downstream turn can point to §X.Y of SPEC for WHAT.
```

- [ ] **Step 3: Commit**

```bash
git add experiments/attempt-B/ai-plan.md experiments/attempt-B/ai-use-log.md
git commit -m "attempt-B: ai-plan and ai-use-log with first entry"
```

---

### Task 5: `package.json` + lint configs

**Files:**
- Create: `experiments/attempt-B/package.json`
- Create: `experiments/attempt-B/.eslintrc.json`
- Create: `experiments/attempt-B/.stylelintrc.json`
- Create: `experiments/attempt-B/.htmlvalidate.json`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "data-heist-attempt-b",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Data Heist slot machine (Attempt B, context-engineered)",
  "scripts": {
    "test": "node --test tests/",
    "lint": "npm run lint:js && npm run lint:css && npm run lint:html",
    "lint:js": "eslint src/ tests/",
    "lint:css": "stylelint \"src/**/*.css\"",
    "lint:html": "html-validate index.html",
    "serve": "python3 -m http.server 8000"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "stylelint": "^16.0.0",
    "stylelint-config-standard": "^36.0.0",
    "html-validate": "^8.0.0"
  }
}
```

- [ ] **Step 2: Create `.eslintrc.json`**

```json
{
  "env": { "browser": true, "es2022": true, "node": true },
  "parserOptions": { "ecmaVersion": 2022, "sourceType": "module" },
  "rules": {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-undef": "error",
    "prefer-const": "error",
    "eqeqeq": ["error", "always"],
    "no-var": "error"
  }
}
```

- [ ] **Step 3: Create `.stylelintrc.json`**

```json
{
  "extends": "stylelint-config-standard",
  "rules": {
    "selector-class-pattern": "^[a-z][a-z0-9\\-]*$",
    "custom-property-pattern": "^[a-z][a-z0-9\\-]*$",
    "no-descending-specificity": null
  }
}
```

- [ ] **Step 4: Create `.htmlvalidate.json`**

```json
{
  "extends": ["html-validate:recommended"],
  "rules": {
    "no-inline-style": "off",
    "attribute-boolean-style": "off"
  }
}
```

- [ ] **Step 5: Install dev deps**

Run: `cd experiments/attempt-B && npm install`
Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Add `node_modules` to `.gitignore` if not already ignored**

Run: `grep -q '^node_modules' experiments/attempt-B/.gitignore 2>/dev/null || echo 'node_modules/' >> experiments/attempt-B/.gitignore`

- [ ] **Step 7: Commit**

```bash
git add experiments/attempt-B/package.json experiments/attempt-B/.eslintrc.json experiments/attempt-B/.stylelintrc.json experiments/attempt-B/.htmlvalidate.json experiments/attempt-B/.gitignore experiments/attempt-B/package-lock.json
git commit -m "attempt-B: package.json and lint configs"
```

---

## Phase B — Pure Core (TDD)

### Task 6: `src/types.js` — JSDoc typedefs only

**Files:**
- Create: `experiments/attempt-B/src/types.js`

- [ ] **Step 1: Create the file**

```js
/**
 * @typedef {'neural_chip'|'katana'|'oni_mask'|'neon_7'|'cyber_iris'|'chrome_skull'|'gold_kanji'|'wild'} Symbol
 */

/**
 * Reel grid. reels[col][row] — 5 columns × 3 rows. row 0 = top.
 * @typedef {{ reels: Symbol[][], rows: 3, cols: 5 }} Grid
 */

/**
 * A fixed payline as a 5-element array of row indices (0–2).
 * @typedef {{ id: number, rows: [number, number, number, number, number] }} Payline
 */

/** @typedef {{ lineId: number, symbol: Symbol, count: 3|4|5, payout: number }} Win */

/**
 * @typedef {{
 *   grid: Grid,
 *   wins: Win[],
 *   payout: number,
 *   newBalance: number,
 *   newState: GameState
 * }} SpinResult
 */

/** @typedef {{ balance: number, bet: number, lastSpin: SpinResult | null }} GameState */

/** @typedef {{ next: (max: number) => number, readonly seed: number }} Rng */

export {}; // module marker; no runtime exports
```

- [ ] **Step 2: Commit**

```bash
git add experiments/attempt-B/src/types.js
git commit -m "attempt-B: types.js (JSDoc typedefs)"
```

---

### Task 7: `src/rng.js` — TDD

**Files:**
- Create: `experiments/attempt-B/tests/rng.test.js`
- Create: `experiments/attempt-B/src/rng.js`

- [ ] **Step 1: Write the failing tests**

```js
// experiments/attempt-B/tests/rng.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/rng.js';

test('createRng with the same seed produces the same sequence', () => {
  const a = createRng(42);
  const b = createRng(42);
  const seqA = Array.from({ length: 1000 }, () => a.next(1000));
  const seqB = Array.from({ length: 1000 }, () => b.next(1000));
  assert.deepEqual(seqA, seqB);
});

test('next(max) returns integers in [0, max)', () => {
  const rng = createRng(7);
  for (let i = 0; i < 10_000; i++) {
    const n = rng.next(100);
    assert.ok(Number.isInteger(n) && n >= 0 && n < 100, `n=${n}`);
  }
});

test('different seeds produce different sequences', () => {
  const a = createRng(1);
  const b = createRng(2);
  const seqA = Array.from({ length: 50 }, () => a.next(1000));
  const seqB = Array.from({ length: 50 }, () => b.next(1000));
  assert.notDeepEqual(seqA, seqB);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd experiments/attempt-B && npm test`
Expected: FAIL — `Cannot find module '../src/rng.js'`.

- [ ] **Step 3: Implement `src/rng.js`**

```js
// experiments/attempt-B/src/rng.js

/**
 * Mulberry32 PRNG. Deterministic when seeded.
 * @param {number} [seed]
 * @returns {import('./types.js').Rng}
 */
export function createRng(seed = Date.now()) {
  let s = seed >>> 0;
  return {
    next(max) {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) % max;
    },
    get seed() { return s; },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd experiments/attempt-B && npm test`
Expected: PASS (3/3 for rng).

- [ ] **Step 5: Lint**

Run: `cd experiments/attempt-B && npm run lint:js`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add experiments/attempt-B/src/rng.js experiments/attempt-B/tests/rng.test.js
git commit -m "attempt-B: rng.js (Mulberry32, seeded)"
```

---

### Task 8: `src/paytable.js` constants — TDD

**Files:**
- Create: `experiments/attempt-B/tests/paytable.test.js`
- Create: `experiments/attempt-B/src/paytable.js`

- [ ] **Step 1: Write the failing tests**

```js
// experiments/attempt-B/tests/paytable.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SYMBOLS, SYMBOL_WEIGHTS, PAYLINES, BET_STEPS, INITIAL_STATE, payoutFor,
} from '../src/paytable.js';

test('SYMBOLS has exactly 8 entries', () => {
  assert.equal(SYMBOLS.length, 8);
});

test('SYMBOL_WEIGHTS sums to 100 and covers every SYMBOL', () => {
  const total = Object.values(SYMBOL_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.equal(total, 100);
  for (const s of SYMBOLS) {
    assert.ok(SYMBOL_WEIGHTS[s] > 0, `missing weight for ${s}`);
  }
});

test('PAYLINES has 25 entries with ids 1..25 and row arrays of length 5', () => {
  assert.equal(PAYLINES.length, 25);
  for (let i = 0; i < PAYLINES.length; i++) {
    assert.equal(PAYLINES[i].id, i + 1);
    assert.equal(PAYLINES[i].rows.length, 5);
    for (const r of PAYLINES[i].rows) {
      assert.ok(r === 0 || r === 1 || r === 2, `bad row ${r}`);
    }
  }
});

test('INITIAL_STATE and BET_STEPS have expected shape', () => {
  assert.equal(INITIAL_STATE.balance, 1000);
  assert.equal(INITIAL_STATE.bet, 10);
  assert.equal(INITIAL_STATE.lastSpin, null);
  assert.deepEqual(BET_STEPS, [1, 5, 10, 25, 50, 100]);
});

test('payoutFor returns the published table values', () => {
  assert.equal(payoutFor('neural_chip', 3), 0.2);
  assert.equal(payoutFor('neural_chip', 4), 0.5);
  assert.equal(payoutFor('neural_chip', 5), 1.0);
  assert.equal(payoutFor('wild', 5), 200);
  assert.equal(payoutFor('gold_kanji', 4), 25);
});

test('payoutFor returns 0 for counts below 3', () => {
  assert.equal(payoutFor('wild', 2), 0);
  assert.equal(payoutFor('neural_chip', 0), 0);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd experiments/attempt-B && npm test`
Expected: FAIL — `Cannot find module '../src/paytable.js'`.

- [ ] **Step 3: Implement `src/paytable.js`**

```js
// experiments/attempt-B/src/paytable.js

/** @type {import('./types.js').Symbol[]} */
export const SYMBOLS = [
  'neural_chip', 'katana', 'oni_mask', 'neon_7',
  'cyber_iris', 'chrome_skull', 'gold_kanji', 'wild',
];

export const SYMBOL_WEIGHTS = {
  neural_chip:  24,
  katana:       19,
  oni_mask:     16,
  neon_7:       13,
  cyber_iris:   11,
  chrome_skull:  7,
  gold_kanji:    5,
  wild:          5,
};

/** @type {import('./types.js').Payline[]} */
export const PAYLINES = [
  { id:  1, rows: [1,1,1,1,1] },
  { id:  2, rows: [0,0,0,0,0] },
  { id:  3, rows: [2,2,2,2,2] },
  { id:  4, rows: [0,1,2,1,0] },
  { id:  5, rows: [2,1,0,1,2] },
  { id:  6, rows: [1,0,0,0,1] },
  { id:  7, rows: [1,2,2,2,1] },
  { id:  8, rows: [0,0,1,2,2] },
  { id:  9, rows: [2,2,1,0,0] },
  { id: 10, rows: [1,2,1,0,1] },
  { id: 11, rows: [1,0,1,2,1] },
  { id: 12, rows: [0,1,1,1,0] },
  { id: 13, rows: [2,1,1,1,2] },
  { id: 14, rows: [0,1,0,1,0] },
  { id: 15, rows: [2,1,2,1,2] },
  { id: 16, rows: [1,1,0,1,1] },
  { id: 17, rows: [1,1,2,1,1] },
  { id: 18, rows: [0,0,2,0,0] },
  { id: 19, rows: [2,2,0,2,2] },
  { id: 20, rows: [0,2,0,2,0] },
  { id: 21, rows: [2,0,2,0,2] },
  { id: 22, rows: [1,0,2,0,1] },
  { id: 23, rows: [1,2,0,2,1] },
  { id: 24, rows: [0,1,2,2,2] },
  { id: 25, rows: [2,1,0,0,0] },
];

export const BET_STEPS = [1, 5, 10, 25, 50, 100];

/** @type {import('./types.js').GameState} */
export const INITIAL_STATE = { balance: 1000, bet: 10, lastSpin: null };

const PAYTABLE = {
  neural_chip:  [0.2, 0.5,   1.0],
  katana:       [0.3, 0.8,   2.0],
  oni_mask:     [0.5, 1.5,   4.0],
  neon_7:       [1.0, 3.0,   8.0],
  cyber_iris:   [1.5, 5.0,  15.0],
  chrome_skull: [2.5, 10.0, 50.0],
  gold_kanji:   [5.0, 25.0, 100.0],
  wild:         [10.0, 50.0, 200.0],
};

/**
 * @param {import('./types.js').Symbol} symbol
 * @param {number} count
 * @returns {number}
 */
export function payoutFor(symbol, count) {
  if (count < 3 || count > 5) return 0;
  const row = PAYTABLE[symbol];
  return row ? row[count - 3] : 0;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd experiments/attempt-B && npm test`
Expected: PASS (all paytable tests green).

- [ ] **Step 5: Lint**

Run: `cd experiments/attempt-B && npm run lint:js`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add experiments/attempt-B/src/paytable.js experiments/attempt-B/tests/paytable.test.js
git commit -m "attempt-B: paytable.js (symbols, weights, paylines, payoutFor)"
```

---

### Task 9: `src/engine.js` — `evaluateLine` TDD

**Files:**
- Create: `experiments/attempt-B/tests/engine.test.js`
- Create: `experiments/attempt-B/src/engine.js`

- [ ] **Step 1: Write the failing tests (evaluateLine focus)**

```js
// experiments/attempt-B/tests/engine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLine, spin, generateGrid } from '../src/engine.js';
import { PAYLINES, payoutFor, INITIAL_STATE } from '../src/paytable.js';
import { createRng } from '../src/rng.js';

function mkGrid(rows) {
  // rows: 3×5 array of symbols; convert to reels[col][row]
  const reels = [[], [], [], [], []];
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 3; row++) {
      reels[col][row] = rows[row][col];
    }
  }
  return { reels, rows: 3, cols: 5 };
}

test('evaluateLine: 3 matching symbols on middle row pays', () => {
  const grid = mkGrid([
    ['neural_chip', 'neural_chip', 'neural_chip', 'neural_chip', 'neural_chip'],
    ['oni_mask',    'oni_mask',    'oni_mask',    'katana',      'katana'],
    ['katana',      'katana',      'katana',      'katana',      'katana'],
  ]);
  const payline = PAYLINES[0]; // [1,1,1,1,1]
  const win = evaluateLine(grid, payline, payoutFor);
  assert.equal(win.symbol, 'oni_mask');
  assert.equal(win.count, 3);
  assert.equal(win.payout, 0.5); // oni_mask ×3
  assert.equal(win.lineId, 1);
});

test('evaluateLine: wild substitutes for non-wild target', () => {
  const grid = mkGrid([
    ['wild', 'oni_mask', 'oni_mask', 'oni_mask', 'katana'],
    ['x',    'x',        'x',        'x',        'x'],
    ['x',    'x',        'x',        'x',        'x'],
  ]);
  const payline = PAYLINES[1]; // [0,0,0,0,0]
  const win = evaluateLine(grid, payline, payoutFor);
  assert.equal(win.symbol, 'oni_mask');
  assert.equal(win.count, 4); // wild + 3 oni_mask
});

test('evaluateLine: pure-wild run pays from wild row', () => {
  const grid = mkGrid([
    ['wild', 'wild', 'wild', 'katana', 'katana'],
    ['x',    'x',    'x',    'x',      'x'],
    ['x',    'x',    'x',    'x',      'x'],
  ]);
  const payline = PAYLINES[1]; // [0,0,0,0,0]
  const win = evaluateLine(grid, payline, payoutFor);
  assert.equal(win.symbol, 'wild');
  assert.equal(win.count, 3);
  assert.equal(win.payout, 10); // wild ×3
});

test('evaluateLine: fewer than 3 matches returns null', () => {
  const grid = mkGrid([
    ['neural_chip', 'katana', 'oni_mask', 'neon_7', 'cyber_iris'],
    ['x',           'x',      'x',        'x',      'x'],
    ['x',           'x',      'x',        'x',      'x'],
  ]);
  const payline = PAYLINES[1]; // [0,0,0,0,0]
  assert.equal(evaluateLine(grid, payline, payoutFor), null);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd experiments/attempt-B && npm test`
Expected: FAIL — `Cannot find module '../src/engine.js'`.

- [ ] **Step 3: Implement `src/engine.js` skeleton (evaluateLine + generateGrid + spin)**

```js
// experiments/attempt-B/src/engine.js
import { PAYLINES, SYMBOL_WEIGHTS, payoutFor } from './paytable.js';

const WEIGHT_TOTAL = Object.values(SYMBOL_WEIGHTS).reduce((a, b) => a + b, 0);

/**
 * @param {import('./types.js').Rng} rng
 * @returns {import('./types.js').Symbol}
 */
function pickSymbol(rng) {
  let r = rng.next(WEIGHT_TOTAL);
  for (const [sym, w] of Object.entries(SYMBOL_WEIGHTS)) {
    if (r < w) return /** @type {import('./types.js').Symbol} */ (sym);
    r -= w;
  }
  throw new Error('pickSymbol fell through');
}

/**
 * @param {import('./types.js').Rng} rng
 * @returns {import('./types.js').Grid}
 */
export function generateGrid(rng) {
  const reels = [[], [], [], [], []];
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 3; row++) {
      reels[col][row] = pickSymbol(rng);
    }
  }
  return { reels, rows: 3, cols: 5 };
}

/**
 * @param {import('./types.js').Grid} grid
 * @param {import('./types.js').Payline} payline
 * @param {typeof payoutFor} payoutForFn
 * @returns {import('./types.js').Win | null}
 */
export function evaluateLine(grid, payline, payoutForFn) {
  const path = payline.rows.map((row, col) => grid.reels[col][row]);

  let target = path[0];
  if (target === 'wild') {
    const firstNonWild = path.find(s => s !== 'wild');
    target = firstNonWild ?? 'wild';
  }

  let count = 0;
  for (const sym of path) {
    if (sym === target || sym === 'wild') count++;
    else break;
  }

  if (count < 3) return null;
  const mult = payoutForFn(target, count);
  if (mult === 0) return null;
  return { lineId: payline.id, symbol: target, count, payout: mult };
}

/**
 * @param {import('./types.js').GameState} state
 * @param {number} bet
 * @param {import('./types.js').Rng} rng
 * @returns {import('./types.js').SpinResult}
 */
export function spin(state, bet, rng) {
  if (!Number.isInteger(bet) || bet < 1 || bet > state.balance) {
    throw new Error('invalid bet');
  }
  const grid = generateGrid(rng);
  const wins = PAYLINES
    .map(pl => evaluateLine(grid, pl, payoutFor))
    .filter(Boolean)
    .map(w => ({ ...w, payout: w.payout * bet }));
  const payout = wins.reduce((s, w) => s + w.payout, 0);
  const newBalance = state.balance - bet + payout;
  const spinResult = {
    grid, wins, payout, newBalance,
    newState: { balance: newBalance, bet, lastSpin: null },
  };
  spinResult.newState.lastSpin = spinResult;
  return spinResult;
}
```

- [ ] **Step 4: Run tests to verify evaluateLine tests pass**

Run: `cd experiments/attempt-B && npm test`
Expected: PASS for the 4 evaluateLine tests.

- [ ] **Step 5: Commit**

```bash
git add experiments/attempt-B/src/engine.js experiments/attempt-B/tests/engine.test.js
git commit -m "attempt-B: engine.js with evaluateLine, generateGrid, spin"
```

---

### Task 10: `src/engine.js` — `spin` TDD (bet validation + seeded grid)

**Files:**
- Modify: `experiments/attempt-B/tests/engine.test.js`

- [ ] **Step 1: Append the failing tests to `tests/engine.test.js`**

```js
test('spin: bet > balance throws', () => {
  const state = { ...INITIAL_STATE, balance: 10 };
  const rng = createRng(1);
  assert.throws(() => spin(state, 100, rng), /invalid bet/);
});

test('spin: bet < 1 throws', () => {
  const rng = createRng(1);
  assert.throws(() => spin({ ...INITIAL_STATE }, 0, rng), /invalid bet/);
});

test('spin: updates balance by -bet + payout', () => {
  const rng = createRng(1);
  const state = { ...INITIAL_STATE, balance: 1000 };
  const r = spin(state, 10, rng);
  assert.equal(r.newBalance, 1000 - 10 + r.payout);
});

test('spin: grid is 5×3 and every cell is a known symbol', () => {
  const rng = createRng(42);
  const r = spin({ ...INITIAL_STATE }, 10, rng);
  assert.equal(r.grid.reels.length, 5);
  for (const col of r.grid.reels) {
    assert.equal(col.length, 3);
    for (const sym of col) {
      assert.ok(typeof sym === 'string' && sym.length > 0);
    }
  }
});
```

- [ ] **Step 2: Run tests**

Run: `cd experiments/attempt-B && npm test`
Expected: PASS for all new tests. If `bet > balance` message does not match regex, tighten the engine's error message to exactly `'invalid bet'`.

- [ ] **Step 3: Lint**

Run: `cd experiments/attempt-B && npm run lint:js`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add experiments/attempt-B/tests/engine.test.js
git commit -m "attempt-B: engine tests (bet validation, grid shape)"
```

---

### Task 11: RTP Monte Carlo test + tune if needed

**Files:**
- Modify: `experiments/attempt-B/tests/engine.test.js`
- Modify (if tuning required): `experiments/attempt-B/src/paytable.js`

- [ ] **Step 1: Append the RTP test**

```js
test('RTP over 100k spins is within 95–97%', () => {
  const rng = createRng(42);
  let state = { ...INITIAL_STATE, balance: 1e9 };
  const bet = 10;
  let totalBet = 0, totalPayout = 0;
  for (let i = 0; i < 100_000; i++) {
    const r = spin(state, bet, rng);
    totalBet += bet;
    totalPayout += r.payout;
    state = r.newState;
    state.balance = 1e9;
  }
  const rtp = totalPayout / totalBet;
  assert.ok(rtp > 0.95 && rtp < 0.97, `rtp=${rtp.toFixed(4)}`);
});
```

- [ ] **Step 2: Run tests**

Run: `cd experiments/attempt-B && npm test`
Expected: PASS if RTP falls in [0.95, 0.97]. On failure the assertion message prints the actual RTP.

- [ ] **Step 3: Tune if out of band**

If observed `rtp = r`, scale every value of `PAYTABLE` in `src/paytable.js` by `0.96 / r` and re-run the test. Keep two decimals of precision. Do not change `SYMBOL_WEIGHTS`.

Example — if `rtp=0.8912` (too low), multiply every payout by `0.96 / 0.8912 ≈ 1.0772`. Write the new values back into the `PAYTABLE` object.

Update the paytable table in `SPEC.md` to match the new values (single source of truth).

- [ ] **Step 4: Re-run tests until green**

Run: `cd experiments/attempt-B && npm test`
Expected: PASS, including the RTP test.

- [ ] **Step 5: Commit**

```bash
git add experiments/attempt-B/tests/engine.test.js experiments/attempt-B/src/paytable.js experiments/attempt-B/SPEC.md
git commit -m "attempt-B: RTP Monte Carlo test and paytable tune"
```

---

## Phase C — UI

### Task 12: `src/assets/symbols.svg` — authored sprite

**Files:**
- Create: `experiments/attempt-B/src/assets/symbols.svg`

Author a lean SVG sprite with 8 `<symbol>` elements that can be referenced via `<use href="assets/symbols.svg#sym-<id>" />`. Keep each symbol in a 100×100 viewBox. Use only strokes and fills from the spec palette; do not inline the research asset (which is an illustration sheet, not a sprite).

- [ ] **Step 1: Create the file**

```xml
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="sym-neural_chip" viewBox="0 0 100 100">
    <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" stroke-width="4"/>
    <circle cx="50" cy="50" r="8" fill="currentColor"/>
    <path d="M25 40 H10 M25 60 H10 M75 40 H90 M75 60 H90 M40 25 V10 M60 25 V10 M40 75 V90 M60 75 V90" stroke="currentColor" stroke-width="3"/>
  </symbol>
  <symbol id="sym-katana" viewBox="0 0 100 100">
    <path d="M15 85 L85 15" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
    <circle cx="18" cy="82" r="7" fill="none" stroke="currentColor" stroke-width="3"/>
    <path d="M12 78 L22 88" stroke="currentColor" stroke-width="3"/>
  </symbol>
  <symbol id="sym-oni_mask" viewBox="0 0 100 100">
    <path d="M20 30 Q50 10 80 30 Q85 55 70 80 Q50 90 30 80 Q15 55 20 30 Z" fill="none" stroke="currentColor" stroke-width="4"/>
    <path d="M30 45 L40 55 M60 55 L70 45" stroke="currentColor" stroke-width="4"/>
    <path d="M35 70 Q50 80 65 70" fill="none" stroke="currentColor" stroke-width="3"/>
    <path d="M20 20 L30 10 M80 20 L70 10" stroke="currentColor" stroke-width="3"/>
  </symbol>
  <symbol id="sym-neon_7" viewBox="0 0 100 100">
    <path d="M25 25 H75 L45 85" fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M35 55 H55" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
  </symbol>
  <symbol id="sym-cyber_iris" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="4"/>
    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="3"/>
    <circle cx="50" cy="50" r="7" fill="currentColor"/>
    <path d="M50 15 V5 M50 85 V95 M15 50 H5 M85 50 H95" stroke="currentColor" stroke-width="3"/>
  </symbol>
  <symbol id="sym-chrome_skull" viewBox="0 0 100 100">
    <path d="M25 35 Q25 15 50 15 Q75 15 75 35 L75 60 Q75 75 60 75 L60 85 L40 85 L40 75 Q25 75 25 60 Z" fill="none" stroke="currentColor" stroke-width="4"/>
    <circle cx="38" cy="45" r="6" fill="currentColor"/>
    <circle cx="62" cy="45" r="6" fill="currentColor"/>
    <path d="M45 58 L50 65 L55 58" fill="none" stroke="currentColor" stroke-width="3"/>
  </symbol>
  <symbol id="sym-gold_kanji" viewBox="0 0 100 100">
    <rect x="15" y="15" width="70" height="70" fill="none" stroke="currentColor" stroke-width="3"/>
    <path d="M30 35 H70 M50 25 V55 M35 65 H65 M40 55 L30 75 M60 55 L70 75" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
  </symbol>
  <symbol id="sym-wild" viewBox="0 0 100 100">
    <path d="M15 25 L30 75 L40 50 L50 75 L60 50 L70 75 L85 25" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
    <text x="50" y="95" font-family="Orbitron, sans-serif" font-size="12" font-weight="700" fill="currentColor" text-anchor="middle">WILD</text>
  </symbol>
</svg>
```

- [ ] **Step 2: Validate the SVG parses**

Open `experiments/attempt-B/src/assets/symbols.svg` in a browser — the file should load without a parser error (visible elements are hidden because `display:none` at the root; this is correct for sprite use).

- [ ] **Step 3: Commit**

```bash
git add experiments/attempt-B/src/assets/symbols.svg
git commit -m "attempt-B: authored symbol sprite (8 symbols)"
```

---

### Task 13: `index.html` skeleton

**Files:**
- Create: `experiments/attempt-B/index.html`

- [ ] **Step 1: Create the file**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DATA HEIST</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="src/styles.css">
</head>
<body>
  <main class="app">
    <header class="topbar">
      <span class="title">DATA HEIST</span>
      <span class="balance-chip">
        <span class="label">BAL</span>
        <span id="balance" class="value">1000</span>
      </span>
    </header>

    <section class="stage">
      <aside class="paytable-panel" aria-label="Paytable">
        <h2>PAYTABLE</h2>
        <div id="paytable-compact" class="paytable-compact"></div>
        <details class="paytable-details">
          <summary>25 paylines</summary>
          <div id="paytable-lines" class="paytable-lines"></div>
        </details>
      </aside>

      <div class="reel-frame">
        <div id="reels" class="reels"></div>
      </div>

      <aside class="breakdown-panel" aria-label="Win breakdown">
        <h2>WIN BREAKDOWN</h2>
        <div id="breakdown" class="breakdown"></div>
      </aside>
    </section>

    <footer class="controls">
      <div class="ctrl-group">
        <span class="ctrl-lbl">BET</span>
        <div class="bet-stepper">
          <button id="bet-down" class="step-btn" aria-label="Decrease bet">−</button>
          <span id="bet" class="bet-val">10</span>
          <button id="bet-up" class="step-btn" aria-label="Increase bet">+</button>
        </div>
      </div>
      <button id="max-bet" class="ghost-btn">MAX BET</button>
      <button id="spin" class="spin-btn">▸ SPIN</button>
      <div class="ctrl-group">
        <span class="ctrl-lbl">WIN</span>
        <span id="last-win" class="ctrl-val">0</span>
      </div>
      <button id="paytable-btn" class="ghost-btn paytable-mobile-trigger" aria-haspopup="dialog">i</button>
    </footer>

    <dialog id="paytable-dialog" class="paytable-dialog">
      <button id="paytable-close" class="ghost-btn close-btn" aria-label="Close">×</button>
      <h2>PAYTABLE</h2>
      <div id="paytable-dialog-compact" class="paytable-compact"></div>
      <details>
        <summary>25 paylines</summary>
        <div id="paytable-dialog-lines" class="paytable-lines"></div>
      </details>
    </dialog>

    <div id="reset-overlay" class="reset-overlay" hidden>
      <div class="reset-card">
        <p>OUT OF CREDITS</p>
        <button id="reset-btn" class="spin-btn">RESET</button>
      </div>
    </div>
  </main>

  <script type="module" src="src/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Lint**

Run: `cd experiments/attempt-B && npm run lint:html`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add experiments/attempt-B/index.html
git commit -m "attempt-B: index.html skeleton"
```

---

### Task 14: `src/styles.css` — tokens + desktop layout

**Files:**
- Create: `experiments/attempt-B/src/styles.css`

- [ ] **Step 1: Create the file with tokens and desktop layout**

```css
:root {
  /* Backgrounds (overview.md) */
  --bg: #0d0b1a;
  --card: #1a1528;
  --panel: #12101f;
  --border: #2a2040;

  /* Text (overview.md) */
  --fg: #ffffff;
  --dim: #6b6480;
  --win: #00ff88;
  --loss: #ff4444;

  /* Accents (overview.md) */
  --acid: #c8ff00;
  --magenta: #ff2d78;
  --cyan: #00ffd4;
  --gold: #ffd700;
  --purple: #b44fff;

  /* Spacing (tokens-cyberpunk.html) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  /* Effects */
  --fx-glow-acid: 0 0 0 1px var(--acid), 0 0 32px rgba(200, 255, 0, 0.5);
  --fx-glow-magenta: 0 0 0 1px var(--magenta), 0 0 32px rgba(255, 45, 120, 0.5);
  --fx-drop: 0 20px 40px -15px rgba(0, 0, 0, 0.9);
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: "Orbitron", sans-serif;
  font-size: 14px;
  min-height: 100%;
}

.app {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  padding: var(--space-4);
  gap: var(--space-4);
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-5);
  border: 1px solid var(--border);
  background: var(--panel);
}

.title {
  font-weight: 900;
  letter-spacing: 0.25em;
  color: var(--acid);
  font-size: 18px;
}

.balance-chip {
  display: flex;
  gap: var(--space-3);
  align-items: baseline;
}

.balance-chip .label {
  font-size: 11px;
  color: var(--dim);
  letter-spacing: 0.2em;
}

.balance-chip .value {
  font-size: 20px;
  font-weight: 700;
  color: var(--cyan);
}

.stage {
  display: grid;
  grid-template-columns: 240px 1fr 260px;
  gap: var(--space-4);
  min-height: 0;
}

.paytable-panel,
.breakdown-panel {
  border: 1px solid var(--border);
  background: var(--panel);
  padding: var(--space-4);
  overflow-y: auto;
}

.paytable-panel h2,
.breakdown-panel h2 {
  margin: 0 0 var(--space-3);
  font-size: 11px;
  letter-spacing: 0.25em;
  color: var(--dim);
}

.reel-frame {
  border: 1px solid var(--border);
  background: var(--card);
  padding: var(--space-5);
  display: grid;
  place-items: center;
  box-shadow: var(--fx-drop);
}

.reels {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
  width: 100%;
  max-width: 560px;
}

.reel-col {
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  gap: var(--space-1);
}

.cell {
  aspect-ratio: 1 / 1;
  border: 1px solid var(--border);
  background: var(--bg);
  display: grid;
  place-items: center;
  color: var(--cyan);
  transition: box-shadow 0.15s ease;
}

.cell svg {
  width: 70%;
  height: 70%;
}

.cell.sym-wild {
  color: var(--magenta);
}

.cell.sym-chrome_skull {
  color: var(--purple);
}

.cell.sym-gold_kanji {
  color: var(--gold);
}

.cell.hot {
  color: var(--acid);
  box-shadow: var(--fx-glow-acid);
  animation: glow-pulse 1.2s ease-in-out 1;
}

@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 0 1px var(--acid), 0 0 8px rgba(200, 255, 0, 0.3); }
  50% { box-shadow: 0 0 0 2px var(--acid), 0 0 32px rgba(200, 255, 0, 0.7); }
}

.paytable-compact {
  display: grid;
  gap: var(--space-2);
}

.pt-row {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: var(--space-2);
  align-items: center;
  padding: var(--space-2) 0;
  border-bottom: 1px dashed var(--border);
  font-size: 11px;
}

.pt-row .pt-name {
  color: var(--fg);
}

.pt-row.on {
  color: var(--acid);
}

.pt-row .pt-val {
  text-align: right;
  color: var(--dim);
  font-family: "Orbitron", monospace;
}

.pt-row.on .pt-val {
  color: var(--acid);
}

.paytable-details {
  margin-top: var(--space-3);
}

.paytable-details summary {
  cursor: pointer;
  font-size: 11px;
  color: var(--dim);
  letter-spacing: 0.2em;
  padding: var(--space-2) 0;
}

.paytable-lines {
  display: grid;
  gap: var(--space-1);
  font-family: "Orbitron", monospace;
  font-size: 10px;
  color: var(--dim);
}

.paytable-lines .pl-row {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: var(--space-2);
}

.paytable-lines .pl-row.on {
  color: var(--acid);
}

.breakdown {
  display: grid;
  gap: var(--space-2);
  font-size: 12px;
}

.breakdown .bd-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  border-bottom: 1px dashed var(--border);
}

.breakdown .bd-row .bd-gain {
  color: var(--win);
  text-align: right;
}

.breakdown .bd-empty {
  color: var(--dim);
  font-style: italic;
}

.controls {
  display: grid;
  grid-template-columns: auto auto 1fr auto auto auto;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--border);
  background: var(--panel);
}

.ctrl-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.ctrl-lbl {
  font-size: 10px;
  color: var(--dim);
  letter-spacing: 0.25em;
}

.ctrl-val {
  font-size: 22px;
  font-weight: 700;
  color: var(--cyan);
}

.bet-stepper {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.step-btn {
  width: 34px;
  height: 34px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--fg);
  font-size: 16px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}

.bet-val {
  min-width: 48px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: var(--fg);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--border);
  background: var(--card);
}

.ghost-btn {
  font-family: inherit;
  cursor: pointer;
  background: transparent;
  color: var(--fg);
  border: 1px solid var(--border);
  padding: var(--space-3) var(--space-4);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.spin-btn {
  font-family: inherit;
  cursor: pointer;
  background: var(--acid);
  color: var(--bg);
  border: 2px solid var(--acid);
  padding: var(--space-4) var(--space-6);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.2em;
  box-shadow: var(--fx-glow-acid);
}

.spin-btn:disabled {
  background: var(--border);
  color: var(--dim);
  border-color: var(--border);
  box-shadow: none;
  cursor: not-allowed;
}

.paytable-mobile-trigger {
  display: none;
}

.paytable-dialog {
  background: var(--panel);
  color: var(--fg);
  border: 1px solid var(--border);
  max-width: 90vw;
  max-height: 90vh;
  padding: var(--space-5);
  position: relative;
}

.paytable-dialog::backdrop {
  background: rgba(0, 0, 0, 0.8);
}

.close-btn {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
}

.reset-overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.85);
  z-index: 10;
}

.reset-card {
  text-align: center;
  padding: var(--space-6);
  border: 1px solid var(--border);
  background: var(--panel);
}

.reset-card p {
  font-size: 24px;
  letter-spacing: 0.2em;
  color: var(--loss);
  margin: 0 0 var(--space-5);
}
```

- [ ] **Step 2: Lint**

Run: `cd experiments/attempt-B && npm run lint:css`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add experiments/attempt-B/src/styles.css
git commit -m "attempt-B: styles.css — tokens and desktop layout"
```

---

### Task 15: `src/styles.css` — responsive tablet + mobile

**Files:**
- Modify: `experiments/attempt-B/src/styles.css`

- [ ] **Step 1: Append responsive media queries to `src/styles.css`**

```css
/* Tablet: stack sides below reels */
@media (max-width: 1023px) {
  .stage {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }

  .paytable-panel {
    order: 2;
  }

  .reel-frame {
    order: 1;
  }

  .breakdown-panel {
    order: 3;
    min-height: 120px;
  }
}

/* Mobile: HUD + reels + bet row + spin row */
@media (max-width: 639px) {
  .app {
    padding: var(--space-2);
    gap: var(--space-3);
  }

  .topbar .title {
    font-size: 14px;
  }

  .paytable-panel {
    display: none;
  }

  .breakdown-panel {
    position: fixed;
    top: 60px;
    left: var(--space-2);
    right: var(--space-2);
    z-index: 5;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .breakdown-panel.visible {
    opacity: 1;
  }

  .stage {
    grid-template-columns: 1fr;
  }

  .reel-frame {
    padding: var(--space-3);
  }

  .controls {
    grid-template-columns: auto 1fr auto auto;
    padding: var(--space-3);
    gap: var(--space-2);
  }

  .controls .ctrl-group:last-child {
    display: none; /* WIN label hidden on mobile (shown via toast) */
  }

  .spin-btn {
    padding: var(--space-3) var(--space-4);
    font-size: 14px;
  }

  .ghost-btn {
    padding: var(--space-2) var(--space-3);
  }

  .paytable-mobile-trigger {
    display: inline-block;
  }
}
```

- [ ] **Step 2: Lint**

Run: `cd experiments/attempt-B && npm run lint:css`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add experiments/attempt-B/src/styles.css
git commit -m "attempt-B: styles.css — responsive tablet and mobile"
```

---

### Task 16: `src/ui.js` — all render functions

**Files:**
- Create: `experiments/attempt-B/src/ui.js`

- [ ] **Step 1: Create the file**

```js
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
      cell.innerHTML = `<svg><use href="assets/symbols.svg#sym-${sym}"></use></svg>`;
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
  clearTimeout(renderBreakdown._t);
  renderBreakdown._t = setTimeout(() => {
    breakdownPanelEl.classList.remove('visible');
  }, 4000);
}

/** @param {{balance: number, bet: number, lastWin: number}} hud */
export function renderHud({ balance, bet, lastWin }) {
  balanceEl.textContent = String(balance);
  betEl.textContent = String(bet);
  lastWinEl.textContent = lastWin > 0 ? `+${lastWin.toFixed(2)}` : '0';
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
```

- [ ] **Step 2: Lint**

Run: `cd experiments/attempt-B && npm run lint:js`
Expected: clean. If ESLint reports `setTimeout`/`clearTimeout` as undefined, add them to `.eslintrc.json`'s `env.browser: true` (already set) — it should be fine.

- [ ] **Step 3: Commit**

```bash
git add experiments/attempt-B/src/ui.js
git commit -m "attempt-B: ui.js with all render + wiring functions"
```

---

### Task 17: `src/main.js` — orchestrator

**Files:**
- Create: `experiments/attempt-B/src/main.js`

- [ ] **Step 1: Create the file**

```js
// experiments/attempt-B/src/main.js
import { createRng } from './rng.js';
import { spin } from './engine.js';
import { INITIAL_STATE, BET_STEPS } from './paytable.js';
import {
  renderGrid, highlightWins, renderBreakdown, renderHud, renderPaytable,
  setSpinEnabled, setResetVisible, wireEvents,
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
    render(result.wins);
  } catch (err) {
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
  const emptyGrid = {
    reels: Array.from({ length: 5 }, () => Array(3).fill('neural_chip')),
    rows: 3, cols: 5,
  };
  renderGrid(emptyGrid);
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
```

- [ ] **Step 2: Lint**

Run: `cd experiments/attempt-B && npm run lint:js`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add experiments/attempt-B/src/main.js
git commit -m "attempt-B: main.js orchestrator"
```

---

## Phase D — Validation

### Task 18: Browser smoke (desktop)

**Files:** none to edit.

- [ ] **Step 1: Serve the app**

Run: `cd experiments/attempt-B && npm run serve`
Open: `http://localhost:8000/`

- [ ] **Step 2: Desktop smoke checklist**

- [ ] Balance reads 1000. Bet reads 10. Spin enabled.
- [ ] Clicking SPIN changes the grid and updates balance.
- [ ] On a winning spin: winning cells glow acid-green; breakdown panel lists lines.
- [ ] On a losing spin: breakdown shows `— no wins —`.
- [ ] Bet steppers + MAX BET work. Bet never exceeds balance.
- [ ] No console errors.
- [ ] Spinning 50 times never leaves balance negative; when balance drops to 0 the RESET overlay appears; RESET restores 1000.

Record observations in `ai-use-log.md` as a new turn.

- [ ] **Step 3: If bugs are found, fix them in the owning module and commit**

One commit per bug. Follow the CLAUDE.md rule: prompt Claude first; hand-edit only after two failed prompt attempts.

---

### Task 19: Browser smoke (tablet + mobile)

**Files:** none to edit.

- [ ] **Step 1: Responsive smoke checklist**

Using Chrome DevTools "Toggle device toolbar" (Cmd-Shift-M on Mac):

Tablet (768 × 1024):
- [ ] Paytable and breakdown stack below reels; no horizontal scroll.
- [ ] Spin button remains reachable.

Mobile (390 × 844):
- [ ] Paytable panel hidden; `[i]` button visible and opens the `<dialog>`.
- [ ] Reels fit the viewport width.
- [ ] Breakdown appears as a toast on a winning spin and auto-hides after ~4 s.
- [ ] SPIN button is comfortably tappable.

Orientation (rotate to landscape):
- [ ] Layout remains valid.

Browser zoom 200% (desktop viewport):
- [ ] No text clipping; controls still usable.

Record a turn in `ai-use-log.md`.

- [ ] **Step 2: Fix responsive issues if any**

One commit per fix.

---

### Task 20: README update + final lint/tests sweep

**Files:**
- Modify: `experiments/attempt-B/README.md`

- [ ] **Step 1: Rewrite the README to reflect the implemented state**

```markdown
# Attempt B — Context-Engineered Data Heist

Parallel reimplementation of the Data Heist slot machine, built under deliberate context engineering (SPEC + CLAUDE.md + three skill files + single-model Claude Opus run) for A/B comparison against Attempt A.

## Run locally

```bash
cd experiments/attempt-B
npm install
npm test            # unit + RTP Monte Carlo
npm run lint        # ESLint + stylelint + html-validate
npm run serve       # http://localhost:8000/
```

## Layout

```
attempt-B/
├── SPEC.md                    WHAT the game does (single source of truth)
├── CLAUDE.md                  HOW to write code (project rules)
├── .claude/skills/            path-scoped editing rules
├── ai-plan.md                 AI usage strategy
├── ai-use-log.md              per-turn log
├── src/                       types, rng, paytable, engine, ui, main, styles, assets
├── tests/                     node --test unit + RTP Monte Carlo
├── research/                  snapshotted research (8 personas, 7 user stories, etc.)
├── docs/superpowers/          spec + plan for this attempt
└── final-report/              writeup, slides, demo video
```

## Differentiators

1. **Payline highlight animation** — acid-green glow on winning cells.
2. **Win breakdown panel** — per-line payout list (right sidebar on desktop, toast on mobile).
```

- [ ] **Step 2: Run full verification**

Run: `cd experiments/attempt-B && npm test && npm run lint`
Expected: all green.

- [ ] **Step 3: Commit**

```bash
git add experiments/attempt-B/README.md
git commit -m "attempt-B: README reflects implemented state"
```

---

## Phase E — Report

### Task 21: `final-report/FINAL-REPORT.md`

**Files:**
- Create: `experiments/attempt-B/final-report/FINAL-REPORT.md`

- [ ] **Step 1: Create the file using the scaffold**

```markdown
# DATA HEIST — Attempt B Final Report

## 1. Hypothesis

Explicit context engineering (SPEC + project CLAUDE.md + three narrow skill files + a single-model Opus run) produces code that is more consistent, testable, and easier to extend than unstructured AI use for the same team.

## 2. Process

### 2.1 Context Engineering Setup

<What went into SPEC.md, CLAUDE.md, and the three skill files. Why each of those boundaries existed. Two or three sentences.>

### 2.2 Model and Harness

<Claude Opus 4.7 (1M) under Claude Code. Why single-model. What the model did well. Where we had to correct course.>

### 2.3 Turn-by-Turn Summary

<Condensed table from ai-use-log.md. One row per turn: #, file, intent, result, any hand-edit.>

## 3. Data

### 3.1 Quantitative

- Turns used: N
- Lines of code: N (src/) + N (tests/)
- Test results: <list each test file and count>
- Empirical RTP: <number> over 100,000 spins with seed=42
- Lint state: all green
- Hand-edits: count and total lines

### 3.2 Qualitative

<Two or three moments where context engineering clearly helped, pointing to ai-use-log turn numbers. One or two moments where it did not help, or was overkill.>

## 4. Discussion

### 4.1 What Worked

<2–3 bullets>

### 4.2 What Did Not

<2–3 bullets>

### 4.3 What We Would Change

<2–3 bullets>

## 5. Conclusion

<One paragraph the team can defend. No overclaim.>
```

- [ ] **Step 2: Fill in the placeholders (<...>) with actual numbers and observations from the ai-use-log**

The placeholders are intentional — they are the only fields where each team member contributes first-hand observations. Every other field is derivable from the log and the codebase.

- [ ] **Step 3: Commit**

```bash
git add experiments/attempt-B/final-report/FINAL-REPORT.md
git commit -m "attempt-B: final report"
```

---

### Task 22: Slide outline (PDF conversion done by the user)

**Files:**
- Create: `experiments/attempt-B/final-report/slides-outline.md`

- [ ] **Step 1: Create the outline**

```markdown
# DATA HEIST — Attempt B, slide outline (4–7 slides)

## Slide 1 — Title
- "DATA HEIST — Attempt B: AI Under Context Engineering"
- Team #7 · CSE 110 · Spring 2026

## Slide 2 — Hypothesis
- One sentence hypothesis.
- One sentence on what Attempt A looked like, what changed for Attempt B.

## Slide 3 — Setup
- Model (Opus 4.7 single), harness (Claude Code), files that scaffolded the run.
- Architecture diagram: paytable ← engine ← main → ui.

## Slide 4 — Data
- Turn count, hand-edit count.
- Test pass count, empirical RTP.
- Lines of code.

## Slide 5 — What worked / what did not
- Two bullets each.

## Slide 6 — Conclusion
- One-sentence claim the team can defend.

## Slide 7 (optional) — Demo
- Short screenshot of desktop and mobile layouts.
```

- [ ] **Step 2: Convert to PDF**

Run (manual): open the outline in Keynote / Google Slides / Marp, export as PDF, save to `experiments/attempt-B/final-report/slides.pdf`.

- [ ] **Step 3: Commit**

```bash
git add experiments/attempt-B/final-report/slides-outline.md experiments/attempt-B/final-report/slides.pdf
git commit -m "attempt-B: slides outline and PDF"
```

---

### Task 23: Demo video

**Files:**
- Add: `experiments/attempt-B/final-report/demo.mp4` (or `.mov`)

- [ ] **Step 1: Record a ≤ 4-minute demo**

Cover: the hypothesis, a quick run through the desktop UI (one winning spin, one losing spin), a walk through `SPEC.md` and one skill file to show the harness, and the final numbers.

- [ ] **Step 2: Commit the video**

```bash
git add experiments/attempt-B/final-report/demo.mp4
git commit -m "attempt-B: demo video"
```

(If the video is too large for git, store a link in `final-report/FINAL-REPORT.md` under a "Video" section and note the hosting location.)

---

## Self-Review Notes

After running through the tasks above, the following were checked against the spec:

- **§1.3 In Scope** — all implemented (core + highlight animation + breakdown).
- **§1.4 Out of Scope** — none implemented; `CLAUDE.md` explicitly rejects these.
- **§1.5 Success Criteria** — `npm test` + `npm run lint` cover (1) and (2); Tasks 18–19 cover (3); Task 21 covers (4); Tasks 1–23 all commit inside `experiments/attempt-B/`, covering (5).
- **§3 Architecture** — every module created with the responsibilities the spec describes.
- **§4.1 Symbol catalog** — 8 symbols match exactly.
- **§4.2 Weights, §4.3 Paytable, §4.4 Paylines** — numbers match the spec; `tests/paytable.test.js` pins them.
- **§4.5 Win evaluation** — implemented and unit-tested including wild substitution and pure-wild run.
- **§4.6 RNG** — implemented and seeded tests cover determinism.
- **§4.7 State and bet control** — `INITIAL_STATE` and `BET_STEPS` pinned by tests; MAX BET logic in `main.js`.
- **§4.8–4.10 Layout** — Task 13 builds HTML; Tasks 14–15 build CSS; Task 19 smoke-checks every breakpoint.
- **§4.11 Differentiator 1** — CSS `@keyframes glow-pulse` + stagger via `animationDelay` in `ui.js`.
- **§4.12 Differentiator 2** — `renderBreakdown` with toast behavior on mobile.
- **§4.13 Design tokens** — encoded at the top of `styles.css`.
- **§4.14 Symbol assets** — Task 12 authors a sprite from scratch (simpler than extracting the research asset, same `<use>` interface).
- **§5 Harness files** — Tasks 1–4 create them with single-responsibility boundaries.
- **§6 Verification** — unit tests (Tasks 7–11), manual responsive (Task 19), RTP tuning (Task 11), optional Playwright not required for baseline.
- **§7 Final report** — Task 21.
- **§8 Deliverable checklist** — every row has a corresponding task.

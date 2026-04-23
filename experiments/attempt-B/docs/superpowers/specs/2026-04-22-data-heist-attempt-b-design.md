# DATA HEIST — Attempt B Design Spec

Date: 2026-04-22
Author: Theo Lee (Team #7, CSE 110 Tech Warmup II)
Harness: Claude Code · Opus 4.7 (1M) · single-model run
Location: `experiments/attempt-B/`

---

## 1. Purpose, Hypothesis, and Scope

### 1.1 Purpose
Reimplement the Data Heist slot machine from scratch under deliberate context engineering. The result is compared against Attempt A (built in `/src` with looser ad-hoc AI usage) so the team can answer whether structured AI context — SPEC + project memory + narrow skill files — yields better software than unstructured AI use.

### 1.2 Hypothesis
Explicit context (single SPEC, project-wide CLAUDE.md, three module-scoped skill files, one model for the whole run) combined with a pure-core / DOM-layer separation produces code that is more consistent, more testable, and easier to extend than the same team prompting without that scaffolding.

### 1.3 In Scope (Scope B)
- 5×3 reel grid with 25 fixed paylines, evaluated left-to-right.
- Weighted RNG reel generation, seeded and testable.
- 8-symbol cyberpunk catalog (one Wild, seven regulars), paytable by bet multiplier.
- Credit / bet / spin loop with starting balance 1,000 and bet steps [1, 5, 10, 25, 50, 100].
- **Differentiator 1** — payline highlight animation (acid-green glow sweep over winning rows).
- **Differentiator 2** — win breakdown panel (per-line "Line 3 · 3× oni_mask · +15" rendering).
- Full responsive layout: desktop (3-column), tablet (sides collapsed), mobile (stacked + `<dialog>` paytable).

### 1.4 Out of Scope
Scatter symbols, Free Spins, multipliers, cascading/respin, auto-spin, both-ways pay, session history panel, progressive jackpots, sounds, real-money flows, accounts, server persistence, near-miss engineered framing.

### 1.5 Success Criteria
1. `npm test` is green: RNG determinism, engine fixed-grid assertions, paytable constants, and an RTP Monte Carlo (96 ± 1% over 100k spins, `seed=42`).
2. `npm run lint` is green across ESLint, stylelint, and html-validate.
3. 30–50 manual spins in the browser satisfy:
   - No console errors or warnings.
   - Balance never goes below zero; SPIN is disabled when `bet > balance`.
   - Displayed balance always equals the engine's internal balance; highlighted lines exactly match `wins[]`.
   - UI does not freeze; queued spins during animation never leave a broken state.
   - Layout is intact on desktop (≥1024px), tablet (640–1023px), and mobile (<640px) viewports.
4. `ai-use-log.md` has ≥ 20 substantive entries.
5. All code, tests, spec, skill files, logs, and final report live in the Attempt B repository tree.

### 1.6 Stable Decisions Driving the Design
- Stack: vanilla HTML + CSS + ES modules. No build tool, no framework.
- Typing: JSDoc `@typedef` in `src/types.js`, imported where helpful. No TypeScript.
- Module count: 5 code modules + 1 types file. See §3.
- Harness: Claude Code with three skill files under `.claude/skills/`.
- Model: Claude Opus 4.7 (1M context), single model for the entire run.
- Test runner: Node built-in `node --test`. No Vitest, no Jest.
- Stretch (only if time allows after baseline is green): 1–2 Playwright smoke tests.

---

## 2. User Stories and Personas Reference

Source of truth for user intent: `research/user-stories/` (7 stories) and `research/personas/` (5 personas). Design decisions in this spec trace back to:

- **US1 (Casual player)** — spin/bet/balance are immediately obvious; winning produces a clear visual reaction. Drives §4 UI layout and §4.5 highlight animation.
- **US3 (Paylines)** — lines connecting matching symbols are visibly shown. Drives §4.5 highlight animation and §4.6 breakdown panel.
- **US4 (New player)** — clear paytable available at any time. Drives §4.4 `<details>` paytable expansion and the mobile `<dialog>` variant.
- **US6 (Session tracker)** — spin history in a side panel. **Explicitly reinterpreted** as the Win Breakdown panel (current spin's lines rather than session log) to match the chosen differentiator in §4.6. Full session history is out of scope.
- **US5 / US7** — bonus-round hunting and "pity feedback" — out of scope for Attempt B.

Personas informing the feel: Marcus (casual, wants instant legibility), Noah (wants responsive, punchy visuals), and Scott (wants transparency — satisfied by the breakdown panel).

---

## 3. Architecture and Data Model

### 3.1 File Layout

```
attempt-B/
├── index.html                         single-page shell; <script type="module" src="src/main.js">
├── package.json                       scripts: test, lint, lint:js, lint:css, lint:html, serve
├── .eslintrc.json
├── .stylelintrc.json
├── .htmlvalidate.json
├── SPEC.md                            lean implementation-facing reference (derived from §3–§4)
├── CLAUDE.md                          global rules (see §5.2)
├── .claude/skills/
│   ├── slot-engine.md                 rules for engine/rng/paytable edits
│   ├── slot-ui.md                     rules for ui.js/styles.css/index.html edits
│   └── slot-testing.md                rules for tests/
├── ai-plan.md                         strategy document
├── ai-use-log.md                      turn-by-turn log (≥ 20 entries)
├── src/
│   ├── main.js                        entry point / orchestrator
│   ├── rng.js                         createRng(seed) → { next(max), seed }
│   ├── engine.js                      spin(state, bet, rng) → SpinResult
│   ├── paytable.js                    SYMBOLS, SYMBOL_WEIGHTS, PAYLINES, payoutFor, INITIAL_STATE, BET_STEPS
│   ├── ui.js                          renderPaytable, renderGrid, highlightWins, renderBreakdown, renderHud, setSpinEnabled
│   ├── types.js                       @typedef declarations only
│   ├── styles.css                     single stylesheet, CSS vars at top
│   └── assets/
│       └── symbols.svg                copied + id-tagged from research/
├── tests/
│   ├── rng.test.js
│   ├── paytable.test.js
│   └── engine.test.js
├── docs/superpowers/specs/
│   └── 2026-04-22-data-heist-attempt-b-design.md  (this document)
└── final-report/
    ├── FINAL-REPORT.md
    └── slides.pdf
```

### 3.2 Module Boundaries

```
paytable.js ← engine.js ← main.js → ui.js
                ↑                      ↑
              rng.js                  (DOM only)
```

Hard rules (enforced by `.claude/skills/slot-engine.md` and `slot-ui.md`):
- `rng.js`, `engine.js`, `paytable.js`: pure. No DOM, no network, no globals, no side effects other than returning values.
- `ui.js`: DOM writes only. Does not import any core module.
- `main.js`: the only module that imports both core and UI. Holds the single mutable `state` variable.

### 3.3 Data Model (JSDoc, declared in `src/types.js`)

```js
/** @typedef {'neural_chip'|'katana'|'oni_mask'|'neon_7'|'cyber_iris'|'chrome_skull'|'gold_kanji'|'wild'} Symbol */

/**
 * Reel grid. reels[col][row] — 5 columns, each with 3 rows.
 * row 0 = top, row 2 = bottom.
 * @typedef {{ reels: Symbol[][], rows: 3, cols: 5 }} Grid
 */

/** @typedef {{ id: number, rows: [number, number, number, number, number] }} Payline */

/** @typedef {{ lineId: number, symbol: Symbol, count: 3|4|5, payout: number }} Win */

/** @typedef {{
 *    grid: Grid,
 *    wins: Win[],
 *    payout: number,
 *    newBalance: number,
 *    newState: GameState
 * }} SpinResult
 */

/** @typedef {{ balance: number, bet: number, lastSpin: SpinResult | null }} GameState */
```

### 3.4 Spin Data Flow

```
[click #spin]
  → main.js reads state, reads bet
  → engine.spin(state, bet, rng)
        ├─ generateGrid(rng, SYMBOL_WEIGHTS)          15 weighted picks
        ├─ evaluateLine(grid, payline, payoutFor)     per PAYLINE (25×)
        └─ applyPayout(state, bet, wins)              returns newState
  → returns SpinResult
  → main.js calls
        ui.renderGrid(result.grid)
        ui.highlightWins(result.wins)                 differentiator 1
        ui.renderBreakdown(result.wins)               differentiator 2
        ui.renderPaytable(result.wins)                .on on symbols whose rows hit
        ui.renderHud({ balance, bet, lastWin: result.payout })
        ui.setSpinEnabled(result.newBalance >= bet)
  → main.js assigns state = result.newState
```

Single `SpinResult` powers all render calls — both differentiators consume the same `wins[]` array. No divergent state.

### 3.5 Error and Edge Cases

- `bet < 1 || bet > state.balance` → `engine.spin` throws `Error('invalid bet')`. `main.js` catches and re-enables SPIN.
- `state.balance === 0` after a spin → `main.js` renders a `RESET` overlay (single button restores `INITIAL_STATE.balance`). Prevents dead-end sessions; called out in the final report as a safety affordance.
- Any other engine throw is logged to console and SPIN is disabled until a reload (defensive, should not occur in correct runs).
- No network I/O: zero network error paths.

---

## 4. Gameplay and UI Specification

### 4.1 Symbol Catalog (8)

Derived from `research/visuals_and_assets/cyberpunk/symbols-cyberpunk.svg` `<desc>`:

| id | display name | role | accent |
|---|---|---|---|
| `neural_chip` | Neural Chip | low | cyan |
| `katana` | Katana | low-mid | cyan |
| `oni_mask` | Oni Mask | mid | cyan |
| `neon_7` | Neon 7 | mid-high | acid / cyan |
| `cyber_iris` | Cyber Iris | high | cyan |
| `chrome_skull` | Chrome Skull | high | purple `#B44FFF` |
| `gold_kanji` | Gold Kanji | top | gold `#FFD700` |
| `wild` | Wild W | substitute | magenta `#FF2D78` |

`triangle` and `cyber_skull` from the prose overview do not exist in the asset; they are removed from this spec.

### 4.2 Symbol Weights (uniform across reels)

```js
export const SYMBOL_WEIGHTS = {
  neural_chip:  24,
  katana:       19,
  oni_mask:     16,
  neon_7:       13,
  cyber_iris:   11,
  chrome_skull:  7,
  gold_kanji:    5,
  wild:          5,
};  // Σ = 100
```

Weighted pick uses cumulative distribution; each of the 15 grid cells is an independent draw.

### 4.3 Paytable (bet multiplier)

`payoutFor(symbol, count)` returns the multiplier. Spin payout per winning line = `payoutFor(symbol, count) × bet`. Matches below 3 pay zero.

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

These values are an initial table. The RTP Monte Carlo test (§6.3) tunes them by applying a single scalar multiplier across the whole table if empirical RTP is outside the 95–97% band. Symbol weights are not touched.

### 4.4 Paylines (25 fixed, left-to-right)

Each payline is expressed as a 5-element array of row indices (0 = top, 2 = bottom).

```js
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
```

### 4.5 Win Evaluation

For each payline, read `path = payline.rows.map((row, col) => grid.reels[col][row])`. The target symbol is `path[0]` unless `path[0]` is wild, in which case the target is the first non-wild in `path` (falling back to `wild` if the entire path is wild). Walk the path from left to right: extend the matching run while the symbol is either the target or `wild`; stop at the first mismatch. If the final count is ≥ 3, produce a `Win { lineId, symbol, count, payout: payoutFor(symbol, count) * bet }`. A pure wild run (target = `wild`) pays from the `wild` row of the §4.3 paytable directly. All wins are returned; the engine does not dedupe across overlapping lines — each line pays independently.

### 4.6 RNG

Mulberry32, seeded. Seed defaults to `Date.now()` in production, fixed at 42 in tests.

```js
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

### 4.7 Initial State and Bet Controls

```js
export const INITIAL_STATE = { balance: 1000, bet: 10, lastSpin: null };
export const BET_STEPS = [1, 5, 10, 25, 50, 100];
```

The bet stepper cycles forward and backward through `BET_STEPS`, clamped to values `≤ state.balance`. `MAX BET` sets bet to the largest step that is still `≤ state.balance`.

### 4.8 UI Layout — Desktop (≥ 1024 px)

Structure follows `research/visuals_and_assets/cyberpunk/01-wireframe-play-dark.html` with palette from overview.md.

```
┌─────────────────────────────────────────────────────────────┐
│  topbar: ← LOBBY · DATA HEIST · balance · settings          │
├──────────┬──────────────────────────────┬───────────────────┤
│ paytable │          5×3 REEL GRID        │  WIN BREAKDOWN   │
│ (compact │                              │                   │
│  + <det- │                              │  Line 3 · 3×      │
│  ails>)  │                              │  oni_mask · +15   │
│          │                              │  Line 11 · 4×     │
│          │                              │  wild · +40       │
│          │                              │                   │
├──────────┴──────────────────────────────┴───────────────────┤
│  BALANCE · BET steppers · MAX BET · ▸ SPIN · WIN            │
└─────────────────────────────────────────────────────────────┘
```

Removed from the wireframe (scope cuts): `AUTO 10×` button, `MULTIPLIER`, `FREESPIN STATE`, `SEED HASH`, `CHAPTER / VOL.02`.

### 4.9 UI Layout — Tablet (640–1023 px)

CSS-only reflow. `grid-template-columns` collapses to `1fr`. Paytable and breakdown move below the reel grid as stacked blocks. Controls bar remains at the bottom.

### 4.10 UI Layout — Mobile (< 640 px)

Per wireframe mobile variant:
- Status bar (time / indicators) — decorative only.
- Top bar: back · DATA HEIST title · settings icon.
- HUD strip: BAL / BET / WIN (three equal columns).
- 5×3 reels fit to viewport width.
- Bet stepper row.
- Spin row: `[i]` — SPIN — (placeholder for future action).
- Paytable: `[i]` button opens a `<dialog>` overlay containing both compact view and `<details>` expansion.
- Win breakdown: a small toast-style strip appearing under the HUD when `wins.length > 0`, auto-dismissing after 4 seconds.

### 4.11 Differentiator 1 — Payline Highlight Animation

Implementation constraints:
- Pure CSS `@keyframes` acid-green glow (`var(--acid)`, `var(--fx-glow-acid)`).
- Applied by toggling a `.hot` class on the 3 cells covered by each winning line, plus a `.winbar-<row>` overlay.
- Multiple simultaneous wins: sort `wins[]` by descending `payout`, then by ascending `lineId`, and stagger each row's animation start by `120 ms × (index in that sorted array, starting from 0)`.
- Total animation time ≤ 1.5 s. Next spin is accepted at any time; kicking off `renderGrid` resets all `.hot` classes idempotently.
- No JavaScript timers. CSS animations end naturally.

### 4.12 Differentiator 2 — Win Breakdown Panel

- Right sidebar on desktop / tablet-stacked; toast on mobile.
- For each `Win` in `wins[]`, render a row: `<line id> · <count>× <symbol glyph> · +<payout>`.
- If `wins.length === 0`: render a muted `— no wins —` placeholder.
- Rebuilt from scratch on every spin (idempotent render).
- Ordering: by descending payout, ties broken by ascending `lineId`.

### 4.13 Design Tokens

Overview.md is the source of truth for colors and typography; tokens-cyberpunk.html contributes spacing and effect values only.

```css
:root {
  /* Backgrounds — overview.md */
  --bg: #0D0B1A; --card: #1A1528; --panel: #12101F; --border: #2A2040;

  /* Text — overview.md */
  --fg: #FFFFFF; --dim: #6B6480; --win: #00FF88; --loss: #FF4444;

  /* Accents — overview.md */
  --acid: #C8FF00; --magenta: #FF2D78; --cyan: #00FFD4;
  --gold: #FFD700; --purple: #B44FFF;

  /* Spacing — tokens-cyberpunk.html */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;

  /* Effects — tokens-cyberpunk.html (magenta re-tuned to overview hue) */
  --fx-glow-acid:    0 0 0 1px var(--acid),    0 0 32px rgba(200, 255, 0, 0.5);
  --fx-glow-magenta: 0 0 0 1px var(--magenta), 0 0 32px rgba(255, 45, 120, 0.5);
  --fx-inset:        inset 0 0 60px rgba(0, 0, 0, 0.9);
  --fx-drop:         0 20px 40px -15px rgba(0, 0, 0, 0.9);
}

body {
  font-family: 'Orbitron', sans-serif;
  background: var(--bg);
  color: var(--fg);
}
```

Orbitron is loaded once in `<head>` from Google Fonts (weights 400 / 500 / 700 / 900).

### 4.14 Symbol Assets

`research/visuals_and_assets/cyberpunk/symbols-cyberpunk.svg` is copied into `src/assets/symbols.svg`. Each of the 8 symbol groups is wrapped in `<g id="sym-<id>">` during the copy step (the copy is a one-shot edit, logged in `ai-use-log.md`). Reel cells reference symbols via `<svg><use href="assets/symbols.svg#sym-<id>" /></svg>`.

---

## 5. Context Engineering Harness

### 5.1 File Responsibilities (no overlap)

| file | holds | changes |
|---|---|---|
| `docs/superpowers/specs/2026-04-22-…design.md` | this full design record | rarely; historical |
| `SPEC.md` | lean implementation-facing reference (§3–§4 condensed) | when design changes |
| `CLAUDE.md` | project-wide rules (HOW, global) | rarely |
| `.claude/skills/slot-engine.md` | rules for engine/rng/paytable edits | rarely |
| `.claude/skills/slot-ui.md` | rules for ui.js / styles.css / index.html | rarely |
| `.claude/skills/slot-testing.md` | rules for tests/ | rarely |
| `ai-plan.md` | model, harness, work-unit, hand-edit policy | when strategy changes |
| `ai-use-log.md` | per-turn record (≥ 20 entries) | every meaningful turn |

Guard rails:
- WHAT (game rules, data shapes, target RTP) lives only in SPEC.md.
- HOW (coding style, module rules) lives only in CLAUDE.md and skills.
- Strategy (model choice, turn policy) lives only in ai-plan.md.

### 5.2 `CLAUDE.md` Outline

```
# DATA HEIST — Attempt B

## Authority
- SPEC.md is the single source of WHAT.
- overview.md + tokens-cyberpunk.html define visual identity (overview wins on conflict).
- Read the relevant .claude/skills/ file before editing any src/ or tests/ file.

## Module Boundaries (hard)
- Pure core: rng.js, engine.js, paytable.js — no DOM, no network, no globals.
- UI: ui.js — DOM writes only, imports no core module.
- Orchestrator: main.js — the ONLY module that imports both core and ui.

## Coding Style
- ES modules, named exports only (no default).
- JSDoc type annotations on all exported functions.
- Small functions (≲ 30 lines); extract helpers when a function grows.
- No WHAT comments; only non-obvious WHY.
- No duplication of symbol strings, payout logic, or payline paths.

## Testing
- Every core module has a companion test file.
- node --test only. No external runners.
- Engine tests use createRng(42) for determinism.

## AI Rules (the experiment)
- Model: Claude Opus 4.7 (1M). Do not switch mid-run.
- Never commit on behalf of the user.
- Two failed prompt fixes → hand-edit, logged.
- Every meaningful turn gets an ai-use-log.md entry.

## Linting
- ESLint, stylelint, html-validate — all three green before declaring any module done.
```

### 5.3 Skill File Outlines

**`.claude/skills/slot-engine.md`** — when editing `rng.js`, `engine.js`, `paytable.js`.
- Pure functions only; input → output, no side effects.
- `spin(state, bet, rng)` signature is frozen; SpinResult may gain fields but not lose.
- Weighted pick uses cumulative distribution (snippet included).
- Wild substitution lives only inside `evaluateLine`.
- No code change without a test change in the same commit.

**`.claude/skills/slot-ui.md`** — when editing `ui.js`, `index.html`, `styles.css`.
- No hex literals; use CSS vars from the `:root` block (snippet included).
- Cache DOM queries at module load; never `querySelector` inside render hot paths.
- Responsive is CSS media queries only; no JS viewport inspection.
- Animations are CSS `@keyframes`; no setInterval/setTimeout chains (one `requestAnimationFrame` is the allowed exception).
- Every render function is idempotent — it fully rebuilds its area from inputs.

**`.claude/skills/slot-testing.md`** — when editing anything under `tests/`.
- `import { test } from 'node:test'` + `import assert from 'node:assert/strict'`.
- Engine tests use `createRng(42)` so expected grids can be hard-coded.
- RTP test: 100,000 spins, `assert(rtp > 0.95 && rtp < 0.97)`.
- No DOM tests here; UI is manually smoked.

### 5.4 `ai-plan.md` Outline

```
# AI Usage Plan — Attempt B

Model: Claude Opus 4.7 (1M). Single model. Rationale: Attempt B's hypothesis
needs a model that reliably absorbs a large coherent context (SPEC + CLAUDE.md
+ 3 skills + research). Opus 1M does so most consistently; switching models
would muddy the A/B comparison.

Harness: Claude Code. Skill files auto-scope by path.

Work unit: one file per turn where possible. Each turn:
  1. Load SPEC + CLAUDE.md + the path-matching skill.
  2. Produce the file end-to-end.
  3. Run linter + tests; Theo reports results.
  4. Fix via prompting if broken; after 2 failed attempts, hand-edit and log.
  5. Theo commits. Entry appended to ai-use-log.md.

Hand-edit policy: only after two failed prompt-based fixes. Each hand-edit is
logged with file path, line range, and why prompting failed.

Adversarial check: every 5 turns, prompt Claude to review recent commits
against SPEC and CLAUDE.md and report contradictions. Log the response.
```

### 5.5 `ai-use-log.md` Entry Template

```
## Turn N — YYYY-MM-DD HH:MM — <file or task>

Prompt intent: <one line>
Context loaded: <SPEC, CLAUDE.md, skill:X>
Result: <summary, files changed>
Lint / tests: <pass/fail; what was fixed>
Hand-edit: <none | file:lines, reason>
Learning: <one line — what worked or didn't>
```

---

## 6. Verification

### 6.1 Unit Tests (required)

```
tests/rng.test.js
  - same seed → same next(max) sequence for 1,000 draws
  - next(max) is always within [0, max)

tests/paytable.test.js
  - payoutFor values match §4.3 table exactly
  - PAYLINES.length === 25 and every rows.length === 5
  - SYMBOL_WEIGHTS values sum to 100

tests/engine.test.js
  - seed=42 produces an exact expected 5×3 grid (pinned in the test)
  - wild substitution: grid with [wild, oni_mask, oni_mask, oni_mask, X] on payline 1
    yields one Win with symbol=oni_mask, count=4
  - bet > balance throws Error('invalid bet')
  - RTP Monte Carlo: createRng(42), 100,000 spins, 0.95 < rtp < 0.97
```

### 6.2 Manual Responsive Check

```
□ ≥1024px: 3-column; all three panels visible without horizontal scroll.
□ 640–1023px: paytable and breakdown stack below reels; no horizontal scroll.
□ <640px:
   □ HUD (BAL/BET/WIN) shows 3 columns.
   □ Reels fit within viewport width.
   □ [i] opens <dialog>; close returns focus to [i].
   □ SPIN is never below the fold.
□ Orientation change (portrait ↔ landscape): layout still valid.
□ Browser zoom 200%: no text clipping.
```

### 6.3 RTP Tuning Procedure

If `tests/engine.test.js` RTP is outside [0.95, 0.97]:
1. Compute observed RTP.
2. Scale every value in the paytable by `target / observed` (target = 0.96).
3. Re-run the test.
4. If still out of band after one scaling pass, adjust `wild` multipliers specifically (largest contributor to variance) and re-run.
5. Do not touch SYMBOL_WEIGHTS — hit frequency is a user-feel parameter held constant.

### 6.4 Stretch — Playwright Smoke (only if time allows)

```
tests/e2e/spin.spec.js
  - load index.html
  - assert BAL reads 1000
  - click SPIN
  - assert BAL changed
  - assert either #breakdown shows at least one entry OR shows "— no wins —"
```

---

## 7. Final Report Scaffold

The report at `final-report/FINAL-REPORT.md` will use this outline:

```
1. Hypothesis — what we tested.
2. Process
   2.1 Context engineering setup (SPEC + CLAUDE.md + skills)
   2.2 Model & harness (why Opus 4.7 single)
   2.3 Turn-by-turn summary (ai-use-log.md condensed)
3. Data
   3.1 Quantitative — turns, LOC, test coverage, RTP, hand-edit count.
   3.2 Qualitative — moments context clearly helped; moments it did not.
4. Discussion
   4.1 What worked.
   4.2 What didn't.
   4.3 What we'd change.
5. Conclusion — a claim the team can defend, no overclaim.
```

Slides (PDF, 4–7 slides) condense §1 / §2 / §3.1 / §4 / §5. The ≤ 4-minute video demo follows the same arc.

---

## 8. Deliverable Checklist

- [ ] `research/` (already present)
- [ ] `ai-plan.md`
- [ ] `ai-use-log.md` (≥ 20 entries)
- [ ] `SPEC.md`
- [ ] `CLAUDE.md`
- [ ] `.claude/skills/{slot-engine,slot-ui,slot-testing}.md`
- [ ] `package.json` + lint configs
- [ ] `src/{types,rng,paytable,engine,ui,main}.js` + `src/styles.css` + `src/assets/symbols.svg` + `index.html`
- [ ] `tests/{rng,paytable,engine}.test.js` (all green)
- [ ] `final-report/FINAL-REPORT.md`
- [ ] `final-report/slides.pdf` (4–7 slides)
- [ ] Demo video (≤ 4 min)
- [ ] README.md updated with Attempt B usage
- [ ] Commits authored by Theo, frequent, clear messages

---

## 9. Open Risks

- **Orbitron legibility at small sizes.** Orbitron is wide; labels <11px may clip. Mitigation: use weight 500 at ≤12px; if still poor on mobile, fall back to a system sans for mono labels only.
- **100k-spin RTP test runtime.** At ~10 µs/spin in JS, ~1 s. Acceptable. If it exceeds 5 s on CI-like hardware, lower to 50k spins and widen the band to [0.94, 0.98].
- **`<dialog>` browser support.** Safari supported since 15.4; acceptable for a class project. If blocked, fall back to a full-screen `<div role="dialog">` with focus trap.
- **20-entry log minimum in a constrained window.** Each meaningful turn (file creation, lint fix, test pass, hand-edit) counts as one entry. Design has ~12 files × ~2 turns each → ~24 turns baseline before any rework.

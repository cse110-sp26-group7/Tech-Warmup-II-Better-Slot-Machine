# Attempt B: Context-Engineered

Parallel reimplementation of the Data Heist slot machine, built from scratch under deliberate context engineering (SPEC, project CLAUDE.md, three path-scoped skill files, and a single-model Claude Opus run) for A/B comparison against Attempt A.

Final report and findings: [`final-report/FINAL-REPORT.md`](final-report/FINAL-REPORT.md).

## Run locally

```bash
cd experiments/attempt-B
npm install
npm test            # 18 unit tests + 100k-spin RTP Monte Carlo
npm run lint        # ESLint + stylelint + html-validate
npm run serve       # http://localhost:8000/
```

## Layout

```
attempt-B/
├── SPEC.md                    Single source of WHAT the game does
├── CLAUDE.md                  Project-wide HOW rules (module boundaries, style)
├── ai-plan.md                 AI usage strategy (model, harness, policy)
├── ai-use-log.md              Per-turn record (28 entries across the run)
├── .claude/skills/            Path-scoped editing rules
│   ├── slot-engine.md           For src/rng.js, src/engine.js, src/paytable.js
│   ├── slot-ui.md               For src/ui.js, src/styles.css, index.html
│   └── slot-testing.md          For tests/
├── docs/
│   ├── design.md                Full brainstorming design doc
│   └── plan.md                  Implementation plan
├── src/                       7 modules, 720 LOC
│   ├── types.js                 JSDoc typedefs
│   ├── rng.js                   Mulberry32 seeded PRNG
│   ├── paytable.js              Symbols, weights, 25 paylines, payoutFor
│   ├── engine.js                Pure spin(), evaluateLine(), generateGrid()
│   ├── ui.js                    Render functions and event wiring (DOM only)
│   ├── main.js                  Orchestrator (only importer of both engine and ui)
│   ├── sound.js                 Web Audio synthesized SFX
│   ├── styles.css               Design tokens, desktop, and responsive
│   └── assets/symbols.svg       8 cyberpunk neon glyphs
├── tests/                     18 unit tests + 100k-spin RTP Monte Carlo
├── research/                  Snapshotted inputs (5 personas, 7 user stories, etc.)
├── final-report/
└── index.html                 Single-page shell
```

## Differentiators (over Attempt A)

1. Payline highlight animation. An acid-green glow sweeps across winning cells 500ms after the grid drop.
2. Win breakdown panel. Right sidebar on desktop and tablet, inline below reels on mobile. Renders per-line `L<id> · <count>× <symbol> · +<payout>`.

Plus visual polish: row-wise staggered reel drop, WIN counter pulse on win, BIG WIN and MEGA WIN overlays with arpeggio SFX on payouts that are 10× or 50× bet, Mystery Drop every 20 spins, Unlucky Bonus after 10 losses in a row, and Web Audio synthesized sounds.

## Verification

- `npm test`: 18 passing. RNG determinism, paytable constants, evaluateLine edge cases, spin shape and bet validation, and a 100k-spin Monte Carlo RTP within [0.95, 0.97].
- `npm run lint`: ESLint, stylelint, and html-validate all clean.
- Manual browser smoke: desktop (1440×900), tablet (1023 and below), and mobile (under 640px) all verified. Keyboard shortcuts `Shift+B`, `Shift+M`, `Shift+U`, and `Shift+Y` preview the BIG, MEGA, UNLUCKY, and MYSTERY overlays without waiting for rare RNG rolls.

## Key numbers

- Empirical RTP (seed=42, 100k spins): 0.9603 (target 0.96 ± 0.01).
- Initial paytable RTP before tune: 1.3512, which was 35% over-generous. One scalar pass brought it into band.
- Hand-edits: 0. All code was authored by Claude Opus 4.7, and all commits were authored by the user.

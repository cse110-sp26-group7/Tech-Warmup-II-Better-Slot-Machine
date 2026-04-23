# DATA HEIST Implementation Spec

This file is the single source of truth for WHAT the game does. The full rationale lives in `docs/design.md`; this file is the condensed reference for coding.

## 1. Game Rules

- 5 columns × 3 rows. 25 fixed paylines, evaluated left-to-right.
- Each of the 15 cells is an independent weighted draw; symbol weights are uniform across reels.
- Wild substitutes for any symbol. A pure-wild run pays from the `wild` row of the paytable.
- A line pays when 3 or more matching symbols (including wilds) extend from reel 0.
- When a line has both a leading-wild run (3 or more wilds from reel 0) AND a substituted-target run, the line pays whichever candidate yields the higher payout. Industry convention: the player is paid the better of the two valid interpretations of the same path.

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
| neural_chip | 0.14 | 0.36 | 0.71 |
| katana | 0.21 | 0.57 | 1.42 |
| oni_mask | 0.36 | 1.07 | 2.84 |
| neon_7 | 0.71 | 2.13 | 5.68 |
| cyber_iris | 1.07 | 3.55 | 10.66 |
| chrome_skull | 1.78 | 7.10 | 35.52 |
| gold_kanji | 3.55 | 17.76 | 71.05 |
| wild | 7.10 | 35.52 | 142.10 |

Paytable values are the initial set. If the 100k-spin RTP Monte Carlo (§7) falls outside [0.95, 0.97], scale every entry by `0.96 / observed_rtp` and update this table to match.

## 5. Paylines

25 fixed paths, each a 5-element array of row indices (0 for top, 2 for bottom). The full list is in `src/paytable.js`. Design rationale and diagrams are in `docs/design.md` §4.4.

## 6. State

- `INITIAL_STATE = { balance: 1000, bet: 10, lastSpin: null }`
- `BET_STEPS = [1, 5, 10, 25, 50, 100]`
- `MAX BET` sets bet to the largest step that does not exceed the balance.
- SPIN is disabled when `bet > balance`. The RESET overlay appears when balance is 0.

## 7. RTP

Target 96% ± 1%. Verified with a 100,000-spin Monte Carlo using `createRng(42)`. Tune by scaling paytable values if out of band. Do not change `SYMBOL_WEIGHTS` for tuning; hit frequency is held constant.

## 8. Differentiators

1. Payline highlight animation. An acid-green glow sweep on winning rows, staggered by rank in the wins array (sort by descending payout, ascending lineId; 120 ms per step).
2. Win breakdown panel. Right sidebar on desktop and tablet, inline below reels on mobile. Renders per-line `L<id> · <count>× <symbol> · +<payout>`.

## 9. Responsive

- 1024 px and up: 3-column (paytable, reels, breakdown) plus the controls bar.
- 640 to 1023 px: sides stack below reels.
- Under 640 px: HUD, reels, bet stepper, and spin row. The paytable opens in a `<dialog>`, and the breakdown appears inline below reels.

## 10. Out of Scope

Scatter, Free Spins (proper bonus mode), multipliers, cascading, auto-spin, both-ways pay, session history log, and accounts. Any request for these is rejected; point back to this section.

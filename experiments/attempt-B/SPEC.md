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

Paytable values are the **initial** set. If the 100k-spin RTP Monte Carlo (§7) falls outside [0.95, 0.97], scale every entry by `0.96 / observed_rtp` and update this table to match.

## 5. Paylines

25 fixed paths, each a 5-element array of row indices (0 = top, 2 = bottom). The full list is in `src/paytable.js`. Design rationale and diagrams are in `docs/superpowers/specs/2026-04-22-data-heist-attempt-b-design.md` §4.4.

## 6. State

- `INITIAL_STATE = { balance: 1000, bet: 10, lastSpin: null }`
- `BET_STEPS = [1, 5, 10, 25, 50, 100]`
- `MAX BET` sets bet to the largest step ≤ balance.
- SPIN disabled when `bet > balance`. RESET overlay when balance = 0.

## 7. RTP

Target 96 ± 1%. Verified with a 100,000-spin Monte Carlo using `createRng(42)`. Tune by scaling paytable values if out of band. Do not change `SYMBOL_WEIGHTS` for tuning — hit frequency is held constant.

## 8. Differentiators

1. **Payline highlight animation** — acid-green glow sweep on winning rows, staggered by rank in the wins array (sort by descending payout, ascending lineId; 120 ms per step).
2. **Win breakdown panel** — right sidebar (desktop/tablet) / toast (mobile), renders per-line `L<id> · <count>× <symbol> · +<payout>`.

## 9. Responsive

- ≥ 1024 px: 3-column (paytable | reels | breakdown) + controls bar.
- 640–1023 px: sides stack below reels.
- < 640 px: HUD + reels + bet stepper + spin row; paytable in `<dialog>`; breakdown as toast.

## 10. Out of Scope

Scatter, Free Spins, multipliers, cascading, auto-spin, both-ways pay, session history, sound, accounts. Any request for these is rejected — point back to this section.

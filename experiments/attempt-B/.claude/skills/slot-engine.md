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

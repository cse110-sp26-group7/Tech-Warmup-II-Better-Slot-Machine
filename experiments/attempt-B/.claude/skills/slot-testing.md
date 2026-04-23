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

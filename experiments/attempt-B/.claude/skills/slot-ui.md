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

# JavaScript Style Guide — Data Heist

Conventions observed in and enforced across this codebase.

---

## Quotes

Use **single quotes** for all string literals. Use template literals (backticks) only when interpolating values.

```js
const id = 'NEON_7';
throw new Error(`Unknown symbol ID: ${symbolId}`);
```

---

## Indentation & Spacing

- **2 spaces** per indent level; no tabs.
- One space after `//` in inline comments.
- No alignment padding — do not add extra spaces to align `=` signs across lines.
- Trailing commas on multi-line arrays and objects (the formatter enforces this).

---

## Semicolons

Always terminate statements with a semicolon.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Exported constant | `SCREAMING_SNAKE_CASE` | `REEL_STRIPS`, `MIN_BET_PER_LINE` |
| Variable / function | `camelCase` | `getBetPerLine`, `spinNodes` |
| Private (non-exported) helper | `camelCase` — no `_` prefix | `updateState`, `makeGain` |
| JSDoc typedef | `PascalCase` | `GameState`, `Payline`, `Symbol` |

Private (non-exported) functions need no special prefix or suffix — module scope already limits their visibility.

---

## Comments

**JSDoc** (`/** */`) is required on every exported constant, type, and function. Use `@param`, `@returns`, and `@throws` for functions; `@type` for typed constants.

```js
/**
 * Calculates the payout for a single payline.
 * @param {string[]} paylineSymbols - Array of 5 symbol IDs
 * @param {number} betAmount - Bet amount for this payline
 * @returns {number} Payout amount (0 if no win)
 * @throws {Error} If parameters are invalid
 */
```

**Section dividers** may be used in large files to group related functions:

```js
// ─── Section Name ─────────────────────────────────────────────────────────────
```

**Inline comments** (`//`) explain non-obvious logic; do not restate the code.

---

## Error Handling

- Throw `new Error(message)` synchronously for invalid arguments and state.
- Validate at public function boundaries; trust internal callers.
- Top-level `async` functions (e.g. `executeSpin`) wrap their body in `try/catch` to prevent unhandled rejections and restore UI state.
- Name unused catch bindings with a descriptive `_`-prefixed identifier: `catch (_error)`.

---

## Module Format

ES Modules (`import` / `export`) throughout. No CommonJS (`require`).

- Use `export const` / `export function` for the public API.
- Private helpers are plain `function` or `const` declarations without `export`.
- Group imports: external packages first, then internal modules in dependency order.

---

## Test Files

Test files mirror the module name: `src/js/foo.js` → `tests/foo.test.js`. Use the same quote and spacing rules. Import only the specific exports under test.

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

## Scope Discipline

Do not reference or modify any file outside `experiments/attempt-B/`. The parent `plan/`, sibling `experiments/attempt-A/`, and repo-root `src/` are off-limits to every turn.

## Out of Scope (Game Features)

Scatter, Free Spins, multipliers, cascading, auto-spin, both-ways pay, session history, sound, accounts. If a prompt asks for these, reject and point to §10 of `SPEC.md`.

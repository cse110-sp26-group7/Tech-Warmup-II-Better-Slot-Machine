# AI Use Log — Attempt B

Per-turn log for the context-engineered reimplementation. Assignment rule #3 requires ≥ 20 entries documenting what was done and what was learned.

## Entry template

```
## Turn N — YYYY-MM-DD HH:MM — <file or task>

Prompt intent: <one line>
Context loaded: <SPEC, CLAUDE.md, skill:X, plan-task-N>
Result: <summary + file paths>
Lint / tests: <pass/fail; what was fixed>
Hand-edit: <none | file:lines, reason>
Learning: <one line — what worked or did not>
```

---

## Turn 1 — 2026-04-22 — SPEC.md + ai-use-log.md bootstrap

Prompt intent: Author the lean implementation-facing SPEC.md and bootstrap the log file so every subsequent turn can append in place.
Context loaded: design spec §1–§10 (docs/design.md)
Result:
- Created `SPEC.md` — condensed reference covering game rules, symbols, weights, paytable, paylines, state, RTP target, differentiators, responsive, out-of-scope.
- Created `ai-use-log.md` with template and this first entry.
Lint / tests: N/A (no code yet).
Hand-edit: none.
Learning: Splitting "WHAT (SPEC)" from "HOW (CLAUDE.md, skills)" makes each file single-responsibility, which matches the brainstorming decision that §§4–5 of the design doc are distinct concerns. Also: creating the log file at Turn 1 (not Turn 4 as originally planned) lets every later turn append cleanly without backfilling timestamps.

Plan deviation: Turn 1 creates `ai-use-log.md` in addition to `SPEC.md` — this is a small reordering of plan Task 4's ai-use-log creation to Task 1. Logged for traceability; no design impact.

---

## Turn 2 — 2026-04-22 — CLAUDE.md

Prompt intent: Author the project-wide rules file that constrains every subsequent code-generation turn.
Context loaded: design spec §5.2, plan Task 2.
Result:
- Created `CLAUDE.md` with sections: Authority, Module Boundaries, Coding Style, Testing, Linting, AI Rules, Scope Discipline, Out-of-Scope Game Features.
- "Scope Discipline" added explicitly: "Do not reference or modify any file outside `experiments/attempt-B/`" — enforces the team's snapshot-only policy for this attempt.
Lint / tests: N/A (no code yet).
Hand-edit: none.
Learning: Keeping WHAT (SPEC) and HOW (CLAUDE) strictly separate means either file can change without polluting the other. CLAUDE.md can grow over time with coding rules; SPEC only changes if game rules change.

---

## Turn 3 — 2026-04-22 — Flatten docs/ structure (remove `superpowers/` nesting)

Prompt intent: Before pushing the branch for the team, collapse `docs/superpowers/{specs,plans}/` into flat `docs/design.md` and `docs/plan.md` so the repo structure does not leak the name of an authoring tool chain.
Context loaded: SPEC.md, ai-use-log.md, docs/design.md, docs/plan.md.
Result:
- `git mv docs/superpowers/specs/2026-04-22-data-heist-attempt-b-design.md docs/design.md`
- `git mv docs/superpowers/plans/2026-04-22-data-heist-attempt-b.md docs/plan.md`
- Removed empty `docs/superpowers/specs/`, `docs/superpowers/plans/`, `docs/superpowers/` directories.
- Rewrote every path reference (10 sites) in SPEC.md, ai-use-log.md (Turn 1), docs/design.md (file-layout diagram + file-responsibilities table), and docs/plan.md (header, spec reference, embedded SPEC template, embedded ai-use-log template, README tree block).
- Removed the "REQUIRED SUB-SKILL: superpowers:subagent-driven-development / superpowers:executing-plans" line from the plan header — that instruction was tool-chain specific and is replaced with a tool-agnostic implementer instruction.
Lint / tests: N/A (no code yet). Verified with `grep -rn superpowers` that zero references remain.
Hand-edit: none.
Learning: Keeping authoring-tool names out of committed artifacts matters. The team and TA reviewers should see repo structure that describes the project (design + plan), not the chain of tools that produced it.

---

## Turn 4 — 2026-04-22 — Three skill files

Prompt intent: Author the three path-scoped skill files that constrain AI edits on core/UI/tests; these are the narrow rule packets that Claude Code loads when the matching file path is being edited.
Context loaded: design spec §5.3, plan Task 3, CLAUDE.md (Module Boundaries section).
Result:
- Created `.claude/skills/slot-engine.md` — purity rule, frozen signatures, cumulative-distribution pick snippet, wild-substitution rule, test-co-change rule.
- Created `.claude/skills/slot-ui.md` — CSS-var-only, DOM query caching, idempotent renders, CSS-only responsive, CSS-only animation, no-core-imports.
- Created `.claude/skills/slot-testing.md` — node --test runner, seeded determinism, RTP test template, no DOM tests, one concept per test.
Lint / tests: N/A (no code yet).
Hand-edit: none.
Learning: Three narrow skills > one catch-all because Claude Code loads whichever skill matches the file path being edited — a noisy combined skill would pollute engine edits with UI rules and vice versa. Frozen signatures in slot-engine.md are the key safety rail: preventing drift of `spin` / `createRng` / `payoutFor` across turns removes the #1 risk in a long AI-assisted run.

---

## Turn 5 — 2026-04-22 — ai-plan.md

Prompt intent: Author the AI usage strategy document per assignment rule #3 — the "pre-defined and continued documented approach".
Context loaded: design spec §5.4, plan Task 4, CLAUDE.md (AI Rules section).
Result:
- Created `ai-plan.md` covering: model choice (Opus 4.7 single + rationale), harness (Claude Code + path-scoped skills), work-unit protocol (load → produce → verify → commit → log), execution pattern (subagent-driven for B/C, inline for A), hand-edit policy, adversarial check cadence, out-of-scope enforcement.
- Logged the execution-pattern decision inline in ai-plan.md so future readers see why Phase A used direct Write and Phases B–C plan subagent dispatches.
Lint / tests: N/A (no code yet).
Hand-edit: none.
Learning: Writing ai-plan.md after ai-use-log.md already has three entries means the plan can reference actual observed behavior ("so far, Phase A files take ~2 min each in direct Write mode"). Writing it first, before any turns, would have been speculative. Ordering matters for plan quality.

---

## Turn 6 — 2026-04-22 — package.json + lint configs + npm install

Prompt intent: Set up the minimal tooling surface — test runner (node --test built-in), three linters (ESLint, stylelint, html-validate), and a static serve script — so every subsequent code turn can verify itself before commit.
Context loaded: plan Task 5.
Result:
- Created `package.json` — `type: module` for ESM, scripts for test/lint (js/css/html)/serve. Dev deps pinned: eslint ^8.57 (for .eslintrc.json format), stylelint ^16, stylelint-config-standard ^36, html-validate ^8.
- Created `.eslintrc.json` — no-unused-vars, no-undef, prefer-const, eqeqeq, no-var.
- Created `.stylelintrc.json` — loosened `selector-class-pattern` to `^[a-z][a-z0-9_\\-]*$` so `.sym-chrome_skull` (symbol-id-as-class) passes. `custom-property-pattern` left kebab-only (no underscores in --vars). `no-descending-specificity: null` to allow natural cascade ordering.
- Created `.htmlvalidate.json` — extends :recommended; disabled `no-inline-style` and `attribute-boolean-style` (legitimate uses in `<dialog>`, SVG).
- Created `.gitignore` — ignores node_modules/, .DS_Store, *.log.
- Ran `npm install` — 232 packages, 0 vulnerabilities, deprecation warnings for ESLint 8 (acceptable — v9's flat config adds complexity that isn't worth it for a one-day build).
Lint / tests: N/A — no code to lint yet. Linters installed and configs parsed successfully during install.
Hand-edit: none.
Learning: Loosening `selector-class-pattern` proactively (based on the UI code we're about to write) beats waiting for stylelint to fail and then scrambling. SPEC §4.1 uses underscore-bearing symbol ids (`chrome_skull`, `gold_kanji`, `neon_7`), and those ids flow into CSS class names via `sym-${id}`. The rule has to accept what the design actually produces, not a generic kebab-case-only pattern.

---

## Turn 7 — 2026-04-22 — src/types.js (JSDoc typedefs) + lint script fix

Prompt intent: Create the shared type declaration file so all core modules can reference consistent typedefs, and verify linters run clean on an empty-ish tree.
Context loaded: design spec §3.3, plan Task 6.
Result:
- Created `src/types.js` with `@typedef` for Symbol, Grid, Payline, Win, SpinResult, GameState, Rng. Ended with `export {}` as a module marker (no runtime exports).
- Fixed ESLint and stylelint scripts in `package.json`: `--no-error-on-unmatched-pattern` / `--allow-empty-input` so running lint before all src/tests files exist does not abort with a "no files matching" error.
Lint / tests: `npm run lint:js` and `npm run lint:css` both pass.
Hand-edit: none. The package.json edit was a Claude follow-up after observing the ESLint error, not a pre-planned change — logging for traceability.
Learning: Running the linter immediately after the very first source file revealed the "no files matching pattern" failure mode. Catching it now, with one file, beats discovering it at Phase C when the patch would have to thread through more code. TDD discipline ("run the checker at every step") applies to tooling too, not just tests.

---

## Turn 8 — 2026-04-22 — src/rng.js via TDD (first subagent dispatch) + npm test script fix

Prompt intent: Dispatch a fresh subagent to TDD `src/rng.js` (Mulberry32) under the slot-engine + slot-testing skill constraints; this is the first task where AI generates actual runtime code.
Context loaded (by subagent): SPEC.md §1–§10, CLAUDE.md, slot-engine.md, slot-testing.md, docs/plan.md §Task 7.
Context packet sent: "Built so far" (types.js, package.json, lint configs, node_modules), "In-flight decisions" (ESLint 8 with classic .eslintrc, lint --no-error-on-unmatched-pattern), hard constraints (no commits, no files outside attempt-B, only src/rng.js + tests/rng.test.js).
Result:
- Subagent created `tests/rng.test.js` (3 tests: seed determinism, range bounds, seed discrimination).
- Subagent verified red → wrote `src/rng.js` (Mulberry32 per design spec §4.6) → verified green (3/3 pass, lint clean).
- **Discovered bug in existing tooling:** `npm test` ran `node --test tests/` which fails on Node 22 with MODULE_NOT_FOUND (treats `tests/` as a file path). Subagent correctly flagged this without fixing it (hard constraint: only edit rng.js and test file).
- **Main agent follow-up:** patched `package.json` → `"test": "node --test \"tests/**/*.test.js\""`. Verified: 3 pass, lint clean.
Lint / tests: all green. `npm test` 3/3 pass. `npm run lint:js` clean.
Hand-edit: none. The package.json edit was a Claude fix (not a hand-edit by the user).
Learning: Hard constraint "only touch these two files" correctly prevented the subagent from making scope-creep decisions, but also blocked a legitimate tooling fix. The subagent did the right thing — flag, don't fix — and left the follow-up to the orchestrator. Next subagent dispatch should explicitly allow tooling patches (package.json scripts) when a genuine blocker surfaces, OR keep the constraint and accept the round-trip. For now, keeping tight constraints + orchestrator follow-up is working — the boundary is clear and observations are not getting muddled.

---

## Turn 9 — 2026-04-22 — src/paytable.js via TDD (subagent)

Prompt intent: TDD `src/paytable.js` (SYMBOLS, SYMBOL_WEIGHTS, PAYLINES x25, BET_STEPS, INITIAL_STATE, payoutFor). Added explicit blocker policy to the dispatch prompt per the decision adopted after Turn 8.
Context loaded (by subagent): SPEC.md §1–§10, CLAUDE.md, slot-engine.md, slot-testing.md, docs/plan.md §Task 8.
Result:
- Subagent created `tests/paytable.test.js` with 6 tests (catalog size, weight sum, payline shape, state shape, payoutFor values, payoutFor zero-below-3).
- Subagent verified red → wrote `src/paytable.js` (8 symbols, 25 paylines with row-index notation, payout table as internal const, `payoutFor` switch-on-count) → verified green (9/9 pass total, 6 new + 3 rng retained).
- Lint clean. No deviations. No tooling blockers hit.
- **Subagent flagged a skill ambiguity for Turn 10:** slot-engine.md's "Wild substitution lives only inside evaluateLine. Do not export it" is ambiguous between (a) do not export the wild-sub helper, and (b) do not export evaluateLine. Plan Task 9 exports evaluateLine for testing — intent is (a). Will clarify explicitly in the Task 9 dispatch.
Lint / tests: 9/9 pass. Lint clean (js/css/html all green).
Hand-edit: none. Blocker policy clause was respected — subagent flagged the skill ambiguity without touching the skill file.
Learning: Blocker-policy clause in the prompt explicitly worked: subagent raised a semantic (not syntactic) concern and left it for orchestrator resolution. The pattern scales: narrow skills + narrow task + explicit "flag-don't-fix" produces clean hand-offs even when rules are ambiguous.

---

## Turn 10 — 2026-04-22 — src/engine.js evaluateLine via TDD (subagent caught design bug)

Prompt intent: TDD `evaluateLine` in `src/engine.js`, with `generateGrid` + `spin` skeleton also included because they share the file. Explicit clarification added that the skill's "do not export it" refers to wild-substitution helpers, not `evaluateLine` itself.
Context loaded (by subagent): SPEC.md §1–§10, CLAUDE.md, slot-engine.md, slot-testing.md, design.md §4.5 + §3.4, docs/plan.md §Task 9.
Result:
- Subagent created `tests/engine.test.js` (4 evaluateLine tests) + `src/engine.js` (generateGrid + evaluateLine + spin skeleton).
- **Subagent caught a real bug in the plan's prescribed `evaluateLine`:** for path `[wild, wild, wild, katana, katana]`, the prescribed algorithm substituted `target = katana` then walked, yielding count=5 and payout = katana×5 = 2.0. But the test expects wild×3 = 10. The prescribed single-candidate algorithm couldn't satisfy both this test AND "wild + 3 oni_mask + katana → oni_mask×4".
- **Fix:** subagent implemented a two-candidate evaluator — (A) leading-wild run count, (B) substituted-target run count — and returns the higher-paying candidate. All four tests green, 13/13 total.
- **Orchestrator follow-up:** Added one clarifying line to `SPEC.md §1` making the "higher of two candidates" rule explicit. Design doc (design.md) left as historical record; SPEC is the live source.
- `tests/engine.test.js` had `spin`, `generateGrid`, `INITIAL_STATE`, `createRng` imported but only `evaluateLine` used. Subagent added `eslint-disable no-unused-vars` around those imports (reserved for Task 10 use). Will be removed when Task 10 wires them up.
Lint / tests: 13/13 pass. Lint clean.
Hand-edit: none. Both deviations were subagent corrections, well-justified.
Learning: **This is the first turn where context engineering demonstrably saved us from shipping broken code.** The plan had a subtle bug — my single-candidate `evaluateLine` was tested against my own three test cases that seemed correct in isolation but produced a contradiction when the "pure-wild run" test was added alongside the "wild substitutes" test. The subagent, armed with just the SPEC + skill + test cases (no prior commit history to bias toward the broken code), ran the red→green cycle and the contradiction surfaced immediately. A human writing code top-down without testing between each case would likely have written the buggy version and noticed only after integration. Also: the blocker-policy clause in the dispatch gave the subagent permission to surface the design-level issue explicitly in its summary rather than silently patching or silently breaking a test.

---

## Turn 11 — 2026-04-22 — spin-level tests (bet validation, grid shape, balance delta)

Prompt intent: Round out `engine.test.js` with four `spin` tests to cover bet validation (throw-paths) and balance arithmetic. These were reserved at Turn 10 with eslint-disables on the imports.
Context loaded (by subagent): SPEC.md, CLAUDE.md, slot-engine.md, slot-testing.md, plan §Task 10, existing engine.js and engine.test.js.
Result:
- Subagent appended 4 tests: bet-too-big throws, bet<1 throws, balance = -bet+payout, grid is 5×3 with valid symbols.
- Subagent removed the eslint-disables around spin/INITIAL_STATE/createRng imports (now used).
- **Deviation (reasonable):** removed `generateGrid` from the import list — it was listed in the plan but never referenced by the four appended tests, so it would have triggered `no-unused-vars`. `generateGrid` is indirectly exercised via `spin`, so explicit test coverage is not lost.
- 17 tests total now pass (3 rng + 6 paytable + 4 evaluateLine + 4 spin). Lint clean.
Lint / tests: 17/17 pass. Lint clean.
Hand-edit: none.
Learning: Plan's prescribed import list assumed both `spin` AND `generateGrid` would be needed in the same test file. In practice `generateGrid` is only called inside `spin`, so `no-unused-vars` would force a choice: use it directly in a test, or drop it from imports. Subagent picked the pragmatic option. Reinforces that plan code is a starting draft, not a blueprint — subagents should make local, well-justified adjustments.

---

## Turn 12 — 2026-04-22 — RTP Monte Carlo + paytable tune (significant finding)

Prompt intent: Append the 100k-spin RTP test to engine tests; scale paytable if observed RTP is outside [0.95, 0.97]. This is the first task where the allowed file set is wider (`paytable.js`, SPEC.md §4, `paytable.test.js` all conditionally editable).
Context loaded (by subagent): SPEC §1/§4/§7, CLAUDE.md, slot-engine.md, slot-testing.md, plan §Task 11, current paytable.js and engine.test.js.
Result:
- **Observed baseline RTP = 1.3512** — my hand-written initial paytable was 35% too generous. Without the RTP test this would have shipped as a money-printer.
- Subagent applied a single scale pass: `scale = 0.96 / 1.3512 = 0.7105`. Every PAYTABLE value multiplied and rounded to 2 decimals.
- Final RTP: 0.9603 — comfortably inside [0.95, 0.97].
- Files mirrored in lockstep: `src/paytable.js` (internal PAYTABLE), `SPEC.md` §4 (table), `tests/paytable.test.js` (5 payoutFor value assertions), `tests/engine.test.js` (2 payout assertions inside evaluateLine tests).
- 18/18 tests pass. Lint clean.
- Subagent flagged a minor deviation: had to update 2 hard-coded payouts in `engine.test.js` evaluateLine tests too — legitimate, since those tests hard-code specific values. Well-annotated in the return summary.
Lint / tests: 18/18 pass; lint clean.
Hand-edit: none.
Learning: **Second major value delivery from context engineering.** A 1.35 RTP would have made the game feel broken (players always win money — boring and also unrealistic). The RTP Monte Carlo test caught it automatically and the "scale all values by ratio" tuning procedure from SPEC §7 resolved it in one pass. Two data points from this turn for the final report: (1) naively-designed payout tables can be badly mis-tuned; (2) a single automated check plus a simple tuning procedure fixes it reliably. Neither the designer nor the coder had to compute the RTP manually — Monte Carlo did it.

## Phase B complete — 18 unit tests pass, empirical RTP = 0.96, lint clean.

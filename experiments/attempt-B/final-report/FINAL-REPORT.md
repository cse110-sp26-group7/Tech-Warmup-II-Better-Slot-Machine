# DATA HEIST — Attempt B Final Report

**Team #7** · CSE 110 · Spring 2026 · Tech Warm-up II
**Date:** 2026-04-22

---

## 1. Hypothesis

Before writing a single line of code, Attempt B committed to a specific experimental hypothesis:

> Deliberate context engineering — a single human-authored SPEC, a project-wide CLAUDE.md, three path-scoped skill files, and a single-model Claude Opus run — produces code that is more consistent, more testable, and easier to extend than the same team prompting an AI coding assistant without that scaffolding.

Attempt B is the **context-engineered** parallel to Attempt A (the team's unstructured AI-assisted build of the same game). Both build "Data Heist", a 5×3 cyberpunk-themed video slot, from the same research snapshot (5 personas, 7 user stories, domain + visual research). The experimental variable is everything *around* the code — the harness, the constraints, the process — not the problem.

---

## 2. Process

### 2.1 Context Engineering Setup

Seven artifacts were authored *before* any runtime code:

| File | Purpose | Changes |
|---|---|---|
| `docs/design.md` | Full design rationale (the brainstorming output) | Written once, frozen |
| `SPEC.md` | Condensed WHAT — game rules, data shapes, target RTP | Updated once (RTP tune; pattern clarification) |
| `CLAUDE.md` | Global HOW — module boundaries, coding style, AI rules | Written once |
| `.claude/skills/slot-engine.md` | Path-scoped rules for core modules | Frozen signatures, purity rule |
| `.claude/skills/slot-ui.md` | Path-scoped rules for UI layer | CSS var only, idempotent renders, no timers |
| `.claude/skills/slot-testing.md` | Path-scoped rules for tests | node --test only, seeded RNG |
| `ai-plan.md` | Strategy document (model, harness, hand-edit policy) | Written once |
| `ai-use-log.md` | Per-turn record | 26 entries across the run |

Guard rails were codified explicitly:
- **WHAT vs HOW separation** — game rules live only in SPEC; coding rules live only in CLAUDE.md. Neither file may duplicate the other.
- **Module boundaries as hard rules** — pure core (`rng`, `engine`, `paytable`) cannot import DOM; `ui.js` cannot import compute core; `main.js` is the only orchestrator. Violating this rejects the commit.
- **Skill files scoped by file path** — when editing `src/engine.js`, the `slot-engine.md` skill loads automatically and provides the relevant constraints without polluting UI or test decisions.
- **No commits by the agent** — Claude writes, the user reviews and commits. Enforced by CLAUDE.md and the dispatch prompts.

### 2.2 Model and Harness

- **Model:** Claude Opus 4.7 (1M context). Single model for the entire run — no switching mid-stream.
- **Harness:** Claude Code CLI. Skill files under `.claude/skills/` auto-load based on the path being edited.
- **Execution pattern:**
  - **Phase A (harness files)** — inline Write by the main agent. Dispatching a subagent to copy prescribed static content added no value.
  - **Phase B (pure core, TDD)** and **Phase C (UI)** — subagent-driven. Each task dispatched to a fresh subagent with a context packet (SPEC + relevant skill + "built so far" + "in-flight decisions"). Subagents edited files, ran linters and tests, returned a ≤250-token summary. The main agent logged the turn and handed the commit command to the user.
  - **Orchestrator follow-ups** — when a subagent flagged a cross-task concern (skill ambiguity, prescribed-content defect, new visual bug), the main agent applied the correction itself, preserving subagent isolation.

**Rationale for single-model-Opus:** the hypothesis tests whether a large coherent context measurably improves generated code. That requires the model to actually absorb SPEC + CLAUDE.md + skills + research simultaneously. Opus 1M does so reliably. Switching models mid-stream would add a second variable and muddy the A/B comparison with Attempt A.

### 2.3 Turn-by-Turn Summary

26 turns spread across 5 phases:

| Phase | Turns | What |
|---|---|---|
| A — harness | 1–6 | SPEC, CLAUDE, 3 skills, ai-plan, ai-use-log, package.json/lint |
| B — pure core | 7–12 | types, rng (TDD), paytable (TDD), engine (TDD), RTP Monte Carlo + tune |
| C — UI | 13–24 | sprite, HTML, CSS (tokens, desktop, responsive), ui.js, main.js, SVG swap, 3 effects, sound |
| D — validation | 25+ | Desktop smoke + iterated fixes (in progress) |
| E — report | — | This document; slides outline; demo video (pending) |

Notable orchestrator interventions:
- Turn 8: Fixed `npm test` script (Node 22 compat) after subagent flagged.
- Turn 10: Clarified skill ambiguity ("don't export wild-sub helper" vs "don't export `evaluateLine`") after subagent flagged.
- Turn 15: Pre-converted plan CSS to modern `rgb(r g b / N%)` and short-hex before dispatch to avoid stylelint round-trip.
- Turn 17: Pre-converted plan media queries to modern `@media (width < 1024px)` range syntax.
- Turn 18: Relaxed `slot-ui.md` to permit paytable.js import after subagent correctly flagged the skill's original wording as too strict for the design.
- Turns 16/20/23: Browser-caught defects (RESET overlay, symbol path, symbol sizing) fixed after user-triggered smoke exposed them.

---

## 3. Data

### 3.1 Quantitative

| Metric | Value |
|---|---|
| AI use log entries | 26 turns |
| Commits on branch | ~29 |
| Source files (`src/`) | 7 modules, 634 LOC |
| Test files (`tests/`) | 3 files, 190 LOC |
| Unit tests | 18 passing / 0 failing |
| Monte Carlo RTP (100k spins, seed=42) | 0.9603 (target: 0.96 ± 0.01) |
| Linters green | ESLint, stylelint, html-validate — all clean |
| Hand-edits (required by rule #4) | 0 |
| Model switches | 0 (single Opus 4.7 run) |

### 3.2 Qualitative Highlights

Three moments where context engineering produced a concrete, documentable outcome:

**(a) Turn 10 — `evaluateLine` design bug caught by TDD.** The design spec (authored by Claude via brainstorming) prescribed a single-candidate wild substitution. With both "pure wild run pays from wild row" and "wild substitutes for target" test cases present, the single-candidate algorithm produced a contradiction: a path `[wild, wild, wild, katana, katana]` walked as target=katana for count=5 = payout 2.0, but the test expected wild×3 = payout 10. The subagent, running the red→green TDD loop with only SPEC + skill + tests as context, identified the contradiction and rewrote `evaluateLine` as a two-candidate evaluator (leading-wild-run vs substituted-target-run, return the higher-paying). SPEC was then clarified to codify the "higher of two candidates" rule. **Without test-first plus a fresh-context subagent, this bug likely ships.**

**(b) Turn 12 — 35% RTP overpay caught by Monte Carlo.** The first-pass paytable — hand-written by Claude during brainstorming — produced an empirical RTP of 1.3512 over 100,000 spins. That is an unplayable game (house always loses; slots at RTP > 1 are obviously broken). The tuning procedure specified in SPEC §7 ("scale every entry by `0.96 / observed_rtp`") resolved it in one pass: scale = 0.7105, final RTP = 0.9603. **The fix was mechanical; the win is that the detection was automated.** A human author inspecting the paytable by eye would plausibly call it "looks about right."

**(c) Turn 23 — comma-separated animation pattern.** When the row-wise drop animation was moved from `.reel-col` parent to individual `.cell` children, it collided with the existing `.cell.hot { animation: glow-pulse }`: the more-specific `.hot` rule replaced the drop entirely, so winning cells lost their entrance animation. The CSS-only resolution — composing two animations on one element via `animation: reel-drop ..., glow-pulse ...` with per-animation delays — kept the slot-ui skill's "no JS timer" rule intact without needing to hoist either animation to a different element. This was a 5-minute fix that would have been much worse if we had let ourselves reach for `setTimeout` as a workaround.

Two moments where the context engineering did *not* help:

**(a) Four Phase C defects that only the browser caught.** The `[hidden]` override (Turn 16), symbol sprite path (Turn 20), symbol sizing (Turn 23), column-vs-row drop direction (Turn 23) — none surfaced in lint or unit tests. They surfaced when the user loaded the page. Lesson: **lint is necessary but not sufficient for visual work.** The plan-writing step should close with a live browser smoke before being frozen.

**(b) SPEC drift vs live skill content.** Twice (Turn 15 CSS syntax, Turn 17 media query syntax), the plan's prescribed content was written against my mental model of a linter's defaults rather than the actual installed `stylelint-config-standard`. Each cost a subagent round-trip. The pattern: plans are rarely "first-run-green" on the linter unless their prescribed snippets were themselves linted during plan-write.

---

## 4. Discussion

### 4.1 What Worked

- **Frozen signatures in `slot-engine.md`.** `createRng(seed) → { next(max), seed }`, `spin(state, bet, rng) → SpinResult`, `payoutFor(symbol, count) → number`. Naming these as non-negotiable at plan time prevented drift across 10+ edits. Zero API thrash across the run.
- **Narrow, path-scoped skills.** One skill per editing context. `slot-engine.md` only loads during core edits; `slot-ui.md` only loads during UI edits. Subagent attention stayed focused on the constraints that mattered for the file being written.
- **"Flag-don't-fix" blocker policy.** After Turn 8's tooling-patch round-trip, every subsequent dispatch told the subagent: "if a non-task file blocks you, list it in the summary and stop." Every subagent followed this cleanly. Non-task changes were consolidated into orchestrator follow-ups, which kept per-turn commits focused and the log entries legible.
- **Two-candidate animations (Turn 23) and AudioContext scheduling (Turn 24).** The skill rules ("no JS timer") pushed toward CSS-native and audio-native solutions that were actually better than the timer-based first draft.
- **Separate ai-use-log from ai-plan.** Plan documented strategy once; log recorded each turn's specific outcome. Debugging "why did we choose that" became `git blame` on the log, not archaeology on a merged monolith.

### 4.2 What Did Not Work

- **Static plan content for the UI phase.** The plan was authored in a single pass and its CSS/HTML/JS snippets accumulated small defects (linter-incompatible syntax, wrong sprite path, visibility vs `hidden` conflict). The fix was iterative: first subagents, then browser smoke. For phases where live verification is cheap (HTML/CSS especially), plan-write should conclude with a browser smoke.
- **"UI.js imports only from types.js" was too strict.** The SPEC/design forbade UI from importing any core module, but the paytable display legitimately needs `SYMBOLS`, `PAYLINES`, `payoutFor`. Subagent surfaced the contradiction at Turn 18; skill was relaxed to permit paytable.js (engine.js + rng.js remain forbidden). Lesson: write the skill after writing at least one file it constrains, not before.

### 4.3 What We Would Change

1. **Close each plan task with a browser smoke, not just a lint check.** Especially for CSS/HTML/JS snippets embedded in the plan. Lint catches ~30% of the visible defects; the browser catches the rest in minutes.
2. **Draft skill files after a first-file reality-check.** Each skill had at least one over-strict rule that surfaced only during actual editing. A 15-minute dry run against a stub file would have caught them.
3. **Add an adversarial-review cadence.** Plan said "every 5 turns, ask Claude to review recent commits against SPEC + CLAUDE.md." We did not actually run this during the one-day build. Worth piloting next time; unverified whether the cost is worth it.

---

## 5. Conclusion

Context engineering earned its keep for Attempt B. The most honest claim we can defend:

> **For AI-assisted code generation, explicit upfront constraints — SPEC, project CLAUDE.md, path-scoped skills, single model — reliably catch and prevent API drift, design contradictions, and math errors that unguided prompting would let through. They do not substitute for end-to-end verification; visual and integration defects still require running the artifact.**

The 35% RTP overpay (Turn 12) and the evaluateLine bug (Turn 10) would have reached final submission under unguided prompting. Both were caught automatically — the first by a 100,000-spin Monte Carlo test the SPEC mandated, the second by a TDD cycle a fresh subagent ran on the wild-substitution rule. These are the kinds of defects AI-assisted codebases routinely ship, and the experiment suggests that the cost of writing SPEC + CLAUDE.md + 3 skill files (~90 minutes up front) is paid back within the first major subsystem.

The cost the experiment does *not* hide: four browser-catchable defects survived the lint-and-test gate. Context engineering kept the code consistent; it did not compensate for an unverified plan. In a longer-running project that imbalance would be easy to close — add a live-browser smoke to every major task — but it belongs in the next iteration of the process, not as a claim for this one.

Attempt B will not prove AI-assisted engineering is "good" or "bad". It does support a narrower, defensible claim: **the quality of AI-generated code is dominated by the quality of the context engineering around it**, and the cost of that engineering is a small fraction of the project's total work.

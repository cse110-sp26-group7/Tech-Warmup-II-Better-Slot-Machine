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

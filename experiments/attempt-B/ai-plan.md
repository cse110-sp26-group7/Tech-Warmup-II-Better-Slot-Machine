# AI Usage Plan — Attempt B

## Model

Claude Opus 4.7 (1M context). Single model for the entire run.

**Rationale:** Attempt B's hypothesis tests whether a large, coherent context
(SPEC + CLAUDE.md + 3 skills + research) measurably improves generated code.
This requires the model to actually read and weigh all of that context — Opus
1M does so most reliably. Switching models mid-run would introduce a second
variable and muddy the A/B comparison with Attempt A.

## Harness

Claude Code (`claude.com/code`). Skill files in `.claude/skills/` auto-scope
by path when editing under `src/` or `tests/`.

## Work Unit

One file per turn where possible. Each turn:

1. Claude loads `SPEC.md` + `CLAUDE.md` + the path-matching skill.
2. Claude produces the file end-to-end.
3. Theo runs `npm test` + `npm run lint` and reports results.
4. If broken: Claude fixes via prompt. If two prompt fixes fail, Theo hand-edits.
5. Theo commits. An entry is appended to `ai-use-log.md`.

## Execution Pattern

**Subagent-driven** for implementation phases (Phase B: core, Phase C: UI).
Each task dispatches a fresh subagent with a context packet (SPEC, relevant
skill, "built so far" summary, any in-flight decisions not yet in SPEC).
The subagent edits files and returns a short summary; the main agent logs
the turn and hands the commit command to Theo. This keeps the main
conversation focused on orchestration and logging while subagents handle
code generation in clean, isolated contexts.

**Inline (direct Write)** for Phase A: static harness files have no code
logic and the dispatch overhead is not worth the isolation benefit.

## Hand-Edit Policy

Allowed only after two failed prompt-based fix attempts. Each hand-edit gets
a log entry with file path, line range, and the reason prompting failed.

## Adversarial Check

Every 5 turns, prompt Claude: "Review the last 5 commits against `SPEC.md`
and `CLAUDE.md`. Report contradictions." Log the response as its own turn.

## Out-of-Scope Enforcement

If a prompt asks for a feature in §10 of `SPEC.md` (Scatter, Free Spins,
multipliers, cascades, auto-spin, etc.), the prompt is rejected and a log
entry records the attempted scope creep. Keeping the scope list enforceable
and visible is part of what makes the A/B comparison meaningful.

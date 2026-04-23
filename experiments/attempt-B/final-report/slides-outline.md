# DATA HEIST — Attempt B Presentation Outline

Target: 4–7 slides, PDF for `final-report/slides.pdf`. Video ≤ 4 min.

---

## Slide 1 — Title

- **DATA HEIST — AI Under Context Engineering**
- Attempt B · Team #7 · CSE 110 · Spring 2026
- Team leaders: Ethan Carter, Gabrielle Wang
- (Optional: DATA HEIST screenshot as backdrop)

---

## Slide 2 — Hypothesis

> Deliberate context engineering — SPEC + CLAUDE.md + path-scoped skill files + single-model Opus run — produces measurably better AI-generated code than unstructured prompting.

- Attempt A: same game, no context engineering.
- Attempt B (this slide deck): same game, deliberate scaffolding.
- Variable under test: **the harness**, not the problem.

---

## Slide 3 — Setup

Show an architecture diagram (three rows):

```
         paytable.js  ←  engine.js  ←  main.js  →  ui.js
                             ↑                       ↑
                          rng.js                   DOM
                                    ↓
                                 sound.js
```

- Vanilla HTML/CSS/ES modules. No build tool.
- 7 modules in `src/`, 3 test files in `tests/`. Total: 634 + 190 LOC.
- Claude Opus 4.7 (1M) · Claude Code harness · 0 hand-edits.
- 26 AI turns logged in `ai-use-log.md`.

---

## Slide 4 — Data

Four headline numbers + one chart:

| Metric | Value |
|---|---|
| Unit tests passing | 18 / 18 |
| Empirical RTP (100k spins) | 0.9603 |
| Commits | ~29 |
| Hand-edits | 0 |
| Lint state | 4 linters, all green |

(Optional bar chart: "Defects caught at each gate")
- Unit tests: 2 (evaluateLine logic, RTP math)
- Linters: 0 important defects
- Browser smoke: 4 (overlay, sprite path, sprite sizing, drop direction)

---

## Slide 5 — What Worked

- Frozen API signatures → zero function-name drift across 10+ edits.
- Path-scoped skills → subagent attention stayed local.
- "Flag-don't-fix" blocker policy → subagents never silently patched outside their scope.
- TDD + Monte Carlo → two real design bugs auto-caught (wild-run, RTP).

---

## Slide 6 — What Didn't / Would Change

- Lint caught none of the 4 visual defects.
- Plan snippets drifted from linter reality in 2 places.
- Would add: **live browser smoke to every plan task, not just at phase end.**

---

## Slide 7 — Conclusion (optional)

> Context engineering catches API, math, and contradiction bugs reliably. It does not substitute for running the artifact.

The 35% RTP overpay and the evaluateLine contradiction would ship under unguided prompting. Both were caught automatically. The 4 visual defects survived lint; user smoke caught them in minutes.

**Cost: ~90 minutes of harness authoring. Payback: within the first major subsystem.**

---

## Notes for PDF export

- Tools: Marp, Keynote, or Google Slides → Export PDF.
- Aspect ratio 16:9, file name `slides.pdf` placed in `final-report/`.
- Font: Orbitron for titles (match the game), system default for body. Or Chakra Petch for continuity with tokens-cyberpunk.
- Backgrounds: dark (`#0d0b1a` from SPEC tokens); title accent acid green `#c8ff00`.

## Notes for the ≤ 4-min video

Suggested arc (roughly 45 seconds per section):

1. **Problem & hypothesis** (≈ 0:00–0:40)
   - Recap: team is doing an A/B experiment on context engineering.
2. **Setup / harness** (0:40–1:20)
   - Show SPEC.md, CLAUDE.md, a skill file briefly on screen.
   - One-line quote: "WHAT vs HOW separation, path-scoped skills, single model."
3. **Demo the game** (1:20–2:30)
   - Load page, show grid + paytable + breakdown.
   - Spin a few times. Hit a small win, show highlight + breakdown.
   - Use `Shift+B` to preview BIG WIN overlay + sound.
   - Use `Shift+M` to preview MEGA WIN.
   - Brief resize to mobile viewport to show responsive layout.
4. **Key findings** (2:30–3:30)
   - Turn 10 evaluateLine bug.
   - Turn 12 RTP 1.35 → 0.96 tune.
   - 4 browser-caught visual defects.
5. **Close** (3:30–4:00)
   - Claim + one-line takeaway.
   - Credits.

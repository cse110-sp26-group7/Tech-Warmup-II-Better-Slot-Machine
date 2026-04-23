# AI Plan
**Strategy Owner:** Kareem Nabulsi

---

## Model

**Primary:** Claude Sonnet via Claude Code.
**Escalate to:** Claude Opus for hard tasks only.
**Do not use:** Claude Haiku.

### Why Sonnet (default)

Sonnet is the right default for this project because our work is a sequence of small, well-scoped prompts — single modules, single functions, a bounded rebalance of the paytable — not long-horizon autonomous sessions. For that shape of work, Sonnet hits the best cost/speed-to-quality point:

- **Fast iteration.** Our loop is `prompt → review → lint → test → commit`. We re-run it dozens of times per evening. Sonnet's faster turns keep that loop tight; Opus latency adds up across 40+ entries.
- **Capability matches task size.** Each phase (RNG, reels, paylines, payout, UI, audio, free spins) is a few hundred lines of vanilla JS with clear inputs and outputs. Sonnet handles that cleanly — we verified by running ESLint and Jest after every generation.
- **Cost discipline.** With 12 teammates potentially iterating, defaulting to Opus for every prompt is wasteful when Sonnet gets it right the first time.
- **Good at following a style guide.** We committed `STYLE-GUIDE.md` early and Sonnet produced consistent single-quote, JSDoc-annotated ES-module code across modules without per-prompt reminders.

### When to escalate to Opus

Switch to Opus (and log the switch in `ai-use-log.md`) when:

- Sonnet has failed the same task twice in a row after re-prompting with corrections.
- The task spans multiple files with cross-module invariants (e.g., rebalancing the paytable touches `payout.js`, `main.js`, and the entire `payout.test.js` suite at once — a case where a single coherent edit beats two cheaper but inconsistent ones).
- The task requires nontrivial math or probability reasoning (RTP/volatility tuning, weighted-symbol reel-strip design) where a wrong answer is hard to catch in unit tests.
- We are debugging an intermittent failure and need stronger hypothesis generation than Sonnet is giving us.

### Why not Haiku

Haiku is optimized for short, simple, high-throughput tasks (classification, extraction, routing). Our prompts routinely ask for a full module with JSDoc, error handling, and style-guide adherence, plus corresponding test updates — that is past Haiku's sweet spot and we would spend the savings on re-prompts. We deliberately keep it off the table so teammates don't silently downgrade mid-session.

### Rule

**Start every session on Sonnet.** If you escalate or change the model for a specific prompt, log it as its own entry in `ai-use-log.md` with the reason and the outcome, so we build evidence for future tuning.

---

## Approach
We prompt Claude Code in small steps — one feature at a time. We review the output, lint it, and commit before moving on.

```
Prompt → Review → Lint → Test → Commit → Repeat
```

---

## Prompting Strategy
- Keep prompts specific and scoped (e.g., "write a spinReels() function that returns a 3x3 symbol grid")
- If output is wrong, re-prompt with corrections before touching the code manually
- Hand-edits are a last resort and will be logged

---

## Code Quality Checklist (per feature)
- [ ] ESLint passes
- [ ] JSDoc comments on all functions
- [ ] Unit test written
- [ ] No duplicate code

---

## Rules We're Following
- No agent commits — each member commits under their own GitHub account
- Hand-edits only after a failed re-prompt attempt (logged in ai-use-log.md)
- All work lives in the repo
- Everyone works on individual branches

---

## Known Risks

| Risk | Fix |
|------|-----|
| Inconsistent code style | Run linter after every generation |
| Hallucinated APIs | Test immediately after generation |
| Context drift in long sessions | Start fresh session per module |

---

*See [ai-use-log.md](./ai-use-log.md) for real-time notes.*

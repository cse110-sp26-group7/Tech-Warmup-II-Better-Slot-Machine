# Attempt B — Context-Engineered

Parallel reimplementation of the Data Heist slot machine, built from scratch with deliberate context engineering (project memory, skill files, spec-first workflow) for A/B comparison against Attempt A (`/src`).

## Layout

```
attempt-B/
├── .claude/skills/                 Skill files that constrain AI code generation
├── research/                       Snapshotted inputs curated from the team's shared research
│   ├── overview.md                   domain + user research synthesis
│   ├── personas/                     5 personas
│   ├── user-stories/                 7 user stories
│   ├── domain_research.md            mechanics, RTP, volatility, paytables
│   ├── visuals_and_assets/cyberpunk/ wireframes, mockups, symbol sheets, logo, tokens
│   └── design/game_design.md         feature + scope notes
├── src/                            Reimplementation (empty; filled in follow-up commits)
└── tests/                          Reimplementation tests (empty; filled in follow-up commits)
```

`research/` is a **snapshot** — once copied in, Attempt B evolves independently of the originals under `/plan` and `/strategyDocs`. CLAUDE.md, SPEC.md, skill files, and the reimplementation itself land in follow-up commits.

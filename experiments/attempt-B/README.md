# Attempt B — Context-Engineered

Parallel reimplementation of the Data Heist slot machine core, built from scratch with deliberate context engineering (project memory, skill files, spec-first workflow) for A/B comparison against Attempt A (`/src`).

## Layout

```
attempt-B/
├── .claude/skills/   Skill files that constrain AI code generation
├── research/         Snapshotted inputs copied from the team's shared research
│   ├── overview.md              domain + user research synthesis
│   ├── personas/                5 personas
│   ├── user-stories/            7 user stories
│   ├── raw-research/
│   │   ├── domain_research.md          mechanics, RTP, volatility, paytables
│   │   ├── considerations.md           design considerations
│   │   ├── images_in_domain_research/  reference screenshots
│   │   └── visuals_and_assets/         wireframes, mockups, symbol sheets
│   └── design/game_design.md           feature + scope notes
├── src/              Reimplementation (empty; filled in follow-up commits)
└── tests/            Reimplementation tests (empty; filled in follow-up commits)
```

`research/` is a **snapshot** — once copied, Attempt B evolves independently. CLAUDE.md, SPEC.md, skill files, and the reimplementation itself land in follow-up commits.

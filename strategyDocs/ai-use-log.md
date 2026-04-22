# AI Use Log

## Entry 1 — April 21, 2026 11:30PM

**Phase:** 0A
**Prompt used:**

> Create a new web-based slot machine project called `data-heist`. Set up the following structure:
>
> ```
> /src
>   index.html
>   /css
>     styles.css
>   /js
>     main.js
>     rng.js
>     reels.js
>     paylines.js
>     payout.js
>     ui.js
>     audio.js
>     state.js
> /tests
>   rng.test.js
>   payout.test.js
>   paylines.test.js
> /assets
>   /symbols
>   /audio
>   /fonts
> package.json
> .eslintrc.json
> .gitignore
> README.md
> ```
>
> Initialize `package.json` with scripts for lint, test, and start. Add ESLint with rules: single quotes, semicolons required, no unused variables, no `console.log` in production. Add Jest for unit testing. Do not write any game logic yet — scaffold only.
> Note: the repo already has a .gitignore and README.md from
> GitHub initialization. Update them if needed rather than
> overwriting them.
>
> **Outcome:**

Claude generated full project scaffold with all
folders (assets, src, test), package.json, eslintrc, updated gitignore

**Linter result:** can't run npm run lint:all because it's missing from package.json

**Tests result:** All 3 test failed (tests will be written in prompt 1D)

**Issues encountered:** missing lint:all script, all tests failed

**Hand-edit required?** No

**Files changed:** assets, package.json, .eslintrc.json, .gitignore, jest.config.js,
src/index.html,tests (paylines.test.js, payout.test.js, rng.test.js)

**Commit message:** feat: initial project scaffold

## Entry 2 — April 21, 2026 12:05PM

**Phase:** 0A
**Prompt used:**
Add htmlhint to the project for HTML validation and configure it in .htmlhintrc. Add a lint:html script to package.json. Also add a lint:all script that runs both ESLint and htmlhint together. Make sure the base index.html passes both linters cleanly before we write any game code.

> **Outcome:**

Claude added lint:all script to package.json

**Linter result:** passed

**Tests result:** N/A

**Issues encountered:** missing lint:all script

**Hand-edit required?** No

**Files changed:** package.json

**Commit message:** feat: initial project scaffold

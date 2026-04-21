# DATA HEIST — Game Design Document

**Team #7 · Tech Warmup II · Better Slot Machine**
**Working Title:** *DATA HEIST*
**Theme:** Cyberpunk (neon, dystopian, data-heist narrative)
**Audience:** Cyberpunk/sci-fi gaming enthusiasts as the acquisition audience, with mechanics engineered to also feel familiar and satisfying to mainstream slot players.

This document is the single source of truth for what we are building. It consolidates all prior domain, user, and visual research into a concrete feature spec. Every engineer, designer, and content creator on the team should be able to pick this up and understand exactly what the game does and why.

---

## Table of Contents

- [1. Vision and Audience](#1-vision-and-audience)
- [2. Core Game Loop](#2-core-game-loop)
- [3. Reels, Paylines, and Grid Layout](#3-reels-paylines-and-grid-layout)
- [4. Symbol Set and Paytable](#4-symbol-set-and-paytable)
- [5. Special Symbols (Wild, Scatter, Bonus)](#5-special-symbols-wild-scatter-bonus)
- [6. Bonus Features](#6-bonus-features)
- [7. Jackpots](#7-jackpots)
- [8. Technical Specifications](#8-technical-specifications)
- [9. Betting, Credits, and Monetization](#9-betting-credits-and-monetization)
- [10. User Interface and Flow](#10-user-interface-and-flow)
- [11. Win Feedback: Animation and Audio](#11-win-feedback-animation-and-audio)
- [12. Auto-Spin and Cooldown Controls](#12-auto-spin-and-cooldown-controls)
- [13. Privacy Mode (Launch Disguise Decision)](#13-privacy-mode-launch-disguise-decision)
- [14. Progression, Retention, and Daily Systems](#14-progression-retention-and-daily-systems)
- [15. Cyberpunk Theme: Why It Works](#15-cyberpunk-theme-why-it-works)
- [16. Bridging to Mainstream Slot Players](#16-bridging-to-mainstream-slot-players)
- [17. Responsible Play and Regulatory Posture](#17-responsible-play-and-regulatory-posture)
- [18. Decisions Log and Remaining Open Items](#18-decisions-log-and-remaining-open-items)

---

## 1. Vision and Audience

DATA HEIST is a 5×3 video slot styled as a near-future **Japanese-cyberpunk** data heist — neon on dark, with visual DNA drawn from *Ghost in the Shell*, *Akira*, *Cyberpunk: Edgerunners*, and the Arasaka iconography of *Cyberpunk 2077*. The player assumes the role of a rogue street runner breaking into megacorp data vaults. Every spin is framed as a "run" against the system, every payout is "data exfiltrated," and progression is framed as leveling up a cyberdeck. The symbol set reinforces this identity: the Oni mask (donned before the run), the Katana (the ronin's blade), the Gold Kanji 金 (the megacorp vault seal), the Neural Chip (data to be breached), and the Chrome Skull (the corporate defense system).

We have two audience segments:

**Primary (acquisition):** Players aged 18–40 who play or follow games like *Cyberpunk 2077*, *Deus Ex*, *Shadowrun*, *Ghost in the Shell*, and *Cyberpunk: Edgerunners*. This segment is digitally native, comfortable with in-app purchases, values aesthetic coherence, and overlaps significantly with the "whale" demographic identified in mobile gaming. They are not the core slot-machine audience today, but they are underserved in the slot genre because most slot games target the mainstream audience with generic themes (fruits, Egypt, pirates). A strong cyberpunk identity differentiates DATA HEIST in a crowded category.

**Secondary (retention):** Mainstream slot players — per Kareem's research, predominantly women aged 55–64, playing for a steady dopamine loop of small frequent wins rather than jackpot hunting (>60% of players). This segment cares less about theme and more about familiar mechanics, clear paytables, readable UI, satisfying wins, and trustworthy payout behavior. The cyberpunk skin must not get in the way of them understanding the game.

The core design thesis is that these two audiences want the same *mechanics* and disagree only on the *skin*. By implementing industry-standard slot mechanics under a distinctive cyberpunk aesthetic, we can serve both.

---

## 2. Core Game Loop

The game loop follows Theo's canonical execution sequence:

1. **Bet Input** — Player sets line bet (multiplier on the base per-line cost). Total stake = line bet × paylines.
2. **Spin Trigger** — Player taps spin button, pulls virtual lever, or triggers an auto-spin iteration.
3. **RNG Call** — Pseudo-random number generator produces a seed for this spin. Each spin is fully independent; past outcomes have no effect on future outcomes.
4. **Symbol Matrix Generation** — RNG seed resolves to a 5×3 grid of symbols, drawn from each reel's weighted symbol strip.
5. **Payline Evaluation** — All 25 fixed paylines are checked left-to-right for matching-symbol sequences starting from reel 1. Wilds substitute. Scatters pay anywhere.
6. **Payout** — Winning lines are totaled, multipliers applied, and credits added to the balance. If a bonus trigger condition was met, the bonus state is queued.
7. **State Update** — Balance, total-bet, last-win, and session stats update. Win animations play. If a bonus was triggered, the bonus state begins after base-game win resolution.

The spin resolution must feel instantaneous at the input level (<100 ms) even if animations take 2–3 seconds to play out. The outcome is determined at step 3; animation is presentation.

---

## 3. Reels, Paylines, and Grid Layout

Per Theo's research recommendation, we're using the statistical baseline for modern video slots:

| Parameter | Value | Rationale |
|---|---|---|
| Reels | 5 | Industry standard; supports rich paytables |
| Rows | 3 | Creates the 5×3 grid |
| Paylines | 25 (fixed) | Standard; simpler math than "ways to win" |
| Evaluation direction | Left to right | Starting from reel 1 |
| Minimum match length | 3 symbols | Matches must start on reel 1 |

Paylines are fixed (not player-selectable). The player adjusts the bet per line, not the number of lines. This matches the modern industry standard, simplifies the UI, and prevents the common "I won but bet only one line" frustration.

The 25 paylines cover horizontal straight lines, zigzag patterns, and V/inverse-V shapes across the 5×3 grid. Standard line maps (Net Entertainment Starburst, IGT Cleopatra, etc.) can be used as reference.

---

## 4. Symbol Set and Paytable

Symbols are drawn from Theo's DATA HEIST asset sheet, tiered from low pays to high pays. Low-pay symbols are intentionally familiar to mainstream slot players (fruits and classic bar/seven motifs) to create a visual bridge into the game. High-pay symbols are pure cyberpunk iconography to give the theme identity.

### 4.1 Symbol Tiers

The symbol set leans into a **Japanese cyberpunk** aesthetic — Gold Kanji, Oni mask, Katana, Neural chip — while keeping a full tier of classic slot symbols (cherry, bar, bell, lime, watermelon, horseshoe, clover, diamond, seven) so mainstream slot players immediately recognize the game. Low-pay symbols are intentionally familiar to create a visual bridge into the game; high-pay symbols carry the theme identity.

| Tier | Symbol | Cyberpunk framing |
|---|---|---|
| Low-pay | Cherry | "Red data node" |
| Low-pay | Lime | "Green data node" |
| Low-pay | Watermelon | "Organic data pocket" |
| Low-pay | BAR | "Data bar / disk" |
| Low-pay | Bell | "Alarm bell / intrusion alert" |
| Mid-pay | Horseshoe | "Legacy luck subroutine" |
| Mid-pay | Clover | "Luck patch" |
| Mid-pay | Diamond | "Encrypted gem" |
| High-pay | Neon 7 | "Lucky protocol 777" |
| High-pay | Katana | "Ronin's blade — slices through ICE" |
| High-pay | Cyber iris | "Ocular implant / surveillance target" |
| Top-pay | Chrome Skull | "Black-ICE defense node" |
| Top-pay | Gold Kanji (金) | "Megacorp vault seal — top jackpot symbol" |
| Special | Wild (W) | "Glitch" — substitutes for any symbol except Scatter and Bonus |
| Special | Neural chip | "Scatter — breached data node" (see §5.2) |
| Special | Oni mask | "Bonus — runner's mask, begin the heist" (see §5.3) |

Total: 13 payline-paying symbols + Wild + Scatter + Bonus = 16 symbol slots. This is on the higher end for a 5×3 slot (typical is 10–12 paying symbols). Each symbol will therefore appear less frequently on the reel strips, and the paytable values in §4.2 are sized accordingly. **The math team will need to tune reel weights to hit the 96% RTP target** — see §18.2.

### 4.2 Paytable (payout as multiple of line bet)

These values are our starting proposal. Because the symbol count is higher than the industry baseline (see §4.1), reel strip weights — not paytable values — will be tuned by the math team to hit the target RTP (§8). Values are shown for 3, 4, and 5 matching symbols on a payline, left-to-right starting from reel 1.

| Symbol | 3-of-a-kind | 4-of-a-kind | 5-of-a-kind |
|---|---|---|---|
| Cherry | 5× | 20× | 80× |
| Lime | 5× | 20× | 80× |
| Watermelon | 5× | 20× | 80× |
| BAR | 10× | 40× | 150× |
| Bell | 10× | 40× | 150× |
| Horseshoe | 15× | 60× | 200× |
| Clover | 15× | 60× | 200× |
| Diamond | 25× | 100× | 350× |
| Neon 7 | 50× | 200× | 750× |
| Katana | 75× | 250× | 900× |
| Cyber iris | 100× | 300× | 1,000× |
| Chrome Skull | 150× | 500× | 1,500× |
| Gold Kanji | 250× | 1,000× | **5,000×** (fixed jackpot) |
| Wild (W) | 100× | 500× | 2,000× |
| Neural chip (Scatter) | 2× *total bet* | 10× *total bet* | 50× *total bet* + triggers Free Spins |
| Oni mask (Bonus) | — | — | 3 on reels 1/3/5 triggers Heist Mini-Game (no direct pay) |

**Reading example:** With a line bet of 10 credits, five Gold Kanji on a single payline pays 10 × 5,000 = 50,000 credits. Five Neural Chip scatters anywhere on the grid at 25-credit total bet pay 25 × 50 = 1,250 credits *plus* launch free spins.

Per Jack's research, symbol weighting on the reel strips — not the paytable values — is the primary tool for controlling RTP and hit frequency. High-value symbols (Gold Kanji, Chrome Skull, Cyber Iris) appear rarely; low-value symbols (Cherry, Lime, Watermelon, BAR, Bell) appear often.

---

## 5. Special Symbols (Wild, Scatter, Bonus)

### 5.1 Wild — "Glitch" (W)

- Substitutes for every symbol except Scatter and Bonus.
- Pays on its own as shown in the paytable.
- Appears on reels 2, 3, and 4 only (industry standard; keeps wilds from completing lines from reel 1 alone).
- In the free-spin bonus, wilds become **Expanding Wilds** (fill the full reel column) per Theo's research on modular wild mechanics.

### 5.2 Scatter — "Neural Chip"

- Pays anywhere on the grid (no payline needed).
- 3, 4, or 5 scatters anywhere = 2×, 10×, or 50× total bet (respectively).
- 3+ scatters also triggers the **Free Spins bonus** (section 6.1).
- **Theme note:** Visually a green-glow circuit die with radiating lines, reading as data transmission — the player has "breached" the data node, triggering a system-wide access window.

### 5.3 Bonus — "Oni Mask"

- Appears on reels 1, 3, and 5 only.
- 3 Oni Mask symbols on the same spin (one each on reels 1, 3, and 5) triggers the **Heist Mini-Game** (section 6.3).
- Does not pay directly.
- **Theme note:** In Japanese cyberpunk iconography, the Oni mask is what a street runner puts on before entering a corporate facility — anonymous, intimidating, crossing the threshold. The moment all three appear on screen is the moment the run begins.

---

## 6. Bonus Features

Bonus features are the primary driver of both engagement and session length. Per Michael's interview research, mini-games and multipliers were among the strongest differentiators between slot games players loved versus abandoned. Per Johnny's research, "gameplay modifiers that change the flow" prevent the core spin action from becoming tedious.

### 6.1 Free Spins — "System Breach"

- **Trigger:** 3+ Scatters anywhere.
- **Awarded:** 3 scatters → 10 free spins; 4 scatters → 15 free spins; 5 scatters → 25 free spins.
- **Behavior:** All wins during free spins are multiplied 2×. Wilds become expanding wilds. Free spins cannot be re-triggered infinitely — max additional re-trigger during a free-spin round is +10 spins.
- **Narrative wrap:** Screen dims to a "system breach" alert, a scrolling terminal overlay announces "ACCESS GRANTED," and the reel background shifts to a "data vault" variant of the base art.

### 6.2 Cascading Reels — "Chain Exploit" *(MVP)*

**Decision locked (see §18.1):** this feature ships in MVP.

- **Trigger:** Any winning combination during the base game or free spins.
- **Behavior:** Winning symbols "disintegrate" (pixel-dissolve animation) and new symbols fall from above. The new symbols are evaluated for wins. Chains continue until no new wins occur.
- **Progressive multiplier within a chain:** 1st win = 1×, 2nd = 2×, 3rd = 3×, 4th+ = 5×. Resets at end of chain.
- **Rationale:** Per Michael's Gemza observation, cascading wins make a single spin feel like multiple events and sustain player attention for longer. This is one of the strongest engagement levers in modern slots.

### 6.3 Heist Mini-Game — "The Data Vault"

- **Trigger:** 3 Bonus symbols on reels 1, 3, and 5.
- **Format:** A pick-em mini-game. The player is shown 12 data terminals on screen. They pick terminals one at a time; each reveals a credit prize or a multiplier. Hitting three "ICE" (defensive counter-hack) terminals ends the mini-game.
- **Rewards:** Prizes range from 10× total bet to 500× total bet, plus the possibility of drawing a "Jackpot" terminal (triggers jackpot roll — see section 7).
- **Rationale:** A narrative break from spinning pacifies the "routine fatigue" Johnny identified, and gives the player an active decision moment, which is psychologically rewarding even though the outcome is RNG-determined.

### 6.4 Wild Respin — "Lockdown"

- **Trigger:** Any spin that lands 2+ Wilds on the grid during the base game.
- **Behavior:** Wilds lock in place for one free respin. Non-wild symbols re-roll.
- **Rationale:** Creates "near-miss" tension — the player can see the wild already on-screen and gets a second chance to line it up.

---

## 7. Jackpots

We are implementing a two-tier jackpot system: a fixed top-symbol jackpot in the base game and a 4-tier progressive jackpot accessible through the Heist mini-game.

### 7.1 Fixed Jackpot

- **Condition:** 5 Gold Kanji symbols on any active payline during the base game.
- **Payout:** 5,000× line bet (as shown in paytable).
- **Odds:** Calibrated via reel weighting to occur approximately 1 in 1,000,000 spins at max bet.

### 7.2 Progressive Jackpot (4-tier)

Accessible only through the Heist Mini-Game's "Jackpot" terminal.

| Tier | Starting value | Seed contribution per spin | Target hit frequency |
|---|---|---|---|
| Chip (Mini) | 1,000 credits | 0.1% of each bet | ~1 in 5,000 plays |
| Disk (Minor) | 10,000 credits | 0.2% of each bet | ~1 in 50,000 plays |
| Vault (Major) | 100,000 credits | 0.4% of each bet | ~1 in 500,000 plays |
| Mainframe (Grand) | 1,000,000 credits | 0.8% of each bet | ~1 in 5,000,000 plays |

Progressive jackpot values persist across sessions and across users (server-side).  Seed amounts are added to an internal pool; when a jackpot is won, the pool resets to the starting value.

Progressive jackpots give the game "reach" — the visible `1,472,891` counter on the main screen is a retention driver even for players who will never hit it. Per Johnny's research, this is one of the strongest "accessibility of payout" levers.

### 7.3 MVP Implementation Note

**Decision locked (see §18.1): we are shipping the full four-tier progressive in MVP, with the live pool simulated client-side.** Rather than running a real server-side shared pool (out of scope for a class project), each tier's visible counter increments via a seeded-random incrementing function on the client:

- Counters start at the tier's defined starting value (1,000 / 10,000 / 100,000 / 1,000,000 CC).
- Each counter advances by small pseudo-random amounts on a timer (e.g., every 0.5–2 seconds), weighted so the Mainframe counter ticks noticeably faster than Chip.
- The increment schedule is seeded so the counter is visually plausible and doesn't reset when the player closes and reopens the app within a session.
- Jackpot hits are triggered by the player's own Heist mini-game (section 6.3), not by any pool-reaching-threshold logic. When a hit occurs, the tier's counter resets to its starting value.

The effect is indistinguishable from a real shared pool for a single-player experience. If we ever move to a multi-user backend, the counter display code can be repointed at a real pool service without changing the UI.

---

## 8. Technical Specifications

### 8.1 Fairness Parameters

| Parameter | Value | Notes |
|---|---|---|
| RTP (theoretical) | 96.0% | Aligned with Benny's research (96–99% range for social / real-money casino apps). Since we are a social-casino-style app with virtual currency, 96% is a reasonable target that leaves 4% "house edge" conceptually while still feeling generous. |
| Volatility | Medium | Per Bishal's research — balances frequent small wins (dopamine loop for mainstream players) with occasional big wins (jackpot hunter appeal). |
| Hit frequency | ~28% | Roughly 1 in 3.5 spins produces some win. Keeps sessions feeling active. |
| Bonus trigger frequency | ~1 in 150 spins (Free Spins) | Bonus rounds feel earned but not distant. |
| Mini-game trigger | ~1 in 250 spins (Heist) | Slightly rarer than Free Spins. |
| RNG | Cryptographically seeded PRNG | Must be auditable. Seed source should not be predictable. |

### 8.2 RNG Implementation Requirements

- Every spin must be fully independent. No "due for a win" logic. No dynamic adjustment based on session losses to artificially induce engagement. *This is a hard constraint.* Per Aarnav's research on explainability, any AI-adjacent modulation of outcomes introduces regulatory and ethical risk that we are not equipped to manage.
- Spin results are determined at step 3 of the game loop and cannot be changed by animation or user input afterward.
- Seed source: `crypto.getRandomValues()` on client. **Decision locked: client-side RNG for MVP** (see §18.1). Server-authoritative spins are deferred to v2. For MVP this is acceptable because the app uses virtual currency with no real-money payout, so there is no player financial risk from a client-side compromise. All spin logic, reel strip data, paytable lookups, and payout calculation happen in the client.
- Reel strip weights must be documented and version-controlled. A change to any weight is a change to RTP and must be re-tested.

### 8.3 Win Transparency

Per Bishal's "Win Breakdown Display" user story (#7), every win must be inspectable:

- Winning paylines highlight with their neon color (paylines use `#FF2D78` magenta per Thy's palette).
- A per-win breakdown shows: `3× Gold Kanji on Line 7 → 200× × 10cr = 2,000cr`.
- Total-win sum is shown separately and animated distinctly from the paytable breakdown.

---

## 9. Betting, Credits, and Monetization

### 9.1 Credit System

Per Cindy's research, slot machine apps almost universally use in-game currency rather than direct real-money wagering. This is both a legal requirement (to avoid being classified as a gambling app in most jurisdictions — see Benny's research) and a psychological design choice that decouples the spin action from the feeling of spending real money.

| Item | Value |
|---|---|
| Currency name | **Crypto-Credits** (CC) |
| Starting balance on first install | 10,000 CC |
| Daily login bonus | 1,000–10,000 CC (random, weighted toward lower) |

### 9.2 Bet Sizes

| Parameter | Value |
|---|---|
| Minimum line bet | 1 CC |
| Minimum total bet | 25 CC (1 × 25 paylines) |
| Maximum line bet | 100 CC |
| Maximum total bet | 2,500 CC |
| Bet increments | 1, 2, 5, 10, 25, 50, 100 CC per line |
| "Max Bet" button | One-tap set to maximum |

### 9.3 Real-Money Purchase Packs

Per Cindy's research, standard mobile casino monetization. Values shown are the pack size; we expect to run periodic "2×" or "3×" promotions on specific packs.

| Pack | Price | Credits | CC per $ |
|---|---|---|---|
| Starter | $0.99 | 10,000 | 10,101 |
| Small | $4.99 | 60,000 | 12,024 |
| Medium | $9.99 | 130,000 | 13,013 |
| Large | $19.99 | 300,000 | 15,008 |
| Mega | $49.99 | 850,000 | 17,003 |
| Whale | $99.99 | 2,000,000 | 20,002 |

Larger packs carry increasing "value," which is industry standard and ethically defensible as a volume discount. However, the pack sizes must be clearly labeled and we will *not* obscure the cost-per-spin math from players. No "featured" or "limited time" pack pressure tactics in MVP.

### 9.4 MVP Purchase Flow — Mock Only

**Decision locked (see §18.1):** MVP ships with **fully mocked purchase screens — no real payment is processed**. This is explicit and non-negotiable for the class-project scope.

The mock flow should look and feel as close to a real store transaction as possible, so the team can demonstrate the full purchase UX during the final presentation:

- Store tab with all six packs rendered, including CC amounts, prices, "Best Value" / "Most Popular" labels, and any promotional banners.
- Tapping a pack opens a native-looking purchase confirmation sheet (styled to match iOS / Android system sheets).
- Confirmation animation plays — spinner, "Processing…" state for 1–1.5 seconds.
- Success screen shows CC credit animation and the balance visibly increases.
- **At no point is real payment submitted.** The pack's CC value is simply added to the local balance for demo purposes.

The purchase pipeline should be written behind a clear interface (e.g., `PurchaseService.buyPack(packId)`) so that when a real IAP integration is added in v2, only the backing implementation changes — the UI and the calling code remain unchanged.

A visible "DEMO MODE — no real charges" banner should appear on the store screen during development and evaluation so reviewers understand what is real and what is simulated.

---

## 10. User Interface and Flow

The UI derives from Theo's wireframes and Thy's visual identity package. The layout is "spin button dominant" per Ethan's research, with the reel grid as the focal visual element and supporting information arranged around it.

### 10.1 Main Screen (Base Game)

**Top bar:** Balance (left, `#FFFFFF` primary), current jackpot counters (center, scrolling through the four tiers), menu button (right).

**Center:** 5×3 reel grid. Card backgrounds are `#1A1528`, active reel border glow is `#C8FF00` neon yellow-green on the winning row after resolution.

**Bottom bar (left to right):**

- Line bet readout with `−` and `+` steppers
- Total bet readout (derived: line bet × 25)
- Last win readout
- **Spin button** (the largest UI element, `#C8FF00` neon yellow-green, dominant per Ethan and Cindy's research on UI simplicity)
- Auto-spin button (smaller, secondary)
- Max Bet shortcut

**Hidden behind menu:** Paytable, settings, history, help, privacy mode, daily bonus collection, VIP status.

### 10.2 Critical UX Requirements

Derived from Bishal's user stories and Cindy's research:

- Balance always visible (Bishal US #1).
- Current bet always clearly displayed (Bishal US #2).
- Winning paylines clearly highlighted (Bishal US #4).
- Win breakdown shown after each spin (Bishal US #7).
- Paytable accessible at any time (Jack's feature list, Cindy's UI research).
- Sound and haptics toggleable.
- Bet adjustment must never be hidden behind multiple taps.

### 10.3 Paytable Screen

Full symbol paytable with payouts, payline diagram showing all 25 lines, special symbol explanations, and bonus feature descriptions. Accessible from any screen via the menu button. Non-modal if possible (player can review while reels are visible).

---

## 11. Win Feedback: Animation and Audio

Per Michael's interview research, **animation intensity and sound design are among the single strongest differentiators between slot games players love versus abandon**. Flashier, louder wins make players feel the win is "bigger than it actually was" (his words), and this is a legitimate tool for making wins feel rewarding.

### 11.1 Tiered Win Celebrations

Tiers are based on win size relative to total bet.

| Tier | Win size | Visual | Audio |
|---|---|---|---|
| **None** | 0 | Brief reel settle | Soft settle click |
| **Small** | 0.5×–2× bet | Gentle reel glow, win amount counter ticks up quickly | Short coin chime |
| **Medium** | 2×–10× bet | Payline traces in neon pink, counter scrolls audibly | Layered win chime + synth pad |
| **Big Win** | 10×–50× bet | Full-screen "BIG WIN" overlay, extended counter roll (2–3 sec), reels pulse | Full musical stinger, bass hit |
| **Mega Win** | 50×–250× bet | Extended celebration sequence (4–5 sec), screen flashes, cinematic zoom | Cinematic music cue, full drop |
| **Epic Win / Jackpot** | 250× bet+ | Full interrupt sequence with themed animation (matrix code rain, vault door opening), dedicated screen state, counter climbs for 6–10 sec | Full jackpot theme, crowd-cheer layer, distinct per-tier for progressive jackpots |

Animation speed balances flair with playability. Per Ethan's research, animation should not impede the "swift play" expectation — small wins resolve in under 1.5 seconds, and big wins can be skipped with a tap (tap-to-skip is standard in modern slots).

### 11.2 Near-Miss Presentation (Honest Version)

Johnny and Benny's research noted that near-miss framing — where the player can see symbols just above or below a winning line — is one of the most potent retention mechanics in slots. Because our reels are spinning visually but the outcome is predetermined, we will let near-misses occur naturally as a function of the reel layout. **We will not artificially manufacture near-misses based on loss streaks or session length.** That crosses into the territory that Aarnav's explainable-AI research flagged as regulatorily and ethically problematic.

### 11.3 Audio System

Based on Thy's Freesound curation:

- **Spin sound:** Looping low-latency effect during reel motion.
- **Reel stop:** Layered click per reel as it lands.
- **Win sounds:** Tiered by win size (see above).
- **Jackpot stinger:** Distinct themed track per jackpot tier.
- **Button click:** UI feedback on every tap.
- **Background music:** Loop-friendly cyberpunk synth track, ambient enough to not fatigue.

Audio must be fully muteable and must remember the mute state across sessions.

---

## 12. Auto-Spin and Cooldown Controls

Auto-spin is a standard slot feature and is one of Bishal's user stories (US #6). It also raises responsible-play considerations that Bishal and the research surfaced.

### 12.1 Auto-Spin Behavior

| Parameter | Value |
|---|---|
| Preset options | 10, 25, 50, 100 spins |
| Custom option | Player sets 1–100 |
| Speed | Normal / Turbo (turbo = skip most animations) |
| Stop conditions (all on by default, per Bishal's research) | On balance below threshold; on single win above threshold; on any bonus trigger; on total loss above threshold |

### 12.2 Cooldown and Session Limits

These are responsible-gaming controls. Some are regulatory defaults in the EU and emerging in California (per Aarnav's research).

| Control | Default | User adjustable? |
|---|---|---|
| Minimum time between spins (base game) | 2 seconds | No |
| Session time reminder | Every 60 minutes of active play | Yes — can be set 15/30/60/120 min or off |
| Daily play-time soft cap | None by default | User can set 30/60/120/240 min |
| Daily spend soft cap | None by default | User can set dollar amount; app prevents purchases past cap for 24h |
| High-bet confirmation | Prompt on bets over 500 CC if user has lost >50,000 CC in current session | Yes — can disable |

The 2-second minimum spin interval is a soft safeguard against unintended rapid-fire auto-spin in frustration, and aligns with the EU's slot-machine minimum-cycle regulations.

---

## 13. Privacy Mode (Launch Disguise Decision)

The brief raised an "app disguise so it looks like a different app on launch" feature. This needs explicit design discussion because the feature space contains both legitimate and problematic options.

### 13.1 What We Are Building

**Decision locked (see §18.1):** Privacy Mode ships with the banking-app pattern — **fast-exit gesture + alternate app icons from an aesthetically neutral set only**. No impersonation of specific other apps (no fake Calculator, fake Notes, etc.).

The three features included:

- **PIN / biometric lock on app launch** — standard in banking, notes, and messaging apps. Hides game state from whoever picks up an unlocked phone.
- **Fast-exit gesture** — four-finger swipe up exits to home screen immediately. Same pattern as banking apps' panic-close.
- **User-selectable app icon** — players can choose from 3–4 alternate icons (plus alternate app name on supported platforms). These are *aesthetically neutral* options like a calculator-style icon, a generic "Tools" icon, a neon geometric icon, and the default DATA HEIST icon. This pattern is offered by apps like 1Password, Bitwarden, and several banking apps.

### 13.2 What We Are Not Building

We are not building a feature that **impersonates a specific other app** (fake Calculator app that opens into a slot machine on a secret PIN, fake Notes app, etc.). Three reasons:

- Apple and Google both reject apps that misrepresent their functionality at launch. This is a store-policy issue.
- Your own user story #2 explicitly framed the use case as helping a "frequent gambler who struggles to maintain transparency with my family regarding my habits" to "avoid the immediate detection and domestic conflict that arises from my gambling." That is a description of a harm vector — a concerned family member trying to identify and address problem-gambling behavior — and the feature would serve to defeat that intervention. Kareem's research established that ~5% of users drive ~82% of revenue, and that this cohort overlaps heavily with at-risk gambling. A deception feature disproportionately serves this cohort.
- Most mainstream slot players do not want or need this. Grandma-on-an-iPad does not need her slot app to pretend to be a calculator. The feature has a narrow target and that target is the problem-gambling segment.

The Privacy Mode as specified above gives users reasonable privacy control (similar to what banking and password apps offer) without the deception layer.

### 13.3 Resolved

This was previously flagged as a team discussion item and has been resolved in favor of the banking-app pattern described in §13.1. Decision logged in §18.1.

---

## 14. Progression, Retention, and Daily Systems

Per Cindy's research, retention systems are essential to sustained engagement. Mainstream slot players (Kareem's 60%+ dopamine-loop cohort) are not jackpot chasers; they come back for the steady daily rhythm. These systems directly serve that cohort.

### 14.1 Daily Login Bonus

Seven-day cycle with escalating rewards. Missing a day does not reset; picks up where you left off.

| Day | Reward |
|---|---|
| 1 | 1,000 CC |
| 2 | 2,000 CC |
| 3 | 3,000 CC + 5 free spins |
| 4 | 5,000 CC |
| 5 | 7,500 CC |
| 6 | 10,000 CC + 10 free spins |
| 7 | 25,000 CC + Heist mini-game entry |

### 14.2 Player Level / "Reputation"

Cyberpunk-framed progression system. Players earn "Street Rep" XP from every spin (1 XP per 10 CC wagered). Each level grants a small permanent reward (CC, free spins, mini-game entries, or cosmetic "hacker avatars"). Levels also gate access to higher-tier cosmetic reel themes (same mechanics, alternate art).

### 14.3 Achievements

Roughly 30 achievements at launch, each worth a one-time CC reward. Examples:

- "Script Kiddie" — Reach level 5
- "Data Runner" — Trigger free spins 10 times
- "Black ICE" — Win 5 Heist mini-games
- "Full Send" — Bet max 100 times
- "Chrome Dome" — Get 5 Chrome Skulls on one spin
- "Corpo Killer" — Hit the Mainframe progressive jackpot

### 14.4 VIP / "Netrunner" Tiers

Five tiers (Bronze Jack, Silver Jack, Gold Jack, Platinum Jack, Chrome Jack) earned by lifetime wagering. Higher tiers unlock: better daily bonus multipliers, exclusive cosmetic themes, higher purchase-pack bonuses, and dedicated events.

---

## 15. Cyberpunk Theme: Why It Works

The cyberpunk theme is not cosmetic. It is a strategic choice that does three things at once.

### 15.1 Differentiation in a Crowded Market

There are thousands of slot apps. Almost all target mainstream audiences with generic themes — Vegas, Egypt, pirates, fruits, mythology. **Cyberpunk is nearly absent from the slot genre despite being one of the most commercially proven aesthetics in adjacent gaming media** (*Cyberpunk 2077*, *Deus Ex*, *Shadowrun*, *Cyberpunk: Edgerunners*, the entire *Blade Runner* lineage). The theme gives DATA HEIST immediate shelf-space differentiation and organic discoverability in the cyberpunk-fan community.

### 15.2 Natural Narrative Scaffolding

Cyberpunk gives us a ready-made narrative vocabulary that maps perfectly onto slot mechanics:

| Slot concept | Cyberpunk framing |
|---|---|
| Spin a reel | Run an exploit |
| Win a payout | Exfiltrate data / credits |
| Free spin bonus | System breach |
| Cascading reels | Chain exploit |
| Wild symbol | Glitch |
| Bonus mini-game | Data vault heist |
| Progressive jackpot | Mainframe score |
| Player progression | Build your cyberdeck / Street Rep |

Themed framing turns every spin into a mini-story, which is a stronger retention hook than a raw spin. It also means bonus rounds can have genuine narrative content (scrolling terminal overlays, "ACCESS GRANTED" text) without feeling gimmicky.

### 15.3 Audience Psychographic Fit

The cyberpunk audience — technically literate, digitally native, comfortable with in-app purchases, aesthetic-conscious — skews significantly toward the profile of mobile-game spenders. This is not the traditional slot-player profile, but it is the mobile-game-spender profile. Reaching this audience expands our potential market beyond the pool that traditional slot apps compete for.

### 15.4 Dark Aesthetic Legitimizes the Stakes

Most slot apps use bright, cheerful Vegas palettes. Cyberpunk's dark dystopian aesthetic is naturally compatible with the "rebellious" framing of gambling — you're not losing money to a casino, you're hacking megacorps. This is a psychological reframing that makes engagement feel edgy and aspirational rather than guilty. It's a legitimate narrative framing used in countless cyberpunk properties and is a better fit for the genre than pretending the stakes are purely cheerful.

---

## 16. Bridging to Mainstream Slot Players

The risk with a strong themed game is alienating players who don't know or care about the theme. Kareem's research makes it clear that the core slot audience — women 55–64, playing for the rhythm and the wins — will not be drawn in by cyberpunk lore. The design choices below ensure they are not *excluded* by it, even if they are not specifically drawn to it.

### 16.1 Familiar Mechanical Foundation

The underlying game is a conventional 5×3 video slot with 25 paylines, standard wild/scatter/bonus mechanics, free spins, cascading reels, and a progressive jackpot. A mainstream slot player who opens DATA HEIST sees exactly the interaction pattern they already know. Only the skin is different.

### 16.2 Low-Pay Symbols Are Universally Familiar

Cherry, BAR, Bell, 7, Clover, Diamond, Watermelon, Horseshoe — these are the symbols on every slot machine since 1895. Their inclusion is deliberate. A mainstream player immediately recognizes "I know what this is," even while the high-pay symbols (Katana, Cyber iris, Chrome Skull, Oni mask, Gold Kanji) give the game its identity.

### 16.3 Clear Money Math

Mainstream players care about the wins, not the lore. The paytable, win breakdown (Bishal US #7), payline highlighting (Bishal US #4), balance tracking (Bishal US #1), and bet adjustment (Bishal US #2) are all built to be unambiguous. A player who has never heard of Cyberpunk 2077 can still read the game instantly.

### 16.4 Satisfying Universal Feedback

The tiered win celebrations use universal sensory language — coins, stingers, screen flashes, counters rolling up. The *visual skin* of these celebrations is themed (matrix rain for jackpot, terminal overlays for free spins), but the *structure* is the same tiered crescendo every slot player understands. Per Michael's interview, it's the intensity and layering of celebrations that make wins feel bigger, not the theme of the celebration.

### 16.5 No Theme Literacy Required

Nothing in the game requires the player to know what cyberpunk is. There is no lore dump, no tutorial text on megacorps, no assumed cultural knowledge. The theme is carried entirely by the visuals and the labels on features ("System Breach" instead of "Free Spins"). Both labels are shown in onboarding so nobody gets confused.

---

## 17. Responsible Play and Regulatory Posture

This section is not optional. Per Kareem's research, ~5% of users drive ~82% of casino slot revenue, and per Benny's research the regulatory landscape is tightening (10+ states restricting sweepstakes mechanics as of 2026, EU and California leading on explainability). Building responsible play features now is cheaper than retrofitting them later, and protects the team and the product from regulatory and ethical risk.

### 17.1 Baseline Commitments

- No artificial outcome modulation based on session behavior. RNG is RNG.
- No fake near-misses generated to retain a dropping player.
- No hidden cost escalation. Every purchase pack shows its cost and CC yield clearly.
- User-configurable time and spend caps (section 12.2).
- Clear "Responsible Play" section accessible from the main menu, with links to helpline resources.
- Age gate at first launch.
- No targeted advertising to users under 21.

### 17.2 Explainability Readiness

Per Aarnav's research, if we eventually use any kind of ML-driven recommendation (e.g., suggested bet sizes, recommended games), those decisions must be loggable and explainable. We should not ship ML-driven outcome modulation at all; but if any ML shows up elsewhere in the stack, use the SHAP/LIME-ready pattern of logging feature contributions.

### 17.3 App Store and Jurisdiction Positioning

Per Benny's research, because we use virtual currency with no direct real-money payout, we are classified as a social casino app, not a gambling app. This significantly loosens regulation but imposes platform requirements:

- Apple and Google both prohibit certain patterns in "simulated gambling" apps — mainly, we can't claim any real-world value for CC and we can't let users transfer CC out.
- Age rating will be 17+ on iOS (Simulated Gambling category) and "Adults Only" or equivalent on Android.
- Not shippable to users in jurisdictions that have restricted social casino / sweepstakes mechanics (including California if our design strays toward sweepstakes behavior).

---

## 18. Decisions Log and Remaining Open Items

### 18.1 Locked-In Decisions (Team Discussion)

The team has made the following scope decisions for MVP. Each resolves an earlier open question and is now binding for implementation.

| # | Decision | Chosen Approach | Implementation Section |
|---|---|---|---|
| 1 | RNG architecture | **Client-side RNG** for MVP. Server-authoritative deferred to v2. | §8.2 |
| 2 | Progressive jackpot scope | **Full four-tier progressive** (Chip / Disk / Vault / Mainframe) in MVP, not the reduced single-progressive option. | §7.2 |
| 3 | Cascading reels scope | **In MVP.** "Chain Exploit" feature ships with v1. | §6.2 |
| 4 | Privacy Mode scope | **Fast-exit gesture + alternate icons in the banking-app pattern** (aesthetically neutral set — no impersonation of specific other apps). | §13 |
| 5 | Real-money purchases | **Mock purchase screens in MVP.** UI should look as real as possible — packs, prices, "Buy" buttons, confirmation flow — but the final purchase step is stubbed and no real payment is processed. | §9.3 |
| 6 | Localization | **English only** for MVP. Internationalization architecture can be added in v2. | — |
| 7 | Live progressive jackpot pool | **Seeded-random incrementing counter** on the client for MVP. Counter advances at a plausible rate so the jackpot number on the main screen always feels "live," but it is not a real shared pool. | §7.2 |

### 18.2 Still Open

| # | Question | Who owns it |
|---|---|---|
| 8 | **Explainable AI / ML scope.** Are we shipping any ML features in v1, and if so do we need SHAP/LIME-style explainability logging? Section 17.2 is currently written as readiness, not a feature. | Kareem (LLM strategy owner) |
| 9 | **Reel weighting + RTP tuning pass.** The expanded 16-symbol set (§4.1) is on the higher end of typical slot symbol counts. Reel strip weights need to be calculated and simulation-tested to confirm the paytable in §4.2 actually hits the 96% target RTP at medium volatility. This is a math-and-simulation task, not a design decision. | Math pass — owner TBD (candidate: Theo or Jack given prior work on mechanics) |

---

## Summary

DATA HEIST is a 5×3 video slot with 25 fixed paylines, 96% RTP, medium volatility, a familiar industry-standard mechanical foundation, and a strong cyberpunk visual identity that differentiates it in a crowded category. The theme gives us an acquisition audience outside the traditional slot demographic; the conventional mechanical foundation ensures mainstream slot players can still play it fluently. Engagement is driven by tiered wins, cascading reels, free spins, a pick-em mini-game, and a four-tier progressive jackpot. Retention is driven by daily logins, player progression, achievements, and VIP tiers. Monetization is standard social-casino IAP. Responsible-play and privacy features are designed in from the start, not bolted on.

Every feature in this document traces back to a source in our research. This is the spec the team is building against.

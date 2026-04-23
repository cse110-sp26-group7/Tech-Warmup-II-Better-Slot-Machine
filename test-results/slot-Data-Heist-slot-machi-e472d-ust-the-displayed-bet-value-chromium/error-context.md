# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: slot.spec.js >> Data Heist slot machine >> bet + and − buttons adjust the displayed bet value
- Location: tests/e2e/slot.spec.js:123:3

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('#bet-display')
Expected: "50"
Received: "50(2 per line)"
Timeout:  15000ms

Call log:
  - Expect "toHaveText" with timeout 15000ms
  - waiting for locator('#bet-display')
    19 × locator resolved to <span id="bet-display" class="bet-amount">…</span>
       - unexpected value "50(2 per line)"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]: DATA_HEIST // VOL.01
    - generic [ref=e5]:
      - generic [ref=e6]: "Crypto-Credits:"
      - generic [ref=e7]: "10000"
    - 'button "SFX: ON" [ref=e8] [cursor=pointer]'
  - main [ref=e9]:
    - complementary [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: "1"
        - generic [ref=e13]: "2"
        - generic [ref=e14]: "3"
        - generic [ref=e15]: "4"
        - generic [ref=e16]: "5"
        - generic [ref=e17]: "6"
        - generic [ref=e18]: "7"
        - generic [ref=e19]: "8"
        - generic [ref=e20]: "9"
        - generic [ref=e21]: "10"
        - generic [ref=e22]: "11"
        - generic [ref=e23]: "12"
        - generic [ref=e24]: "13"
        - generic [ref=e25]: "14"
        - generic [ref=e26]: "15"
        - generic [ref=e27]: "16"
        - generic [ref=e28]: "17"
        - generic [ref=e29]: "18"
        - generic [ref=e30]: "19"
        - generic [ref=e31]: "20"
        - generic [ref=e32]: "21"
        - generic [ref=e33]: "22"
        - generic [ref=e34]: "23"
        - generic [ref=e35]: "24"
        - generic [ref=e36]: "25"
    - generic [ref=e37]:
      - generic [ref=e39]:
        - generic [ref=e40]:
          - generic "BAR" [ref=e42]: ▬
          - generic "Cherry" [ref=e44]: ●
          - generic "Cyber Iris" [ref=e46]: ◎
        - generic [ref=e47]:
          - generic "Diamond" [ref=e49]: ◆
          - generic "Neon 7" [ref=e51]: "7"
          - generic "Cherry" [ref=e53]: ●
        - generic [ref=e54]:
          - generic "Cherry" [ref=e56]: ●
          - generic "Diamond" [ref=e58]: ◆
          - generic "BAR" [ref=e60]: ▬
        - generic [ref=e61]:
          - generic "Bell" [ref=e63]: ♦
          - generic "BAR" [ref=e65]: ▬
          - generic "BAR" [ref=e67]: ▬
        - generic [ref=e68]:
          - generic "Neural Chip" [ref=e70]: ⚡
          - generic "Cherry" [ref=e72]: ●
          - generic "BAR" [ref=e74]: ▬
      - generic [ref=e76]: "0"
      - generic [ref=e77]:
        - generic [ref=e78]:
          - button "−" [ref=e79] [cursor=pointer]
          - generic [ref=e80]:
            - generic [ref=e81]: "Bet:"
            - generic [ref=e82]:
              - text: "50"
              - text: (2 per line)
          - button "+" [active] [ref=e83] [cursor=pointer]
        - button "SPIN" [ref=e84] [cursor=pointer]
        - generic [ref=e85]:
          - button "AUTO SPIN" [ref=e86] [cursor=pointer]
          - button "MAX BET (2500)" [ref=e87] [cursor=pointer]
      - button "PAYTABLE" [ref=e88] [cursor=pointer]
    - complementary [ref=e89]:
      - generic [ref=e91]: LAST SPINS
```

# Test source

```ts
  30  |         animation-duration:   1ms !important;
  31  |         animation-delay:      0ms !important;
  32  |         transition-duration:  1ms !important;
  33  |         transition-delay:     0ms !important;
  34  |       }
  35  |     `,
  36  |   });
  37  | }
  38  | 
  39  | /**
  40  |  * Navigate to the game and apply both speed patches.
  41  |  */
  42  | async function gotoGame(page) {
  43  |   await injectTimerPatch(page);   // must be set before goto
  44  |   await page.goto('/');
  45  |   await injectAnimationPatch(page); // applied after DOM is ready
  46  | }
  47  | 
  48  | /**
  49  |  * Wait for the spin to complete by polling until the SPIN button
  50  |  * re-enables (isSpinning = false) and the balance display has
  51  |  * had a chance to update.
  52  |  */
  53  | async function waitForSpinEnd(page) {
  54  |   await page.waitForFunction(
  55  |     () => {
  56  |       const btn = document.getElementById('spin-btn');
  57  |       return btn && !btn.disabled && btn.textContent.trim() === 'SPIN';
  58  |     },
  59  |     { timeout: 15_000 },
  60  |   );
  61  | }
  62  | 
  63  | // ---------------------------------------------------------------------------
  64  | // Tests
  65  | // ---------------------------------------------------------------------------
  66  | 
  67  | test.describe('Data Heist slot machine', () => {
  68  | 
  69  |   // ── 1 ───────────────────────────────────────────────────────────────────
  70  |   test('page loads, "DATA_HEIST" title is visible, and balance shows 10000', async ({ page }) => {
  71  |     await gotoGame(page);
  72  | 
  73  |     // The top-bar title contains the game name
  74  |     await expect(page.getByText('DATA_HEIST', { exact: false })).toBeVisible();
  75  | 
  76  |     // Initial balance is 10 000 Crypto-Credits
  77  |     await expect(page.locator('#balance-display')).toHaveText('10000');
  78  |   });
  79  | 
  80  |   // ── 2 ───────────────────────────────────────────────────────────────────
  81  |   test('clicking SPIN deducts the bet from the balance', async ({ page }) => {
  82  |     await gotoGame(page);
  83  | 
  84  |     const initialBalance = parseInt(await page.locator('#balance-display').textContent(), 10);
  85  |     const bet = parseInt(await page.locator('#bet-display').textContent(), 10);
  86  | 
  87  |     await page.getByRole('button', { name: 'SPIN', exact: true }).click();
  88  |     await waitForSpinEnd(page);
  89  | 
  90  |     const finalBalance  = parseInt(await page.locator('#balance-display').textContent(), 10);
  91  |     const winAmount     = parseInt(await page.locator('#win-amount').textContent(), 10);
  92  | 
  93  |     // finalBalance must satisfy: finalBalance = initialBalance − bet + payout
  94  |     expect(finalBalance).toBe(initialBalance - bet + winAmount);
  95  |   });
  96  | 
  97  |   // ── 3 ───────────────────────────────────────────────────────────────────
  98  |   test('the 5×3 symbol grid is fully populated on load and after a spin', async ({ page }) => {
  99  |     await gotoGame(page);
  100 | 
  101 |     // Before any spin: initializeGame() seeds the grid with a decorative
  102 |     // starting matrix so the player never sees a blank reel area.
  103 |     await page.waitForFunction(
  104 |       () => document.querySelectorAll('.reel-cell .symbol').length === 15,
  105 |       { timeout: 10_000 },
  106 |     );
  107 |     const symbolsOnLoad = await page.locator('.reel-cell .symbol').count();
  108 |     expect(symbolsOnLoad).toBe(15);
  109 | 
  110 |     // After a spin the grid must still be fully populated.
  111 |     await page.getByRole('button', { name: 'SPIN', exact: true }).click();
  112 |     await waitForSpinEnd(page);
  113 | 
  114 |     await page.waitForFunction(
  115 |       () => document.querySelectorAll('.reel-cell .symbol').length === 15,
  116 |       { timeout: 10_000 },
  117 |     );
  118 |     const symbolsAfterSpin = await page.locator('.reel-cell .symbol').count();
  119 |     expect(symbolsAfterSpin).toBe(15);
  120 |   });
  121 | 
  122 |   // ── 4 ───────────────────────────────────────────────────────────────────
  123 |   test('bet + and − buttons adjust the displayed bet value', async ({ page }) => {
  124 |     await gotoGame(page);
  125 | 
  126 |     const initialBet = parseInt(await page.locator('#bet-display').textContent(), 10);
  127 | 
  128 |     // Each click changes bet-per-line by 1; total bet = lines × bet-per-line = 25 × delta
  129 |     await page.locator('#bet-plus-btn').click();
> 130 |     await expect(page.locator('#bet-display')).toHaveText(String(initialBet + 25));
      |                                                ^ Error: expect(locator).toHaveText(expected) failed
  131 | 
  132 |     await page.locator('#bet-plus-btn').click();
  133 |     await expect(page.locator('#bet-display')).toHaveText(String(initialBet + 50));
  134 | 
  135 |     await page.locator('#bet-minus-btn').click();
  136 |     await expect(page.locator('#bet-display')).toHaveText(String(initialBet + 25));
  137 | 
  138 |     await page.locator('#bet-minus-btn').click();
  139 |     await expect(page.locator('#bet-display')).toHaveText(String(initialBet));
  140 |   });
  141 | 
  142 |   // ── 5 ───────────────────────────────────────────────────────────────────
  143 |   test('auto-spin runs 3 times and updates the balance each time', async ({ page }) => {
  144 |     await gotoGame(page);
  145 | 
  146 |     // Attach a MutationObserver that records every distinct balance value
  147 |     await page.evaluate(() => {
  148 |       window.__balanceHistory = [
  149 |         parseInt(document.getElementById('balance-display').textContent, 10),
  150 |       ];
  151 |       const display = document.getElementById('balance-display');
  152 |       new MutationObserver(() => {
  153 |         const val = parseInt(display.textContent, 10);
  154 |         const prev = window.__balanceHistory[window.__balanceHistory.length - 1];
  155 |         if (val !== prev) window.__balanceHistory.push(val);
  156 |       }).observe(display, { childList: true, subtree: true, characterData: true });
  157 |     });
  158 | 
  159 |     // Start auto-spin (cycles OFF → 10 spins)
  160 |     await page.getByRole('button', { name: 'AUTO SPIN' }).click();
  161 | 
  162 |     // Wait until the auto-spin counter drops to 7 or below
  163 |     // (counter starts at 10 and decrements after each spin, so ≤7 means ≥3 spins done)
  164 |     await page.waitForFunction(
  165 |       () => {
  166 |         const counter = document.getElementById('auto-spin-counter');
  167 |         const m = (counter?.textContent ?? '').match(/\((\d+)\)/);
  168 |         return m !== null && parseInt(m[1], 10) <= 7;
  169 |       },
  170 |       { timeout: 30_000 },
  171 |     );
  172 | 
  173 |     // Stop the auto-spin loop: while auto-spin is active the button label
  174 |     // is "STOP", so locate by id instead of by accessible name.
  175 |     await page.locator('#auto-spin-btn').click();
  176 | 
  177 |     // Let the in-flight spin finish before reading state
  178 |     await waitForSpinEnd(page);
  179 | 
  180 |     // Assert ≥ 3 distinct balance values were recorded
  181 |     const history = await page.evaluate(() => window.__balanceHistory);
  182 |     expect(history.length).toBeGreaterThanOrEqual(4); // initial + 3 updates
  183 |   });
  184 | 
  185 |   // ── 6 ───────────────────────────────────────────────────────────────────
  186 |   test('paytable modal opens on button click and closes on ✕ button', async ({ page }) => {
  187 |     await gotoGame(page);
  188 | 
  189 |     // Modal must be hidden on load
  190 |     await expect(page.locator('#paytable-modal')).not.toBeVisible();
  191 | 
  192 |     // Open
  193 |     await page.getByRole('button', { name: 'PAYTABLE' }).click();
  194 |     await expect(page.locator('#paytable-modal')).toBeVisible();
  195 | 
  196 |     // Verify heading inside the modal is rendered
  197 |     await expect(page.getByRole('heading', { name: /PAYTABLE/i })).toBeVisible();
  198 | 
  199 |     // Close via the ✕ button
  200 |     await page.locator('#paytable-close-btn').click();
  201 |     await expect(page.locator('#paytable-modal')).not.toBeVisible();
  202 |   });
  203 | 
  204 |   // ── 7 ───────────────────────────────────────────────────────────────────
  205 |   test('free spins counter is hidden when not in a bonus round', async ({ page }) => {
  206 |     await gotoGame(page);
  207 | 
  208 |     // On load the element is display:none — not visible to the user
  209 |     await expect(page.locator('#free-spins-counter')).not.toBeVisible();
  210 | 
  211 |     // Still hidden after a normal spin (no bonus round triggered by default)
  212 |     await page.getByRole('button', { name: 'SPIN', exact: true }).click();
  213 |     await waitForSpinEnd(page);
  214 | 
  215 |     await expect(page.locator('#free-spins-counter')).not.toBeVisible();
  216 |   });
  217 | 
  218 |   // ── 8 ───────────────────────────────────────────────────────────────────
  219 |   test('auto-spin button cancels immediately on a single STOP click', async ({ page }) => {
  220 |     await gotoGame(page);
  221 | 
  222 |     const autoBtn = page.locator('#auto-spin-btn');
  223 |     const autoCounter = page.locator('#auto-spin-counter');
  224 | 
  225 |     // Initial label is AUTO SPIN
  226 |     await expect(autoBtn).toHaveText('AUTO SPIN');
  227 | 
  228 |     // Start auto-spin — label flips to STOP and counter shows "(10)"
  229 |     await autoBtn.click();
  230 |     await expect(autoBtn).toHaveText('STOP');
```
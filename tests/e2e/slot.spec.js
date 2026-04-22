import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers shared across tests
// ---------------------------------------------------------------------------

/**
 * Patch setTimeout/setInterval so all in-game delays cap at 50 ms.
 * This makes spin animations, win celebrations, and auto-spin pauses
 * resolve almost instantly without touching any game logic.
 */
async function injectTimerPatch(page) {
  await page.addInitScript(() => {
    const _st = window.setTimeout;
    window.setTimeout = (fn, ms, ...args) => _st(fn, Math.min(ms ?? 0, 50), ...args);
    const _si = window.setInterval;
    window.setInterval = (fn, ms, ...args) => _si(fn, Math.min(ms ?? 0, 50), ...args);
  });
}

/**
 * Inject a stylesheet that collapses all CSS animation/transition durations
 * to 1 ms so animationend events fire almost immediately.
 * Must be called after page.goto() since addStyleTag injects at runtime.
 */
async function injectAnimationPatch(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration:   1ms !important;
        animation-delay:      0ms !important;
        transition-duration:  1ms !important;
        transition-delay:     0ms !important;
      }
    `,
  });
}

/**
 * Navigate to the game and apply both speed patches.
 */
async function gotoGame(page) {
  await injectTimerPatch(page);   // must be set before goto
  await page.goto('/');
  await injectAnimationPatch(page); // applied after DOM is ready
}

/**
 * Wait for the spin to complete by polling until the SPIN button
 * re-enables (isSpinning = false) and the balance display has
 * had a chance to update.
 */
async function waitForSpinEnd(page) {
  await page.waitForFunction(
    () => {
      const btn = document.getElementById('spin-btn');
      return btn && !btn.disabled && btn.textContent.trim() === 'SPIN';
    },
    { timeout: 15_000 },
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Data Heist slot machine', () => {

  // ── 1 ───────────────────────────────────────────────────────────────────
  test('page loads, "DATA_HEIST" title is visible, and balance shows 10000', async ({ page }) => {
    await gotoGame(page);

    // The top-bar title contains the game name
    await expect(page.getByText('DATA_HEIST', { exact: false })).toBeVisible();

    // Initial balance is 10 000 Crypto-Credits
    await expect(page.locator('#balance-display')).toHaveText('10000');
  });

  // ── 2 ───────────────────────────────────────────────────────────────────
  test('clicking SPIN deducts the bet from the balance', async ({ page }) => {
    await gotoGame(page);

    const initialBalance = parseInt(await page.locator('#balance-display').textContent(), 10);
    const bet = parseInt(await page.locator('#bet-display').textContent(), 10);

    await page.getByRole('button', { name: 'SPIN', exact: true }).click();
    await waitForSpinEnd(page);

    const finalBalance  = parseInt(await page.locator('#balance-display').textContent(), 10);
    const winAmount     = parseInt(await page.locator('#win-amount').textContent(), 10);

    // finalBalance must satisfy: finalBalance = initialBalance − bet + payout
    expect(finalBalance).toBe(initialBalance - bet + winAmount);
  });

  // ── 3 ───────────────────────────────────────────────────────────────────
  test('after a spin the 5×3 symbol grid is fully populated with 15 symbols', async ({ page }) => {
    await gotoGame(page);

    await page.getByRole('button', { name: 'SPIN', exact: true }).click();
    await waitForSpinEnd(page);

    // Every reel-cell should contain exactly one .symbol div
    await page.waitForFunction(
      () => document.querySelectorAll('.reel-cell .symbol').length === 15,
      { timeout: 10_000 },
    );

    const symbolCount = await page.locator('.reel-cell .symbol').count();
    expect(symbolCount).toBe(15);
  });

  // ── 4 ───────────────────────────────────────────────────────────────────
  test('bet + and − buttons adjust the displayed bet value', async ({ page }) => {
    await gotoGame(page);

    const initialBet = parseInt(await page.locator('#bet-display').textContent(), 10);

    // Each click changes bet-per-line by 1; total bet = lines × bet-per-line = 25 × delta
    await page.locator('#bet-plus-btn').click();
    await expect(page.locator('#bet-display')).toHaveText(String(initialBet + 25));

    await page.locator('#bet-plus-btn').click();
    await expect(page.locator('#bet-display')).toHaveText(String(initialBet + 50));

    await page.locator('#bet-minus-btn').click();
    await expect(page.locator('#bet-display')).toHaveText(String(initialBet + 25));

    await page.locator('#bet-minus-btn').click();
    await expect(page.locator('#bet-display')).toHaveText(String(initialBet));
  });

  // ── 5 ───────────────────────────────────────────────────────────────────
  test('auto-spin runs 3 times and updates the balance each time', async ({ page }) => {
    await gotoGame(page);

    // Attach a MutationObserver that records every distinct balance value
    await page.evaluate(() => {
      window.__balanceHistory = [
        parseInt(document.getElementById('balance-display').textContent, 10),
      ];
      const display = document.getElementById('balance-display');
      new MutationObserver(() => {
        const val = parseInt(display.textContent, 10);
        const prev = window.__balanceHistory[window.__balanceHistory.length - 1];
        if (val !== prev) window.__balanceHistory.push(val);
      }).observe(display, { childList: true, subtree: true, characterData: true });
    });

    // Start auto-spin (cycles OFF → 10 spins)
    await page.getByRole('button', { name: 'AUTO SPIN' }).click();

    // Wait until the auto-spin counter drops to 7 or below
    // (counter starts at 10 and decrements after each spin, so ≤7 means ≥3 spins done)
    await page.waitForFunction(
      () => {
        const counter = document.getElementById('auto-spin-counter');
        const m = (counter?.textContent ?? '').match(/\((\d+)\)/);
        return m !== null && parseInt(m[1], 10) <= 7;
      },
      { timeout: 30_000 },
    );

    // Stop the auto-spin loop: the current count is not in AUTO_SPIN_OPTIONS,
    // so one click cycles back to 0 (OFF).
    await page.getByRole('button', { name: 'AUTO SPIN' }).click();

    // Let the in-flight spin finish before reading state
    await waitForSpinEnd(page);

    // Assert ≥ 3 distinct balance values were recorded
    const history = await page.evaluate(() => window.__balanceHistory);
    expect(history.length).toBeGreaterThanOrEqual(4); // initial + 3 updates
  });

  // ── 6 ───────────────────────────────────────────────────────────────────
  test('paytable modal opens on button click and closes on ✕ button', async ({ page }) => {
    await gotoGame(page);

    // Modal must be hidden on load
    await expect(page.locator('#paytable-modal')).not.toBeVisible();

    // Open
    await page.getByRole('button', { name: 'PAYTABLE' }).click();
    await expect(page.locator('#paytable-modal')).toBeVisible();

    // Verify heading inside the modal is rendered
    await expect(page.getByRole('heading', { name: /PAYTABLE/i })).toBeVisible();

    // Close via the ✕ button
    await page.locator('#paytable-close-btn').click();
    await expect(page.locator('#paytable-modal')).not.toBeVisible();
  });

  // ── 7 ───────────────────────────────────────────────────────────────────
  test('free spins counter is hidden when not in a bonus round', async ({ page }) => {
    await gotoGame(page);

    // On load the element is display:none — not visible to the user
    await expect(page.locator('#free-spins-counter')).not.toBeVisible();

    // Still hidden after a normal spin (no bonus round triggered by default)
    await page.getByRole('button', { name: 'SPIN', exact: true }).click();
    await waitForSpinEnd(page);

    await expect(page.locator('#free-spins-counter')).not.toBeVisible();
  });

});

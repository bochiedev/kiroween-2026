import type { Page } from '@playwright/test';

/** Presses Tab until the focused element has the given accessible name. Keyboard only. */
export async function tabTo(page: Page, name: string, maxPresses = 80): Promise<void> {
  for (let i = 0; i < maxPresses; i++) {
    await page.keyboard.press('Tab');
    const label = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return '';
      return (el.getAttribute('aria-label') ?? el.textContent ?? '').trim();
    });
    if (label === name) return;
  }
  throw new Error(`Could not reach "${name}" by Tab within ${maxPresses} presses`);
}

/** Moves focus to the named control with Tab, then activates it with the given key. */
export async function press(page: Page, name: string, key: 'Enter' | 'Space' = 'Enter'): Promise<void> {
  await tabTo(page, name);
  await page.keyboard.press(key);
}

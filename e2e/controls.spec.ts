import { expect, test } from '@playwright/test';
import { press } from './helpers';

test('controls work by keyboard and show visible focus', async ({ page }) => {
  await page.goto('/lab?mode=digital');
  await expect(page.getByRole('heading', { name: 'PaperFault Lab' })).toBeVisible();
  await press(page, 'Submit order');
  await expect(page.getByLabel('Queue contents')).toContainText('order-1');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
  expect(outline).not.toBe('none');
  await press(page, 'Take Database down', 'Space');
  await expect(page.getByTestId('status-database')).toContainText('DOWN');
  await press(page, 'Restore Database');
  await expect(page.getByTestId('status-database')).toContainText('UP');
  await press(page, 'Advance one tick');
  await press(page, 'Reset lab');
  await expect(page.getByTestId('queue-empty')).toBeVisible();
});

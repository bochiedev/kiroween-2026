import { expect, test } from '@playwright/test';
import { openLab, press } from './helpers';

test.describe('360px layout', () => {
  test.use({ viewport: { width: 360, height: 740 } });
  test('has no horizontal scroll and controls stay inside the viewport', async ({ page }) => {
    await openLab(page);
    await expect(page.getByRole('button', { name: 'Submit order' })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const box = await page.getByRole('button', { name: 'Submit order' }).boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(360);
  });
});

test('live region announces simulator events politely', async ({ page }) => {
  await openLab(page);
  const region = page.getByTestId('live-region');
  await expect(region).toHaveAttribute('aria-live', 'polite');
  await press(page, 'Take Database down');
  await expect(region).toHaveText('Database went down');
});

test('status is not color alone: DOWN has text and a distinct marker', async ({ page }) => {
  await openLab(page);
  await press(page, 'Take Database down');
  await expect(page.getByTestId('status-database')).toHaveText(/▲ Database: DOWN/);
  await expect(page.getByTestId('status-api')).toHaveText(/● API: UP/);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('animated edges do not animate', async ({ page }) => {
    await openLab(page);
    await press(page, 'Submit order');
    const edge = page.locator('.react-flow__edge.animated path').first();
    await expect(edge).toBeVisible();
    const name = await edge.evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe('none');
  });
});

test('control: without reduced motion the moving edge does animate', async ({ page }) => {
  await openLab(page);
  await press(page, 'Submit order');
  const edge = page.locator('.react-flow__edge.animated path').first();
  await expect(edge).toBeVisible();
  const name = await edge.evaluate((el) => getComputedStyle(el).animationName);
  expect(name).not.toBe('none');
});

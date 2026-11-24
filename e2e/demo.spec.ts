import { expect, test } from '@playwright/test';
import { press } from './helpers';

// Follows docs/demo-plan.md "Runnable script" from the landing page, keyboard only.
test('demo path: landing, ENTER THE LAB, order, DB down, retry, restore, exactly once, replay', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await press(page, 'ENTER THE LAB');
  await page.waitForURL('**/lab?mode=digital');
  await page.getByRole('heading', { name: 'PaperFault Lab' }).waitFor();

  await press(page, 'Take Database down');
  await press(page, 'Submit order');
  await press(page, 'Advance one tick');
  await press(page, 'Advance one tick');
  const timeline = page.getByRole('list', { name: 'Event timeline' });
  await expect(timeline).toContainText('order-1 could not be saved');
  await expect(timeline).toContainText('order-1 will retry');
  await press(page, 'Restore Database');
  for (let i = 0; i < 8; i++) {
    if (await page.getByTestId('queue-empty').isVisible()) break;
    await press(page, 'Advance one tick');
  }
  await expect(timeline.getByText('order-1 saved to the Database')).toHaveCount(1);
  await press(page, 'Resubmit last order');
  await expect(timeline).toContainText('order-1 duplicate ignored, nothing saved twice');
  await press(page, 'Start replay');
  await expect(page.getByTestId('replay-status')).toContainText('Replay position 0 of');
});

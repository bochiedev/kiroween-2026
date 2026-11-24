import { expect, test } from '@playwright/test';
import { openLab, press } from './helpers';

// Every interaction below is a Tab to a named control followed by Enter or Space.
// No mouse clicks and no programmatic focus.
test('full lesson by keyboard only: healthy, DB down, queued retry, restore, exactly-once, replay', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await openLab(page);

  // R1: direct load, no camera code and no camera permission.
  expect(requests.filter((u) => /camera|aruco|getusermedia/i.test(u))).toEqual([]);
  await expect(page.getByTestId('lesson-progress')).toHaveText('Step 1 of 5: Run a healthy order');

  // 1. Healthy order.
  await press(page, 'Submit order');
  await expect(page.getByLabel('Queue contents')).toContainText('order-1');
  await expect(page.getByTestId('lesson-healthy')).not.toContainText('done');
  await press(page, 'Advance one tick');
  await press(page, 'Advance one tick');
  await expect(page.getByTestId('lesson-healthy')).toContainText('done');
  await expect(page.getByTestId('queue-empty')).toBeVisible();

  // 2. Database down.
  await press(page, 'Take Database down');
  await expect(page.getByTestId('status-database')).toContainText('DOWN');
  await expect(page.getByTestId('lesson-db-down')).toContainText('done');

  // 3. Submit and observe queued retry.
  await press(page, 'Submit order', 'Space');
  await press(page, 'Advance one tick');
  await press(page, 'Advance one tick');
  await expect(page.getByTestId('lesson-queued-retry')).toContainText('done');
  await expect(page.getByLabel('Queue contents')).toContainText('order-2');
  await expect(page.getByRole('list', { name: 'Event timeline' })).toContainText('order-2 could not be saved');
  await expect(page.getByRole('list', { name: 'Event timeline' })).toContainText('order-2 will retry');

  // 4. Restore the Database.
  await press(page, 'Restore Database');
  await expect(page.getByTestId('status-database')).toContainText('UP');
  await expect(page.getByTestId('lesson-restore')).toContainText('done');

  // 5. Advance until the queued order is saved, then confirm exactly-once.
  for (let i = 0; i < 8; i++) {
    if (await page.getByTestId('queue-empty').isVisible()) break;
    await press(page, 'Advance one tick');
  }
  await expect(page.getByTestId('queue-empty')).toBeVisible();
  await press(page, 'Resubmit last order');
  await expect(page.getByRole('list', { name: 'Event timeline' })).toContainText('order-2 duplicate ignored, nothing saved twice');
  await expect(page.getByTestId('lesson-exactly-once')).toContainText('done');
  await expect(page.getByTestId('lesson-progress')).toHaveText('Lesson complete.');
  const saved = page.getByRole('list', { name: 'Event timeline' }).getByText('order-2 saved to the Database');
  await expect(saved).toHaveCount(1);

  // Replay uses the same engine and ends equal to the live state.
  await press(page, 'Start replay');
  await expect(page.getByTestId('replay-status')).toContainText('Replay position 0 of');
  await expect(page.getByTestId('timeline-empty')).toBeVisible();
  const total = Number(/of (\d+)/.exec((await page.getByTestId('replay-status').textContent()) ?? '')![1]);
  for (let i = 1; i <= total; i++) {
    await press(page, 'Replay next event');
    await expect(page.getByTestId('replay-status')).toContainText(`Replay position ${i} of ${total}`);
  }
  await expect(page.getByTestId('replay-status')).toContainText('Replayed state matches live state.');
  await expect(page.getByTestId('live-region')).toContainText('Replay:');
  await press(page, 'Exit replay');
  await expect(page.getByTestId('replay-status')).toHaveCount(0);
  await expect(page.getByTestId('lesson-progress')).toHaveText('Lesson complete.');
});

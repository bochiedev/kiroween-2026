import { expect, test } from '@playwright/test';

test('landing has one h1, one main and an ENTER THE LAB link to the lab', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
  const cta = page.getByRole('link', { name: 'ENTER THE LAB' });
  await expect(cta).toHaveAttribute('href', '/lab?mode=digital');
  await expect(page.locator('svg.portal')).toHaveAttribute('aria-hidden', 'true');
  const h = (await cta.boundingBox())!.height;
  expect(h).toBeGreaterThanOrEqual(44);
});

test('CTA plays one transition of 1000 to 1500 ms, then opens the lab', async ({ page }) => {
  await page.goto('/');
  const cta = page.getByRole('link', { name: 'ENTER THE LAB' });
  const start = Date.now();
  await cta.click();
  await expect(page.locator('main.portal-entering')).toHaveCount(1);
  await expect(page).toHaveURL(/\/lab\?mode=digital$/);
  const elapsed = Date.now() - start;
  await page.getByRole('heading', { name: 'PaperFault Lab' }).waitFor();
  expect(elapsed).toBeGreaterThanOrEqual(1000);
  expect(elapsed).toBeLessThanOrEqual(2500); // 1200 ms timer plus click and polling overhead
});

test('second activation during the transition does not navigate twice', async ({ page }) => {
  await page.goto('/');
  const cta = page.getByRole('link', { name: 'ENTER THE LAB' });
  await page.evaluate(() => {
    (window as unknown as { __pushes: number }).__pushes = 0;
    const orig = history.pushState.bind(history);
    history.pushState = (...a: Parameters<History['pushState']>) => {
      (window as unknown as { __pushes: number }).__pushes++;
      orig(...a);
    };
  });
  await cta.dispatchEvent('click');
  await cta.dispatchEvent('click');
  await expect(page).toHaveURL(/\/lab/);
  await page.getByRole('heading', { name: 'PaperFault Lab' }).waitFor();
  expect(await page.evaluate(() => (window as unknown as { __pushes: number }).__pushes)).toBe(1);
});

test('keyboard: Tab to the CTA and Enter opens the lab', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'ENTER THE LAB' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/lab\?mode=digital$/);
});

test('direct /lab plays no portal animation and has no landing', async ({ page }) => {
  await page.goto('/lab?mode=digital');
  await page.getByRole('heading', { name: 'PaperFault Lab' }).waitFor();
  await expect(page.locator('.portal-entering')).toHaveCount(0);
  await expect(page.locator('svg.portal')).toHaveCount(0);
});

test('landing does not load the lab or flow chunks before the CTA is used', async ({ page }) => {
  const urls: string[] = [];
  page.on('request', (r) => urls.push(r.url()));
  await page.goto('/');
  await page.getByRole('heading', { level: 1 }).waitFor();
  expect(urls.filter((u) => /FlowGraph|Lab-|camera|aruco/i.test(u))).toEqual([]);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('CTA navigates immediately with no transition, rings do not spin', async ({ page }) => {
    await page.goto('/');
    const ring = page.locator('.ring-a');
    expect(await ring.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    await page.getByRole('link', { name: 'ENTER THE LAB' }).click();
    await expect(page.locator('main.portal-entering')).toHaveCount(0);
    await expect(page).toHaveURL(/\/lab\?mode=digital$/);
    await page.getByRole('heading', { name: 'PaperFault Lab' }).waitFor();
  });
});

test('control: without reduced motion the rings do animate', async ({ page }) => {
  await page.goto('/');
  const name = await page.locator('.ring-a').evaluate((el) => getComputedStyle(el).animationName);
  expect(name).not.toBe('none');
});

test.describe('360px layout', () => {
  test.use({ viewport: { width: 360, height: 740 } });
  test('no horizontal scroll and the CTA is inside the viewport without scrolling', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const box = (await page.getByRole('link', { name: 'ENTER THE LAB' }).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(360);
    expect(box.y + box.height).toBeLessThanOrEqual(740);
  });
});

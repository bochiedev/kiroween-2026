import { createRequire } from 'node:module';
import { expect, test, type Page } from '@playwright/test';

const require = createRequire(import.meta.url);
const { AR } = require('js-aruco2') as { AR: { Dictionary: new (n: string) => { codeList: string[] } } };
const CARD_GRIDS: Record<number, string> = Object.fromEntries([0, 1, 2, 3].map((id) => [id, new AR.Dictionary('ARUCO').codeList[id]]));


/** Replaces getUserMedia with a counter. `mode` picks the outcome. Never touches real hardware. */
async function stubCamera(page: Page, mode: 'denied' | 'none' | 'unsupported' | 'canvas') {
  await page.addInitScript((m) => {
    const w = window as unknown as { __gum: number; __drawCards?: (ids: number[]) => void };
    w.__gum = 0;
    if (m === 'unsupported') {
      Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
      return;
    }
    const fail = (name: string) => () => {
      w.__gum += 1;
      return Promise.reject(Object.assign(new Error(name), { name }));
    };
    let impl: () => Promise<MediaStream>;
    if (m === 'denied') impl = fail('NotAllowedError');
    else if (m === 'none') impl = fail('NotFoundError');
    else {
      // Synthetic camera: a canvas stream that shows the four ArUco cards drawn from the page's own grid data.
      impl = () => {
        w.__gum += 1;
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 640;
        (window as unknown as { __cam: HTMLCanvasElement }).__cam = canvas;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 640, 640);
        const stream = canvas.captureStream(30);
        w.__drawCards = (ids: number[]) => {
          const cards = (window as unknown as { __cards: Record<number, string> }).__cards;
          ctx.fillStyle = '#808080';
          ctx.fillRect(0, 0, 640, 640);
          ids.forEach((id) => {
            const grid = cards[id];
            const ox = (id % 2) * 320 + 10;
            const oy = Math.floor(id / 2) * 320 + 10;
            const u = 300 / 9;
            ctx.fillStyle = '#fff';
            ctx.fillRect(ox, oy, 300, 300);
            ctx.fillStyle = '#000';
            ctx.fillRect(ox + u, oy + u, u * 7, u * 7);
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 25; i++) if (grid[i] === '1') ctx.fillRect(ox + (2 + (i % 5)) * u, oy + (2 + Math.floor(i / 5)) * u, u + 0.5, u + 0.5);
          });
        };
        w.__drawCards([]);
        return Promise.resolve(stream);
      };
    }
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: impl }, configurable: true });
  }, mode);
}

const gum = (page: Page) => page.evaluate(() => (window as unknown as { __gum: number }).__gum);

test('landing page and digital lab never request the camera or load camera chunks', async ({ page }) => {
  await stubCamera(page, 'denied');
  const urls: string[] = [];
  page.on('request', (r) => urls.push(r.url()));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  await page.goto('/lab?mode=digital');
  await expect(page.getByRole('heading', { name: 'PaperFault Lab' })).toBeVisible();
  expect(await gum(page)).toBe(0);
  expect(urls.filter((u) => /CameraPanel|adapter|aruco/i.test(u))).toEqual([]);
  expect(urls.length).toBeGreaterThan(0);
});

test('physical mode asks for no camera until the start button is clicked, and loads detection only then', async ({ page }) => {
  await stubCamera(page, 'denied');
  const urls: string[] = [];
  page.on('request', (r) => urls.push(r.url()));
  await page.goto('/lab?mode=physical');
  await expect(page.getByRole('button', { name: 'Start camera' })).toBeVisible();
  await expect(page.getByText('Implemented, not hardware-verified.')).toBeVisible();
  expect(await gum(page)).toBe(0);
  expect(urls.filter((u) => /adapter|aruco/i.test(u))).toEqual([]);
  await page.getByRole('button', { name: 'Start camera' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'permission was denied' })).toBeVisible();
  expect(await gum(page)).toBe(1);
});

const cases = [
  { mode: 'denied', text: 'permission was denied' },
  { mode: 'none', text: 'No camera was found' },
  { mode: 'unsupported', text: 'cannot use a camera here' },
] as const;

for (const c of cases) {
  test(`failure "${c.mode}" shows its own message and a working link to the Digital Lab`, async ({ page }) => {
    await stubCamera(page, c.mode);
    await page.goto('/lab?mode=physical');
    await page.getByRole('button', { name: 'Start camera' }).click();
    await expect(page.getByRole('status').filter({ hasText: c.text })).toBeVisible();
    // The rest of the lab still works.
    await page.getByRole('button', { name: 'Submit order' }).click();
    await expect(page.getByLabel('Queue contents')).toContainText('order-1');
    await page.getByRole('link', { name: 'Continue in the Digital Lab' }).click();
    await expect(page).toHaveURL(/mode=digital/);
    await expect(page.getByRole('heading', { name: 'PaperFault Lab' })).toBeVisible();
  });
}

test('printable cards are served at /cards/', async ({ request }) => {
  const sheet = await request.get('/cards/index.html');
  expect(sheet.ok()).toBe(true);
  expect(await sheet.text()).toContain('Print instructions');
  for (const id of ['api', 'queue', 'worker', 'database']) {
    const r = await request.get(`/cards/${id}.svg`);
    expect(r.ok()).toBe(true);
    expect(r.headers()['content-type']).toContain('image/svg');
  }
});

test('synthetic camera: removing a card takes its component down, restoring it brings it back (no hardware)', async ({ page }) => {
  await page.addInitScript((grids) => {
    (window as unknown as { __cards: unknown }).__cards = grids;
  }, CARD_GRIDS);
  await stubCamera(page, 'canvas');
  await page.goto('/lab?mode=physical');
  await page.getByRole('button', { name: 'Start camera' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'The camera is on' })).toBeVisible();
  expect(await gum(page)).toBe(1);
  const draw = (ids: number[]) => page.evaluate((i) => (window as unknown as { __drawCards: (x: number[]) => void }).__drawCards(i), ids);
  // Keep redrawing so captureStream keeps producing frames.
  const timer = setInterval(() => void draw(current).catch(() => {}), 50);
  let current = [0, 1, 2, 3];
  try {
    await draw(current);
    await page.waitForTimeout(500);
    for (const id of ['api', 'queue', 'worker', 'database']) await expect(page.getByTestId(`status-${id}`)).toContainText('UP');
    current = [0, 1, 3];
    await expect(page.getByTestId('status-worker')).toContainText('DOWN', { timeout: 8000 });
    await expect(page.getByTestId('status-api')).toContainText('UP');
    current = [0, 1, 2, 3];
    await expect(page.getByTestId('status-worker')).toContainText('UP', { timeout: 8000 });
  } finally {
    clearInterval(timer);
  }
  await page.getByRole('button', { name: 'Stop camera' }).click();
  await expect(page.getByRole('button', { name: 'Start camera' })).toBeVisible();
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openLab } from './helpers';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function scan(page: import('@playwright/test').Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s)`);
  console.log(`axe ${label}: ${results.violations.length} violations, ${results.passes.length} rules passed`, summary);
  return results.violations;
}

test('axe: landing page / has no WCAG 2.1 A/AA violations', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /enter the lab/i }).waitFor();
  expect(await scan(page, '/')).toEqual([]);
});

test('axe: /lab?mode=digital has no WCAG 2.1 A/AA violations', async ({ page }) => {
  await openLab(page);
  expect(await scan(page, '/lab?mode=digital')).toEqual([]);
});

test('axe: /lab?mode=digital after Database down has no violations', async ({ page }) => {
  await openLab(page);
  await page.getByRole('button', { name: 'Take Database down' }).click();
  expect(await scan(page, '/lab?mode=digital (db down)')).toEqual([]);
});

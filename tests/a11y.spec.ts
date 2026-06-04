import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/',
  '/about',
  '/blog',
  '/blog/adguard-home',
  '/services/dns',
  '/contribute',
  '/terms',
  '/privacy',
  '/license',
  '/404',
];

async function preparePage(page) {
  await page.addInitScript(() => {
    document.cookie = 'cookieConsent=true; path=/; max-age=31536000; SameSite=Lax';
  });

  await page.route('https://monitor.dns.hapara.fail/', async (route) => {
    await route.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' });
  });
  await page.route('https://monitor.dns2.hapara.fail/', async (route) => {
    await route.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' });
  });
}

async function checkA11y(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'])
    .analyze();

  expect(results.violations).toEqual([]);
}

test.describe('WCAG 2.2 AA checks', () => {
  for (const route of routes) {
    test(`axe scan passes on ${route}`, async ({ page }) => {
      await preparePage(page);
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main#main-content')).toBeVisible();
      await checkA11y(page);
    });
  }

  test('skip link moves focus to main content', async ({ page }) => {
    await preparePage(page);
    await page.goto('/');

    await page.keyboard.press('Tab');
    await expect(page.locator('a[href="#main-content"]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('navigation drawer is keyboard operable and traps focus', async ({ page }) => {
    await preparePage(page);
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /open navigation menu/i });
    await menuButton.focus();
    await page.keyboard.press('Enter');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: /main menu/i })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toBeFocused();
  });

  test('DNS modal exposes agreement and address steps accessibly', async ({ page }) => {
    await preparePage(page);
    await page.goto('/services/dns');

    const openButton = page.getByRole('button', { name: /view servers/i });
    await openButton.click();

    const dialog = page.getByRole('dialog', { name: /service agreement/i });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: /close modal/i })).toBeFocused();

    await page.getByLabel(/i agree to the terms/i).check();
    await page.getByRole('button', { name: /proceed/i }).click();
    await expect(page.getByRole('dialog', { name: /dns addresses/i })).toBeVisible();

    await checkA11y(page);

    await page.keyboard.press('Escape');
    await expect(openButton).toBeFocused();
  });

  test('DNS tabs support arrow, Home, and End navigation', async ({ page }) => {
    await preparePage(page);
    await page.goto('/services/dns');

    const firstTab = page.getByRole('tab', { name: /chromeos/i });
    await firstTab.focus();
    await page.keyboard.press('End');
    await expect(page.getByRole('tab', { name: /linux/i })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(firstTab).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: /windows/i })).toBeFocused();
  });

  test('blog search and topic chips expose state', async ({ page }) => {
    await preparePage(page);
    await page.goto('/blog');

    await page.getByLabel(/search/i).fill('dns');
    const firstChip = page.locator('.category-chip').first();
    await firstChip.click();
    await expect(firstChip).toHaveAttribute('aria-pressed', 'true');
    await checkA11y(page);
  });
});

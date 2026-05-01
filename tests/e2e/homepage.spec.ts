import { test, expect } from '@playwright/test';

test('homepage renders both real course cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /AI in Your Project/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Drag and Drop in React/i })).toBeVisible();
});

test('homepage shows at least one Coming soon placeholder', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Coming soon/i).first()).toBeVisible();
});

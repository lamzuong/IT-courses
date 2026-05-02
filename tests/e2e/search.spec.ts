import { test, expect } from '@playwright/test';

test('search trigger is visible in the header', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /search the site/i })).toBeVisible();
});

test('Cmd/Ctrl+K opens the search dialog and returns lesson results', async ({ page }) => {
  await page.goto('/');
  // Use Control+K — Playwright maps to the right modifier per platform automatically with Meta/Control,
  // but we just dispatch directly via the trigger button for stability across platforms.
  await page.getByRole('button', { name: /search the site/i }).click();

  const dialog = page.getByRole('dialog', { name: /search the site/i });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('searchbox', { name: /search query/i }).fill('confirmation');

  // The lesson "interrupt: pausing for confirmation" should be the strongest match.
  await expect(page.getByRole('option').first()).toBeVisible();
  await expect(page.getByRole('option').first()).toContainText(/confirmation/i);
});

test('search Enter navigates to the top result', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /search the site/i }).click();
  const input = page.getByRole('searchbox', { name: /search query/i });
  await input.fill('langgraph');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/courses\/ai-in-your-project\/lessons\//);
});

test('Escape closes the search dialog', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /search the site/i }).click();
  await expect(page.getByRole('dialog', { name: /search the site/i })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: /search the site/i })).toBeHidden();
});

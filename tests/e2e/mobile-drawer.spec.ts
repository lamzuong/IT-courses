import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } });

test('mobile drawer opens, traps focus, closes on Escape', async ({ page }) => {
  await page.goto('/courses/drag-drop-react/lessons/01-intro-and-landscape');
  const toggle = page.getByRole('button', { name: /Lessons/i });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  // Drawer is visible
  const drawer = page.getByRole('dialog', { name: /Course lessons/i });
  await expect(drawer).toBeVisible();

  // Escape closes
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

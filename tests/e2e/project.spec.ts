import { test, expect } from '@playwright/test';

test('project page renders title and walkthrough sections', async ({ page }) => {
  await page.goto('/courses/drag-drop-react/project');
  await expect(page.getByRole('heading', { level: 1, name: /Restaurant Table Booking Manager/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /State shape/i })).toBeVisible();
});

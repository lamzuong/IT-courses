import { test, expect } from '@playwright/test';

test('lesson page renders body, breadcrumb, sidebar, prev/next', async ({ page }) => {
  await page.goto('/courses/drag-drop-react/lessons/01-intro-and-landscape');
  await expect(page.getByRole('heading', { level: 1, name: /Intro & DnD landscape/i })).toBeVisible();
  await expect(page.getByRole('navigation', { name: /Breadcrumb/i })).toBeVisible();
  await expect(page.getByRole('navigation', { name: /Course lessons/i })).toBeVisible();
  await expect(page.getByRole('navigation', { name: /Lesson navigation/i })).toBeVisible();
});

test('lesson 404s for unknown slug', async ({ page }) => {
  const res = await page.goto('/courses/drag-drop-react/lessons/nope');
  expect(res?.status()).toBe(404);
});

import { test, expect } from '@playwright/test';

test('course detail renders title, parts, and final project card', async ({ page }) => {
  await page.goto('/courses/drag-drop-react');
  await expect(page.getByRole('heading', { level: 1, name: /Drag and Drop in React/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /Foundations/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /@dnd-kit/i })).toBeVisible();
  await expect(page.getByText(/Restaurant Table Booking Manager/i)).toBeVisible();
});

test('course detail returns 404 for unknown course', async ({ page }) => {
  const res = await page.goto('/courses/nonexistent');
  expect(res?.status()).toBe(404);
});

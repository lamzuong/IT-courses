import { test, expect } from '@playwright/test';

test('AI course agenda renders title, parts, and final project', async ({ page }) => {
  await page.goto('/courses/ai-in-your-project');
  await expect(page.getByRole('heading', { level: 1, name: /AI in Your Project/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /First conversations/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /LangGraph & confirmation/i })).toBeVisible();
  await expect(page.getByText(/AI Operator Console/i).first()).toBeVisible();
});

test('AI course returns 404 for unknown lesson', async ({ page }) => {
  const res = await page.goto('/courses/ai-in-your-project/lessons/nope');
  expect(res?.status()).toBe(404);
});

test.describe('desktop layout', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('AI course lesson page renders body, breadcrumb, sidebar, prev/next', async ({ page }) => {
    await page.goto('/courses/ai-in-your-project/lessons/01-what-this-teaches');
    await expect(page.getByRole('heading', { level: 1, name: /What this course teaches/i })).toBeVisible();
    await expect(page.getByRole('navigation', { name: /Breadcrumb/i })).toBeVisible();
    await expect(page.getByRole('navigation', { name: /Course lessons/i })).toBeVisible();
    await expect(page.getByRole('navigation', { name: /Lesson navigation/i })).toBeVisible();
  });
});

test('AI course project page renders demo and walkthrough', async ({ page }) => {
  await page.goto('/courses/ai-in-your-project/project');
  await expect(page.getByRole('heading', { level: 1, name: /AI Operator/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /State shape/i })).toBeVisible();
});

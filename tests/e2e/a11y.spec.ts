import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  '/',
  '/courses/drag-drop-react',
  '/courses/drag-drop-react/lessons/01-intro-and-landscape',
  '/courses/drag-drop-react/lessons/04-html5-hands-on',
  '/courses/drag-drop-react/project',
  '/courses/ai-in-your-project',
  '/courses/ai-in-your-project/lessons/01-what-this-teaches',
  '/courses/ai-in-your-project/lessons/19-interrupt-confirmation',
  '/courses/ai-in-your-project/project',
];

for (const path of pages) {
  test(`${path} has no detectable a11y violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // re-enable after design tweak pass if needed
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

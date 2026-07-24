import { test, expect } from '@playwright/test';

test('browse skills button navigates to skills page', async ({ page }) => {
  await page.goto('/');
  // click the call to action that clearly leads to skills
  const cta = page.getByRole('link', { name: 'Browse skills', exact: true });
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(page).toHaveURL(/\/skills/);
});

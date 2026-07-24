import { test, expect } from '@playwright/test';

test('home page loads and nav links exist', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SkillSwap/i);
  const skillsLink = page.getByRole('link', { name: 'Skills', exact: true });
  await expect(skillsLink).toBeVisible();
});

// quick smoke: navigate to skills page
test('navigate to skills page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Skills', exact: true }).click();
  await expect(page).toHaveURL(/\/skills/);
});

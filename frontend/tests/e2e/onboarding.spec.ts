import { test, expect } from '@playwright/test';

test.describe('Onboarding Journey', () => {
  test('redirects to login when unauthenticated', async ({ page }) => {
    // This assumes hitting any protected route will redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});

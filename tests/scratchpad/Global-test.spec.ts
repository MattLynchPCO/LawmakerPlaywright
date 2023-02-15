import { test, expect } from '@playwright/test';

test('First global Lawmaker test', async ({ page }) => {

  await page.goto('/');

});
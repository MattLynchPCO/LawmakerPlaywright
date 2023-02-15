import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {

  await page.goto('https://lawmaker.dev.legislation.gov.uk/');

  await page.getByText('Forgot password?').click();

  await page.locator('[data-test="username-input"]').click();

  await page.locator('[data-test="username-input"]').fill('tesname');

  await page.getByRole('button', { name: 'Send Code' }).click();

  await page.getByRole('heading', { name: 'Reset your password' }).click({
    button: 'right'
  });

  await page.getByRole('heading', { name: 'Reset your password' }).click();

  await page.getByRole('button', { name: 'Submit' }).click();

  await page.getByText('Required String parameter \'pw\' is not present').click();

});
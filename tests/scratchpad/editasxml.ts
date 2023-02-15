import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {

  await page.goto('https://lawmaker.dev.legislation.gov.uk/');

  await page.locator('input[name="username"]').click();

  await page.locator('input[name="username"]').fill('testing.automation.hoc');

  await page.locator('input[name="username"]').press('Tab');

  await page.locator('input[name="password"]').fill('LawmakerTA17');

  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('https://lawmaker.dev.legislation.gov.uk/');

  await page.getByPlaceholder('Filter by project title...').click();

  await page.getByPlaceholder('Filter by project title...').fill('3577');

  await page.locator('button:has-text("Open")').click();
  await expect(page).toHaveURL('https://lawmaker.dev.legislation.gov.uk/project/6672d2eb-0060-4ec3-bb52-6872a6d1cf02');

  const [page1] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('row', { name: 'Show working version snapshots Inline edit Last modified: 13 January 2023 at 23:38:00 - testuser1.hoc - HoC Open document in editor Actions dropdown' }).getByRole('button', { name: 'Open document in editor' }).nth(1).click()
  ]);

  await page1.frameLocator('#editor_iframe').getByRole('button', { name: 'Document ▼' }).click();

  await page1.frameLocator('#editor_iframe').getByText('Edit as XML').click();

  await page1.frameLocator('#editor_iframe').frameLocator('#text-mode-iframe').getByText(/"varPassedDate"/).click();

  await page1.frameLocator('#editor_iframe').frameLocator('#text-mode-iframe').getByRole('textbox').press('Control+a');

  await page1.frameLocator('#editor_iframe').frameLocator('#text-mode-iframe').getByRole('textbox').press('Control+c');

  await page1.frameLocator('#editor_iframe').getByRole('button', { name: 'Switch to Author mode' }).click();

});
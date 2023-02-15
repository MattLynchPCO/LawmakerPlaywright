import { test, expect } from '@playwright/test';
import { Login } from '../POM/login';
var totp = require("totp-generator");

test('First Lawmaker test', async ({ page }) => {

  const secret = "O6ME4LRNMGOF75U4M4Y2FJUEIMAF5KYEF3VOUSW3XOAJXLNBLHRQ";
  const login = new Login(page);
  await login.login("TestUser1.pco","LawmakerTA17", secret);

   await page.getByPlaceholder('Filter by project title...').click();

  await page.getByPlaceholder('Filter by project title...').fill('testautomation (Scotland)');

  await page.locator('button:has-text("Open")').first().click();

});
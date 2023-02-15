// login.ts
import { expect, Locator, Page } from '@playwright/test';
var totp = require("totp-generator");
import path from 'node:path';

export class Login {
  readonly page: Page;
  readonly username:Locator;
  readonly password:Locator;
  readonly signIn:Locator;
  readonly MFAcode:Locator;
  readonly MFAcontinue:Locator;
  readonly forgotPasswordLink:Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.locator('input[name="username"]');
    this.password = page.locator('input[name="password"]');
    this.signIn = page.getByRole('button', { name: 'Sign In' });
    this.MFAcode = page.getByPlaceholder('Enter your MFA code');
    this.MFAcontinue = page.getByRole('button', { name: 'Continue' });
    this.forgotPasswordLink = page.getByText('Forgot password?');
   
  }

  async goto() {
    await this.page.goto('/login');
    //try and catch the intermittent bug where you get an application error instead of login screen
    if (await this.page.getByText('Application Error').isVisible()){
      console.log('Encountered session issue when trying to log back in to Lawmaker.')
      this.page.getByRole('button', {name:'Ok'}).click();
    }
    await expect(this.page.locator('body')).toHaveText(/Sign in to Lawmaker/);
  }

  async login(uname: string, pword: string, secret: string) {
    
    await this.username.fill(uname);
    await this.password.fill(pword);
    await this.signIn.click();


    const mfaRequired = await Promise.race([
      this.page.getByText('Invalid username or password').first().waitFor().then(() => "fail"),
      this.page.getByText('Multi-factor Authentication').waitFor().then(() => "mfa"),
      this.page.getByRole('link', { name: 'Go to Dashboard Home' }).waitFor().then(() => "pass")
    ]);

    expect (mfaRequired!="fail", "Login failed").toBeTruthy();

    if (mfaRequired=="mfa") {

      //await expect (this.page.locator('body')).toHaveText(/Multi-factor Authentication/);
      const code = totp(secret);

      await this.MFAcode.fill(code);
      const navigationPromise = this.page.waitForNavigation();
      await this.MFAcontinue.click();
      await navigationPromise;
    } 

  }

  async forgotPassword() {

    await this.forgotPasswordLink.click();

  }
  
}
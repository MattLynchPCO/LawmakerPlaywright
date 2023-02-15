// lawmaker.ts
// fixtures and functions for use in Lawmaker tests generally

import { test as base, expect, Page, Browser, Locator, TestInfo } from '@playwright/test';
export { expect } from '@playwright/test';
import { Login } from './POM/login';
import path from 'node:path';
var fs = require('fs');

const userDir = "user-data";

// Page Object Model for the PCO user page.
class PcoPage {
  // Page signed in as PCO user.
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  static async create(browser: Browser, testInfo: TestInfo) {
   const page = await createOrgSession('pco', testInfo.parallelIndex, browser);
    return new PcoPage(page);
  }
}

// Page Object Model for the SP user page.
class SpPage {
  // Page signed in as "user".
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  static async create(browser: Browser, testInfo: TestInfo) {
    const page = await createOrgSession('sp', testInfo.parallelIndex, browser);
    return new PcoPage(page);
  }
}

// Page Object Model for the OPC user page.
class OpcPage {
  // Page signed in as PCO user.
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  static async create(browser: Browser, testInfo: TestInfo) {
   const page = await createOrgSession('opc', testInfo.parallelIndex, browser);
    return new PcoPage(page);
  }
}

// Declare the types of your fixtures.
type MyFixtures = {
  pcoPage: PcoPage;
  spPage: SpPage;
  opcPage: OpcPage;
};

// Extend base test by providing pcoPage and spPage
export const test = base.extend<MyFixtures>({
  pcoPage: async ({ browser }, use, testInfo) => {
    await use(await PcoPage.create(browser, testInfo));
  },
  spPage: async ({ browser }, use, testInfo) => {
    await use(await SpPage.create(browser, testInfo));
  },
  opcPage: async ({ browser }, use, testInfo) => {
    await use(await OpcPage.create(browser, testInfo));
  }
});

export async function createOrgSession (org: string, index: number, browser: Browser) {

  const userFileName = path.join(userDir, org + index + '-user.json');
  const sessionFileName = path.join(userDir, 'session-' + org + index + '.json');

    if (!fs.existsSync(sessionFileName)) {
      //no session file so log in from scratch
      //get user details from json file
      //each user file will have name like "pco1-user.json" and contain username, password and secret
      console.log("create new session " + sessionFileName + ": " + Date());
      let rawdata = fs.readFileSync(userFileName);
      let user = JSON.parse(rawdata);

      const context = await browser.newContext({ storageState: undefined});
      const page = await context.newPage();
      const login = new Login(page);
      console.log('Creating ' +org + index + ' session...');
      await login.goto();
      await login.login(user.username, user.password, user.secret);

      await page.context().storageState({ path: sessionFileName });
      console.log(org + index + ' session successfully created');
      return page;
    } else {
      console.log("create existing session " + sessionFileName + ": " + Date());
      const context = await browser.newContext({ storageState: sessionFileName });
      const page = await context.newPage();
      await page.goto('/');

      //check to see if user automatically re-logged in or taken to sign-in page
      //appears in "application error" cases that page is very briefly directed to dashboard first

      const loginRequired = await Promise.race([
        
        page.getByText('Application Error').waitFor({timeout:10000}).then(() => "login"),
        page.getByText('Sign in to Lawmaker').waitFor({timeout:10000}).then(() => "login"),
        page.getByText('Logged in').waitFor({timeout:10000}).then(()=> "continue"),
        
      // page.getByRole('button', { name: 'Go to Dashboard Home' }).waitFor({timeout:15000}).then(() => false),
        new Promise(resolve => setTimeout(resolve, 10000)).then(() => true)
      ]);
      
      if (loginRequired == "login") {
        //log back in
        await page.reload();
        let rawdata = fs.readFileSync(userFileName);
        let user = JSON.parse(rawdata);
        const login = new Login(page);
        console.log('Session expired so logging back in...');
        if (!await page.getByText("Sign in to Lawmaker").isVisible()) {
          await login.goto();
        }
        await login.login(user.username, user.password, user.secret);

        await page.context().storageState({ path: sessionFileName });
        console.log(org + index + ' session successfully reestablished');
      } else {
        console.log(org + index + ' session already active');
      };

    return page;
    }
}

/*
async function createOrgSession (org: string, index: number, browser: Browser) {

  const userFileName = path.join(userDir, org + index + '-user.json');
  const sessionFileName = path.join(userDir, 'session-' + org + index + '.json');

    if (!fs.existsSync(sessionFileName)) {
      //no session file so log in from scratch
      //get user details from json file
      //each user file will have name like "pco1-user.json" and contain username, password and secret
      console.log("create new session " + sessionFileName + ": " + Date());
      let rawdata = fs.readFileSync(userFileName);
      let user = JSON.parse(rawdata);

      const page = await browser.newPage({ storageState: undefined });
      const login = new Login(page);
      console.log('Creating ' +org + index + ' session...');
      await login.goto();
      await login.login(user.username, user.password, user.secret);

      await page.context().storageState({ path: sessionFileName });
      console.log(org + index + ' session successfully created');
      return page;
    } else {
      console.log("create existing session " + sessionFileName + ": " + Date());
      const context = await browser.newContext({ storageState: sessionFileName });
      const page = await context.newPage();
      await page.goto('/');

      //check to see if user automatically re-logged in or taken to sign-in page
      //appears in "application error" cases that page is very briefly directed to dashboard first

      const loginRequired = await Promise.race([
        
        page.getByText('Application Error').waitFor({timeout:10000}).then(() => "login"),
        page.getByText('Sign in to Lawmaker').waitFor({timeout:10000}).then(() => "login"),
        page.getByText('Logged in').waitFor({timeout:10000}).then(()=> "continue"),
        
      // page.getByRole('button', { name: 'Go to Dashboard Home' }).waitFor({timeout:15000}).then(() => false),
        new Promise(resolve => setTimeout(resolve, 10000)).then(() => true)
      ]);
      
      if (loginRequired == "login") {
        //log back in
        await page.reload();
        let rawdata = fs.readFileSync(userFileName);
        let user = JSON.parse(rawdata);
        const login = new Login(page);
        console.log('Session expired so logging back in...');
        if (!await page.getByText("Sign in to Lawmaker").isVisible()) {
          await login.goto();
        }
        await login.login(user.username, user.password, user.secret);

        await page.context().storageState({ path: sessionFileName });
        console.log(org + index + ' session successfully reestablished');
      } else {
        console.log(org + index + ' session already active');
      };

    return page;
    }
}


*/

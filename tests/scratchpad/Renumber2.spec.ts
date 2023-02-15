import { test, expect} from '../lawmaker';
import { chromium } from '@playwright/test';
import { Dashboard } from '../POM/dashboard';
import { ProjectTab } from '../POM/projectTab';
import {Login} from '../POM/login';

import path from "node:path";
import { Page } from '@playwright/test';
var fs = require('fs');

const userDir = "user-data";

const DataDir = "test-data";

test.describe('Renumber performance tests', ()=> {

  //Get all xml files in test data directory
  const testDataDir = path.join(DataDir,"Renumber performance tests")
  const allFiles = fs.readdirSync(testDataDir);
  const files = allFiles.filter( file => file.match(new RegExp(`.*\.(xml)`, 'ig')));
    
  //Set project title
  const projectTitle = 'Renumber tests' + Date.now();
  let projectCreated: boolean = false;
  let projectDeleted: boolean = false;

  test.beforeAll(async ({browser},testInfo) => {
    test.setTimeout(240000);
  
    //Create test project if it doesn't exist
    if (!projectCreated && testInfo.parallelIndex==0){
      const page = await createOrgSession('opc',testInfo.parallelIndex);
      const dashboard = new Dashboard(page);
      const editor = await dashboard.newProject(projectTitle, 'UK Public Bill');
      await editor.getByRole('button', { name: 'Close Editor' }).click();
      console.log ('Created test project: '+projectTitle);
      projectCreated = true;
      await page.close();
    } else {
      const page = await createOrgSession('opc',testInfo.parallelIndex);
      const dashboard = new Dashboard(page);
      await expect.poll(async () => {
        return dashboard.projectExists(projectTitle);
      }, {timeout: 60000, intervals: [1_000,5_000,10_000]}).toBeTruthy();
    }

  });

  test.afterAll(async({browser}, testInfo) => {
      
      test.setTimeout(240000);
      const page = await createOrgSession('opc',testInfo.parallelIndex);

      if (!projectDeleted) {
        const dashboard = new Dashboard(page);
        await dashboard.goto();
        await dashboard.deleteProjectByTitle(projectTitle);
        await page.close();
        console.log ('Deleted test project: '+projectTitle);
        projectDeleted=true;
      }
  });

  for ( const entry of files) {

    const fileName = entry.split('.')[0];

    test('Renumber - '+fileName, async ({browser}, testInfo) => {
      test.setTimeout(2400000);
      console.log("test start: " + Date());
      const page = await createOrgSession('opc',testInfo.parallelIndex);

      const editor = await test.step ('setup', async () =>{
        const dashboard = new Dashboard(page);
        const projectTab = new ProjectTab(page);
        await dashboard.goto();
        await expect.poll(async () => {
          return dashboard.projectExists(projectTitle);
        }, {
        
          timeout: 60000,
          intervals: [1_000,5_000,10_000]
        }).toBeTruthy();
        await dashboard.openProject(projectTitle);
       

        //upload xml of test doc
        await projectTab.uploadDocument("Pre-Introduction", fileName, testDataDir, fileName+'.xml');

        //open test doc
        const newPage = await projectTab.openVersion({folder:'Pre-Introduction', title: fileName});

        //wait for the Editor to be fully loadable and the toolbar to be clickable
        await newPage.frameLocator('#editor_iframe').getByRole('button', { name: 'Renumber Provisions (Alt+N)' }).click({trial:true});

        return newPage;
      });

      await test.step ('renumber', async () =>{
        //trigger renumber operation and wait for success message
        await editor.frameLocator('#editor_iframe').getByRole('button', { name: 'Renumber Provisions (Alt+N)' }).click();
        await editor.frameLocator('#editor_iframe').getByRole('button', { name: 'Whole document' }).click();
        await editor.getByText('Renumbering complete').waitFor();
      });

      await test.step ('tidy up', async () =>{
        //trigger renumber operation and wait for success message
        await editor.getByText('Close Editor').click();
        await editor.getByText('Discard changes').click();
        await page.close();
      });

    });
  }

 
  
  
  });

  async function createOrgSession (org: string, index: number) {

    const browser = await chromium.launch();
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
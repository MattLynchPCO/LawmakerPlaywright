import { test, expect } from '../lawmaker';
import { Dashboard } from '../POM/dashboard';
import { ProjectTab } from '../POM/projectTab';
import path from "node:path";
import { Page } from '@playwright/test';
import fs from "node:fs";

const DataDir = "test-data";

test.describe('Renumber performance tests', ()=> {

  //Get all xml files in test data directory
  const testDataDir = path.join(DataDir,"Renumber performance tests")
  const allFiles = fs.readdirSync(testDataDir);
  const files = allFiles.filter( file => file.match(new RegExp(`.*\.(xml)`, 'ig')));
    
  //Set project title
  let projectTitle: string = 'Renumber tests' + Date.now();
  let projectCreated: boolean = false;
  let projectDeleted: boolean = false;

  test.beforeAll(async ({opcPage}, testInfo) => {
    test.setTimeout(240000);
    projectTitle = projectTitle + testInfo.parallelIndex;
    const dashboard = new Dashboard(opcPage.page);
    if (!projectCreated){
      //Create test project
      projectCreated = true;
      const editor = await dashboard.newProject(projectTitle, 'UK Public Bill');
      await editor.getByRole('button', { name: 'Close Editor' }).click();
      console.log ('Worker ' + testInfo.parallelIndex + ' created test project: '+projectTitle);
      
    } else {
      //wait for test project to be created before proceeding
      expect(false).toBeTruthy();
      await expect.poll(async () => {
        return dashboard.projectExists(projectTitle);
      }, {
        timeout: 60000,
        intervals: [1_000,5_000,10_000]
      }).toBeTruthy();
    }

  });

  test.afterAll(async({opcPage, browser}, testInfo) => {

    const userDir = "user-data";
    const sessionFileName = path.join(userDir, 'session-' + "opc" + testInfo.parallelIndex + '.json');
    const page = await browser.newPage({ storageState: sessionFileName});

        const dashboard = new Dashboard(page);
        await dashboard.goto();
        await dashboard.deleteProjectByTitle(projectTitle);
        await page.close();
        console.log ('Deleted test project: '+projectTitle);

  });

  for ( const entry of files) {

    const fileName = entry.split('.')[0];

    test('Renumber - '+fileName, async ({ opcPage }, testInfo) => {
      test.setTimeout(2400000);
      console.log("test start: " + Date());

      const editor = await test.step ('setup', async () =>{
        const dashboard = new Dashboard(opcPage.page);
        const projectTab = new ProjectTab(opcPage.page);
        await dashboard.goto();
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
      });

      await opcPage.page.close();

    });
  }
});
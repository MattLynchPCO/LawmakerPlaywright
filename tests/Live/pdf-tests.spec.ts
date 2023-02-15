import { test, expect } from '../lawmaker';
import { Dashboard } from '../POM/dashboard';
import { ProjectTab } from '../POM/projectTab';
import fs from 'fs';
import path from 'path';
import decompress from "decompress";
import comparePdf from "pdf-visual-compare";

const DataDir = "test-data";



test.describe("Scottish Bill PDF tests", () => {
 
  let projectTitle: string;
  const testDataDir = path.join(DataDir,"SP-PDF")

  //Get all xml files in test data directory
  const allFiles = fs.readdirSync(testDataDir);
  const files = allFiles.filter( file => file.match(new RegExp(`.*\.(xml)`, 'ig')));


  test.beforeAll(async ({pcoPage}, testInfo) => {
    test.setTimeout(120000);

    //Set project title
    projectTitle = 'Scottish Bill PDF tests ' + Date.now();

    //Create test project
    const dashboard = new Dashboard(pcoPage.page);
    const editor = await dashboard.newProject(projectTitle, 'Scottish Public Bill');
    await editor.getByRole('button', { name: 'Close Editor' }).click();

  });

    test.afterAll(async({pcoPage, browser}, testInfo) => {
      
      test.setTimeout(120000);
      const dashboard = new Dashboard(pcoPage.page);
      await dashboard.goto();
      await dashboard.deleteProjectByTitle(projectTitle);
      await pcoPage.page.close();
    });

  for ( const entry of files) {

    const fileName = entry.split('.')[0];

    test('SP PDF '+fileName, async ({ pcoPage }, testInfo) => {
      test.setTimeout(120000);
      const dashboard = new Dashboard(pcoPage.page);
      const projectTab = new ProjectTab(pcoPage.page);

      await dashboard.goto();
      await dashboard.openProject(projectTitle);

      //upload xml of test doc
      await projectTab.uploadDocument("Pre-Introduction", fileName, testDataDir, fileName+'.xml');

      //generate PDF of test doc
      const pdf = await projectTab.generatePDF({folder:"Pre-Introduction", title:fileName}, {lineNumbering:true, sidelining:true, TrackedChanges:'showChangesApplied'});
      await pdf.close();

      //download zip file containing PDF
      await projectTab.downloadZip({folder:"Pre-Introduction", title: fileName, snapshot: {name: 'PDF', index: 1}}, testInfo.outputDir, 'temp.zip');
      
      //unzip it using decompress npm package
      await decompress(path.join(testInfo.outputDir,'temp.zip'), testInfo.outputDir);

      //compare with reference copy using pdf-visual-compare npm package
      if (fs.existsSync(path.join(testDataDir,fileName+'.pdf'))) {
        console.log(`Comparing PDFs of ${fileName}...`);
        const result: boolean = await comparePdf(path.join(testInfo.outputDir,projectTitle+'.pdf'),
                                                path.join(testDataDir,fileName+'.pdf'),
                                                {diffsOutputFolder: testInfo.outputDir,
                                                  pdfToPngConvertOptions: {viewportScale:1.0}
                                                });
        console.log('Comparison result: '+result);
        expect (result, "The PDFs do not match").toBeTruthy();
      } else {
        console.log('Snapshot PDF does not exist for: ' + fileName + ' so copying output PDF to test data folder...');
        fs.copyFileSync(path.join(testInfo.outputDir, projectTitle + ".pdf"), path.join(testDataDir,fileName+'.pdf'));
      }

     // await pcoPage.page.close();
    });

  }


});

test.describe("UK Bill PDF tests", () => {
 
  let projectTitle: string;
  const testDataDir = path.join(DataDir,"UK-PDF")

  //Get all xml files in test data directory
  const allFiles = fs.readdirSync(testDataDir);
  const files = allFiles.filter( file => file.match(new RegExp(`.*\.(xml)`, 'ig')));


  test.beforeAll(async ({opcPage}, testInfo) => {
    test.setTimeout(120000);

    //Set project title
    projectTitle = 'UK Bill PDF tests ' + Date.now();

    //Create test project
    const dashboard = new Dashboard(opcPage.page);
    const editor = await dashboard.newProject(projectTitle, 'UK Public Bill');
    await editor.getByRole('button', { name: 'Close Editor' }).click();

  });

    test.afterAll(async({opcPage, browser}, testInfo) => {
      
      test.setTimeout(120000);
      const dashboard = new Dashboard(opcPage.page);
      await dashboard.goto();
      await dashboard.deleteProjectByTitle(projectTitle);
      await opcPage.page.close();
    });

  for ( const entry of files) {

    const fileName = entry.split('.')[0];

    test('UK PDF '+fileName, async ({ opcPage }, testInfo) => {
      test.setTimeout(240000);
      const dashboard = new Dashboard(opcPage.page);
      const projectTab = new ProjectTab(opcPage.page);

      await dashboard.goto();
      await dashboard.openProject(projectTitle);

      //upload xml of test doc
      await projectTab.uploadDocument("Pre-Introduction", fileName, testDataDir, fileName+'.xml');

      //generate PDF of test doc
      const pdf = await projectTab.generatePDF({folder:"Pre-Introduction", title:fileName}, {lineNumbering:true});
      await pdf.close();

      //download zip file containing PDF
      await projectTab.downloadZip({folder:"Pre-Introduction", title: fileName, snapshot: {name: 'PDF', index: 1}}, testInfo.outputDir, 'temp.zip');
      
      //unzip it using decompress npm package
      await decompress(path.join(testInfo.outputDir,'temp.zip'), testInfo.outputDir);

      //compare with reference copy using pdf-visual-compare npm package
      if (fs.existsSync(path.join(testDataDir,fileName+'.pdf'))) {
        console.log(`Comparing PDFs of ${fileName}...`);
        const result: boolean = await comparePdf(path.join(testInfo.outputDir,projectTitle+'.pdf'),
                                                path.join(testDataDir,fileName+'.pdf'),
                                                {diffsOutputFolder: testInfo.outputDir,
                                                  pdfToPngConvertOptions: {viewportScale:1.0}
                                                });
        console.log('Comparison result: '+result);
        expect (result, "The PDFs do not match").toBeTruthy();
      } else {
        console.log('Snapshot PDF does not exist for: ' + fileName + ' so copying output PDF to test data folder...');
        fs.copyFileSync(path.join(testInfo.outputDir, projectTitle + ".pdf"), path.join(testDataDir,fileName+'.pdf'));
      }

     // await pcoPage.page.close();
    });

  }


});

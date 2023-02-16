import { test, expect } from '../lawmaker';
import { ProjectTab } from '../POM/projectTab';
import { Editor } from '../POM/Editor';
import { Dashboard } from '../POM/dashboard';

test('test', async ({ pcoPage }) => {

  const dash = new Dashboard(pcoPage.page);
  await dash.openProject('Copy provisions Test (Scotland) Bill');
  const project = new ProjectTab(pcoPage.page);
  await project.newVersion("test","test doc");
  const editor = new Editor(await project.openVersion({folder:'test', title:"test doc"}));
  await editor.textEditor.getByText('body').click();
  await editor.insertElement("part");
  await new Promise(resolve => setTimeout(resolve, 500));
  await editor.insertElement("chapter");
  await new Promise(resolve => setTimeout(resolve, 500));
  await editor.insertElement("section");
  await new Promise(resolve => setTimeout(resolve, 500));
  await editor.generatePDF();

/*
  const [page3] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Open document in editor' }).nth(1).click()
  ]);

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Enter');

  await page3.frameLocator('#editor_iframe').getByPlaceholder('Search').fill('par');

  await page3.frameLocator('#editor_iframe').getByPlaceholder('Search').press('Enter');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Enter');

  await page3.frameLocator('#editor_iframe').getByPlaceholder('Search').fill('ch');

  await page3.frameLocator('#editor_iframe').getByPlaceholder('Search').press('Enter');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Enter');

  await page3.frameLocator('#editor_iframe').getByPlaceholder('Search').press('Enter');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Tab');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Tab');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Control+Enter');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Enter');

  await page3.frameLocator('#editor_iframe').getByPlaceholder('Search').fill('se');

  await page3.frameLocator('#editor_iframe').getByPlaceholder('Search').press('Enter');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Tab');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Tab');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Alt+[');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Enter');

  await page3.frameLocator('#editor_iframe').getByPlaceholder('Search').fill('ch');

  await page3.frameLocator('#editor_iframe').getByPlaceholder('Search').press('Enter');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Enter');

  await page3.frameLocator('#editor_iframe').getByPlaceholder('Search').press('Enter');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Tab');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Tab');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Control+Enter');

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Control+s');

  await page2.frameLocator('#editor_iframe').getByRole('button', { name: 'Tools ▼' }).click();

  await page2.frameLocator('#editor_iframe').getByText('Copy provisions between documents...').click();

  await page2.getByText('Push - Copy from this document to target document').click();

  await page2.locator('input[type="text"]').click();

  await page2.locator('span:has-text("Pre-Introduction / Second doc")').click();

  await page2.locator('label:has-text("1 - This is a section heading")').first().click();

  await page2.locator('label:has-text("2 - This is the second section")').click();

  await page2.getByRole('button', { name: 'Copy provisions' }).click();

  await page3.goto('https://lawmaker.dev.legislation.gov.uk/project/0567e2b7-7550-4616-9245-03561e7fb14b/edit/c46b4dba-4f8a-4a17-a050-8163f6272636');

  await page3.frameLocator('#editor_iframe').getByText('This is a section heading').nth(1).click();

  await page3.frameLocator('#editor_iframe').locator('#breadcrumbs-area').getByText('Section').click();

  await page3.frameLocator('#editor_iframe').getByText('This is the second section').click();

  await page3.frameLocator('#editor_iframe').locator('#breadcrumbs-area').getByText('Section').click();

  await page3.frameLocator('#editor_iframe').getByRole('textbox', { name: 'Editor' }).press('Control+s');

  await page2.frameLocator('#editor_iframe').getByRole('button', { name: 'Tools ▼' }).click();

  await page2.frameLocator('#editor_iframe').getByRole('menuitem', { name: 'Copy provisions between documents...' }).click();

  await page2.locator('label:has-text("All provisions")').click();

  await page2.getByText('Add comment').click();

  await page2.getByPlaceholder('Enter comment text').click();

  await page2.getByPlaceholder('Enter comment text').fill('Hello world!');

  await page2.getByRole('button', { name: 'Copy provisions' }).click();

  await page2.frameLocator('#editor_iframe').getByRole('button', { name: 'Tools ▼' }).click();

  await page2.getByText('Please select...').click();

  await page2.getByRole('option', { name: 'Pre-Introduction / Second doc' }).click();

  await page2.locator('label:has-text("All provisions")').first().click();

  await page2.getByText('Add comment').click();

  await page2.getByPlaceholder('Enter comment text').click();

  await page2.getByPlaceholder('Enter comment text').fill('Hello World!');

  await page2.getByRole('button', { name: 'Copy provisions' }).click();

  await page3.frameLocator('#editor_iframe').getByRole('button', { name: 'Undo (Ctrl+Z)' }).click();

  await page3.goto('https://lawmaker.dev.legislation.gov.uk/project/0567e2b7-7550-4616-9245-03561e7fb14b/edit/c46b4dba-4f8a-4a17-a050-8163f6272636');

  await page3.frameLocator('#editor_iframe').getByRole('option', { name: 'Commented by testuser1.pco 10:59 "Hello World!" Reply Edit Remove Mark as Done' }).click();

  await page3.frameLocator('#editor_iframe').locator('#review-item1 div').nth(2).click();

  await page3.frameLocator('#editor_iframe').locator('#review-item2').getByText('testuser1.pco10:59').click();

  await page3.frameLocator('#editor_iframe').locator('#review-item3').getByText('testuser1.pco10:59').click();
*/
});
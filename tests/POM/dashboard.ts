// dashboard.ts
import { expect, Locator, Page } from '@playwright/test';

export class Dashboard {
  readonly page: Page;
  readonly home:Locator;
  readonly toggleTileTableView:Locator;
  readonly projectTitleFilter:Locator;
  readonly favouritesButton:Locator;
  readonly sessionFilter:Locator;
  readonly projectTypeFilter:Locator;
  readonly createNew:Locator;
  readonly typeDropdown:Locator;
  readonly newProjectTitle:Locator;

  constructor(page: Page) {
    this.page = page;
    this.home = page.getByRole('link', { name: 'Go to Dashboard Home' });
    this.toggleTileTableView = page.getByRole('button', { name: 'Toggle Tile/Table View' });
    this.projectTitleFilter = page.locator('input[name="title"]');
    this.createNew = page.getByRole('button', { name: 'New' });
    this.typeDropdown = page.locator("//div[@role='listbox' and @name='Type']/i[@class = 'dropdown icon']");
    this.newProjectTitle = page.getByLabel('Title');
    this.favouritesButton = page.getByRole('button', { name: 'Favourites' });
    //this.sessionFilter = 
    this.projectTypeFilter = page.locator("//div[@role='listbox' and @name='projectType']/i[@class = 'dropdown icon']");
   
  }

  async goto() {
    await this.page.goto('/');
  }

  async filterProjects (name: string) {
    const navigationPromise1 = this.page.waitForLoadState('domcontentloaded');
    await this.projectTitleFilter.fill('');
    await navigationPromise1;
    const navigationPromise2 = this.page.waitForLoadState('domcontentloaded');
    await this.projectTitleFilter.fill(name);
    await navigationPromise2;
  }

  async openProject (title: string) {
    await this.filterProjects (title);
    await this.page.locator('div.card')
          .filter({ hasText: title })
          .locator('button:has-text("Open")').click();
  }

  async projectExists (title: string) {
    await this.filterProjects (title);
    return this.page.locator('div.card')
          .filter({ hasText: title })
          .locator('button:has-text("Open")').isVisible();
  }

  async newProject (title: string, type: "UK Public Bill" | "UK Private Bill" | "UK Hybrid Bill" | "Scottish Public Bill" | "Scottish Private Bill" | "Scottish Hybrid Bill" | "Statutory Intrument" | "Scottish Statutory Instrument", subtype?: string, procedure?: string) {
    await this.createNew.click();
    await this.typeDropdown.click();
    await this.page.locator(`span:has-text('${type}')`).click();
    if (subtype != undefined) {
      await this.page.locator("//div[@name='Sub Type']").click();
      await this.page.locator(`span:has-text('${subtype}')`).click();
    }
    await this.newProjectTitle.fill(title);
    if (procedure != undefined) {
      await this.page.locator("//div[@name = 'Procedure' and @role = 'combobox']").click();
      await this.page.locator(`span:has-text('${procedure}')`).click();
    }
    const popupPromise = this.page.waitForEvent('popup');
    await this.page.getByRole('button', { name: 'Create' }).click();
    const page2 = await popupPromise;
    return page2;
  }

  async setProjectFilter (type: "-All projects-" | "UK Bills/Acts" | "SP Bills/Acts" | "Statutory Instruments") {
    const navigationPromise = this.page.waitForLoadState('domcontentloaded');
    await this.projectTypeFilter.fill(type);
    await navigationPromise;
  }

  async deleteProjectByTitle (title: string) {
    //deletes a project using the UI only - won't work if project contains a significant version
    await this.filterProjects(title);
    await this.page.locator('div.card')
          .filter({ hasText: title })
          .getByRole('button', {name:'Delete Project'}).click();
    await this.page.getByRole('button', { name: 'Delete', exact: true }).click();


    //TODO - use api call to delete any project

    /* Katalon Function using api to delete any project
    static void deleteProjectByName (String projectTitle) {
		//This uses the api call to delete the project, thus enabling it to delete projects that contain significant versions

		//switch to list view
		WebUI.callTestCase(findTestCase('Helpers/Dashboard_Helpers/Show List view'), [:], FailureHandling.STOP_ON_FAILURE)

		//find test project by name
		WebUI.setText(findTestObject('Application/Dashboard/input_Project_search'), projectTitle)

		WebUI.waitForElementVisible(findTestObject('Application/Dashboard/a_First_row_title', [('title') : projectTitle]),
		10, FailureHandling.STOP_ON_FAILURE)

		//get projectId
		String projectId = WebUI.getText(findTestObject('Application/Dashboard/td_first_project_ID'))

		//delete project
		WebUI.comment('Deleting project ' + projectId)

		String token = WebUI.callTestCase(findTestCase('Helpers/API_Helpers/Get AuthToken'), [:], FailureHandling.STOP_ON_FAILURE)

		WebUI.callTestCase(findTestCase('Helpers/API_Helpers/Delete project'), [('deleteProjectID') : projectId, ('authToken') : token], FailureHandling.STOP_ON_FAILURE)
	  }
  */

  }
  
}

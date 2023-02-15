// projectTab.ts
import { expect, Locator, Page } from '@playwright/test';
import path from "node:path";

export type ActionOptions = {
	folder?: string;
	title?: string;
	snapshot?: Snapshot;
	significantVersionIndex?: number;
}
export type GeneratePdfOptions = {
	snapshot?: Snapshot;
    TrackedChanges?: "showTrackedChanges" | "showChangesApplied";
    sidelining?: boolean;
	lineNumbering?: boolean;
	insertFooters?: boolean;
	insertFooterNote?: string;
    showJrefsInMargin?: boolean;
	showJrefsWithinCrossReferences?: boolean;
	showAmendmentDnumbers?: boolean;
	showOriginInformaiton?: boolean;
	showReviewComments?: boolean;
	recordSnapshotVersion?: string;
};

export type DownloadZipOptions = {
	resolveDates?: boolean;
};

export type Snapshot = {
	name: string;
	index?: number;
}

export type Version = {
	folder?: string;
	title?: string;
	snapshot?: Snapshot;
	significantVersionIndex?: number;
}

export class ProjectTab {
  readonly page: Page;
  readonly home:Locator;
  readonly tab:Locator;
  readonly createNewButton:Locator;
  readonly uploadDocumentButton:Locator;
  readonly firstWorkingVersion:Locator;
  readonly generatePdfLineNumbering:Locator;
  readonly generatePdfSideLining:Locator;
  readonly generatePdfShowChangesApplied: Locator;

  

  constructor(page: Page) {
	//general locators
    this.page = page;
    this.home = page.getByRole('link', { name: 'Go to Dashboard Home' });
    this.tab = page.getByRole('link', { name: 'Project' });
    this.firstWorkingVersion = page.getByRole('button', { name: 'Open document in editor' }).first();

	//Generate PDF modal locators
	//this.generatePdfLineNumbering = page.getByText('Line numbering');
	this.generatePdfLineNumbering = page.locator('div.checkbox').filter({hasText:'Line numbering'});
	this.generatePdfSideLining = page.getByText('Side-lining');
	this.generatePdfShowChangesApplied = page.getByText('Show changes applied');
   
  }

  folderXpath (folder: string) {
		return `//label/span[text()='${folder}']/ancestor::div[1]`;
	}

  workingVersionXpath (folder?: string, name?: string) {
    let xpath: string;
	if (folder !=undefined) {
		xpath = `${this.folderXpath(folder)}/following-sibling::div//td[@class='workingVersion']/label/span[text()='${name}']/ancestor::td`;
	} else {
		xpath = `//td[contains(@class,'workingVersion')]/label/span[text()='v1']/ancestor::td`;
	};
	return xpath;
  }

  /*
	private String significantVersionXpath () {
		String xpath
		if (name != "") {
			xpath = "(//td[@class='significantVersion']//strong[text()='${name}'])[${Index}]/ancestor::td[@class='significantVersion']"
		} else {
			xpath = "//td[@class='significantVersion'][${Index}]"
		}
	}

*/

  async goto() {
    await this.tab.click();
  }

  async action ( version: Version, action: "Generate PDF" | "View PDF" | "Duplicate Version" | "Download ZIP File") {

	if (version.folder != undefined) {
		//action on working version
		await this.expandFolder(version.folder);

		let actionsMenuXpath: string;

		if (version.snapshot !=undefined) {
			//action is on snapshot of working version
			const snapshotToggleXpath = `${this.workingVersionXpath(version.folder,version.title)}/button`;
			await this.page.locator(snapshotToggleXpath).click();
			let index: number;
			if (version.snapshot.index != undefined) {
				index = version.snapshot.index;
			} else {
				index = 1;
			}
			const snapshotXpath = `(//td[@class='snapshotVersion' and ancestor::tbody/tr/td/label/span[text()='${version.title}']]/table/tbody/tr/td/strong[(text()='${version.snapshot.name}' or .='${version.snapshot.name}')])[${index}]`;
			actionsMenuXpath = `${snapshotXpath}/ancestor::td/following-sibling::td/div[@role='listbox']`;
		} else {
			//action is on main working version
			actionsMenuXpath = `${this.workingVersionXpath(version.folder, version.title)}/following-sibling::td/div[@role='listbox']`;
		}

    	const actionsMenuOptionXpath = `${actionsMenuXpath}//div[@role='option' and contains(., '${action}')]`;
   		await this.page.locator(actionsMenuXpath).click();
    	await this.page.locator(actionsMenuOptionXpath).click();
	} 

	if (version.significantVersionIndex != undefined) {
		//action is on significant version - TODO
	}
  }

  async expandFolder(folder:string) {
    // expand folder if necessary, based on value of @class attribute
    const classAttr = await this.page.locator(this.folderXpath(folder)).getAttribute('class');
    if (!classAttr?.includes('active')) {
      await this.page.locator(this.folderXpath(folder)).click();
    }
  }

  async openVersion (versionToOpen: Version) {

	let editorPage: Page = this.page;

	if (versionToOpen.folder != undefined) {
		//open working version
		await this.expandFolder(versionToOpen.folder);
		let controlCellXpath: string;

		if (versionToOpen.snapshot !=undefined) {
			//action is on snapshot of working version
			const snapshotToggleXpath = `${this.workingVersionXpath(versionToOpen.folder,versionToOpen.title)}/button`;
			await this.page.locator(snapshotToggleXpath).click();
			let index: number;
			if (versionToOpen.snapshot.index != undefined) {
				index = versionToOpen.snapshot.index;
			} else {
				index = 1;
			}
			const snapshotXpath = `(//td[@class='snapshotVersion' and ancestor::tbody/tr/td/label/span[text()='${versionToOpen.title}']]/table/tbody/tr/td/strong[(text()='${versionToOpen.snapshot.name}' or .='${versionToOpen.snapshot.name}')])[${index}]`;
			controlCellXpath = `${snapshotXpath}/ancestor::td/following-sibling::td`;
		} else {
			//action is on main working version
			controlCellXpath = `${this.workingVersionXpath(versionToOpen.folder, versionToOpen.title)}/following-sibling::td`;
		}

		const popupPromise = this.page.waitForEvent('popup');
		await this.page.locator(controlCellXpath).getByRole('button', { name: 'Open document in editor' }).first().click();
		editorPage = await popupPromise;

		//capture and click away the Auto-renumbering toastie
		if (await editorPage.locator('div[role="log"]:has-text("Auto-Renumbering:") i').first().isVisible()){
			await editorPage.locator('div[role="log"]:has-text("Auto-Renumbering:") i').first().click();
		}
		
	} 

	if (versionToOpen.significantVersionIndex != undefined) {
		//action is on significant version - TODO
	}

	return editorPage;

  }

  async openFirstWorkingVersion() {
    const popupPromise = this.page.waitForEvent('popup');
    await this.firstWorkingVersion.click();
    const page2 = await popupPromise;
    return page2;
  }
  
  async uploadDocument (folder: string, title: string, filePath: string, fileName: string) {

	//adding in a hard wait to see if we can avoid getting stuck here sometimes
	await new Promise(resolve => setTimeout(resolve, 500));

    await this.page.getByRole('button', { name: 'Upload Document' }).click();
    await this.page.locator('div[role="combobox"]:has-text("Please select...") i').click();
    await this.page.getByRole('option', { name: folder }).getByText(folder).click();
    await this.page.getByLabel('Version description').fill(title);
    const fs = require('fs');
    const fileContents = fs.readFileSync(path.join(filePath,fileName));
    await this.page.setInputFiles("input[type='file']", {
      name: fileName,
      mimeType:'text/xml',
      buffer: fileContents
    });
    await this.page.getByRole('button', { name: 'Upload' }).click();
  }

  async generatePDF (versionToPdf: Version, opts?: GeneratePdfOptions){
	//open modal
	await this.action(versionToPdf, "Generate PDF");

	//adding in a hard wait to see if we can avoid getting stuck here sometimes
	await new Promise(resolve => setTimeout(resolve, 1000));

	//set options
	if (opts?.lineNumbering) {
		await this.generatePdfLineNumbering.click();
	}
	if (opts?.sidelining) {
		await this.generatePdfSideLining.click();
	}

	if (opts?.TrackedChanges == "showChangesApplied") {
		await this.generatePdfShowChangesApplied.click();
	}
	
	//adding in a hard wait to see if we can ensure that settings are picked up
	await new Promise(resolve => setTimeout(resolve, 500));

	//generate PDF
	const popupPromise = this.page.waitForEvent('popup');
	await this.page.getByRole('button', { name: 'Generate' }).click();
	const popup = await popupPromise;

	//return tab containing PDF (not that it is much use for anything)
	return popup;
  }

  async downloadZip (versionToDownload: Version, savePath: string, saveFilename: string, opts?: DownloadZipOptions) {
	 //download zip file
	 await this.action(versionToDownload, 'Download ZIP File');

	 if (opts?.resolveDates != undefined) {
		//change option to resolve dates on download -TODO
	 }
	 const downloadPromise = this.page.waitForEvent('download');
	 await this.page.getByRole('button', { name: 'Download' }).click();
	 const download = await downloadPromise;

	 // Save downloaded file somewhere
	 await download.saveAs(path.join(savePath, saveFilename));
  }

  async newVersion (folder:string, versionDescription: string) {
	await this.page.getByRole('button', { name: 'New' }).click();
	//await this.page.getByText('Please select...').fill(folder);
	await this.page.getByRole('textbox', { name: 'Select a folder or type to create a new one' }).fill(folder);
	await this.page.getByRole('option', { name: RegExp(`${folder}`) }).click();  
	await this.page.getByLabel('Version Description').fill(versionDescription);
	await this.page.getByRole('button', { name: 'Create' }).click();
}
}


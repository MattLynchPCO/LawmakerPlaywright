// editor.ts
import { expect, Frame, FrameLocator, Locator, Page } from '@playwright/test';
//import path from "node:path";

export type GeneratePdfOptions = {
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

export class Editor {
  readonly page: Page;
  readonly editorIframe: FrameLocator;
  readonly textEditor: Locator;
  readonly closeButton: Locator;
  readonly discardChanges: Locator;
  readonly generatePdfLineNumbering:Locator;
  readonly generatePdfSideLining:Locator;
  readonly generatePdfShowChangesApplied: Locator;
  /*readonly home:Locator;
  readonly tab:Locator;
  readonly createNewButton:Locator;
  readonly uploadDocumentButton:Locator;
  readonly firstWorkingVersion:Locator;
  
*/
  

  constructor(page: Page) {
	//general locators
	
    this.page = page;

    //Generate PDF modal locators
    //this.generatePdfLineNumbering = page.getByText('Line numbering');
    this.generatePdfLineNumbering = page.locator('div.checkbox').filter({hasText:'Line numbering'});
    this.generatePdfSideLining = page.getByText('Side-lining');
    this.generatePdfShowChangesApplied = page.getByText('Show changes applied');
    this.editorIframe = page.frameLocator('#editor_iframe');
    this.textEditor = this.editorIframe.getByRole('textbox', { name: 'Editor' });
    this.closeButton = page.getByText('Close Editor');
    this.discardChanges = page.getByText('Discard changes');
	/*
    this.home = page.getByRole('link', { name: 'Go to Dashboard Home' });
    this.tab = page.getByRole('link', { name: 'Project' });
    this.firstWorkingVersion = page.getByRole('button', { name: 'Open document in editor' }).first();
	*/
   
  }

  async closeEditor () {
    await this.closeButton.click();
    await this.discardChanges.click();
  }

  async insertElement (name: string) {
    //inserts element into Editor using CCA
    //assumes cursor already in relevant place in document
    //need to add verification that element has been inserted
    await this.textEditor.press('Enter');
    await this.editorIframe.getByPlaceholder('Search').fill(name);
    await this.editorIframe.getByPlaceholder('Search').press('Enter');
  }

  async toolbarOption (menu: string, option: string) {
	
  }

  async generatePDF (opts?: GeneratePdfOptions){
    //open modal
    await this.editorIframe.getByRole('button', { name: 'Document ▼' }).click();
    await this.editorIframe.getByText('Generate PDF').click();
  
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

}
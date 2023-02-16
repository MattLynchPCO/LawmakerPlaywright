// editor.ts
import { FrameLocator, Locator, Page } from '@playwright/test';
import { GeneratePDF, GeneratePdfOptions } from './generatePDFmodal';

//import path from "node:path";

export class Editor {
  readonly page: Page;
  readonly editorIframe: FrameLocator;
  readonly textEditor: Locator;
  readonly closeButton: Locator;
  readonly discardChanges: Locator;

  constructor(page: Page) {

	  //general locators
    this.page = page;

    //Editor locators
    this.editorIframe = page.frameLocator('#editor_iframe');
    this.textEditor = this.editorIframe.getByRole('textbox', { name: 'Editor' });
    this.closeButton = page.getByText('Close Editor');
    this.discardChanges = page.getByText('Discard changes');
   
  }

  async closeEditor () {
    //TODO - add options to save changes or discard
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
	  //TODO
  }

  async generatePDF (opts?: GeneratePdfOptions){
    //open modal
    await this.editorIframe.getByRole('button', { name: 'Document ▼' }).click();
    await this.editorIframe.getByText('Generate PDF').click();
    //generate PDF
    const pdf=new GeneratePDF(this.page);
    return pdf.modal(opts);
    }

}
import { Locator, Page } from '@playwright/test';

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
  
  export class GeneratePDF {
    readonly page: Page;

    readonly generatePdfLineNumbering:Locator;
    readonly generatePdfSideLining:Locator;
    readonly generatePdfShowChangesApplied: Locator;
    readonly generateButton:Locator;
  
    constructor(page: Page) {
      this.page = page;
      this.generatePdfLineNumbering = page.locator('div.checkbox').filter({hasText:'Line numbering'});
      this.generatePdfSideLining = page.getByText('Side-lining');
      this.generatePdfShowChangesApplied = page.getByText('Show changes applied');
      this.generateButton = page.getByRole('button', { name: 'Generate' });
    }

    async modal (opts?: GeneratePdfOptions){
        //TODO - add in support for options other than sidelining and line numbering

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
        await this.generateButton.click();
        const popup = await popupPromise;
    
        //return tab containing PDF (not that it is much use for anything)
        return popup;
    }
  }
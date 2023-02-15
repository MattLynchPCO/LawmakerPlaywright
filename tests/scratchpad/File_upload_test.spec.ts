import { test, expect } from '@playwright/test';
import { Dashboard } from '../POM/dashboard';
import { ProjectTab } from '../POM/projectTab';

test('test', async ({ page }) => {

  const dashboard = new Dashboard(page);
  const projectTab = new ProjectTab(page);
  await dashboard.goto();
  const page1 = await dashboard.newProject("Upload Test 110123 Bill", 'UK Public Bill');
  await page1.getByRole('button', { name: 'Close Editor' }).click();
  await projectTab.uploadDocument("Pre-Introduction", "Upload test", "tests-data/", "output.xml");

});
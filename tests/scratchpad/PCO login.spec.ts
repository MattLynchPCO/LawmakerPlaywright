import { test, expect } from '../lawmaker';

test('PCO login', async ({ pcoPage }) => {

  await pcoPage.page.goto('https://lawmaker.dev.legislation.gov.uk/');

});
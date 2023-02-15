import { test, expect } from '../lawmaker';

test('OPC login', async ({ opcPage }) => {

  await opcPage.page.goto('https://lawmaker.dev.legislation.gov.uk/');

});
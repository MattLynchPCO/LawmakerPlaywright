import { test, expect } from '@playwright/test';

const APIUSERNAME = 'matthew.lynch.api';
const APIPASSWORD = 'ldapp20199';

// Request context is reused by all tests in the file.
let apiContext;

test.use({baseURL: 'https://lawmaker.dev.legislation.gov.uk/pdr/'});

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    // All requests we send go to this API endpoint.
    baseURL: 'https://lawmaker.dev.legislation.gov.uk/pdr/',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type' : 'application/x-www-form-urlencoded'
    },
  });
 const login = await apiContext.post('./login', {
    form: {
      username: APIUSERNAME,
      password: APIPASSWORD,
      ds: 'LEGI_PDR'
    }
  });
  expect(login.ok()).toBeTruthy();
  const respText = JSON.parse (await login.text());
  console.log("token: " + respText.token);
  apiContext = await playwright.request.newContext({
    extraHTTPHeaders: {
      baseURL: 'https://lawmaker.dev.legislation.gov.uk/pdr/',
      'Accept': 'application/json',
      'X-Auth-Token' : respText.token
    },
  });
  
})

test.afterAll(async ({ }) => {
    // Dispose all responses.
    await apiContext.dispose();
  });



  test('first api test', async ({ baseURL }) => {
    
    const newIssue = await apiContext.get(`${baseURL}ids?docTypes=ukpubb`);
    expect(newIssue.ok()).toBeTruthy();
    const idResponse = await newIssue.text();
    console.log(idResponse);
  
    
  });

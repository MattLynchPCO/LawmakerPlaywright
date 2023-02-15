// example.spec.ts
// Import test with our new fixtures.
import { test, expect } from '../lawmaker';

// Use adminPage and userPage fixtures in the test.
test('admin and user', async ({ pcoPage }) => {
  // ... interact with both adminPage and userPage ...
  await pcoPage.page.screenshot();
  
});
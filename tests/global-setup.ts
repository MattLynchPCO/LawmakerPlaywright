// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from "node:path";

const userDir = "user-data/staging";

async function globalSetup(config: FullConfig) {
  
  //Delete session files in user data directory before tests are run
  const allFiles = fs.readdirSync(userDir);
  const files = allFiles.filter( file => file.match(new RegExp(`session.*\.(json)`, 'ig')));

  for (const file of files) {
    fs.unlink(path.join(userDir,file), function(err) {
      if(err && err.code == 'ENOENT') {
          // file doens't exist
          console.info(file, "doesn't exist, won't remove it.");
      } else if (err) {
          // other errors, e.g. maybe we don't have enough permission
          console.error("Error occurred while trying to remove",file);
      } else {
          console.info(file, "removed");
      }
  });
  }
}

export default globalSetup;
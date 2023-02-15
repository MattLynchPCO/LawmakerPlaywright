# Playwright tests for Lawmaker
This repository contains the fruits of my playing around with Playwright to develop front-end tests for Lawmaker.

For these tests (and Lawmaker.ts in particular) to work, these tests require an additional folder at the root level called "user-data" containing a json doc for each user account that the tests use.

The filename should be: [org][index].json e.g. "pco0.json", "pco1.json", "opc0.json" etc.

The content of each json file should be:
```json
{"username":"",
"password": "",
"secret": ""}
```


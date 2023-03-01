# Playwright tests for Lawmaker
This repository contains the fruits of my playing around with Playwright to develop front-end tests for Lawmaker.

## Lawmaker.ts
This extends Playwright's test package to introduce organisation-specific fixtures. So far:
* pcoPage
* opcPage

But the plan was to extend them to all organisations.

Using these fixtures will create a browser session logged into with a user from that organisation.

User sessions are stored in json files to allow them to be reused between tests. Those sessions are stored in /user-data/ (see below).The worker index is used to select distinct users for each test that might be running in parallel, e.g. opc0 will be used by first worker, opc1 by second worker etc.

Much of the complexity here has been tryign to handle the various ways that things go wrong when the session is no longer current (e.g. the white screen of death or the application error on session timeout)

For these tests (and Lawmaker.ts in particular) to work, these tests require an additional folder at the root level called "user-data" containing a json doc for each user account that the tests use.

The filename should be: [org][index].json e.g. "pco0.json", "pco1.json", "opc0.json" etc.

The content of each json file should be:
```json
{"username":"",
"password": "",
"secret": ""}
```

The approach here to managing users and authentication is inspired by suggestions in Playwright documentation here: https://playwright.dev/docs/auth

## Page object model
Something like the page object model suggested in Playwright documentation (https://playwright.dev/docs/pom) seems like the right way to go but with further elaboration for the complexity of Lawmaker. Around the Editor, especially, there are likely to be a need for multiple classes.

As a start I created in /POM:
* login.ts - provides the Login class to handle logging in and MFA. Utilises totp-generator npm package for MFA.
* dashboard.ts - Dashboard class with methods for finding and opening projects
* projectTab.ts - ProjectTab class with methods for working with the project tab and working/signficant/snapshot versions on that tab
* editor.ts - Editor class with some initial methods for working in the Editor
* generatePDFmodal - GeneratePDF class with methods for selecting things in the Generate PDF modal (shared in Editor and Project tab)

Future extensions at a minimum:
* amendmentWorkspace.ts
* officialLists.ts

## Tests
So far, apart from playing around generally with Playwright, I've concentrated on building tests to compare PDF output and to measure renumber performance.

### Live/pdf-tests.spec.ts
Uses the XML files in `/test-data/SP-PDF` and `/test-data/UK-PDF` to generate PDFs and compare them against the same-named pdf files in the same folder.

Depends on decompress npm package to extract docs from zip file and pdf-visual-compare package to do PDF comparison.

The test creates test projects as necessary and then deletes them at the end.

### Live/renumber-tests.spec.ts
Uses the XML files in `/test-data/renumber performance tests` to run the renumber operation. I've used `test.step` to capture the actual renumber action as opposed to the setup and teardown so that it is possible to easily identify the performance of the renumber action in the report. The test creates test projects as necessary and then deletes them at the end.

## Issues and observations
Some of the issues I've run into so far and some observations:
* I still get hit by the flaky user account issue where login fails I think due to timeout rather than username/password being wrong - see SPT-502
* Because of complex pages and lazy-loading etc., it is can still be hard to work out when things are done before moving onto next step. For longer actions it can be difficult to identify when the action is actually complete (and problem is compounded when you can't guarantee a certain sequence of events, e.g. in some actions, hard to know whether the progress bar overlay or the success toastie will be the last thing to appear/disappear)
* Despite parallel running of tests, I'm still getting timeouts on browser launch when I try to run renumber-tests on large documents, i.e. it seems to be waiting for one test to complete before launching the browser for other test so times out.
* Running into various issues with modals, e.g. the Generate PDF modal, where changes (e.g. selecting some options in the modal) are not picked up by the main action (e.g. clicking "Generate") unless I put arbitrary delays in. Should be some way to get this to work consistently without hard waits but not sure whether it is a playwright issue or a Lawmaker issue.
* Ideally tests should all be capable of running in headerless mode but that doesn't always work. Need to account for more variable aspects of presentation in headerless mode (e.g. in the Editor, whether the structure view and side panels are extended or minimised). Generally, I think tests need to be pretty robust and rely on logical locators and proper sequencing to work in headerless mode.
* When you're just wanted to test Editor behaviour, getting data into the Editor can be tricky. It's ok for Bills and SIs because you can use the Upload Document feature on the project tab. But that doesn't extend to Act versions and it doesn't help if you want to test things relating to Amendment Lists. Having a quick way to get a document in the Editor (perhaps by accessing the api directly within the test) would make set-up for Editor tests much quicker when you don't care about other data in the project.
* Playwright's recorder seems to do a pretty good job of generating code which can then be used as the basis for a more robust test - still needs work if it is to work reliably sometimes or be used as part of parameterised tests but good nonetheless. Previous experience with Katalon's recorder was much poorer.
* Where work has been done to improve accessibility that generally makes writing tests much easier. Where elements are properly labelled and the HTML is used and structured semantically, it's just much easier to identify the locators quickly and reliably without resorting to hacks. Conversely where the HTML is not great in terms of semantic structure, the test code becomes more fiddly - a good example is the project tab which is an over-complicated series of nested tables/divs.
* It would probably be much easier to write tests if you are able to tweak the corresponding dev code as necessary, e.g. to fix lack of labels or to make sure actions do something definite when they complete that can easily be picked up by the tests. Doing the tests completely in isolation can be frustrating at times.
* From my experience in Katalon and now Playwright, I definitely think the best approach is build a library of helper functions/classes and then build tests from that. Adapting the Page Object Model suggested by Playwright seems a good approach and is similar to what I had started to do with Katalon (You can see the Katalon classes here - https://legi-project.teratext.leidos.com.au/bitbucket/projects/LDAP/repos/test-automation/browse/Keywords/lawmaker). Taking this approach means that in many cases updating the helper classes to reflect changes in the UI will be sufficient to ensure existing tests continue to pass.
* Good Lawmaker tests will probably involve mixing front-end testing with some api testing to make sure PDR is functioning appropriately. Might also want to use some direct Rest API calls in tests to short-circuit some of the setup required for tests.

const cheerio = require('cheerio');
const dateUtil = require('../util/dateUtil');

module.exports = {
  getApplications: async (page, selectedTerm) => {
    // Navigate to the dashboard
    await page.goto('https://waterlooworks.uwaterloo.ca/myAccount/dashboard.htm');
    const postingsButtonIdentifier =
      '#displayStudentMyPostingsApplications > a';
    await page.waitForSelector(postingsButtonIdentifier, {
      visible: true,
      timeout: 3000,
    });

    // Click on the postings tab
    await page.$eval(postingsButtonIdentifier, (postingsButton) =>
      postingsButton.click());

    // Pull out the action code from the page
    const viewButtonIdentifier = '.btn.btn-mini.btn-primary.pull-right';
    await page.waitForSelector(viewButtonIdentifier, {
      visible: true,
      timeout: 3000,
    });

    const actionCode = await page.evaluate((viewButtonIdentifier) => {
      return document.querySelector(viewButtonIdentifier).onclick.toString()
        .match('_-[a-zA-Z0-9_-]*')[0];
    }, viewButtonIdentifier);

    // Submit the action
    await page.evaluate((actionCode, selectedTerm) => {
      orbisApp.buildForm({
        'action': actionCode,
        'numOfDays': '-1',
        'selectedTerm': selectedTerm,
      }, '/myAccount/co-op/coopApplications.htm', '').submit();
    }, actionCode, selectedTerm);

    try {
      const applicationsTableIdentifier = '#na_studentApplicationGridTableID';
      await page.waitForSelector(applicationsTableIdentifier, {
        visible: true,
        timeout: 6000,
      });
    } catch (error) {
      // Tables didn't populate
      // Let's check if no applications were found
      const noRecordsMessageIdentifier =
        '#na_studentApplicationGrid_noRecordsMessage';
      await page.waitForSelector(noRecordsMessageIdentifier, {
        visible: true,
        timeout: 1000,
      });

      // No applications message must be visible
      return {
        jobIds: [],
        jobs: {},
      };
    }

    const content = await page.content();
    const $ = cheerio.load(content);

    const numApps = parseInt($('.badge-info').text());
    const appRows = $('tr').slice(2, numApps + 2);
    const jobIds = [];
    let jobs = {};

    for (let i = 0; i < appRows.length; i++) {
      const appRow = $(appRows[i]);
      const appCells = appRow.find('td');

      const termCell = $(appCells[1]);
      const jobIdCell = $(appCells[2]);
      const titleCell = $(appCells[3]);
      const companyCell = $(appCells[4]);
      const divisionCell = $(appCells[5]);
      const locationCell = $(appCells[6]);
      const cityCell = $(appCells[7]);
      const appStatusCell = $(appCells[9]);
      const jobStatusCell = $(appCells[10]);
      const openingsCell = $(appCells[11]);
      const appDeadlineCell = $(appCells[12]);
      const appSubmittedOnCell = $(appCells[13]);
      const appSubmittedByCell = $(appCells[14]);

      const jobId = jobIdCell.text();
      jobIds.push(jobId);

      jobs[jobId] = {
        term: termCell.text(),
        jobId: jobId,
        title: titleCell.text(),
        company: companyCell.text(),
        division: divisionCell.text(),
        location: locationCell.text(),
        city: cityCell.text(),
        appStatus: appStatusCell.text(),
        jobStatus: jobStatusCell.text(),
        openings: parseInt(openingsCell.text()),
        appDeadline: Date.parse(appDeadlineCell.text() +
          (dateUtil.isDST(new Date(appDeadlineCell.text()))
          ? ' EDT' : ' EST')),
        appSubmittedOn: Date.parse(appSubmittedOnCell.text() +
          (dateUtil.isDST(new Date(appSubmittedOnCell.text()))
          ? ' EDT' : ' EST')),
        appSubmittedBy: appSubmittedByCell.text(),
      };
    };

    return {
      jobIds: jobIds,
      jobs: jobs,
    };
  },
};

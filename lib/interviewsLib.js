const cheerio = require('cheerio');

module.exports = {
  getInterviews: async (page, numOfDays) => {
    // Navigate to the dashboard
    await page.goto('https://waterlooworks.uwaterloo.ca/myAccount/dashboard.htm');
    const interviewsButtonIdentifier = '#displayStudentMyInterviews > a';
    await page.waitForSelector(interviewsButtonIdentifier, {
      visible: true,
      timeout: 1001,
    });

    // Click on the interviews tab
    await page.$eval(interviewsButtonIdentifier, (interviewsButton) =>
      interviewsButton.click());

    // Pull out the action code from the page
    const viewButtonIdentifier = '#mainContentDiv > div.orbisTabContainer' +
      ' > div.tab-content > div > div > div > div > div > div > ' +
      'div.panel-body > table > tbody > tr:nth-child(1) > ' +
      'td:nth-child(3) > a';
    await page.waitForSelector(viewButtonIdentifier, {
      visible: true,
      timeout: 1002,
    });
    const actionCode = await page.evaluate((viewButtonIdentifier) => {
      return document.querySelector(viewButtonIdentifier).onclick
        .toString().match('_-[a-zA-Z0-9_-]*')[0];
    }, viewButtonIdentifier);

    // Submit the action
    await page.evaluate((actionCode, numOfDays) => {
      orbisApp.buildForm({
        'action': actionCode,
        'numOfDays': numOfDays,
        'selectedFilter': 'booked',
      }, '/myAccount/co-op/interviews-co-op.htm', '').submit();
    }, actionCode, numOfDays);

    // Parse the page
    try {
      const interviewsTableIdentifier = '#ccrm_studentInterviewsTableID';
      await page.waitForSelector(interviewsTableIdentifier, {
        visible: true,
        timeout: 6000,
      });
    } catch (error) {
      // Tables didn't populate
      // Let's check for no records message
      const noRecordsMessageIdentifier =
        '#ccrm_studentInterviews_noRecordsMessage';
      await page.waitForSelector(noRecordsMessageIdentifier, {
        visible: true,
        timeout: 1004,
      });

      // No interviews :(
      return {
        interviewIds: [],
        interviews: {},
      };
    }

    const content = await page.content();
    const $ = cheerio.load(content);

    const numInterviews = parseInt($('.badge-info').text());
    const interviewRows = $('tr').slice(1, numInterviews + 1);
    const interviewIds = [];
    let interviews = {};

    for (let i = 0; i < interviewRows.length; i++) {
      const interviewRow = $(interviewRows[i]);
      const interviewCells = interviewRow.find('td');

      const termCell = $(interviewCells[1]);
      const scheduleStatusCell = $(interviewCells[2]);
      const confirmationStatusCell = $(interviewCells[3]);
      const dateTimeCell = $(interviewCells[4]);
      const typeCell = $(interviewCells[5]);
      const locationCell = $(interviewCells[6]);
      const methodCell = $(interviewCells[7]);
      const jobIdCell = $(interviewCells[8]);
      const jobTitleCell = $(interviewCells[9]);
      const organizationCell = $(interviewCells[10]);
      const divisionCell = $(interviewCells[11]);
      const mockInterviewCell = $(interviewCells[12]);

      // Generate an interview id based on the job id and time
      const interviewDateTime = Date.parse(dateTimeCell.text() + ' EST');
      const jobId = jobIdCell.text();
      const interviewId = jobId + interviewDateTime.valueOf().toString();

      interviewIds.push(interviewId);
      interviews[interviewId] = {
        term: termCell.text(),
        scheduleStatus: scheduleStatusCell.text(),
        confirmationStatus: confirmationStatusCell.text(),
        dateTime: interviewDateTime,
        type: typeCell.text(),
        location: locationCell.text(),
        method: methodCell.text(),
        jobId: jobId,
        jobTitle: jobTitleCell.text(),
        organization: organizationCell.text(),
        division: divisionCell.text(),
        isMockInterview: mockInterviewCell.text() === 'No' ?
          false : true,
      };
    };

    return {
      interviewIds: interviewIds,
      interviews: interviews,
    };
  },
};

const cheerio = require('cheerio');
const dateUtil = require('../util/dateUtil');

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
    const interviewRows = $('tr').slice(2, numInterviews + 2);
    const interviewIds = [];
    let interviews = {};

    for (let i = 0; i < interviewRows.length; i++) {
      const interviewRow = $(interviewRows[i]);
      const interviewCells = interviewRow.find('td');

      const viewCell = $(interviewCells[0]);
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

      const interviewId = viewCell.find('a').attr('onclick')
        .match(/interviewId:\'(\d+)\'/g)[0].match(/\d+/)[0];

      interviewIds.push(interviewId);
      interviews[interviewId] = {
        interviewId: interviewId,
        term: termCell.text(),
        scheduleStatus: scheduleStatusCell.text(),
        confirmationStatus: confirmationStatusCell.text(),
        dateTime: Date.parse(dateTimeCell.text() +
          (dateUtil.isDST(new Date(dateTimeCell.text())) ? ' EDT' : ' EST')),
        type: typeCell.text(),
        location: locationCell.text(),
        method: methodCell.text(),
        jobId: jobIdCell.text(),
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
  getInterview: async (page, interviewId, numOfDays) => {
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
    let actionCode = await page.evaluate((viewButtonIdentifier) => {
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

    const interviewsTableIdentifier = '#ccrm_studentInterviewsTableID';
    await page.waitForSelector(interviewsTableIdentifier, {
      visible: true,
      timeout: 6000,
    });

    const interviewViewButtonIdentifier = 'td:contains(\'view\') > a';
    actionCode = await page.evaluate((viewButtonIdentifier) => {
      return $($(viewButtonIdentifier)[0]).attr('onclick')
        .match('_-[a-zA-Z0-9_-]*')[0];
    }, interviewViewButtonIdentifier);

    await page.evaluate((actionCode, interviewId) => {
      orbisApp.buildForm({
        'action': actionCode,
        'interviewId': interviewId,
      }, '/myAccount/co-op/interviews-co-op.htm').submit();
    }, actionCode, interviewId);

    const interviewPageIdentifier =
      '.reservedSlot';
    await page.waitForSelector(interviewPageIdentifier);

    const content = await page.content();
    const $ = cheerio.load(content);

    const interviewDetailsRows = $('tr');
    const interview = {};

    for (let i = 0; i < interviewDetailsRows.length; i++) {
      const row = $(interviewDetailsRows[i]);
      const cells = row.find('td');

      const keyCell = $(cells[0]);
      const valueCell = $(cells[1]);

      const key = keyCell.text().trim().replace(/\s+/g, ' ');
      const value = valueCell.text().trim().replace(/\t+/g, '')
        .replace(/\n+/g, '\n');

      if (key === 'Interview Type:') {
        interview.interviewType = value;
      } else if (key === 'Location Type:') {
        interview.locationType = value;
      } else if (key === 'Status of Interview:') {
        interview.status = value;
      } else if (key === 'Special Instructions:') {
        interview.specialInstructions = value;
      } else if (key === 'Interviewing For Job:') {
        interview.interviewingForJob = value;
      } else if (key === 'Interviewer:') {
        interview.interviewer = value;
      } else if (key === 'Interview Method:') {
        interview.method = value;
      } else if (key === 'Web Cam Id :') {
        interview.webCamId = value;
      } else if (key === 'When:') {
        interview.when = value;
      } else if (key === 'Where:') {
        interview.where = value;
      }
    }

    return {interview: interview};
  },
};

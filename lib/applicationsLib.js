const cheerio = require('cheerio');

module.exports = {
  getApplications: async (page, selectedTerm) => {
    /* eslint-disable */
    await page.evaluate((selectedTerm) => {
      orbisApp.buildForm({
        'action': '_-_-OmTSRZVRaEMr9pw1r9-auRDZ7vo0565eaAf9pNzLAKslFQpz1cW0GjaRD5MBgffmGrbIgRl-8GGIG06aRwWkyykAbNt2OCjT8G8baBI30tp3AxDGpiiGRlI9NksFAZwNbC3QNLF-xlrvGhvmN0SxgcXiubkp2IP9wsWUHLK_qbLFfV_dnbZylzA6zlZBri8',
        'numOfDays': '-1',
        'selectedTerm': selectedTerm,
      }, '/myAccount/co-op/coopApplications.htm', '').submit();
    }, selectedTerm);
    /* eslint-enable */

    try {
      const applicationsTableIdentifier = '#na_studentApplicationGridTableID';
      await page.waitForSelector(applicationsTableIdentifier, {
        visible: true,
        timeout: 10000,
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
    const appRows = $('tr').slice(1, numApps + 1);
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
        appDeadline: appDeadlineCell.text(),
        appSubmittedOn: appSubmittedOnCell.text(),
        appSubmittedBy: appSubmittedByCell.text(),
      };
    };

    return {
      jobIds: jobIds,
      jobs: jobs,
    };
  },
};

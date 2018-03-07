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
    const appRows = $('tr').slice(1, numApps);
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
      jobsIds: jobIds,
      jobs: jobs,
    };
  },
  getApplicationById: async (page, selectedTerm, jobId) => {
    /* eslint-disable */
    await page.evaluate((selectedTerm) => {
      orbisApp.buildForm({
        'action': '_-_-OmTSRZVRaEMr9pw1r9-auRDZ7vo0565eaAf9pNzLAKslFQpz1cW0GjaRD5MBgffmGrbIgRl-8GGIG06aRwWkyykAbNt2OCjT8G8baBI30tp3AxDGpiiGRlI9NksFAZwNbC3QNLF-xlrvGhvmN0SxgcXiubkp2IP9wsWUHLK_qbLFfV_dnbZylzA6zlZBri8',
        'numOfDays': '-1',
        'selectedTerm': selectedTerm,
      }, '/myAccount/co-op/coopApplications.htm', '').submit();
    }, selectedTerm);
    /* eslint-enable */

    const applicationsTableIdentifier = '#na_studentApplicationGridTableID';
    await page.waitForSelector(applicationsTableIdentifier, {
      visible: true,
      timeout: 10000,
    });

    const content = await page.content();
    let $ = cheerio.load(content);

    const jobIdCell = $('td:contains("' + jobId + '")');
    const orbisAppBuildForm = jobIdCell.prev().prev().find('a').attr('onclick');

    await page.evaluate((orbisAppBuildForm) => {
      eval(orbisAppBuildForm);
    }, orbisAppBuildForm);

    const postingDivIdentifier = '#postingDiv';
    await page.waitForSelector(postingDivIdentifier);

    const jobContent = await page.content();
    $ = cheerio.load(jobContent);

    let job = {};
    const tables = $('tbody');
    for (let i = 0; i < tables.length; i++) {
      const rows = $(tables[i]).children();

      for (let j = 0; j < rows.length; j++) {
        const cells = $(rows[j]).children();
        const keyCell = $(cells[0]);
        const valueCell = $(cells[1]);

        const key = keyCell.text().trim();
        const value = valueCell.text().trim();

        if (key === 'Job Posting Status:') {
          job.jobPostingStatus = value;
        } else if (key === 'Internal Status') {
          job.internalStatus = value;
        } else if (key === 'Work Term:') {
          job.workTerm = value;
        } else if (key === 'Job Type:') {
          job.jobType = value;
        } else if (key === 'Job Title:') {
          job.jobTitle = value;
        } else if (key === 'Number of Job Openings:') {
          job.openings = parseInt(value);
        } else if (key === 'Job Category (NOC):') {
          job.jobCategory = value;
        } else if (key === 'Level') {
          job.level = [];
          const levelCells = valueCell.find('td');
          for (let k = 0; k < levelCells.length; k++) {
            job.level.push($(levelCells[k]).text().trim());
          }
        } else if (key === 'Region:') {
          job.region = value;
        } else if (key === 'Job - Address Line One:') {
          job.addressLineOne = value;
        } else if (key === 'city') {
          job.city = value;
        } else if (key === 'Job - Province / State:') {
          job.provinceOrState = value;
        } else if (key === 'Job - Postal Code / Zip Code (X#X #X#):') {
          job.postalCodeOrZipCode = value;
        } else if (key === 'Job - Country:') {
          job.country = value;
        } else if (key === 'Work Term Duration:') {
          job.workTermDuration = value;
        } else if (key === 'Special Job Requirements:') {
          job.specialJobRequirements = value;
        } else if (key === 'Job Summary:') {
          job.jobSummary = value;
        } else if (key === 'Job Responsibilities:') {
          job.jobResponsibilities = value;
        } else if (key === 'Required Skills:') {
          job.requiredSkills = value;
        } else if (key === 'Compensation and Benefits Information:') {
          job.compensationAndBenefitsInformation = value;
        } else if (key === 'Targeted Degrees and Disciplines:') {
          job.targetedDegreesAndDisciplines = value;
        } else if (key === 'Application Deadline:') {
          job.applicationDeadline = Date.parse(value + ' EST');
        } else if (key === 'Organization:') {
          job.organization = value;
        } else if (key === 'Division:') {
          job.division = value;
        }
      };
    };

    return {
      job: job,
    };
  },
};

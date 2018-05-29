const cheerio = require('cheerio');
const Job = require('../db/job');
const dateUtil = require('../util/dateUtil');

module.exports = {
  getJobById: async (page, selectedTerm, jobId) => {
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

    let job = new Job({
      jobId: jobId,
    });
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
          job.postingStatus = value;
        } else if (key === 'Internal Status') {
          job.internalStatus = value;
        } else if (key === 'Work Term:') {
          job.workTerm = value;
        } else if (key === 'Job Type:') {
          job.type = value;
        } else if (key === 'Job Title:') {
          job.title = value;
        } else if (key === 'Number of Job Openings:') {
          job.openings = parseInt(value);
        } else if (key === 'Job Category (NOC):') {
          job.category = value;
        } else if (key === 'Level:') {
          job.level = [];
          const levelCells = valueCell.find('td');
          for (let k = 0; k < levelCells.length; k++) {
            job.level.push($(levelCells[k]).text().trim());
          }
        } else if (key === 'Region:') {
          job.region = value;
        } else if (key === 'Job - Address Line One:') {
          job.addressLineOne = value;
        } else if (key === 'Job - Address Line Two:') {
          job.addressLineTwo = value;
        } else if (key === 'Job - City:') {
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
          job.summary = value;
        } else if (key === 'Job Responsibilities:') {
          job.responsibilities = value;
        } else if (key === 'Required Skills:') {
          job.requiredSkills = value;
        } else if (key === 'Compensation and Benefits Information:') {
          job.compensationAndBenefitsInformation = value;
        } else if (key === 'Targeted Degrees and Disciplines:') {
          job.targetedDegreesAndDisciplines = value
            .replace(/\s+/g, ' ')
            .replace(/ENG/g, '\nENG')
            .replace(/MATH/g, '\nMATH')
            .replace(/Theme/g, '\nTheme');
        } else if (key === 'Application Deadline:') {
          job.applicationDeadline = Date.parse(value +
            (dateUtil.isDST(new Date(value)) ? ' EDT' : ' EST'));
        } else if (key === 'Organization:') {
          job.organization = value;
        } else if (key === 'Division:') {
          job.division = value;
        }
      };
    };

    job.lastUpdated = new Date();
    const jobObj = job.toObject();
    delete jobObj._id;
    Job.update({
      jobId: jobId,
    }, jobObj, {
      upsert: true,
    }, (error) => {
      if (error) {
        // TODO: Handle error
      }
    });

    return {
      job: job,
    };
  },
  getJobFromDb: async (jobId) => {
    try {
      const job = await Job.findOne({
        jobId: jobId,
      }).exec();

      return {
        job: job,
      };
    } catch (error) {
      return {};
    }
  },
};

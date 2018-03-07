const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

module.exports = app => {

  app.post('/interviews/get', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({
        status: 'Error',
        message: 'Missing username or password',
      });
    }

    try {    
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto('https://cas.uwaterloo.ca/cas/login?service=https://waterlooworks.uwaterloo.ca/waterloo.htm');
      
      const usernameIdentifier = '#username';
      await page.waitForSelector(usernameIdentifier);
      await page.type(usernameIdentifier, username);
    
      const passwordIdentifier = '#password';
      await page.waitForSelector(passwordIdentifier);
      await page.type(passwordIdentifier, password);
    
      const submitButtonIdentifier = '#cas-submit';
      await page.waitForSelector(submitButtonIdentifier);
      await page.click(submitButtonIdentifier);
      
      try {
        const postingsApplicationsButtonIdentifier = '#displayStudentMyPostingsApplications';
        await page.waitForSelector(postingsApplicationsButtonIdentifier, { timeout: 10000 });
      } catch (error) {
        return res.json({
          status: 'Error',
          message: 'Failed to login'
        });
      }
        
      try {
        await page.evaluate(() => {
          orbisApp.buildForm({'action':'_-_-RpQB0w5b3x0Y2uBJbh_dK7tQ3LxZhUGWd2WGW7IvIpjec3bVMnW4PIemg5LIFm2nvbpVeNxDXUopX34BdV3ROoHMycmqkMcPcjAJdwkAvh-EnLy-RTJcXq-GypjlVMlewztx7PxHHuAyknqkOzDfLMWQyimxUYNjOhY2hOh9j96ICfE','numOfDays':'-1','selectedFilter':'booked'}, '/myAccount/co-op/interviews-co-op.htm', '').submit();
        });  
      } catch (error) {
        return res.json({
          status: 'Error',
          message: 'Failed to navigate to interviews page',
          error: error.message
        });
      }
      
      try {
        const interviewsTableIdentifier = '#ccrm_studentInterviewsTableID';
        await page.waitForSelector(interviewsTableIdentifier, { visible: true, timeout: 10000 });
      } catch (error) {
        // Tables didn't populate 
        // Let's check for no records message 
        const noRecordsMessageIdentifier = '#ccrm_studentInterviews_noRecordsMessage';
        await page.waitForSelector(noRecordsMessageIdentifier, { visible: true, timeout: 1000 });

        // No records message must be visible
        return res.json({
          status: 'OK',
          data: []
        });
      }
      
      const content = await page.content();
      const $ = cheerio.load(content);
      
      const numInterviews = parseInt($('.badge-info').text());
      const interviewRows = $('tr').slice(1, numInterviews);
      const interviewIds = [];
      let interviews = {};

      for (let i = 0; i < interviewRows.length; i++) {
        const interviewRow = $(interviewRows[i]);
        const interviewCells = interviewRow.find('td');

        const termCell = $(interviewCells[1]);
        const scheduleStatusCell  = $(interviewCells[2]);
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
        const interviewId = jobId.toString() + interviewDateTime.valueOf().toString();

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
          mockInterview: (mockInterviewCell.text() === 'No' ? false : true),
        };
      }

      await browser.close();
      return res.json({
        status: 'OK',
        interviews: interviews,
        interviewIds: interviewIds,
      });
    } catch (error) {
      return res.json({
        status: 'Error',
        message: 'An unknown error occurred',
        error: error.message,
      });
    }
  });
}
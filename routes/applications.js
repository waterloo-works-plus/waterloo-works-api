const puppeteer = require('puppeteer');

const authLib = require('../lib/authLib');
const applicationLib = require('../lib/applicationsLib');

module.exports = app => {

  app.post('/applications/get', async (req, res) => {
    const { username, password } = req.body;
    let { selectedTerm } = req.body;

    if (!username || !password) {
      return res.json({
        status: 'Error',
        message: 'Missing username or password',
      });
    }

    if (!selectedTerm) {
      const now = new Date();
      const termNum = 411 + 3 * (now.getFullYear() - 2018) + Math.floor((now.getMonth() - 1) / 4);
      selectedTerm = termNum.toString();
    }

    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
    
      try {
        await authLib.login(page, username, password);
      } catch (error) {
        return res.json({
          status: 'Error',
          message: 'Failed to login'
        });
      }

      const { jobIds, jobs } = await applicationLib.getApplications(page, selectedTerm);

      await browser.close();
      return res.json({
        status: 'OK',
        jobIds: jobIds,
        jobs: jobs,
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
const puppeteer = require('puppeteer');
const puppeteerUtil = require('../util/puppeteerUtil');

const authLib = require('../lib/authLib');
const jobsLib = require('../lib/jobsLib');

module.exports = (app) => {
  app.post('/jobs/get', async (req, res) => {
    const {
      username,
      password,
      jobId,
      selectedTerm,
    } = req.body;

    if (!username || !password || !jobId || !selectedTerm) {
      return res.json({
        status: 'Error',
        message: 'Missing parameter username, password, jobId, selectedTerm',
      });
    }

    const browser = await puppeteer.launch(puppeteerUtil.getLaunchFlags());

    try {
      const page = await browser.newPage();

      try {
        await authLib.login(page, username, password);
      } catch (error) {
        return res.json({
          status: 'Error',
          message: 'Failed to login',
        });
      }

      const {
        job,
      } = await jobsLib.getJobById(page, selectedTerm, jobId);

      return res.json({
        status: 'OK',
        job: job,
      });
    } catch (error) {
      return res.json({
        status: 'Error',
        message: 'An unknown error occurred',
        error: error.message,
      });
    } finally {
      await browser.close();
    }
  });

  app.post('/jobs/db/get', async (req, res) => {
    const {
      jobId,
    } = req.body;

    if (!jobId) {
      return res.json({
        status: 'Error',
        message: 'Missing job id',
      });
    }

    const {
      job,
    } = await jobsLib.getJobFromDb(jobId);

    if (job) {
      return res.json({
        status: 'OK',
        found: true,
        job: job,
      });
    } else {
      return res.json({
        status: 'OK',
        found: false,
      });
    }
  });
};

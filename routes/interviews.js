const puppeteer = require('puppeteer');
const authLib = require('../lib/authLib');
const interviewsLib = require('../lib/interviewsLib');

module.exports = app => {
  app.post('/interviews/get', async (req, res) => {
    const {
      username,
      password,
      numOfDays
    } = req.body;

    if (!username || !password || !numOfDays) {
      return res.json({
        status: 'Error',
        message: 'Missing parameter username, password, numOfDays',
      });
    }

    try {    
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
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
        interviewIds,
        interviews,
      } = await interviewsLib.getInterviews(page, numOfDays);

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
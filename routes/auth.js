const puppeteer = require('puppeteer');
const puppeteerUtil = require('../util/puppeteerUtil');

const authLib = require('../lib/authLib');

module.exports = (app) => {
  app.post('/auth/login', async (req, res) => {
    const {
      username,
      password,
    } = req.body;

    if (!username || !password) {
      return res.json({
        status: 'Error',
        message: 'Missing username or password',
      });
    }

    const browser = await puppeteer.launch(puppeteerUtil.getLaunchFlags());

    try {
      const page = await browser.newPage();

      await authLib.login(page, username, password);

      return res.json({
        status: 'OK',
        message: 'Login successful',
      });
    } catch (error) {
      return res.json({
        status: 'Error',
        message: 'Login failed',
        error: error,
      });
    } finally {
      await browser.close();
    }
  });
};

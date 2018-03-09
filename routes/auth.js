const puppeteer = require('puppeteer');

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

    try {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      await authLib.login(page, username, password);

      await browser.close();
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
    }
  });
};

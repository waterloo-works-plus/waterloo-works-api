const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

module.exports = app => {

  app.post('/auth/login', async (req, res) => {
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
    
      const postingsApplicationsButtonIdentifier = '#displayStudentMyPostingsApplications';
      await page.waitForSelector(postingsApplicationsButtonIdentifier, { timeout: 10000 });

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

}
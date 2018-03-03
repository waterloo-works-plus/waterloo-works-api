const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

module.exports = app => {

  app.post('/applications/get', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({
        status: 'error',
        message: 'Missing username or password',
      });
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://cas.uwaterloo.ca/cas/login?service=https://waterlooworks.uwaterloo.ca/waterloo.htm');
    
    await page.waitForSelector('#username');
    await page.type('#username', username );
  
    await page.waitForSelector('#password');
    await page.type('#password', password);
  
    await page.waitForSelector('#cas-submit');
    await page.click('#cas-submit');
  
    await page.waitForSelector('#displayStudentMyPostingsApplications');  
  
    await page.evaluate(() => {
      orbisApp.buildForm({'action':'_-_-OmTSRZVRaEMr9pw1r9-auRDZ7vo0565eaAf9pNzLAKslFQpz1cW0GjaRD5MBgffmGrbIgRl-8GGIG06aRwWkyykAbNt2OCjT8G8baBI30tp3AxDGpiiGRlI9NksFAZwNbC3QNLF-xlrvGhvmN0SxgcXiubkp2IP9wsWUHLK_qbLFfV_dnbZylzA6zlZBri8','numOfDays':'-1','selectedTerm':'410'}, '/myAccount/co-op/coopApplications.htm', '').submit();
    });
  
    await page.waitForSelector('#na_studentApplicationGridTableID', { visible: true });
    
    const content = await page.content();
    const $ = cheerio.load(content);
  
    const numApps = parseInt($('.badge-info').text());
    const appRows = $('tr').slice(1, numApps);
    const apps = [];

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

      apps.push({
        term: termCell.text(),
        jobId: jobIdCell.text(),
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
      });
    }

    await browser.close();
    return res.json({
      status: 'ok',
      data: apps,
    });
  });

}
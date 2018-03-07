module.exports = {
  login: async (page, username, password) => {
    await page.goto('https://cas.uwaterloo.ca/cas/login?' +
      'service=https://waterlooworks.uwaterloo.ca/waterloo.htm');

    const usernameIdentifier = '#username';
    await page.waitForSelector(usernameIdentifier);
    await page.type(usernameIdentifier, username);

    const passwordIdentifier = '#password';
    await page.waitForSelector(passwordIdentifier);
    await page.type(passwordIdentifier, password);

    const submitButtonIdentifier = '#cas-submit';
    await page.waitForSelector(submitButtonIdentifier);
    await page.click(submitButtonIdentifier);

    const postingsApplicationsButtonIdentifier =
      '#displayStudentMyPostingsApplications';
    await page.waitForSelector(postingsApplicationsButtonIdentifier, {
      timeout: 10000,
    });
  },
};

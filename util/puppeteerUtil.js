module.exports = {
  getLaunchFlags: () => {
    return {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };
  },
};

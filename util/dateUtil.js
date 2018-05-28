module.exports = {
    isDST: () => {
      const now = new Date();
      return (now.getMonth() > 4 || (now.getMonth() === 4 && now.getDate() >= 11)) &&
        (now.getMonth() < 10 || (now.getMonth() === 10 && now.getDate() <= 4));
    },
  };
  
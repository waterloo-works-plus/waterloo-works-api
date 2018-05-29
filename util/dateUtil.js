module.exports = {
    isDST: (date) => {
      return (date.getMonth() > 4 ||
        (date.getMonth() === 4 && date.getDate() >= 11)) &&
        (date.getMonth() < 10 ||
        (date.getMonth() === 10 && date.getDate() <= 4));
    },
  };

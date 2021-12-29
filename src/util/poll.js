export const wait = (ms = 5000) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export const poll = async (fn, fnCondition, ms) => {
  let result = await fn();
  while (fnCondition(result)) {
    // eslint-disable-next-line no-await-in-loop
    await wait(ms);
    // eslint-disable-next-line no-await-in-loop
    result = await fn();
  }
  return result;
};

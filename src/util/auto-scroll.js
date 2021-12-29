/**
 * used for sites that load on scroll
 * @param {current browser page} page
 */
export default async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const { scrollHeight } = document.body;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
        // This can be tweaked. This is the time between each "scroll" that takes place.
        // If this is too fast, the data on the page might not load quick enough
      }, 1500);
    });
  });
}

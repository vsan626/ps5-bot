/* eslint-disable import/no-unresolved */
/* eslint-disable quotes */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import chalk from 'chalk';
import { poll, wait } from './poll';

/**
 * Goes to designated URL and finds item availability
 * @param {current webpage} page
 * @returns
 */
async function getAvailability(page) {
  await page.goto(
    `https://www.gamestop.com/consoles-hardware/nintendo-switch/consoles/products/nintendo-switch-oled-console-white-joy-con/299009.html`
  );

  // This can be tweaked. This is the time we allow the browser to wait for a request
  console.log(chalk.blue('waiting for browser requests...'));
  await wait(6000);

  // console.log(chalk.blueBright('scrolling initiated to load all data...'));
  // await autoScroll(page);

  const results = await page.$eval('html', function (html) {
    let currentAvailability;

    const available = html.querySelector(`[class^='condition-label new`);

    if (!available) {
      currentAvailability = 'Not Available 😭';
    } else {
      currentAvailability = 'Available Now 😁';
    }

    return currentAvailability;
  });

  return results;
}

(async () => {
  // If you want to see the scraping in real time, change `headless` to false
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();

  // turns request interceptor on
  await page.setRequestInterception(true);

  // Adblock on puppeteer
  puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

  // if the page makes a request to a resource type of image or stylesheet then abort that request
  page.on('request', (request) => {
    if (
      request.resourceType() === 'font'
      || request.resourceType() === 'stylesheet'
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  // listening to console and network events from site
  page
    .on('console', (message) => {
      const type = message.type().substr(0, 3).toUpperCase();
      const colors = {
        LOG: (text) => text,
        ERR: chalk.red,
        WAR: chalk.yellow,
        INF: chalk.cyan
      };
      const color = colors[type] || chalk.blue;
      console.log(color(`${type} ${message.text()}`));
    })
    .on('pageerror', ({ message }) => console.log(chalk.red(message)))
    .on('response', (response) => {
      console.log(chalk.green(`${response.status()} ${response.url()}`));
    })
    .on('requestfailed', (request) => console.log(
      chalk.magenta(`${request.failure().errorText} ${request.url()}`)
    ));

  let result;

  console.log(chalk.blue.underline('entering loop'));

  while (result !== 'Available Now 😁') {
    // eslint-disable-next-line no-await-in-loop
    await wait(30000);
    console.log(chalk.blue.underline('waiting for result...'));
    // eslint-disable-next-line no-await-in-loop
    result = await getAvailability(page);
  }

  console.log(chalk.yellow.underline.bold(result));

  // TODO: code to send message to discord

  browser.close();
})();

/**
 * used for sites that load on scroll
 * @param {current browser page} page
 */
async function autoScroll(page) {
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

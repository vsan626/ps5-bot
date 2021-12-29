/* eslint-disable quotes */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import chalk from 'chalk';
import { url } from './src/constants/app.constants';
import { wait } from './src/util/poll';

/**
 * Goes to designated URL and finds item availability
 * @param {current webpage} page
 * @returns
 */
async function getAvailability(page) {
  await page.goto(url);

  // This can be tweaked. This is the time we allow the browser to wait for a request
  console.log(chalk.blue('waiting for browser requests...'));
  await wait(6000);

  const results = await page.$eval('html', function (html) {
    let currentAvailability;

    // GAMESTOP ELEMENT: const available = html.querySelector(`[class^='condition-label new`);
    const available = html.querySelector(`[class^='fulfillment-add-to-cart-button`).innerText.trim() === 'Add to Cart' ? true : null;

    if (!available) {
      currentAvailability = 'Not Available 😭';
    } else {
      currentAvailability = 'Available Now 😁';
    }
    console.log(currentAvailability);
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

  console.log(chalk.cyanBright.underline.bold(result));

  // TODO: code to send message to discord

  browser.close();
})();

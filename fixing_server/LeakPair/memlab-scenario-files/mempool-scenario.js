/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:4200';
}

// action where you suspect the memory leak might be happening
async function action(page) {
  // const markets = await page.$('a[href="/markets"]');
  // markets.evaluate((h)=>{h.click()});

  // const transactions = await page.$('a[href="/transactions"]');
  // transactions.evaluate((h)=>{h.click()});

  // await page.waitForXPath("//h1[contains(., 'BSQ Transactions')]", {
  //   visible: true
  // })

  // const firstTransaction = await page.$('a');
  // firstTransaction.evaluate((h)=>{h.click()});

  // const blocks = await page.$('a[href="/blocks"]');
  // blocks.evaluate((h)=>{h.click()});

  // await page.waitForSelector('.page-item', {
  //   visible: true
  // })

  // const pageItem = await page.$('.page-item');
  // pageItem.evaluate((h)=>{h.click()});

  const stats = await page.$('a[href="/stats"]');
  stats.evaluate((h)=>{h.click()});

  const docs = await page.$('a[href="/docs"]');
  docs.evaluate((h)=>{h.click()});

  const tabs =  await page.$$('ul[role="tablist"] li');
  for (const tab of tabs) {
    tab.evaluate((h)=>{h.click()});
  }

  const docLinks = await page.$$('app-api-docs-nav a');
  for(const link of docLinks) {
    link.evaluate((h)=>{h.click()});
  }

  const about = await page.$('a[href="/about"]');
  about.evaluate((h)=>{h.click()});
}

// how to go back to the state before actionw
async function back(page) {
  const home =  await page.$('.logo');
  home.evaluate((h)=>{h.click()});
}

module.exports = {url, action, back, repeat: () => 5};

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:4200/';
}

// action where you suspect the memory leak might be happening
async function action(page) {
  for (let i=1; i<=10; i++) {
    const components =  await page.$('a[href="/components"]');
    components.evaluate((h)=>{h.click()});

    const matitems =  await page.$$('mat-nav-list a'); //foreach
    for (const item of matitems) {
      item.evaluate((h)=>{h.click()});
    }

    const cdk =  await page.$('a[href="/cdk"]');
    cdk.evaluate((h)=>{h.click()});

    const guides =  await page.$('a[href="/guides"]');
    guides.evaluate((h)=>{h.click()});

    const home =  await page.$('img[alt="angular"]');
    home.evaluate((h)=>{h.click()});
  }
}

// how to go back to the state before actionw
async function back(page) {
    const home =  await page.$('img[alt="angular"]');
    home.evaluate((h)=>{h.click()});
}

module.exports = {action, back, url};

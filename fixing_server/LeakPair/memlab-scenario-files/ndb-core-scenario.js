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
  const menuitems = await page.$$('app-navigation mat-list-item');
  console.log('menuitems', menuitems.length);

  for(const item of menuitems) {
    item.evaluate((h)=>{h.click()});
    const inputs = await page.$$('a[href="/"]');
    console.log('inputs', inputs.length);

    for(const item of inputs) {
      item.evaluate((h)=>{h.click()});
    }

    const tableRows = await page.$$('table tr');
    console.log('tableRows', tableRows.length);

    for(const item of tableRows) {
      item.evaluate((h)=>{h.click()});
    }
  }

  // const handles12 =  await page.$$('a[href="/"]');
  // handles12[0].evaluate((h)=>{h.click()});

  // const handles12 =  await page.$$('a[href="/"]');
  // handles12[0].evaluate((h)=>{h.click()});

  // const handles12 =  await page.$$('a[href="/"]');
  // handles12[0].evaluate((h)=>{h.click()});

  // const handles12 =  await page.$$('a[href="/"]');
  // handles12[0].evaluate((h)=>{h.click()});
}

// how to go back to the state before actionw
async function back(page) {
  const dashboard = await page.$('app-fa-dynamic-icon[ng-reflect-icon="home"]');
  dashboard.evaluate((h)=>{h.click()});
}

module.exports =  {url, action, back, repeat: () => 1 };

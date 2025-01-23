/* eslint-disable no-multi-spaces */
/* eslint-disable space-infix-ops */
/* eslint-disable indent */

 // span
 // foreach

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */

function url() {
  return 'http://localhost:8080/';
}

// action where you suspect the memory leak might be happening
async function action(page) {
  const geoBtn =  await page.$('.geoButton');
  geoBtn.evaluate((h)=>{h.click()});

  const refocus =  await page.$('.refocusButton');
  refocus.evaluate((h)=>{h.click()});

  const filterbydate = await page.$x("//span[contains(., 'Filter by Date')]");
  filterbydate[0].evaluate((h)=>{h.click()}); 

  const datechecks =  await page.$$('input[type="checkbox"]');
  for (const check of datechecks) {
    check.evaluate(h=>{h.click()});
  }
}

// how to go back to the state before actionw
async function back(page) {
}

module.exports = {action, back, url, repeat: () => 9 };

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */

function url() {
  return 'http://localhost:4200/dashboard';
}

// action where you suspect the memory leak might be happening
async function action(page) {
    for (let i=0; i<=10; i++) {
        const picture =  await page.$$('.user-picture');
        picture[0].evaluate((h)=>{h.click()});

        const profile =  await page.$$('a[href="/dashboard/profile"]');
        profile[0].evaluate((h)=>{h.click()});

        const dashboard =  await page.$$('a[href="/dashboard"]');
        dashboard[0].evaluate((h)=>{h.click()});
    }
}

// how to go back to the state before actionw
async function back(page) {
    const dashboard =  await page.$$('a[href="/dashboard"]');
    dashboard[0].evaluate((h)=>{h.click()});
}

module.exports = {action, back, url};

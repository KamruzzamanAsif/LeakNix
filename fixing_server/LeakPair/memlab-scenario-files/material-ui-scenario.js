/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:3000/lab/slider';
}

// action where you suspect the memory leak might be happening
async function action(page) {
    await page.waitForSelector('div[role="slider"]', {
      visible: true,
    });

    const slider = await page.$('div[role="slider"]');
    slider.evaluate((h)=>{h.click()});

    for (let i=1; i<=10; i++) {
      slider.evaluate((h)=>{h.click()});
    }

    const color =  await page.$('a[href="/style/color#color-tool"]');
    color.evaluate((h)=>{h.click()});

    await page.waitForXPath("//h2[contains(., 'Color system')]", {
      visible: true,
    })

    page.goBack();
}

// how to go back to the state before actionw
async function back(page) {
    await page.waitForSelector('div[role="slider"]', {
      visible: true,
    })
}

module.exports = {action, back, url, repeat: () => 9 };

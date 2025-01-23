/* eslint-disable prettier/prettier */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:3000/toolbar-visiblity-demo-nav-link';
}

// action where you suspect the memory leak might be happening
async function action(page) {
    for (let i=1; i<=20; i++) {
        const tooltipsmenu = await page.$('a[href="/tooltip-demo-nav-link"]');
        tooltipsmenu.evaluate(h => { h.click();});

        const tooltip = await page.$('#tooltipTarget');
        tooltip.evaluate(h => { h.click();});
        
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            btn.evaluate(h => {  h.click();});
        }

        const toolbar =  await page.$('a[href="/toolbar-visiblity-demo-nav-link"]');
        toolbar.evaluate((h)=>{h.click()});
    }
}

// how to go back to the state before actionw
async function back(page) {
    const toolbar =  await page.$('a[href="/toolbar-visiblity-demo-nav-link"]');
    toolbar.evaluate((h)=>{h.click()});
}

module.exports = {action, back, url};

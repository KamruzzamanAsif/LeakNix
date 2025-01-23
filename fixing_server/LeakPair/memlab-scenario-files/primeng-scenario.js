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
    const setup =  await page.$('.landing-header a[href="/setup"]');
    setup.evaluate((h)=> {h.click()});
    await page.waitForSelector('.menu-items a', {
        visible: true,
    });


    const menuItems =  await page.$$('.menu-items a');
    console.log('menuitems.length', menuItems.length);
    console.log('menuitems', menuItems);

    for (let i=0; i<=25; i++) {
        const menutext = await menuItems[i].evaluate(p => p.textContent);
        console.log('menutext', menutext);

        if (menutext === 'Store'
            || menutext === 'Twitter'
            || menutext === 'SASS API'
            || menutext === 'Theme Designer'
            || menutext === 'Visual Editor'
            || menutext === 'Free Blocks'
            || menutext === 'All Blocks'
            || menutext === 'PrimeFlex v3'
            || menutext === 'PrimeFlex v2'
            ) {
            continue;
        }

        menuItems[i].evaluate((h)=> {h.click()});

        const buttons = await page.$$('.content-section button');
        for (btn of buttons) {
            btn.evaluate((h)=> {h.click()});
        }

        const inputs = await page.$$('.content-section input');
        for (input of inputs) {
            input.evaluate((h)=> {h.click()});
        }
    }
}

// how to go back to the state before actionw
async function back(page) {
    const handles12 =  await page.$$('.logo');
    handles12[0].evaluate((h)=>{h.click()});
}

module.exports = {url, action, back, repeat: () => 1};

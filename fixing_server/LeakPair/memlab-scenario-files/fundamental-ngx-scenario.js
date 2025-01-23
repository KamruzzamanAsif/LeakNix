/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */

function url() {
    return 'http://localhost:4200/fundamental-ngx#/core/home';
}

// action where you suspect the memory leak might be happening
async function action(page) {
    const button = await page.$('button[glyph="menu2"]');
    button.evaluate((h) => {
        h.click();
    });

    const menuitems = await page.$$('.fd-nested-list__item');
    for (const item of menuitems) {
        item.evaluate((h) => {
            h.click();
        });

        const buttons = await page.$$('component-example button');

        console.log('buttons', buttons.length);
        for (const btn of buttons) {
            const btnid = await btn.evaluate((btnitem) => btnitem.getAttribute('id'));
            const textcontent = await btn.evaluate((btnitem) => btnitem.textContent);
            console.log('button id', btnid);
            console.log('button text content', textcontent);
            btn.evaluate((h) => {
                h.click();
            });
        }
    }
}

// how to go back to the state before actionw
async function back(page) {
    const home = await page.$('a[href="#/core/home"]');
    home.evaluate((h) => {
        h.click();
    });
}

module.exports = { action, back, url, repeat: () => 1 };

/* eslint-disable prettier/prettier */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:6006/?selectedKind=Carousel&selectedStory=With%20infinite%20mode&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel';
}

// action where you suspect the memory leak might be happening
async function action(page) {
    await page.waitForSelector('#storybook-preview-iframe', { timeout: 30000 });
    const iframeHandle1 = await page.$('#storybook-preview-iframe');
    const frame = await iframeHandle1.contentFrame();

    const next = await frame.$('button[aria-label="Go to next slide"]');
    for (let i = 1; i <= 20; i++) {
        next.evaluate(h => {h.click();});
    }

    const autoplay = await page.$x("//div[contains(., 'with rewind in non-infinite mode')]");
    autoplay[0].evaluate(h => {h.click()});

    const autoplayAnimation = await page.$x("//div[contains(., 'Auto play custom animation')]");
    autoplayAnimation[0].evaluate((h)=>{h.click()});

    const rtl = await page.$x("//div[contains(., 'RTL')]");
    rtl[0].evaluate((h)=>{h.click()});

    const multiCarousels =  await frame.$$('.react-multi-carousel-item button');
    for (const item of multiCarousels) {
        item.evaluate((h)=>{h.click()});
    }

    const menuitems =  await frame.$$('div[role="menuitem"] a');
    for (const item of menuitems) {
        item.evaluate((h)=>{h.click()});
    }  
}

// how to go back to the state before actionw
async function back(page) {
    const inf = await page.$x("//div[contains(., 'With infinite mode')]");
    inf[0].evaluate((h)=>{h.click()});
}

module.exports = {action, back, url, repeat: () => 10 };


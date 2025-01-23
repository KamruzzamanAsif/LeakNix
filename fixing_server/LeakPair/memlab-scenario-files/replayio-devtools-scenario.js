

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:6006/?path=/story/network-monitor-network-monitor--basic';
}

// action where you suspect the memory leak might be happening
async function action(page) {
    const components =  await page.$$('button[data-nodetype="component"]');
    for(const component of components) {
      component.evaluate((h)=>{h.click()});
    }

    await page.waitForSelector('#storybook-preview-iframe', { timeout: 30000 });
    const iframeHandle = await page.$('#storybook-preview-iframe');
    const frame = await iframeHandle.contentFrame();

    const stories = await page.$$('a[data-nodetype="story"]');
    console.log('stories', stories.length);
    for(const story of stories) {
        story.evaluate((h)=>{h.click()});

        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }
}

// how to go back to the state before actionw
async function back(page) {
    const handles12 =  await page.$$('#network-monitor-network-monitor');
    handles12[0].evaluate((h)=>{h.click()});
}

module.exports = {action, back, url, repeat: () => 9 };

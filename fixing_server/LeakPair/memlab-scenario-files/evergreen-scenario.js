/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:6006/?path=/story/alert--alert';
}

// action where you suspect the memory leak might be happening
async function action(page) {
  await page.waitForSelector('button[data-nodetype="component"]', {
    visible: true,
  });

  const buttons = await page.$$('button[data-nodetype="component"]');
  for (const button of buttons) {
    button.evaluate((h)=>{h.click()});
  }

  await page.waitForSelector('a[data-nodetype="story"]', {
    visible: true,
  });
  const stories = await page.$$('a[data-nodetype="story"]');

  await page.waitForSelector('#storybook-preview-iframe', { timeout: 30000 });
  const iframeHandle = await page.$('#storybook-preview-iframe');
  const frame = await iframeHandle.contentFrame();
  await frame.waitForSelector('body');

  for (let i=1; i<= 10; i++) {
    for (const story of stories) {
      story.evaluate((h)=>{h.click()});
      const framebody = await frame.$('body');
      framebody.evaluate((h)=>{h.click()});
    }
  }
};

// how to go back to the state before actionw
async function back(page) {
  // const alert =  await page.$('#alert--alert');
  // alert.evaluate((h)=>{h.click()});
}

module.exports = {action, back, url};

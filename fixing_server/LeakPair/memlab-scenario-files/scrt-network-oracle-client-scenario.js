/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */

function url() {
  return 'http://localhost:3000/';
}

// action where you suspect the memory leak might be happening
async function action(page) {
  await page.waitForXPath("//div[contains(., 'Service Provider')]", {
    visible: true,
  });

  const serviceProvider = await page.$x(
    "//div[contains(., 'Service Provider')]"
  );

  serviceProvider[0].evaluate((h) => {
    h.click();
  });

  const learn = await page.$$('p[href="/learn"]');
  learn[0].evaluate((h) => {
    h.click();
  });

  const connect = await page.$x("//p[contains(., 'Connect')]");
  connect[0].evaluate((h) => {
    h.click();
  });
}

// how to go back to the state before actionw
async function back(page) {
  const handles12 = await page.$$('a[href="/"]');
  handles12[0].evaluate((h) => {
    h.click();
  });
}

module.exports = { action, back, url, repeat: () => 9 };

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */

function url() {
  return 'http://localhost:8889/home';
}

// action where you suspect the memory leak might be happening
async function action(page) {
  await page.waitForSelector('.lang-btns', {
    visible: true
  });

  const langbuttons = await page.$$('.lang-btns button');
  langbuttons[0].evaluate(h => {
    h.click();
  });
  langbuttons[1].evaluate(h => {
    h.click();
  });

  const navitems = await page.$$('.nav-item');
  for (const item of navitems) {
    item.evaluate(h => {
      h.click();
    });
  }
}

// how to go back to the state before actionw
async function back(page) {
  const locale = await page.$('a[href="/home"]');
  locale.evaluate(h => {
    h.click();
  });
}

module.exports = { action, back, url, repeat: () => 9 };

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */

function url() {
  return 'http://localhost:4200/examples';
}

// action where you suspect the memory leak might be happening
async function action(page) {
  await page.waitForXPath("//mat-icon[contains(., 'menu')]", {
    visible: true,
  });

  for (let i = 0; i <= 65; i++) {
    const rtl = await page.$x("//mat-icon[contains(., 'menu')]");
    rtl[0].evaluate(h => {
      h.click();
    });

    const menuitems = await page.$$('.mat-mdc-list-item');
    menuitems[i].evaluate(h => {
      h.click();
    });

    const buttons = await page.$$('.demo-content');
    for (const btn of buttons) {
      btn.evaluate(h => {
        h.click();
      });
    }
  }
}

// how to go back to the state before actionw
async function back(page) {
  const handles12 = await page.$$('a[href="/examples"]');
  handles12[0].evaluate(h => {
    h.click();
  });
}

module.exports = {action, back, url, repeat: () => 9};

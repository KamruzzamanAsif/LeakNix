

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:8080/';
}

// action where you suspect the memory leak might be happening
async function action(page) {
    const range =  await page.$$('input[type="range"]');
    range[0].evaluate((h)=>{h.value = 72});
    range[0].evaluate((h)=>{h.value = 2});
    range[0].evaluate((h)=>{h.value = 95});
}

// how to go back to the state before actionw
async function back(page) {
}

module.exports = {action, back, url, repeat: () => 9};

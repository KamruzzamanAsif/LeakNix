/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:8084/';
}

// action where you suspect the memory leak might be happening
async function action(page) {
    for (let i=1; i<= 50; i++) {
        const inputs =  await page.$$('input');

        for (const input of inputs) {
            input.evaluate((h)=>{h.value=1234567890});
        }
    }
}

// how to go back to the state before actionw
async function back(page) {
}

module.exports = {action, back, url};

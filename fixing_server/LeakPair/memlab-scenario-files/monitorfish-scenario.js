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
    const dismisses =  await page.$$('.react-toast-notifications__toast__dismiss-button');
    console.log('dismisses', dismisses.length);

    for(const dismiss of dismisses) {
      dismiss.evaluate((h)=>{h.click()});
    }

    const buttons =  await page.$$('button');
    console.log('button', buttons.length);
    for(const btn of buttons) {
      const dataCy = await btn.evaluate((h)=>h.getAttribute('data-cy'));
      console.log('data-cy', dataCy);
    }

    await page.waitForSelector('button[data-cy="vessel-labels"]', {
      visible: true,
    });

    const handles2 =  await page.$$('button[data-cy="vessel-labels"]');
    handles2[0].evaluate((h)=>{h.click()});

    const labelRadio =  await page.$$('input[name="vesselLabelRadio"]');

    for(let i=0; i<3; i++) {
      labelRadio[0].evaluate((h)=>{h.click()});
    }

}

// how to go back to the state before actionw
async function back(page) {
}

module.exports = {action, back, url, repeat: () => 9};

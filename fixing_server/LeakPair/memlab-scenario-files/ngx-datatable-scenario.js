/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:4200/#virtual-scroll';
}

// action where you suspect the memory leak might be happening
async function action(page) {
  const navitems =  await page.$$('nav a');
  
  for(const item of navitems) {
    const navItemText = await item.evaluate((h)=> h.textContent);
    if (navItemText === 'Online' ||  navItemText === 'PDF') {
      continue;
    }

    item.evaluate((h)=>{h.click()});

    const buttons =  await page.$$('content button');
    for(const btn of buttons) {
      const buttonText = await item.evaluate((h)=> h.textContent);
      btn.evaluate((h)=>{h.click()});
    }

    const spans =  await page.$$('content span');
    for(const span of spans) {
      const spanText = await span.evaluate((h)=> h.getAttribute('class'));
      span.evaluate((h)=>{h.click()});
    }

    const inputs =  await page.$$('content input');
    for(const input of inputs) {
      const inputText = await input.evaluate((h)=> h.getAttribute('class'));
      input.evaluate((h)=>{h.click()});
    }
  }
}

// how to go back to the state before actionw
async function back(page) {
  const handles12 =  await page.$$('a[href="#virtual-scroll"]');
  handles12[0].evaluate((h)=>{h.click()});
}

module.exports = {url, action, back, repeat: () => 1};

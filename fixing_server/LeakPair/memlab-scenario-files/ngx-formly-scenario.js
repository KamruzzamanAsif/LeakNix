/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:4100/';
}

// action where you suspect the memory leak might be happening
async function action(page) {
    const guide =  await page.$('a[href="/guide"]');
    guide.evaluate((h)=>{h.click()});

    const sideNavLinks =  await page.$$('.mat-drawer-inner-container a[routerlinkactive="active-link"]');
    console.log('guide sideNavLinks', sideNavLinks.length);

    for (const link of sideNavLinks) {
      const linkcontent = await link.evaluate(b => b.getAttribute('href'));
      console.log('guide-linkconent', linkcontent);

      if (linkcontent === '/guide'
        || linkcontent === '/ui'
        || linkcontent === '/examples') {
        continue
      }

      link.evaluate((h)=>{h.click()});
      const buttons =  await page.$$('formly-examples-viewer button');
      const inputs =  await page.$$('formly-examples-viewer input');
      for (const btn of buttons) {
        btn.evaluate((h)=>{h.click()});
      }
      for (const input of inputs) {
        input.evaluate((h)=>{h.click()});
      }
    }

    const ui =  await page.$('a[href="/ui"]');
    ui.evaluate((h)=>{h.click()});

    const sideNavLinks2 =  await page.$$('.mat-drawer-inner-container a[routerlinkactive="active-link"]');
    console.log('ui sideNavLinks', sideNavLinks2.length);

    for (const link of sideNavLinks2) {
      const linkcontent = await link.evaluate(b => b.getAttribute('href'));
      console.log('ui-linkconent', linkcontent);

      if (linkcontent === '/guide'
        || linkcontent === '/ui'
        || linkcontent === '/examples') {
        continue
      }

      link.evaluate((h)=>{h.click()});

      const buttons =  await page.$$('formly-examples-viewer button');
      const inputs =  await page.$$('formly-examples-viewer input');

      // for (const btn of buttons) {
      //   const btnAria = await btn.evaluate(b => b.getAttribute('aria-label'));
      //   const btntext = await btn.evaluate(b => b.textContent);
      //   console.log('ui-btntext', btntext);
      //   if (btnAria == 'Edit this example in StackBlitz') {
      //     continue
      //   }
      //   btn.evaluate((h)=>{h.click()});
      // }

      for (const input of inputs) {
        input.evaluate((h)=>{h.click()});
      }
    }

    const examples =  await page.$('a[href="/examples"]');
    examples.evaluate((h)=>{h.click()});

    const sideNavLinks3 =  await page.$$('.mat-drawer-inner-container a[routerlinkactive="active-link"]');
    console.log('examples sideNavLinks', sideNavLinks3.length);
    for (const link of sideNavLinks3) {
      const linkcontent = await link.evaluate(b => b.getAttribute('href'));
      console.log('examples-linkconent', linkcontent);
      if (linkcontent === '/guide'
        || linkcontent === '/ui'
        || linkcontent === '/examples') {
        continue
      }

      const buttons =  await page.$$('formly-examples-viewer button');
      const inputs =  await page.$$('formly-examples-viewer input');

      // for (const btn of buttons) {
      //   const btnAria = await btn.evaluate(b => b.getAttribute('aria-label'));
      //   const btntext = await btn.evaluate(b => b.textContent);
      //   console.log('examples-btntext', btntext);
      //   if (btnAria == 'Edit this example in StackBlitz') {
      //     continue
      //   }
      //   btn.evaluate((h)=>{h.click()});
      // }

      for (const input of inputs) {
        input.evaluate((h)=>{h.click()});
      }
    }
}

// how to go back to the state before actionw
async function back(page) {
    const handles12 =  await page.$$('a[href="/"]');
    handles12[0].evaluate((h)=>{h.click()});
}

module.exports = {url, action, back, repeat: () => 1};

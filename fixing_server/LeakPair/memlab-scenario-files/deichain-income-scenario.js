/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:4200/dashboard';
}

// action where you suspect the memory leak might be happening
async function action(page) {

    await page.waitForSelector('#statisticsOnId', {
      visible: true,
    });

    const handles =  await page.$$('#statisticsOnId');
    handles[0].evaluate((h)=>{h.click()});

    const handles1 =  await page.$$('a[title="Holdings/liabilities"]');
    handles1[0].evaluate((h)=>{h.click()});

    const framebuttons = await page.$$("button");
    console.log('framebuttons1', framebuttons.length);

    for (const btn of framebuttons) {
      const btnID = await btn.evaluate((h)=>h.getAttribute('id'));
      console.log('btnID', btnID);
      btn.evaluate((h)=>{h.click()});
    }

    const handles2 =  await page.$$('a[title="Income"]');
    handles2[0].evaluate((h)=>{h.click()});

    const framebuttons2 = await page.$$("button");
    console.log('framebuttons2', framebuttons2.length);

    for (const btn of framebuttons2) {
      const btnID = await btn.evaluate((h)=>h.getAttribute('id'));
      console.log('btnID', btnID);
      btn.evaluate((h)=>{h.click()});
    }

    const handles4 =  await page.$$('a[title="History"]');
    handles4[0].evaluate((h)=>{h.click()});

      await page.waitForSelector('select', {
        visible: true,
      });

      const framebuttons3 = await page.$$("button");
    console.log('framebuttons3', framebuttons3.length);

    for (const btn of framebuttons3) {
      const btnID = await btn.evaluate((h)=>h.getAttribute('id'));
      console.log('btnID', btnID);
      btn.evaluate((h)=>{h.click()});
    }

    const selecttag =  await page.$$('select');

    selecttag[0].evaluate((h)=>{h.click()});
    const pooloption = await page.$x('//option[contains(., "ETH")]');
    pooloption[0].evaluate((h)=>{h.click()});

    selecttag[1].evaluate((h)=>{h.click()});
    const timeoption = await page.$x('//option[contains(., "7D")]');
    timeoption[0].evaluate((h)=>{h.click()});

    const go = await page.$x('//button[contains(., " GO ")]');
    go[0].evaluate((h)=>{h.click()});

    const dex =  await page.$$('a[title="DEX"]');
    dex[0].evaluate((h)=>{h.click()});

    const framebuttons4 = await page.$$("button");
    console.log('framebuttons4', framebuttons4.length);

    for (const btn of framebuttons4) {
      const btnID = await btn.evaluate((h)=>h.getAttribute('id'));
      console.log('btnID', btnID);
      btn.evaluate((h)=>{h.click()});
    }

    const defi =  await page.$$('a[title="DEFI"]');
    defi[0].evaluate((h)=>{h.click()});

    const framebuttons5 = await page.$$("button");
    console.log('framebuttons5', framebuttons5.length);

    for (const btn of framebuttons5) {
      const btnID = await btn.evaluate((h)=>h.getAttribute('id'));
      console.log('btnID', btnID);
      btn.evaluate((h)=>{h.click()});
    }

    const calc =  await page.$$('a[title="Calculator"]');
    calc[0].evaluate((h)=>{h.click()});

    const framebuttons6 = await page.$$("button");
    console.log('framebuttons6', framebuttons6.length);

    for (const btn of framebuttons6) {
      const btnID = await btn.evaluate((h)=>h.getAttribute('id'));
      console.log('btnID', btnID);
      btn.evaluate((h)=>{h.click()});
    }

    const newsletter =  await page.$$('a[title="Newsletter"]');
    newsletter[0].evaluate((h)=>{h.click()});

    const framebuttons7 = await page.$$("button");
    console.log('framebuttons7', framebuttons7.length);

    for (const btn of framebuttons7) {
      const btnID = await btn.evaluate((h)=>h.getAttribute('id'));
      console.log('btnID', btnID);
      btn.evaluate((h)=>{h.click()});
    }

    const handles5 =  await page.$$('a[title="Info"]');
    handles5[0].evaluate((h)=>{h.click()});

    const framebuttons8 = await page.$$("button");
    console.log('framebuttons8', framebuttons8.length);

    for (const btn of framebuttons8) {
      const btnID = await btn.evaluate((h)=>h.getAttribute('id'));
      console.log('btnID', btnID);
      btn.evaluate((h)=>{h.click()});
    }

    const handles6 =  await page.$$('a[title="Settings"]');
    handles6[0].evaluate((h)=>{h.click()});

    const framebuttons9 = await page.$$("button");
    console.log('framebuttons9', framebuttons9.length);

    const settingButtons =  await page.$$('button');

    for (let i=0; i<2; i++) {
      settingButtons[i].evaluate((h)=>{h.click()});
    }

    const dash = await page.$$('a[title="Dashboard"]');
    dash[0].evaluate((h)=>{h.click()});
}

// how to go back to the state before actionw
async function back(page) {
    const handles12 =  await page.$$('header img[src="assets/img/Defi-income.svg"]');
    handles12[0].evaluate((h)=>{h.click()})
}

module.exports = {action, back, url, repeat: () => 10};

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:4200/elements/#/home';
}

// action where you suspect the memory leak might be happening
async function action(page) {
  await page.waitForSelector('a[href="#/docs"]', {
    visible: true,
  });

  const docs = await page.$('a[href="#/docs"]');
  docs.evaluate((h)=>{h.click()});

  await page.waitForSelector('.sub-nav', {
      visible: true,
  });

  const submenus =  await page.$$('.sub-nav');
  console.log('submenus1', submenus.length);
  for (const submenu of submenus) {
    submenu.evaluate((h)=>{h.click()});

    const buttons =  await page.$$('.wrapper button');
    console.log('buttons', buttons.length);

    for (const btn of buttons) {
      const btnid = await btn.evaluate(btnitem => btnitem.getAttribute('id'));
      const textcontent = await btn.evaluate(btnitem => btnitem.textContent);
      console.log('button id', btnid);
      console.log('button text content', textcontent);
      btn.evaluate((h)=>{h.click()});
    }
  }

  const examples = await page.$('a[href="#/examples"]');
  examples.evaluate((h)=>{h.click()});

  await page.waitForSelector('.sub-nav', {
    visible: true,
  });

  const submenus2 =  await page.$$('.sub-nav');
  console.log('submenus2', submenus.length);

  for (const submenu of submenus2) {
    submenu.evaluate((h)=>{h.click()});

    const buttons2 =  await page.$$('.wrapper button');
    console.log('buttons2', buttons2.length);

    for (const btn of buttons2) {
      const btnid = await btn.evaluate(btnitem => btnitem.getAttribute('id'));
      const textcontent = await btn.evaluate(btnitem => btnitem.textContent);
      console.log('button id', btnid);
      console.log('button2 text content', textcontent);

      if (textcontent.includes('Preload everything')) {
        continue;
      }
      btn.evaluate((h)=>{h.click()});
    }
  }

  await page.waitForSelector('a[href="#/contribute"]', {
    visible: true,
  });

  const contribute = await page.$('a[href="#/contribute"]');
  contribute.evaluate((h)=>{h.click()});

  const changelog = await page.$('a[href="#/changelog"]');
  changelog.evaluate((h)=>{h.click()});
}

// how to go back to the state before actionw
async function back(page) {
    const home =  await page.$('mat-icon[svgicon="logo"]');
    home.evaluate((h)=>{h.click()});
}


module.exports = {action, back, url, repeat: () => 3 };

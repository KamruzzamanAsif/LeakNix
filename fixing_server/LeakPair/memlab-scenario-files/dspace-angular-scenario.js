
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:4000/home';
}

// action where you suspect the memory leak might be happening
async function action(page) {
  await page.waitForSelector('ds-search-form input', {
    visible: true,
    timeout: 10000
  });

  const inputf =  await page.$('ds-search-form input');
  inputf.evaluate((h)=>{h.value='test'});

  const  searchbtn =  await page.$('.search-button');
  searchbtn.evaluate((h)=>{h.click()});

  await page.waitForSelector('ds-search-filters div', {
    visible: true,
    timeout: 10000
  });

  const  filterbuttons =  await page.$$('.filter-name');
  console.log('filterbuttons', filterbuttons.length);
  for (const btn of filterbuttons) {
    // const btnclass = await btn.evaluate((h)=>h.getAttribute('class'));
    // const btnhref = await btn.evaluate((h)=>h.getAttribute('href'));
    btn.evaluate((h)=>{h.click()});
  }

  const  checboxes =  await page.$$('input[type="checkbox"]');
  console.log('checboxes.length', checboxes.length);
  for (const box of checboxes) {
    box.evaluate((h)=>{h.click()});
  }

  const  gridview =  await page.$('a[data-test="grid-view"]');
  gridview.evaluate((h)=>{h.click()});


  const  community =  await page.$('a[href="/community-list"]');
  community.evaluate((h)=>{h.click()});

}

// how to go back to the state before actionw
async function back(page) {
  const handles12 =  await page.$$('img[src="assets/images/dspace-logo.svg"]');
  handles12[0].evaluate((h)=>{h.click()});
}

module.exports = {action, back, url, repeat: () => 9 };


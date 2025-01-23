/* eslint-disable prettier/prettier */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */
function url() {
  return "http://localhost:6006/?path=/story/docs-intro--page"
}

// action where you suspect the memory leak might be happening
async function action(page) {
  const groups= await page.$$('button[data-nodetype="group"]');
  for (const group of groups) {
    group.evaluate(h => {h.click()})
  }

  const components = await page.$$('button[data-nodetype="component"]');
  for (const component of components) {
    component.evaluate(h => {h.click()})
  }

  const stories = await page.$$('a[data-nodetype="story"]');
  console.log('stories', stories.length);

  for (const story of stories) {
    const storyid = await story.evaluate((h)=>h.getAttribute('id'));
    console.log('storyid', storyid);
    story.evaluate(h => {h.click()});

    const framebuttons = await page.$$(".sb-show-main button");
    console.log('framebuttons', framebuttons.length);

    for (const btn of framebuttons) {
      const btnID = await btn.evaluate((h)=>h.getAttribute('id'));
      console.log('btnID', btnID);
      btn.evaluate((h)=>{h.click()});
    }
  }
}

module.exports = {action, back, url, repeat: () => 9 };

// how to go back to the state before actionw
async function back(page) {
  const home =  await page.$('#docs-intro--page');;
  home.evaluate(h => {h.click()})
}

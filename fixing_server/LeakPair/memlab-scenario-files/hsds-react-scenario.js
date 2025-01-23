/* eslint-disable prettier/prettier */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */

function url() {
  return 'http://localhost:8900/?path=/story/welcome-2-contributing--page'
}

// action where you suspect the memory leak might be happening
async function action(page) {
  const docs = await page.$$('button[data-nodetype="document"]')
  for (const doc of docs) {
    doc.evaluate(h => {
      h.click()
    })
  }

  const groups = await page.$$('button[data-nodetype="group"]')
  for (const group of groups) {
    group.evaluate(h => {
      h.click()
    })
  }

  const components = await page.$$('button[data-nodetype="component"]')
  for (const component of components) {
    component.evaluate(h => {
      h.click()
    })
  }

  console.log('components', components.length)
  await page.waitForSelector('#storybook-preview-iframe', { timeout: 30000 })
  const iframeHandle = await page.$('#storybook-preview-iframe')
  const frame = await iframeHandle.contentFrame()

  const stories = await page.$$('a[data-nodetype="story"]')
  console.log('stories', stories.length)
  for (const story of stories) {
    const storyid = await story.evaluate(h => h.getAttribute('id'))
    console.log('\nstoryid', storyid)
    story.evaluate(h => {
      h.click()
    })

    // await frame.waitForSelector('.sb-show-main');
    const framebuttons = await frame.$$('button')
    console.log('framebuttons', framebuttons.length)

    for (const btn of framebuttons) {
      const btnID = await btn.evaluate(h => h.getAttribute('id'))
      console.log('btnID', btnID)
      btn.evaluate(h => {
        h.click()
      })
    }
  }
}

// how to go back to the state before actionw
async function back(page) {
  const alert = await page.$('#welcome-2-contributing--page')
  alert.evaluate(h => {
    h.click()
  })
}

module.exports = { action, back, url, repeat: () => 9 }

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */

function url() {
  return 'http://localhost:6006/?path=/story/docs-introduction--page';
}

// action where you suspect the memory leak might be happening
async function action(page) {
      const handlers =  await page.$$('#docs-handlers--page');
      handlers[0].evaluate((h)=>{h.click()});

      const props =  await page.$$('#docs-props--page');
      props[0].evaluate((h)=>{h.click()});

      await page.waitForSelector('#storybook-preview-iframe', { timeout: 30000 });
      const iframeHandle = await page.$('#storybook-preview-iframe');
      const frame = await iframeHandle.contentFrame();

      const renderingcontent = await page.$$("#examples-rerendering-content--rerendering-content");
      renderingcontent[0].evaluate((h)=>{h.click()});


      const mixedcontent = await page.$$("#examples-mixed-content--mixed-content");
      mixedcontent[0].evaluate((h)=>{h.click()});
      await frame.waitForSelector('.react-transform-component img');
      const clickMe = await frame.$x("//button[contains(., 'Click me!')]");
      const img1 = await frame.$(".react-transform-component img");
      img1.evaluate((h)=>{h.click()});
      // clickMe[0].evaluate((h)=>{h.click()});

      const controls = await page.$$("#examples-controls--controls");
      controls[0].evaluate((h)=>{h.click()});

      await frame.waitForXPath("//button[contains(., 'Zoom In +')]");
      const zoomout = await frame.$x("//button[contains(., 'Zoom In +')]");
      zoomout[0].evaluate((h)=>{h.click()});
      const zoomin = await frame.$x("//button[contains(., 'Zoom Out -')]");
      zoomin[0].evaluate((h)=>{h.click()});
      const reset = await frame.$x("//button[contains(., 'Reset')]");
      reset[0].evaluate((h)=>{h.click()});
      const center = await frame.$x("//button[contains(., 'Center')]");
      center[0].evaluate((h)=>{h.click()});
      const img2 = await frame.$(".react-transform-component img");
      img2.evaluate((h)=>{h.click()});
      

      const bigimage = await page.$$("#examples-big-image--big-image");
      bigimage[0].evaluate((h)=>{h.click()});

      await frame.waitForXPath("//button[contains(., 'Zoom In +')]");
      const zoomout2 = await frame.$x("//button[contains(., 'Zoom In +')]");
      zoomout2[0].evaluate((h)=>{h.click()});
      const zoomin2 = await frame.$x("//button[contains(., 'Zoom Out -')]");
      zoomin2[0].evaluate((h)=>{h.click()});
      const reset2 = await frame.$x("//button[contains(., 'Reset')]");
      reset2[0].evaluate((h)=>{h.click()});
      const center2 = await frame.$x("//button[contains(., 'Center')]");
      center2[0].evaluate((h)=>{h.click()});
      const img3 = await frame.$(".react-transform-component img");
      img3.evaluate((h)=>{h.click()});


      const mediumimage = await page.$$("#examples-medium-image--medium-image");
      mediumimage[0].evaluate((h)=>{h.click()});

      await frame.waitForXPath("//button[contains(., 'Zoom In +')]");
      const zoomout3 = await frame.$x("//button[contains(., 'Zoom In +')]");
      zoomout3[0].evaluate((h)=>{h.click()});
      const zoomin3 = await frame.$x("//button[contains(., 'Zoom Out -')]");
      zoomin3[0].evaluate((h)=>{h.click()});
      const reset3 = await frame.$x("//button[contains(., 'Reset')]");
      reset3[0].evaluate((h)=>{h.click()});
      const center3 = await frame.$x("//button[contains(., 'Center')]");
      center3[0].evaluate((h)=>{h.click()});
      const img4 = await frame.$(".react-transform-component img");
      img4.evaluate((h)=>{h.click()});


      const smallimage = await page.$$("#examples-small-image--small-image");
      smallimage[0].evaluate((h)=>{h.click()});
  
      await frame.waitForXPath("//button[contains(., 'Zoom In +')]");
      const zoomout4 = await frame.$x("//button[contains(., 'Zoom In +')]");
      zoomout4[0].evaluate((h)=>{h.click()});
      const zoomin4 = await frame.$x("//button[contains(., 'Zoom Out -')]");
      zoomin4[0].evaluate((h)=>{h.click()});
      const reset4 = await frame.$x("//button[contains(., 'Reset')]");
      reset4[0].evaluate((h)=>{h.click()});
      const center4 = await frame.$x("//button[contains(., 'Center')]");
      center4[0].evaluate((h)=>{h.click()});
      const img5 = await frame.$(".react-transform-component img");
      img5.evaluate((h)=>{h.click()});

      const zoomedout = await page.$$("#examples-zoomed-out--zoomed-out");
      zoomedout[0].evaluate((h)=>{h.click()});

      await frame.waitForXPath("//button[contains(., 'Zoom In +')]");
      const zoomout5 = await frame.$x("//button[contains(., 'Zoom In +')]");
      zoomout5[0].evaluate((h)=>{h.click()});
      const zoomin5 = await frame.$x("//button[contains(., 'Zoom Out -')]");
      zoomin5[0].evaluate((h)=>{h.click()});
      const reset5 = await frame.$x("//button[contains(., 'Reset')]");
      reset5[0].evaluate((h)=>{h.click()});
      const center5 = await frame.$x("//button[contains(., 'Center')]");
      center5[0].evaluate((h)=>{h.click()});
      const img6 = await frame.$(".react-transform-component img");
      img6.evaluate((h)=>{h.click()});

      const zoomedin = await page.$$("#examples-zoom-to-element--zoom-to-element");
      zoomedin[0].evaluate((h)=>{h.click()});
  
  
      await frame.waitForSelector("#root button");
      const framebuttons = await frame.$$("#root button");

      for (const btn of framebuttons) {
        btn.evaluate((h)=>{h.click()});
      }
}

// how to go back to the state before actionw
async function back(page) { 
    const handles12 =  await page.$$('#docs-introduction--page');
    handles12[0].evaluate((h)=>{h.click()});
}

module.exports = {action, back, url, repeat: () =>  9};
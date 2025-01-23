// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:9009/?path=/story/components-autosizingcanvas--static';
}

// action where you suspect the memory leak might be happening
async function action(page) {
    const panelImage =  await page.$('#panels-image');
    panelImage.evaluate((h)=>{h.click()});

    const panelImagesComponents =  await page.$$('button[data-parent-id="panels-image"]');
    for(const component of panelImagesComponents) {
      component.evaluate((h)=>{h.click()});
    }

    const panelImagesStories =  await page.$$('a[data-parent-id^="panels-image-"]');
    for(const story of panelImagesStories) {
      story.evaluate((h)=>{h.click()});
    }

    console.log('panelImagesStories', panelImagesStories.length);

    //////////////////

     const threedeerender =  await page.$('#panels-threedeerender');
    threedeerender.evaluate((h)=>{h.click()});

    const threedeerenderComponents =  await page.$$('button[data-parent-id="panels-threedeerender"]');
    for(const component of threedeerenderComponents) {
      component.evaluate((h)=>{h.click()});
    }

    const threedeerenderStories =  await page.$$('a[data-parent-id^="panels-threedeerender-"]');
    for(const story of threedeerenderStories) {
      story.evaluate((h)=>{h.click()});
    }

    console.log('threedeerenderStories', threedeerenderStories.length);

    //////////////////


    const playbackcontrol =  await page.$('#components-playbackcontrols');
    playbackcontrol.evaluate((h)=>{h.click()});

    const playbackcontrolscomponents =  await page.$$('button[data-parent-id^="components-playbackcontrols"]');
    for(const component of playbackcontrolscomponents) {
      component.evaluate((h)=>{h.click()});
    }

    const playbackcontrolsstories =  await page.$$('a[data-parent-id^="components-playbackcontrols-"]');
    for(const story of playbackcontrolsstories) {
      story.evaluate((h)=>{h.click()});
    }

    console.log('playbackcontrolsstories', playbackcontrolsstories.length);

    //////////////////

    const timebasedchart =  await page.$('#components-timebasedchart');
    timebasedchart.evaluate((h)=>{h.click()});

    const timebasedchartcomponents =  await page.$$('button[data-parent-id^="components-timebasedchart"]');
    for(const component of timebasedchartcomponents) {
      component.evaluate((h)=>{h.click()});
    }

    const timebasedchartstories =  await page.$$('a[data-parent-id^="components-timebasedchart-"]');
    for(const story of timebasedchartstories) {
      story.evaluate((h)=>{h.click()});
    }

    console.log('timebasedchartstories', timebasedchartstories.length);

    //////////////////

    const opendialog =  await page.$('#components-opendialog');
    opendialog.evaluate((h)=>{h.click()});

    const opendialogcomponents =  await page.$$('button[data-parent-id^="components-opendialog"]');
    for(const component of opendialogcomponents) {
      component.evaluate((h)=>{h.click()});
    }

    const opendialogstories =  await page.$$('a[data-parent-id^="components-opendialog-"]');
    for(const story of opendialogstories) {
      story.evaluate((h)=>{h.click()});
    }

    console.log('opendialogstories', opendialogstories.length);

    ////////////////////////


    const legacyplot =  await page.$('#panels-legacyplot');
    legacyplot.evaluate((h)=>{h.click()});

    const legacyplotstories =  await page.$$('a[data-parent-id^="panels-legacyplot"]');
    for(const story of legacyplotstories) {
      story.evaluate((h)=>{h.click()});
    }

    console.log('legacyplotstories', legacyplotstories.length);
    //////////////////



    /////////////////

     const autosizingcanvas =  await page.$('#components-autosizingcanvas');
    autosizingcanvas.evaluate((h)=>{h.click()});

    const autosizingcanvasStories =  await page.$$('a[data-parent-id^="panels-rawmessages"]');
    for(const story of autosizingcanvasStories) {
      story.evaluate((h)=>{h.click()});
    }

     console.log('autosizingcanvasStories', autosizingcanvasStories.length);

    //////////////////



    const devicecodedialog =  await page.$('#accountsettingssidebar-devicecodedialog');
    devicecodedialog.evaluate((h)=>{h.click()});

    const devicecodedialogStories =  await page.$$('a[data-parent-id^="accountsettingssidebar-devicecodedialog"]');
    for(const story of devicecodedialogStories) {
      story.evaluate((h)=>{h.click()});
    }

    console.log('devicecodedialogStories', devicecodedialogStories.length);
    //////////////////



     const rawmessages =  await page.$('#panels-rawmessages');
    rawmessages.evaluate((h)=>{h.click()});

    const rawmessagesstories =  await page.$$('a[data-parent-id^="panels-rawmessages"]');
    for(const story of rawmessagesstories) {
      story.evaluate((h)=>{h.click()});
    }

    console.log('rawmessagesstories', rawmessagesstories.length);
    //////////////////


    const topicgraphplot =  await page.$('#panels-topicgraph');
    topicgraphplot.evaluate((h)=>{h.click()});

    const topicgraphstories =  await page.$$('a[data-parent-id^="panels-topicgraph"]');
    for(const story of topicgraphstories) {
      story.evaluate((h)=>{h.click()});
    }

    console.log('topicgraphstories', topicgraphstories.length);
}

// how to go back to the state before actionw
async function back(page) {
    const handles12 =  await page.$$('#components-autosizingcanvas');
    handles12[0].evaluate((h)=>{h.click()});
}

module.exports = {action, back, url, repeat: () => 1};

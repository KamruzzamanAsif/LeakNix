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
    const bold = await page.$$('button[aria-label="Bold"]');
    bold[0].evaluate(h => {
        h.click();
    });

    const italic = await page.$$('button[aria-label="Italic"]');
    italic[0].evaluate(h => {
        h.click();
    });

    const underline = await page.$$('button[aria-label="Underline"]');
    underline[0].evaluate(h => {
        h.click();
    });

    const font = await page.$$('button[aria-label="Font"]');
    font[0].evaluate(h => {
        h.click();
    });

    const size = await page.$$('button[aria-label="Font size"]');
    size[0].evaluate(h => {
        h.click();
    });

    const increasesize = await page.$$('button[aria-label="Increase font size"]');
    increasesize[0].evaluate(h => {
        h.click();
    });

    const color = await page.$$('button[aria-label="Text color"]');
    color[0].evaluate(h => {
        h.click();
    });

    const bgcolor = await page.$$('button[aria-label="Background color"]');
    bgcolor[0].evaluate(h => {
        h.click();
    });

    const list = await page.$$('button[aria-label="Bulleted list"]');
    list[0].evaluate(h => {
        h.click();
    });

    const numlist = await page.$$('button[aria-label="Numbered list"]');
    numlist[0].evaluate(h => {
        h.click();
    });

    const decreaseindent = await page.$$('button[aria-label="Decrease indent"]');
    decreaseindent[0].evaluate(h => {
        h.click();
    });

    const increaseindent = await page.$$('button[aria-label="Increase indent"]');
    increaseindent[0].evaluate(h => {
        h.click();
    });

    const showsidepane = await page.$$('.side-pane-toggle.close');
    showsidepane[0].evaluate(h => {
        h.click();
    });

    await page.waitForXPath("//div[contains(text(), 'Format State')]", {
        visible: true,
    });

    const state = await page.$x("//div[contains(text(), 'Format State')]");
    state[0].evaluate(h => {
        h.click();
    });

    const options = await page.$x("//div[contains(., 'Editor Options')]");
    options[0].evaluate(h => {
        h.click();
    });

    const pageRight = await page.$$('label[for="pageRtl"]');
    pageRight[0].evaluate(h => {
        h.click();
    });

    const viewer = await page.$x("//div[contains(., 'Event Viewer')]");
    viewer[0].evaluate(h => {
        h.click();
    });

    const clearall = await page.$x("//button[contains(., 'Clear all')]");
    clearall[0].evaluate(h => {
        h.click();
    });

    const playground = await page.$x("//div[contains(., 'API Playground')]");
    playground[0].evaluate(h => {
        h.click();
    });

    const snapshots = await page.$x("//div[contains(., 'Undo Snapshots')]");
    snapshots[0].evaluate(h => {
        h.click();
    });

    const takesnapshot = await page.$x("//div[contains(., 'Take snapshot')]");
    takesnapshot[0].evaluate(h => {
        h.click();
    });

    const hidesidepane = await page.$$('.side-pane-toggle.open');
    hidesidepane[0].evaluate(h => {
        h.click();
    });
}

// how to go back to the state before actionw
async function back(page) {
    // const handles12 =  await page.$$('a[href="/"]');
    // handles12[0].evaluate((h)=>{h.click()});
}

module.exports = { action, back, url, repeat: () => 9 };

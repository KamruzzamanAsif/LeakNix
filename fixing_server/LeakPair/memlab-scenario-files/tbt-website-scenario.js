/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */

function url() {
  return "http://localhost:3000/";
}

// action where you suspect the memory leak might be happening
async function action(page) {
  for (let i=1; i<=50; i++) {
    const about = await page.$$('a[href="/#about"]');
    about[0].evaluate((h) => {
      h.click();
    });

    const scrollup = await page.$$(".scroll");
    scrollup[0].evaluate((h) => {
      h.click();
    });

    const readersforum = await page.$$('a[href="/#readersForum"]');
    readersforum[0].evaluate((h) => {
      h.click();
    });

    const scrollup1 = await page.$$(".scroll");
    scrollup1[0].evaluate((h) => {
      h.click();
    });

    const writersforum = await page.$$('a[href="/#writersForum"]');
    writersforum[0].evaluate((h) => {
      h.click();
    });

    const scrollup3 = await page.$$(".scroll");
    scrollup3[0].evaluate((h) => {
      h.click();
    });

    const speakersforum = await page.$$('a[href="/#speakersForum"]');
    speakersforum[0].evaluate((h) => {
      h.click();
    });

    const scrollup5 = await page.$$(".scroll");
    scrollup5[0].evaluate((h) => {
      h.click();
    });

    const events = await page.$$('a[href="/#events"]');
    events[0].evaluate((h) => {
      h.click();
    });

    const scrollup4 = await page.$$(".scroll");
    scrollup4[0].evaluate((h) => {
      h.click();
    });

    const team = await page.$$('a[href="/#team"]');
    team[0].evaluate((h) => {
      h.click();
    });

    const scrollup6 = await page.$$(".scroll");
    scrollup6[0].evaluate((h) => {
      h.click();
    });

    const vision = await page.$$('a[href="/vision"]');
    vision[0].evaluate((h) => {
      h.click();
    });

    const scrollup7 = await page.$$(".scroll");
    scrollup7[0].evaluate((h) => {
      h.click();
    });
  }
}

// how to go back to the state before actionw
async function back(page) {
  const home = await page.$$('a[href="/"]');
  home[0].evaluate((h) => {
    h.click();
  });
}

module.exports = { action, back, url };

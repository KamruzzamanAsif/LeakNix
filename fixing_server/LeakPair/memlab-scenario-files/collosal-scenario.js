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
    for (let i=1; i<=10; i++) {
      await page.waitForSelector('nav p[href="/service"]', {
          visible: true,
      });

      const service =  await page.$$('nav p[href="/service"]');
      service[0].evaluate((h)=>{h.click()});

      await page.waitForXPath("//p[contains(., 'Service Detail')]", {
          visible: true,
      });

      const servicedetail = await page.$x("//p[contains(., 'Service Detail')]");
      servicedetail[0].evaluate((h)=>{h.click()});

      await page.waitForSelector('a[href="/quote"]', {
          visible: true,
      });

      const quote = await page.$$('a[href="/quote"]');
      quote[0].evaluate((h)=>{h.click()});

      await page.waitForSelector('input', {
          visible: true,
      });

      const input = await page.$$('input');
      input[0].evaluate((h)=>{h.value = 'test name'});

      const howwework =  await page.$$('nav p[href="/how-we-work"]');
      howwework[0].evaluate((h)=>{h.click()});

      const project =  await page.$$('nav p[href="/project"]');
      project[0].evaluate((h)=>{h.click()});

      // await page.waitForXPath("//button[contains(., 'Detail')]", {
        //   visible: true,
      // });

      // const detail = await page.$x("//button[contains(., 'Detail')]");
      // detail[0].evaluate((h)=>{h.click()});

      const about = await page.$$('nav p[href="/about"]');
      about[0].evaluate((h)=>{h.click()});

      await page.waitForSelector('img[alt="Team Avatar"]', {
          visible: true,
      });

      const avatar = await page.$$('img[alt="Team Avatar"]');
      avatar[0].evaluate((h)=>{h.click()});

      await page.waitForSelector('p[href="/blog"]', {
          visible: true,
      });

      const blog = await page.$$('p[href="/blog"]');
      blog[0].evaluate((h)=>{h.click()});

      await page.waitForSelector('img[alt="Blog Thumbnail"]', {
          visible: true,
      });

      const blogthumbnail = await page.$$('img[alt="Blog Thumbnail"]');
      blogthumbnail[0].evaluate((h)=>{h.click()});

      const loadmore = await page.$x("//button[contains(., 'Load More')]");
      loadmore[0].evaluate((h)=>{h.click()});
    }

    // const contact = await page.$x("//button[contains(., 'Contact')]");
    // contact[0].evaluate((h)=>{h.click()});

    // const sendQuote = await page.$x("//button[contains(., 'Send Quote')]");
    // sendQuote[0].evaluate((h)=>{h.click()});

    // const askus = await page.$x("//button[contains(., 'Ask Us')]");
    // askus[0].evaluate((h)=>{h.click()});


  //   await page.waitForXPath("//div[contains(., 'Transaction')]", {
  //      visible: true,
  //   });

  //   const Transaction = await page.$x("//div[contains(., 'Transaction')]");
  //   Transaction[0].evaluate((h)=>{h.click()});

  //   const Maintenance = await page.$x("//div[contains(., 'Maintenance')]");
  //   Maintenance[0].evaluate((h)=>{h.click()});

  //   const Technology = await page.$x("//div[contains(., 'Technology')]");
  //   Technology[0].evaluate((h)=>{h.click()});

  //   const questionexpand =  await page.$$('.select-none');
  //   questionexpand[0].evaluate((h)=>{h.click()});

  //   await page.waitForXPath("//p[contains(., 'Web Development')]", {
  //      visible: true,
  //   });

  //   const webdev = await page.$x("//p[contains(., 'Web Development')]");
  //   webdev[0].evaluate((h)=>{h.click()});

  //   const appdev = await page.$x("//p[contains(., 'App Development')]");
  //   appdev[0].evaluate((h)=>{h.click()});

  //   const uidesign = await page.$x("//p[contains(., 'UI Design')]");
  //   uidesign[0].evaluate((h)=>{h.click()});

  //   const consult = await page.$x("//p[contains(., 'Consultation')]");
  //   consult[0].evaluate((h)=>{h.click()});

  //  const maintainanance = await page.$x("//p[contains(., 'Maintenance')]");
  //   maintainanance[0].evaluate((h)=>{h.click()});

  //   const pricing = await page.$x("//p[contains(., 'Pricing')]");
  //   pricing[0].evaluate((h)=>{h.click()});

  //   await page.waitForSelector('p[href="/term-of-service"]', {
  //      visible: true,
  //   });

    // const termsOfService = await page.$x("//p[contains(., 'Term of Service')]");
    // termsOfService[0].evaluate((h)=>{h.click()});

    // await page.waitForSelector('p[href="/blog"]', {
    //   visible: true,
    // });

    // const blogs = await page.$x("//p[contains(., 'Blogs')]");
    // blogs[0].evaluate((h)=>{h.click()});
}

// how to go back to the state before actionw
async function back(page) {
    const handles12 =  await page.$$('nav img[src="/images/brand.svg"]');
    handles12[0].evaluate((h)=>{h.click()})
}

module.exports = {action, back, url};

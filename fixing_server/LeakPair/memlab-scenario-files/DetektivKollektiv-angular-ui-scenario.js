/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */

function url() {
  return 'http://localhost:4200/landingpage';
}

// action where you suspect the memory leak might be happening
async function action(page) {
  for (let i=1; i<=10; i++) {
    const workshop =  await page.$$('a[href="/workshop"]');
    workshop[0].evaluate((h)=>{h.click()});

    await page.waitForSelector('.navigation-footer__list a[href="/team"]', {
      visible: true,
    });

    const team =  await page.$$('.navigation-footer__list a[href="/team"]');
    team[0].evaluate((h)=>{h.click()});

    await page.waitForXPath("//p[contains(., 'einblenden')]", {
      visible: true,
    });

    const memberFilter = await page.$x("//p[contains(., 'einblenden')]");
    memberFilter[0].evaluate((h)=>{h.click()})

    await page.waitForSelector('.filtertags .tag-icon', {
      visible: true,
    });

    const tagicon =  await page.$$('.filtertags .tag-icon');
    tagicon[0].evaluate((h)=>{h.click()});

    await page.waitForSelector('.member-filter .reset', {
      visible: true,
    });

    const reset =  await page.$$('.member-filter .reset');
    reset[0].evaluate((h)=>{h.click()});

    const landingpage =  await page.$$('header a[href="/landingpage"]');
    landingpage[0].evaluate((h)=>{h.click()});

    const formpage =  await page.$$('header a[href="/submit"]');
    formpage[0].evaluate((h)=>{h.click()});

    const contentbtn =  await page.$$('.collapse-container__content__btn');
    contentbtn[0].evaluate((h)=>{h.click()});

    const next =  await page.$$('.carousel-arrow-next');
    next[0].evaluate((h)=>{h.click()});

    await page.waitForSelector('textarea[name="content"]', {
     visible: true,
    });

    const handles9 =  await page.$$('textarea[name="content"]');
    handles9[0].evaluate((h)=>{h.value = "test content"});

    const handles10 =  await page.$$('input[name="mail"]');
    handles10[0].evaluate((h)=>{h.value = "test@gmail.com"});

    // await page.waitForSelector('#mat-checkbox-2', {
    //  visible: true,
    // });

    // const handles11 =  await page.$$('#mat-checkbox-2');
    // handles11[0].evaluate((h)=>{h.click()});

    const submit =  await page.$$('button[type="submit"]');
    submit[0].evaluate((h)=>{h.click()});

    const landingpage2 =  await page.$$('header a[href="/landingpage"]');
    landingpage2[0].evaluate((h)=>{h.click()});

    const review =  await page.$$('.section-background-stars a[href="/review"]');
    review[0].evaluate((h)=>{h.click()});

    const archive =  await page.$$('a[href="/archive"]');
    archive[0].evaluate((h)=>{h.click()});

    const listoption =  await page.$$('.archive-list-option');
    listoption[0].evaluate((h)=>{h.click()});

    await page.waitForSelector('.item__details-btn', {
      visible: true,
    });

    const handles13 =  await page.$$('.item__details-btn');
    handles13[0].evaluate((h)=>{h.click()});


    await page.waitForSelector('.collapse-container__content__btn', {
        visible: true,
    });

    const handles14 =  await page.$$('.collapse-container__content__btn');
    handles14[0].evaluate((h)=>{h.click()});

    await page.waitForSelector('.item__score', {
        visible: true,
    });

    const scorefull =  await page.$$('.item__score');
    scorefull[0].evaluate((h)=>{h.click()});

    const handles2 =  await page.$$('header a[href="/landingpage"]');
    handles2[0].evaluate((h)=>{h.click()});

    const trustcheck =  await page.$$('img[src="assets/images/illustrations/trust-checking.svg"]');
    trustcheck[0].evaluate((h)=>{h.click()});

    const handles3 =  await page.$$('header a[href="/landingpage"]');
    handles3[0].evaluate((h)=>{h.click()});

    const email =  await page.$$('input[formcontrolname="email"]');
    email[0].evaluate((h)=>{h.value = "test email"});

    const firstname =  await page.$$('input[formcontrolname="firstname"]');
    firstname[0].evaluate((h)=>{h.value = "test firstname"});

    const lastname =  await page.$$('input[formcontrolname="lastname"]');
    lastname[0].evaluate((h)=>{h.value = "test LAST name"});

    const submitform =  await page.$$('button[type="submit"]');
    submitform[0].evaluate((h)=>{h.click()});

    const faq =  await page.$$('.navigation-footer__list a[href="/faq"]');
    faq[0].evaluate((h)=>{h.click()});

    const imprint =  await page.$$('.navigation-footer__list a[href="/imprint"]');
    imprint[0].evaluate((h)=>{h.click()});

    const privacy =  await page.$$('.navigation-footer__list a[href="/privacy-statement"]');
    privacy[0].evaluate((h)=>{h.click()});

    const terms =  await page.$$('a[href="/terms"]');
    terms[0].evaluate((h)=>{h.click()});

    const about =  await page.$$('a[href="/about"]');
    about[0].evaluate((h)=>{h.click()});
   }
}

// how to go back to the state before actionw
async function back(page) {
  const handles2 =  await page.$$('header a[href="/landingpage"]');
  handles2[0].evaluate((h)=>{h.click()});
}

module.exports = {action, back, url, repeat: () => 2};

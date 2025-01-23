/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:4200/ngx-bootstrap/#/';
}

// action where you suspect the memory leak might be happening
async function action(page) {
  await page.waitForSelector('a[href="#/documentation"]', {
    visible: true,
  });

   const doc =  await page.$$('a[href="#/documentation"]');
  doc[0].evaluate((h)=>{h.click()});

  await page.waitForXPath("//p[contains(., 'Discover')]", {
      visible: true,
    });

    const Discover = await page.$x("//p[contains(., 'Discover')]");
    Discover[0].evaluate((h)=>{h.click()});

    const Schematics = await page.$x("//p[contains(., 'Schematics')]");
    Schematics[0].evaluate((h)=>{h.click()});

    await page.waitForSelector('img[src="assets/images/icons/icon-components.svg"]', {
      visible: true,
    });

    const components =  await page.$$('img[src="assets/images/icons/icon-components.svg"]');
    components[0].evaluate((h)=>{h.click()});

    const accordian = await page.$x("//p[contains(., 'Accordion')]");
    accordian[0].evaluate((h)=>{h.click()});
    const accordianapi=  await page.$$('a[href="#/components/accordion?tab=api"]');
    accordianapi[0].evaluate((h)=>{h.click()});
    const accordianexamples =  await page.$$('a[href="#/components/accordion?tab=examples"]');
    accordianexamples[0].evaluate((h)=>{h.click()});


        const alerts = await page.$x("//p[contains(., 'Alerts')]");
    alerts[0].evaluate((h)=>{h.click()});
    const alertsapi=  await page.$$('a[href="#/components/alerts?tab=api"]');
    alertsapi[0].evaluate((h)=>{h.click()});
    const alertsexamples =  await page.$$('a[href="#/components/alerts?tab=examples"]');
    alertsexamples[0].evaluate((h)=>{h.click()});


        const buttons = await page.$x("//p[contains(., 'Buttons')]");
    buttons[0].evaluate((h)=>{h.click()});
    const buttonsapi=  await page.$$('a[href="#/components/buttons?tab=api"]');
    buttonsapi[0].evaluate((h)=>{h.click()});
    const buttonsexamples =  await page.$$('a[href="#/components/buttons?tab=examples"]');
    buttonsexamples[0].evaluate((h)=>{h.click()});

        const carousel = await page.$x("//p[contains(., 'Carousel')]");
    carousel[0].evaluate((h)=>{h.click()});
    const carouselapi=  await page.$$('a[href="#/components/carousel?tab=api"]');
    carouselapi[0].evaluate((h)=>{h.click()});
    const carouselexamples =  await page.$$('a[href="#/components/carousel?tab=examples"]');
    carouselexamples[0].evaluate((h)=>{h.click()});


        const collapse = await page.$x("//p[contains(., 'Collapse')]");
    collapse[0].evaluate((h)=>{h.click()});
    const collapseapi=  await page.$$('a[href="#/components/collapse?tab=api"]');
    collapseapi[0].evaluate((h)=>{h.click()});
    const collapseexamples =  await page.$$('a[href="#/components/collapse?tab=examples"]');
    collapseexamples[0].evaluate((h)=>{h.click()});


        const datepicker = await page.$x("//p[contains(., 'Datepicker')]");
    datepicker[0].evaluate((h)=>{h.click()});
    const datepickerapi=  await page.$$('a[href="#/components/datepicker?tab=api"]');
    datepickerapi[0].evaluate((h)=>{h.click()});
    const datepickerexamples =  await page.$$('a[href="#/components/datepicker?tab=examples"]');
    datepickerexamples[0].evaluate((h)=>{h.click()});

        const dropdowns = await page.$x("//p[contains(., 'Dropdowns')]");
    dropdowns[0].evaluate((h)=>{h.click()});
    const dropdownsapi=  await page.$$('a[href="#/components/dropdowns?tab=api"]');
    dropdownsapi[0].evaluate((h)=>{h.click()});
    const dropdownsexamples =  await page.$$('a[href="#/components/dropdowns?tab=examples"]');
    dropdownsexamples[0].evaluate((h)=>{h.click()});

        const modals = await page.$x("//p[contains(., 'Modals')]");
    modals[0].evaluate((h)=>{h.click()});
    const modalsapi=  await page.$$('a[href="#/components/modals?tab=api"]');
    modalsapi[0].evaluate((h)=>{h.click()});
    const modalsexamples =  await page.$$('a[href="#/components/modals?tab=examples"]');
    modalsexamples[0].evaluate((h)=>{h.click()});

        const pagination = await page.$x("//p[contains(., 'Pagination')]");
    pagination[0].evaluate((h)=>{h.click()});
    const paginationapi=  await page.$$('a[href="#/components/pagination?tab=api"]');
    paginationapi[0].evaluate((h)=>{h.click()});
    const paginationexamples =  await page.$$('a[href="#/components/pagination?tab=examples"]');
    paginationexamples[0].evaluate((h)=>{h.click()});

        const popover = await page.$x("//p[contains(., 'Popover')]");
    popover[0].evaluate((h)=>{h.click()});
    const popoverapi=  await page.$$('a[href="#/components/popover?tab=api"]');
    popoverapi[0].evaluate((h)=>{h.click()});
    const popoverexamples =  await page.$$('a[href="#/components/popover?tab=examples"]');
    popoverexamples[0].evaluate((h)=>{h.click()});

        const progressbar = await page.$x("//p[contains(., 'Progressbar')]");
    progressbar[0].evaluate((h)=>{h.click()});
    const progressbarapi=  await page.$$('a[href="#/components/progressbar?tab=api"]');
    progressbarapi[0].evaluate((h)=>{h.click()});
    const progressbarexamples =  await page.$$('a[href="#/components/progressbar?tab=examples"]');
    progressbarexamples[0].evaluate((h)=>{h.click()});

        const rating = await page.$x("//p[contains(., 'Rating')]");
    rating[0].evaluate((h)=>{h.click()});
    const ratingapi=  await page.$$('a[href="#/components/rating?tab=api"]');
    ratingapi[0].evaluate((h)=>{h.click()});
    const ratingexamples =  await page.$$('a[href="#/components/rating?tab=examples"]');
    ratingexamples[0].evaluate((h)=>{h.click()});

        const sortable = await page.$x("//p[contains(., 'Sortable')]");
    sortable[0].evaluate((h)=>{h.click()});
    const sortableapi=  await page.$$('a[href="#/components/sortable?tab=api"]');
    sortableapi[0].evaluate((h)=>{h.click()});
    const sortableexamples =  await page.$$('a[href="#/components/sortable?tab=examples"]');
    sortableexamples[0].evaluate((h)=>{h.click()});

        const tabs = await page.$x("//p[contains(., 'Tabs')]");
    tabs[0].evaluate((h)=>{h.click()});
    const tabsapi=  await page.$$('a[href="#/components/tabs?tab=api"]');
    tabsapi[0].evaluate((h)=>{h.click()});
    const tabsexamples =  await page.$$('a[href="#/components/tabs?tab=examples"]');
    tabsexamples[0].evaluate((h)=>{h.click()});

        const timepicker = await page.$x("//p[contains(., 'Timepicker')]");
    timepicker[0].evaluate((h)=>{h.click()});
    const timepickerapi=  await page.$$('a[href="#/components/timepicker?tab=api"]');
    timepickerapi[0].evaluate((h)=>{h.click()});
    const timepickerexamples =  await page.$$('a[href="#/components/timepicker?tab=examples"]');
    timepickerexamples[0].evaluate((h)=>{h.click()});

    const tooltip = await page.$x("//p[contains(., 'Tooltip')]");
    tooltip[0].evaluate((h)=>{h.click()});
    const tooltipapi=  await page.$$('a[href="#/components/tooltip?tab=api"]');
    tooltipapi[0].evaluate((h)=>{h.click()});
    const tooltipexamples =  await page.$$('a[href="#/components/tooltip?tab=examples"]');
    tooltipexamples[0].evaluate((h)=>{h.click()});

        const typeahead = await page.$x("//p[contains(., 'Typeahead')]");
    typeahead[0].evaluate((h)=>{h.click()});
    const typeaheadapi=  await page.$$('a[href="#/components/typeahead?tab=api"]');
    typeaheadapi[0].evaluate((h)=>{h.click()});
    const typeaheadexamples =  await page.$$('a[href="#/components/typeahead?tab=examples"]');
    typeaheadexamples[0].evaluate((h)=>{h.click()});
}

// how to go back to the state before actionw
async function back(page) {
    const home =  await page.$$('img[src="assets/images/logos/ngx-bootstrap-logo-red.svg"]');
    home[0].evaluate((h)=>{h.click()});
}

module.exports = {action, back, url, repeat: () => 9};

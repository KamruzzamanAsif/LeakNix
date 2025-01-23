

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @nolint
 * @oncall web_perf_infra
 */


function url() {
  return 'http://localhost:6060/?path=/story/autocomplete--mobile-simple';
}

// action where you suspect the memory leak might be happening
async function action(page) {
    const toast =  await page.$('#toast');
    toast.evaluate((h)=>{h.click()});

    await page.waitForSelector('#storybook-preview-iframe', { timeout: 30000 });
    const iframeHandle = await page.$('#storybook-preview-iframe');
    const frame = await iframeHandle.contentFrame();

    const toaststories = await page.$$('a[data-parent-id="toast"]');
    console.log('toast stories', toaststories.length);
    for(const story of toaststories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }

    const input =  await page.$('#input');
    input.evaluate((h)=>{h.click()});
    const inputstories = await page.$$('a[data-parent-id="input"]');
    console.log('input stories', inputstories.length);
    for(const story of inputstories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }

    const select =  await page.$('#select');
    select.evaluate((h)=>{h.click()});
    const selectstories = await page.$$('a[data-parent-id="select"]');
    console.log('select stories', selectstories.length);
    for(const story of selectstories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }

    const scrollcontainer =  await page.$('#scrollcontainer');
    scrollcontainer.evaluate((h)=>{h.click()});
    const scrollcontainerStories = await page.$$('a[data-parent-id="scrollcontainer"]');
    console.log('stories', scrollcontainerStories.length);
    for(const story of scrollcontainerStories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }

    const tabs =  await page.$('#tabs');
    tabs.evaluate((h)=>{h.click()});
    const tabsstories = await page.$$('a[data-parent-id="tabs"]');
    console.log('tabs stories', tabsstories.length);
    for(const story of tabsstories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }

    const tokeninput =  await page.$('#tokeninput');
    tokeninput.evaluate((h)=>{h.click()});
    const tokeninputStories = await page.$$('a[data-parent-id="tokeninput"]');
    console.log('tokeninputStories', tokeninputStories.length);
    for(const story of tokeninputStories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }

    const kebab =  await page.$('#kebab');
    kebab.evaluate((h)=>{h.click()});
    const kebabstories = await page.$$('a[data-parent-id="kebab"]');
    console.log('kebab stories', kebabstories.length);
    for(const story of kebabstories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }

    const paging =  await page.$('#paging');
    paging.evaluate((h)=>{h.click()});
    const pagingstories = await page.$$('a[data-parent-id="paging"]');
    console.log('paging stories', pagingstories.length);
    for(const story of pagingstories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }

    const link =  await page.$('#link');
    link.evaluate((h)=>{h.click()});
    const linkstories = await page.$$('a[data-parent-id="link"]');
    console.log('link stories', linkstories.length);
    for(const story of linkstories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }

    const radio =  await page.$('#radio');
    radio.evaluate((h)=>{h.click()});
    const radiostories = await page.$$('a[data-parent-id="radio"]');
    console.log('radio stories', radiostories.length);
    for(const story of radiostories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }

    const button =  await page.$('#button');
    button.evaluate((h)=>{h.click()});
    const buttonstories = await page.$$('a[data-parent-id="button"]');
    console.log('buttonstories',buttonstories.length);
    for(const story of buttonstories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }

    const checkbox =  await page.$('#checkbox');
    checkbox.evaluate((h)=>{h.click()});
    const checkboxstories = await page.$$('a[data-parent-id="checkbox"]');
    console.log('checkbox stories',checkboxstories.length);
    for(const story of checkboxstories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }

    const sidepage =  await page.$('#sidepage');
    sidepage.evaluate((h)=>{h.click()});
    const sidepagestories = await page.$$('a[data-parent-id="sidepage"]');
    console.log('sidepage stories',sidepagestories.length);
    for(const story of sidepagestories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }

    const modal =  await page.$('#modal');
    modal.evaluate((h)=>{h.click()});
    const modalstories = await page.$$('a[data-parent-id="modal"]');
    console.log('modal stories',modalstories.length);
    for(const story of modalstories) {
        story.evaluate((h)=>{h.click()});
        const storyButtons =  await frame.$$('.sb-show-main button');
        for(const btn of storyButtons) {
            const btnText = await btn.evaluate((h)=>h.textContent);
            console.log('btnText', btnText);

            btn.evaluate((h)=>{h.click()});
        }

        const storyInputs =  await frame.$$('.sb-show-main input');
        for (const input of storyInputs) {
            input.evaluate((h)=>{h.click()});
        }
    }
}

// how to go back to the state before actionw
async function back(page) {
    const handles12 =  await page.$$('#autocomplete');
    handles12[0].evaluate((h)=>{h.click()});
}

module.exports = {action, back, url, repeat: () => 9};

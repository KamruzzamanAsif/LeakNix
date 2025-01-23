// myScenario.mjs
import { defaultWaitForPageIdle } from './puppeteerUtil.js';

/**
 * OPTIONAL: Setup code to run before each test
 * @param { import("puppeteer").Page } page
 */

export async function createTests(page) {
  return [
    {
      data: {
        selector: '//*[@id="__next"]/nav/div/div/div/div[2]/p[1]',
      },
      description: "Navigate and click on Service and back"
    },
    {
      data: {
        selector: '//*[@id="__next"]/nav/div/div/div/div[2]/p[2]',
      },
      description: "Navigate and click on How we work and back"
    },
    // {
    //   data: {
    //     href: "/page2",
    //     fullHref: "http://localhost:3000/page2"
    //   },
    //   description: "Go to /page2 and back"
    // }
  ];
}


async function clickFirstVisible(page, xpath) {
  const element = await page.evaluateHandle((xpath) => {
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    const element = result.singleNodeValue;

    // Check if element is visible
    if (element && 
        window.getComputedStyle(element).getPropertyValue('display') !== 'none' && 
        window.getComputedStyle(element).getPropertyValue('visibility') !== 'hidden' && 
        element.offsetHeight > 0 && 
        element.offsetWidth > 0) {
      return element;
    }

    return null; // No visible element found
  }, xpath);

  if (element) {
    try {
      await element.click();
    } catch (err) {
      throw new Error(`Element with XPath ${xpath} is not clickable or is not an in-page SPA navigation: ${err.message}`);
    } finally {
      await element.dispose();
    }
  } else {
    console.log(`No visible element found for XPath: ${xpath}`);
  }
}




/**
 * REQUIRED: Run a single iteration against a page – e.g., execute colossal scenario and go back
 * @param { import("puppeteer").Page } page
 * @param { any } data
 */
export async function iteration(page, data) {
    await clickFirstVisible(page, data.selector)
    await defaultWaitForPageIdle(page)
    await page.goBack()
    await defaultWaitForPageIdle(page)
}

/**
 * OPTIONAL: Teardown code to run after each test
 * @param { import("puppeteer").Page } page
 */
export async function teardown(page) {}

/**
 * OPTIONAL: Code to wait asynchronously for the page to become idle
 * @param { import("puppeteer").Page } page
 */
export async function waitForIdle(page) {}

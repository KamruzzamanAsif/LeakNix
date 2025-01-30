// myScenario.mjs
import { defaultWaitForPageIdle } from './puppeteerUtil.js'

/**
 * OPTIONAL: Setup code to run before each test
 * @param { import("puppeteer").Page } page
 */

export async function createTests(page) {
  return [
    {
      data: {
        href: "/about-us",
        fullHref: "https://www.shohoz.com/about-us"
      },
      description: "Go to /employee and back"
    },
  ];
}


async function clickFirstVisible(page, selector) {
    const element = await page.evaluateHandle((selector) => {
        return [...document.querySelectorAll(selector)].filter(el => {
          // avoid links that open in a new tab
          return el.target === '' &&
            // quick and dirty visibility check
            window.getComputedStyle(el).getPropertyValue('display') !== 'none' &&
            window.getComputedStyle(el).getPropertyValue('visibility') !== 'hidden' &&
            el.offsetHeight > 0 &&
            el.offsetWidth > 0
        })[0]
    }, selector)

    try {
        await element.click()
      } catch (err) {
        throw ono(err, `Element ${selector} is not clickable or is not an in-page SPA navigation`)
      }
      finally {
        await element.dispose()
      }
}




/**
 * REQUIRED: Run a single iteration against a page – e.g., execute colossal scenario and go back
 * @param { import("puppeteer").Page } page
 * @param { any } data
 */
export async function iteration(page, data) {
    await clickFirstVisible(page, `a[href=${JSON.stringify(data.href)}]`)
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

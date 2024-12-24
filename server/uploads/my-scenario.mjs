// myScenario.mjs

/**
 * OPTIONAL: Setup code to run before each test
 * @param { import("puppeteer").Page } page
 */
export async function setup(page) {
    console.log("Setting up the scenario...");
    // Set a viewport size, if needed
    await page.setViewport({ width: 1280, height: 800 });
  }
  
  /**
   * OPTIONAL: Code to run once on the page to determine which tests to run
   * @param { import("puppeteer").Page } page
   */
  export async function createTests(page) {
    console.log("Creating tests...");
    const buttons = await page.$$eval("button", (btns) =>
      btns.map((btn, index) => ({
        text: btn.innerText || `Button ${index + 1}`,
        selector: btn.id
          ? `#${btn.id}`
          : btn.className
          ? `.${btn.className.split(" ").join(".")}`
          : null,
      }))
    );
    console.log(`Tests created: ${JSON.stringify(buttons, null, 2)}`);
    return buttons;
  }
  
  /**
   * REQUIRED: Run a single iteration against a page – e.g., click a link and then go back
   * @param { import("puppeteer").Page } page
   * @param { any } data
   */
  export async function iteration(page, data) {
    if (!data || !data.selector) {
      console.error("Invalid test data:", data);
      return;
    }
  
    console.log(`Clicking button: ${data.text}`);
    try {
      await page.evaluate((selector) => {
        const button = document.querySelector(selector);
        if (button) button.click();
      }, data.selector);
  
      await page.waitForTimeout(1000);
      await page.goBack();
    } catch (error) {
      console.error(`Error during iteration for button: ${data.text}`, error);
    }
  }
  
  /**
   * OPTIONAL: Teardown code to run after each test
   * @param { import("puppeteer").Page } page
   */
  export async function teardown(page) {
    console.log("Cleaning up after tests...");
    // Close popups or modals, if necessary
  }
  
  /**
   * OPTIONAL: Code to wait asynchronously for the page to become idle
   * @param { import("puppeteer").Page } page
   */
  export async function waitForIdle(page) {
    console.log("Waiting for the page to become idle...");
    // Wait for network idle or no animations (customize as needed)
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Example: wait 2 seconds for the page to stabilize
  }
  
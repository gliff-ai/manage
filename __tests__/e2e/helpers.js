const { until, By } = require("selenium-webdriver");

const { TARGET_URL = "http://bs-local.com:8080/" } = process.env;

const sleep = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

const openApp = async (driver, webdriver, TARGET_URL) => {
  await driver.get(TARGET_URL);

  await driver.wait(webdriver.until.titleMatches(/Manage/i), 60000);
};

const findElementById = async (driver, id, timeout = 3000) => {
  const el = await driver.wait(until.elementLocated(By.id(id)), timeout);
  return el;
};

const findElementByText = async (driver, text, tag = "*", timeout = 3000) => {
  const el = await driver.wait(
    until.elementLocated(By.xpath(`//${tag}[text()='${text}']`)),
    timeout
  );
  return el;
};

const clickHiddenElement = async (driver, elementId) => {
  driver.executeScript(
    `var el = document.getElementById("${elementId}");
         el.dispatchEvent(new MouseEvent("click", { bubbles: true }));`
  );
};

const moveMouseAndClick = async (driver, element) => {
  // Note: actions.move doesn't work with IPads.
  const actions = await driver.actions();

  await actions.move({ origin: element }).click().perform();
};

export {
  sleep,
  openApp,
  findElementById,
  findElementByText,
  moveMouseAndClick,
  clickHiddenElement,
  TARGET_URL,
};

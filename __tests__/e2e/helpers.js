const { until, By } = require("selenium-webdriver");

const sleep = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

const openApp = async (driver, webdriver, TARGET_URL) => {
  await driver.get(TARGET_URL);

  await driver.wait(webdriver.until.titleMatches(/Manage/i), 60000);
};

const findElementById = async (driver, id, timeout = 1000) => {
  const el = await driver.wait(until.elementLocated(By.id(id)), timeout);
  return el;
};

const findElementByText = async (driver, text, tag = "*", timeout = 1000) => {
  const el = await driver.wait(
    until.elementLocated(By.xpath(`//${tag}[text()='${text}']`)),
    timeout
  );
  return el;
};

const moveMouseAndClick = async (driver, element) => {
  const actions = await driver.actions({ async: true });

  await actions.move({ origin: element }).press().release().perform();
};

const moveMouseOver = async (driver, element) => {
  const actions = await driver.actions({ async: true });

  await actions.move({ origin: element }).perform();
};

export {
  sleep,
  openApp,
  findElementById,
  findElementByText,
  moveMouseAndClick,
  moveMouseOver,
};

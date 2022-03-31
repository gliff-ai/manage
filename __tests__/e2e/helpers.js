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

const findElementByText = async (driver, text, timeout = 1000) => {
  const el = await driver.wait(
    until.elementLocated(By.xpath(`//p[text()='${text}']`)),
    timeout
  );
  return el;
};

export { sleep, openApp, findElementById, findElementByText };

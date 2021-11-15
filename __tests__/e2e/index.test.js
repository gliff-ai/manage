const { until } = require("selenium-webdriver");
const { By } = require("selenium-webdriver");
const { wrapper, test, webdriver } =
  require("@gliff-ai/jest-browserstack-automate")("Manage");

const { TARGET_URL = "http://127.0.0.1:3000/" } = process.env;

wrapper(() => {
  describe("Load page", () => {
    test("loads the page", async (driver) => {
      await driver.get(TARGET_URL);

      await driver.wait(webdriver.until.titleMatches(/Manage/i), 60000);
      const title = await driver.getTitle();

      expect(title).toEqual("gliff.ai MANAGE");
    });

    test("lists projects", async (driver) => {
      await driver.get(TARGET_URL);

      await driver.wait(webdriver.until.titleMatches(/Manage/i), 60000);
      const title = await driver.getTitle();

      let el = await driver.findElement(
        By.xpath('//*[@id="react-container"]/div/div/div/span/a')
      );
      await driver.wait(until.elementIsVisible(el), 10000);

      expect(title).toEqual("gliff.ai MANAGE");
      await el.click();

      const projectsTable = await driver.findElement(
        By.xpath('//*[@id="react-container"]/div/div[2]/div[1]/p')
      );
      await driver.wait(until.elementIsVisible(projectsTable), 10000);

      const text = await driver
        .findElement(
          By.xpath('//*[@id="react-container"]/d/div/table/tbody/tr[1]/td[1]')
        )
        .getText();

      expect(text).toEqual("Project 1");
    });
  });
});

const { until } = require("selenium-webdriver");
const { By } = require("selenium-webdriver");
const { wrapper, test, webdriver } =
  require("@gliff-ai/jest-browserstack-automate")("Manage");

const { TARGET_URL = "http://bs-local.com:8080/" } = process.env;

wrapper(() => {
  describe("Load page", () => {
    test("loads the page", async (driver, percySnapshot) => {
      await driver.get(TARGET_URL);

      await driver.wait(webdriver.until.titleMatches(/Manage/i), 60000);
      const title = await driver.getTitle();

      expect(title).toEqual("gliff.ai MANAGE");
    });

    test("lists projects", async (driver, percySnapshot) => {
      await driver.get(TARGET_URL);

      await driver.wait(webdriver.until.titleMatches(/Manage/i), 60000);
      const title = await driver.getTitle();

      expect(title).toEqual("gliff.ai MANAGE");

      const el = await driver.wait(
        until.elementLocated(
          By.xpath('//*[@id="react-container"]/div/div/div/span/a')
        ),
        10000
      );

      await el.click();

      const projectsTable = await driver.wait(
        until.elementLocated(
          By.xpath('//*[@id="react-container"]/div/div[2]/div[1]/p')
        ),
        10000
      );

      const text = await driver
        .wait(
          until.elementLocated(
            By.xpath(
              '//*[@id="react-container"]/div/div[2]/div[2]/div/table/tbody/tr[2]/td[1]'
            )
          ),
          10000
        )
        .getText();

      expect(text).toEqual("Project 1");

      await percySnapshot(driver, "Projects Screenshot");
    });
  });
});

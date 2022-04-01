const { openApp, findElementById, findElementByText } = require("./helpers");

const { wrapper, test, webdriver } =
  require("@gliff-ai/jest-browserstack-automate")("Manage");

const { TARGET_URL = "http://bs-local.com:8080/" } = process.env;

wrapper(() => {
  describe("Teams", () => {
    test("load teams page", async (driver, percySnapshot) => {
      await openApp(driver, webdriver, TARGET_URL);

      const title = await driver.getTitle();

      expect(title).toEqual("gliff.ai MANAGE");

      const el = await findElementById(driver, "team");

      await el.click();

      const text = "Team Members";

      const targetEl = await findElementByText(driver, text, "p");

      expect(await targetEl.getText()).toEqual(text);

      await percySnapshot(driver, "Team Members Page");
    });
  });
});

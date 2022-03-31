const {
  sleep,
  openApp,
  findElementById,
  findElementByText,
} = require("./helpers");

const { wrapper, test, webdriver } =
  require("@gliff-ai/jest-browserstack-automate")("Manage");

const { TARGET_URL = "http://bs-local.com:8080/" } = process.env;

wrapper(() => {
  describe("Projects", () => {
    test("create project dialog", async (driver, percySnapshot) => {
      await openApp(driver, webdriver, TARGET_URL);

      const el = await findElementById(driver, "create-project");

      await el.click();

      await sleep();

      const text = "Create Project";

      const targetEl = await findElementByText(driver, text);

      expect(await targetEl.getText()).toEqual(text);

      await percySnapshot(driver, "Create Project Screenshot");
    });

    test("edit project dialog", async (driver, percySnapshot) => {
      await openApp(driver, webdriver, TARGET_URL);

      const el = await findElementById(driver, "edit-project-1", 5000);

      const actions = await driver.actions({ async: true });

      await actions.move({ origin: el }).press().release().perform();

      await sleep();

      const text = "Edit Project";

      const targetEl = await findElementByText(driver, text);

      expect(await targetEl.getText()).toEqual(text);

      await percySnapshot(driver, "Edit Project Screenshot");
    });
  });
});

const {
  sleep,
  openApp,
  findElementById,
  findElementByText,
  clickHiddenElement,
} = require("./helpers");

const { wrapper, test, webdriver } =
  require("@gliff-ai/jest-browserstack-automate")("Manage");

const { TARGET_URL = "http://bs-local.com:8080/" } = process.env;

wrapper(() => {
  describe("Projects", () => {
    test("load projects page", async (driver, percySnapshot) => {
      await openApp(driver, webdriver, TARGET_URL);

      const title = await driver.getTitle();

      expect(title).toEqual("gliff.ai MANAGE");

      const el = await findElementById(driver, "projects");

      await el.click();

      const text = "Projects";

      const targetEl = await findElementByText(driver, text, "p");

      expect(await targetEl.getText()).toEqual(text);

      await percySnapshot(driver, "Projects Page");
    });

    test("create project dialog", async (driver, percySnapshot) => {
      await openApp(driver, webdriver, TARGET_URL);

      const el = await findElementById(driver, "create-project");

      await el.click();

      const text = "Create Project";

      const targetEl = await findElementByText(driver, text, "p");

      expect(await targetEl.getText()).toEqual(text);

      await percySnapshot(driver, "Create Project Dialog");
    });

    test("edit project dialog", async (driver, percySnapshot) => {
      await openApp(driver, webdriver, TARGET_URL);

      await clickHiddenElement(driver, "edit-project-1");

      const text = "Edit Project";

      const targetEl = await findElementByText(driver, text, "p");

      expect(await targetEl.getText()).toEqual(text);

      await percySnapshot(driver, "Edit Project Dialog");
    });
  });
});

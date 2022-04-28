const {
  openApp,
  findElementById,
  findElementByText,
  clickHiddenElement,
  sleep,
  TARGET_URL,
} = require("./helpers");

const { wrapper, test, webdriver } =
  require("@gliff-ai/jest-browserstack-automate")("Manage");

wrapper(() => {
  describe("Plugins", () => {
    test("load plugins page", async (driver, percySnapshot) => {
      await openApp(driver, webdriver, TARGET_URL);

      const title = await driver.getTitle();

      expect(title).toEqual("gliff.ai MANAGE");

      const el = await findElementById(driver, "plugins");

      await el.click();

      await sleep();

      const text = "Plugins";
      await findElementByText(driver, text, "p");

      expect(await targetEl.getText()).toEqual(text);

      await percySnapshot(driver, "Plugins Page");
    });

    test("add plugin dialog", async (driver, percySnapshot) => {
      await openApp(driver, webdriver, TARGET_URL);

      const el1 = await findElementById(driver, "plugins");

      await el1.click();

      const el2 = await findElementById(driver, "add-plugin");

      await el2.click();

      await sleep();

      const text = "Add Plug-in";

      const targetEl = await findElementByText(driver, text, "p");

      expect(await targetEl.getText()).toEqual(text);

      await percySnapshot(driver, "Add Plugin - Dialog 1");

      const el3 = await findElementByText(driver, "Continue", "button");

      await el3.click();

      await percySnapshot(driver, "Add Plugin - Dialog 2");
    });

    test("edit plugin dialog", async (driver, percySnapshot) => {
      await openApp(driver, webdriver, TARGET_URL);

      const el1 = await findElementById(driver, "plugins");

      await el1.click();

      await clickHiddenElement(driver, "edit-plugin-python-plugin");

      await sleep();

      const text = "Edit Plug-in";

      const targetEl = await findElementByText(driver, text, "p");

      expect(await targetEl.getText()).toEqual(text);

      await percySnapshot(driver, "Edit Plugin Dialog");
    });

    test("delete plugin dialog", async (driver, percySnapshot) => {
      await openApp(driver, webdriver, TARGET_URL);

      const el1 = await findElementById(driver, "plugins");

      await el1.click();

      await clickHiddenElement(driver, "delete-plugin-python-plugin");

      await sleep();

      const text = "Are You Sure?";

      const targetEl = await findElementByText(driver, text, "p");

      expect(await targetEl.getText()).toEqual(text);

      await percySnapshot(driver, "Delete Plugin Dialog");
    });
  });
});

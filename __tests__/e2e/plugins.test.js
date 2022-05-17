const { until, By } = require("selenium-webdriver");

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

      const text = "Plugins";

      sleep(5000)

      console.log("go!")
      const x = driver.findElement(By.xpath(`//p[text()='Plugins']`))

      console.log(x)

      const targetEl = await findElementByText(driver, text, "p");

      sleep(5000)

      console.log(targetEl);

      const res = targetEl.getText()

      console.log(res);

      expect(res).toEqual(text);

      console.log("doing percy");
      await percySnapshot(driver, "Plugins Page");
      console.log("done percy");
    }, 30000, {capabilities: {"browserstack.idleTimeout": 300}});

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

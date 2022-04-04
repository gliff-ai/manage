const {
  openApp,
  findElementById,
  findElementByText,
  TARGET_URL,
} = require("./helpers");

const { wrapper, test, webdriver } =
  require("@gliff-ai/jest-browserstack-automate")("Manage");

wrapper(() => {
  describe("Collaborats", () => {
    test("load collaborators page", async (driver, percySnapshot) => {
      await openApp(driver, webdriver, TARGET_URL);

      const title = await driver.getTitle();

      expect(title).toEqual("gliff.ai MANAGE");

      const el = await findElementById(driver, "collaborators");

      await el.click();

      const text = "Collaborators";

      const targetEl = await findElementByText(driver, text, "p");

      expect(await targetEl.getText()).toEqual(text);

      await percySnapshot(driver, "Collaborators Page");
    });
  });
});

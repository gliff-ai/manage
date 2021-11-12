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
  });
});

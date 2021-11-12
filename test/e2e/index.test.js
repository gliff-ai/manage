const { wrapper, test, webdriver } =
  require("@gliff-ai/jest-browserstack-automate")();

const { TARGET_URL = "http://127.0.0.1:3000/" } = process.env;

const timeout = 60000;

const capabilities = {
  project: "Manage",
};

wrapper(() => {
  describe("Load page", () => {
    test(
      "loads the page",
      async (driver) => {
        await driver.get(TARGET_URL);

        await driver.wait(webdriver.until.titleMatches(/Manage/i), 60000);
        const title = await driver.getTitle();

        expect(title).toEqual("gliff.ai MANAGE");
      },
      timeout,
      { capabilities }
    );
  });
});

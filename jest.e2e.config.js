module.exports = {
  bail: true,
  // transform: {},
  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  // setupFilesAfterEnv: ["./jest-setup.ts"],

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/__tests__/e2e/plugins.test.js"],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ["/node_modules/", "dist/"],
};

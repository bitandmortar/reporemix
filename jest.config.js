module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverage: true,
  collectCoverageFrom: [
    "server/**/*.js",
    "!server/index.js",
    "!server/config/**",
    "!server/services/syncWorker.js",
  ],
  coverageThreshold: {
    global: {
      statements: 35,
      branches: 30,
      functions: 35,
      lines: 35,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.js"],
};

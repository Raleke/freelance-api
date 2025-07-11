module.exports = {
  testEnvironment: "node",
  testTimeout: 30000,
  verbose: true,
  roots: ["<rootDir>/tests"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};

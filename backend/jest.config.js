module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  clearMocks: true,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
};

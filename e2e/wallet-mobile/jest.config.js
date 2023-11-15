/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  rootDir: '.',
  testMatch: ['<rootDir>/**/**/*.test.ts'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        "publicPath": "./html-report",
        "filename": "report.html",
        "includeConsoleLog": true,      
        "openReport": true,
        "pageTitle": "YOMO e2e Test Results"
      }
    ]
  ],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};

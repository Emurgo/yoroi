import fs, {promises as fsAsync} from 'fs'
import {appiumLogsPath, screenshotsDir} from './testPaths'
import {APP_ID, APP_ID_PARENT, APP_PATH} from '../constants'

export const config: WebdriverIO.Config = {
  runner: 'local',
  // ============
  // Specs
  // ============
  specs: ['./tests/specs/*.test.ts'],
  capabilities: [
    {
      platformName: 'Android',
      maxInstances: 1,
      'appium:deviceName': 'Pixel_5',
      // @ts-ignore
      'appium:autoLaunch': false,
      'appium:appWaitActivity': APP_ID_PARENT,
      'appium:noReset': true,
      'appium:orientation': 'PORTRAIT',
      'appium:automationName': 'UiAutomator2',
      'appium:app': APP_PATH,
    },
  ],
  autoCompileOpts: {
    autoCompile: true,
    // for all available options
    tsNodeOpts: {
      transpileOnly: true,
      project: 'tsconfig.json',
    },
  },
  logLevel: 'error',
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [
    [
      'appium',
      {
        command: 'appium',
        logPath: appiumLogsPath,
      },
    ],
    ['selenium-standalone', {}],
  ],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 3 * 60 * 1000, // 3min
  },
  //
  // =====
  // Hooks
  // =====
  // WebdriverIO provides several hooks you can use to interfere with the tests process in order to enhance
  // it and to build services around it. You can either apply a single function or an array of
  // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
  // resolved to continue.
  /**
   * Gets executed once before all workers get launched.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  // onPrepare: function (config, capabilities) {
  // },
  /**
   * Gets executed before a worker process is spawned and can be used to initialise specific service
   * for that worker as well as modify runtime environments in an async fashion.
   * @param  {String} cid      capability id (e.g. 0-0)
   * @param  {[type]} caps     object containing capabilities for session that will be spawn in the worker
   * @param  {[type]} specs    specs to be run in the worker process
   * @param  {[type]} args     object that will be merged with the main configuration once worker is initialised
   * @param  {[type]} execArgv list of string arguments passed to the worker process
   */
  // onWorkerStart: function (cid, caps, specs, args, execArgv) {
  // },
  /**
   * Gets executed just before initialising the webdriver session and tests framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   * @param {String} cid worker id (e.g. 0-0)
   */
  beforeSession: function (config, capabilities, specs, cid) {
    const testSuitePathArray = specs[0].split('/')
    const testSuiteName = testSuitePathArray[testSuitePathArray.length - 1]
    capabilities['appium:noReset'] = !testSuiteName.includes('resetApp')
  },
  /**
   * Gets executed before tests execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs        List of spec file paths that are to be run
   * @param {Object}         driver      instance of created browser/device session
   */
  // before: function (capabilities, specs, driver) {
  // },
  /**
   * Runs before a WebdriverIO command gets executed.
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   */
  // beforeCommand: function (commandName, args) {
  // },
  /**
   * Hook that gets executed before the suite starts
   * @param {Object} suite suite details
   */
  // beforeSuite: function (suite) {
  // },
  /**
   * Function to be executed before a tests (in Mocha/Jasmine) starts.
   */
  // beforeTest: function (tests, context) {
  // },
  /**
   * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
   * beforeEach in Mocha)
   */
  // beforeHook: function (tests, context) {
  // },
  /**
   * Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
   * afterEach in Mocha)
   */
  // afterHook: function (tests, context, { error, result, duration, passed, retries }) {
  // },
  /**
   * Function to be executed after a tests (in Mocha/Jasmine only)
   * @param {Object}  test             tests object
   * @param {Object}  context          scope object the tests was executed with
   * @param {Error}   result.error     error object in case the tests fails, otherwise `undefined`
   * @param {Any}     result.result    return object of tests function
   * @param {Number}  result.duration  duration of tests
   * @param {Boolean} result.passed    true if tests has passed, otherwise false
   * @param {Object}  result.retries   information to spec related retries, e.g. `{ attempts: 0, limit: 0 }`
   */
  afterTest: async function (test, context, {error, result, duration, passed, retries}) {
    // take a screenshot anytime a tests fails and throws an error
    if (error) {
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, {recursive: true})
      }
      const screenshotName = `${test.parent.replace(/ /g, '_')}-${test.title.replace(/ /g, '_')}.png`
      const screenshotPath = `${screenshotsDir}${screenshotName}`
      const screenshot = await driver.takeScreenshot()
      await fsAsync.writeFile(screenshotPath, screenshot, 'base64')
    }
  },
  /**
   * Hook that gets executed after the suite has ended
   * @param {Object} suite suite details
   */
  // afterSuite: function (suite) {
  // },
  /**
   * Runs after a WebdriverIO command gets executed
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   * @param {Number} result 0 - command success, 1 - command error
   * @param {Object} error error object if any
   */
  // afterCommand: function (commandName, args, result, error) {
  // },
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the tests.
   * @param {Number} result 0 - tests pass, 1 - tests fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  after: function (result, capabilities, specs) {
    driver.removeApp(APP_ID)
  },
  /**
   * Gets executed right after terminating the webdriver session.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // afterSession: function (config, capabilities, specs) {
  // },
  /**
   * Gets executed after all workers got shut down and the process is about to exit. An error
   * thrown in the onComplete hook will result in the tests run failing.
   * @param {Object} exitCode 0 - success, 1 - fail
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Object} results object containing tests results
   */
  // onComplete: function(exitCode, config, capabilities, results) {
  // },
  /**
   * Gets executed when a refresh happens.
   * @param {String} oldSessionId session ID of the old session
   * @param {String} newSessionId session ID of the new session
   */
  // onReload: function(oldSessionId, newSessionId) {
  // }
}

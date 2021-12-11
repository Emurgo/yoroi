const { config } = require('./wdio.shared.conf');
const { appiumLogsPath } = require('./testPaths.config.js');

//
// ======
// Appium
// ======
//
config.services = (config.services ? config.services : []).concat([
    [
        'appium',
        {
            command : 'appium',
            logPath: appiumLogsPath,
        }
    ],
    ['selenium-standalone'],
]);

config.port = 4723;
config.path = '/wd/hub';

module.exports = config;
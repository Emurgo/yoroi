// @flow
/* This module sets up Jest */
import fetch from 'node-fetch'
import {Logger, LogLevel} from './utils/logging'

import nodeUtil from 'util'

import {NativeModules} from 'react-native'

NativeModules.KeyStoreBridge = {
  REJECTION_MESSAGES: {},
}

// $FlowFixMe
global.TextEncoder = nodeUtil.TextEncoder
// $FlowFixMe
global.TextDecoder = nodeUtil.TextDecoder

export default {
  setup: () => {
    global.fetch = fetch
    Logger.setLogLevel(LogLevel.Warn)
  },
  debug: () => Logger.setLogLevel(LogLevel.Debug),
}

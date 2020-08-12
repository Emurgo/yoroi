// @flow
/* eslint-env jest */
/* This module sets up Jest */
import fetch from 'node-fetch'
import {Logger, LogLevel} from './utils/logging'

import nodeUtil from 'util'

jest.setMock('./config/networks', require('./config/__mocks__/networks'))
jest.mock('react-native-device-info', () => {
  return {
    getVersion: () => '1.5.1',
  }
})
jest.mock('react-native-randombytes', () => {
  const crypto = require('crypto')
  return crypto.randomBytes
})

jest.mock('@ledgerhq/react-native-hw-transport-ble', () => ({}))

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

// @flow

/* eslint-env jest */
/* This module sets up Jest */
import fetch from 'node-fetch'
import {Logger, LogLevel} from './utils/logging'

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

export default {
  setup: () => {
    global.fetch = fetch
    Logger.setLogLevel(LogLevel.Warn)
  },
  debug: () => Logger.setLogLevel(LogLevel.Debug),
}

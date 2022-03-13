// @flow

/* eslint-env jest */
/* This module sets up Jest */
import 'react-native-gesture-handler/jestSetup'

import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js'
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
jest.mock('react-native-background-timer', () => {})
jest.mock('@sentry/react-native', () => ({init: () => jest.fn()}))
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('@ledgerhq/react-native-hw-transport-ble', () => ({}))
jest.mock('react-native-ble-plx', () => ({}))

export default {
  setup: () => {
    global.fetch = fetch
    Logger.setLogLevel(LogLevel.Warn)
  },
  debug: () => Logger.setLogLevel(LogLevel.Debug),
}

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)
jest.mock('react-native-keychain', () => {})
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => ({
  loadFont: jest.fn(),
}))
jest.mock('react-native-blockies-svg', () => {})
jest.mock('react-intl', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en',
  })

  return {
    ...reactIntl,
    useIntl: () => intl,
  }
})
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {}

  return Reanimated
})

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

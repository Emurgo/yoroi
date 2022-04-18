/* eslint-env jest */
/* This module sets up Jest */
import 'react-native-gesture-handler/jestSetup'

import fetch from 'node-fetch'
import {Logger, LogLevel} from './src/legacy/logging'

global.fetch = fetch
Logger.setLogLevel(LogLevel.Warn)

jest.mock('react-native-device-info', () => ({getVersion: () => '1.5.1'}))
jest.mock('react-native-randombytes', () => require('crypto').randomBytes)
jest.mock('react-native-background-timer', () => {})
jest.mock('@sentry/react-native', () => ({init: () => jest.fn()}))
jest.mock('@react-native-community/netinfo', () => require('@react-native-community/netinfo/jest/netinfo-mock.js'))
jest.mock('@ledgerhq/react-native-hw-transport-ble', () => ({}))
jest.mock('react-native-ble-plx', () => ({}))
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)
jest.mock('react-native-keychain', () => {})
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => ({loadFont: jest.fn()}))
jest.mock('react-native-blockies-svg', () => {})

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {}
  return Reanimated
})
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

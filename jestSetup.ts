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
jest.mock('@ledgerhq/react-native-hw-transport-ble', () => ({}))
jest.mock('react-native-ble-plx', () => ({}))
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)
jest.mock('react-native-keychain', () => {})
jest.mock('react-native-blockies-svg', () => {})

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')

  RN.NativeModules.SettingsManager = {
    settings: {
      AppLocale: true,
      AppleLanguages: ['en-US'],
    },
  }

  return RN
})

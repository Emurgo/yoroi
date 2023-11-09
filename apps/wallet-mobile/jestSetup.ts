/* eslint-env jest */
/* This module sets up Jest */
import 'react-native-gesture-handler/jestSetup'

import fetch from 'node-fetch'

import {Logger, LogLevel} from './src/legacy/logging'
import * as YoroiLogging from './src/yoroi-wallets/logging'

global.fetch = fetch
Logger.setLogLevel(LogLevel.Warn)

jest.mock('react-native-device-info', () => ({getVersion: () => '1.5.1'}))
jest.mock('react-native-randombytes', () => require('crypto').randomBytes)
jest.mock('react-native-background-timer', () => {})
jest.mock('@ledgerhq/react-native-hw-transport-ble', () => ({}))
jest.mock('react-native-ble-plx', () => ({}))
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)
jest.mock('react-native-keychain', () => ({
  resetGenericPassword: jest.fn(),
}))
jest.mock('@emurgo/react-native-blockies-svg', () => {})

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {}
  return Reanimated
})
jest.mock('react-native-localize', () => ({
  getLocales: () => [
    // extend if needed, add the locales you want
    {countryCode: 'US', languageTag: 'en-US', languageCode: 'en', isRTL: false},
    {countryCode: 'FR', languageTag: 'fr-FR', languageCode: 'fr', isRTL: false},
  ],

  // use a provided translation, or return undefined to test your fallback
  findBestLanguageTag: () => ({
    languageTag: 'en-US',
    isRTL: false,
  }),

  getNumberFormatSettings: () => ({
    decimalSeparator: '.',
    groupingSeparator: ',',
  }),

  getCalendar: () => 'gregorian', // the calendar identifier you want
  getCountry: () => 'US', // the country code you want
  getCurrencies: () => ['USD', 'EUR'], // can be empty array
  getTemperatureUnit: () => 'celsius', // or "fahrenheit"
  getTimeZone: () => 'Europe/Paris', // the timezone you want
  uses24HourClock: () => true,
  usesMetricSystem: () => true,
  usesAutoDateAndTime: () => true,
  usesAutoTimeZone: () => true,
}))

Logger.setLogLevel(LogLevel.Nothing)
YoroiLogging.Logger.setLogLevel(YoroiLogging.LogLevel.Nothing)

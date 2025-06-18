import {ThemeName} from '@yoroi/theme'
import {App, Portfolio} from '@yoroi/types'

import Constants from 'expo-constants'
import * as Device from 'expo-device'
import {freeze} from 'immer'
import {Platform} from 'react-native'

const getEnvString = (key: string) => Constants.expoConfig?.extra?.[key] ?? ''

// Resolvers API Keys
export const unstoppableApiKey = getEnvString('UNSTOPPABLE_API_KEY')

// Dev
export const commit = getEnvString('COMMIT')
export const buildVariant = getEnvString('BUILD_VARIANT')
export const disableLogbox = Boolean(
  Constants.expoConfig?.extra?.DISABLE_LOGBOX,
)

// Runtime
export const isNightly = buildVariant === 'NIGHTLY'
export const isProduction = buildVariant === 'PROD'
export const isDev = __DEV__

export const environment = isNightly
  ? 'nightly'
  : isProduction
    ? 'production'
    : 'development'
export const version = Device.osVersion ?? ''
export const release = isProduction ? version : 'dev'
export const build = Device.osBuildId ?? ''
export const distribution = `${Platform.OS}.${build}`

// Platforms - there is one disavantage to using this approach when testing:
// the react-native module needs to be unloaded and reloaded to change the platform
export const isIOS = Platform.OS === 'ios'
export const isAndroid = Platform.OS === 'android'
export const isNative = isIOS || isAndroid
export const isWeb =
  !isNative && typeof window !== 'undefined' && typeof document !== 'undefined'

export const platform = isIOS ? 'ios' : isAndroid ? 'android' : 'web'

// Swap Fees
export const frontendFeeAddressMainnet = getEnvString(
  'FRONTEND_FEE_ADDRESS_MAINNET',
)
export const frontendFeeAddressPreprod = getEnvString(
  'FRONTEND_FEE_ADDRESS_PREPROD',
)

// Ramp on/off
export const banxaTestWallet = getEnvString('BANXA_TEST_WALLET')

// Logger
export const sentryDsn = getEnvString('SENTRY_DSN')
const envLoggerFilter = getEnvString('LOGGER_FILTER')
export const loggerFilter = envLoggerFilter ? new RegExp(envLoggerFilter) : null
export const loggerLevel: App.Logger.Level = isDev
  ? App.Logger.Level.Debug
  : App.Logger.Level.Warn

// Themes
export const supportedThemes: Readonly<Record<ThemeName, ThemeName>> = freeze({
  'system': 'system',
  'default-light': 'default-light',
  'default-dark': 'default-dark',
})

// Currency
export const defaultCurrency: Portfolio.Currency.Symbol = 'USD'

// Legal
export const agreementDate = 1691967600000

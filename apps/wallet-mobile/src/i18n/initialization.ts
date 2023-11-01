import BigNumber from 'bignumber.js'
import {NativeModules, Platform} from 'react-native'

import {getRegion} from './getRegion'
import {numberLocales} from './languages'
import {asYoroiLocale} from './transformers/asYoroiLocale'

const systemLanguageCode =
  process.env.NODE_ENV === 'test'
    ? 'en-US'
    : Platform.select({
        ios: () =>
          NativeModules.SettingsManager.settings.AppleLocale ??
          NativeModules.SettingsManager.settings.AppleLanguages[0],
        android: () => NativeModules.I18nManager.localeIdentifier,
        default: () => 'en-US',
      })()

export const systemLocale = asYoroiLocale(systemLanguageCode)
export const numberLocale = numberLocales[getRegion(systemLanguageCode)]

BigNumber.config({
  FORMAT: numberLocale,
})

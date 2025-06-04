import {BigNumber} from 'bignumber.js'
import * as Localization from 'expo-localization'

import {
  LanguageCode,
  decimalComma,
  decimalDot,
  supportedLanguagesCodes,
} from './languages'

/**
 * NOTE: Locale Selection Logic
 *
 * The system uses the device's preferred locale settings to determine the best
 * language to use. Here's how it works:
 *
 * 1. getLocales() returns an array of locales in the device's preference order
 * 2. The first locale that matches our supported languages is selected
 * 3. If no match is found, it defaults to 'en-US'
 */
const bestLocale = Localization.getLocales().find(
  (locale: Localization.Locale) =>
    supportedLanguagesCodes.includes(locale.languageTag as LanguageCode),
)
export const systemLocale = bestLocale?.languageTag ?? 'en-US'

/**
 * NOTE: Time Zone
 *
 * For a better estimation you could use the moment-timezone package
 * but it will add significant bloat to your website's bundle size.
 */
const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const timeZone = Localization.getCalendars()[0]?.timeZone
export const systemTimeZone = timeZone ?? defaultTimeZone ?? 'UTC'

/**
 * NOTE: Number Formatting
 *
 * It is leverage to display only
 * To input numbers, anything other than numbers are considered the decimal separator.
 */
export const systemNumberLocale =
  bestLocale?.decimalSeparator === '.' ? decimalDot : decimalComma

BigNumber.config({
  FORMAT: systemNumberLocale,
})

import BigNumber from 'bignumber.js'
import {NativeModules, Platform} from 'react-native'

import {getRegion} from './getRegion'
import {asYoroiLocale} from './transformers/asYoroiLocale'

export const supportedLanguages = [
  {code: 'bn-BD', label: 'বাংলা'},
  {code: 'cs-CZ', label: 'Čeština'},
  {code: 'de-DE', label: 'Deutsch'},
  {code: 'en-US', label: 'English'},
  {code: 'es-ES', label: 'Español'},
  {code: 'fr-FR', label: 'Français'},
  {code: 'hu-HU', label: 'Magyar'},
  {code: 'id-ID', label: 'Bahasa Indonesia'},
  {code: 'it-IT', label: 'Italiano'},
  {code: 'ja-JP', label: '日本語'},
  {code: 'ko-KR', label: '한국어'},
  {code: 'nl-NL', label: 'Nederlands'},
  {code: 'pl-PL', label: 'Polski'},
  {code: 'pt-BR', label: 'Português brasileiro'},
  {code: 'ru-RU', label: 'Русский'},
  {code: 'sk-SK', label: 'Slovenčina'},
  {code: 'sl-SI', label: 'Slovenščina'},
  {code: 'sv-SE', label: 'Svenska'},
  {code: 'sw-KE', label: 'Kiswahili'},
  {code: 'fil-PH', label: 'Filipino'},
  {code: 'uk-UA', label: 'Українська'},
  {code: 'vi-VN', label: 'Tiếng Việt'},
  {code: 'zh-Hans', label: '简体中文'},
] as const

export const LANGUAGES = {
  BENGALI: 'bn-BD',
  BRAZILIAN: 'pt-BR',
  CHINESE_SIMPLIFIED: 'zh-Hans',
  CZECH: 'cs-CZ',
  DUTCH: 'nl-NL',
  ENGLISH: 'en-US',
  FILIPINO: 'fil-PH',
  FRENCH: 'fr-FR',
  GERMAN: 'de-DE',
  HUNGARIAN: 'hu-HU',
  INDONESIAN: 'id-ID',
  ITALIAN: 'it-IT',
  JAPANESE: 'ja-JP',
  KENYAN: 'sw-KE',
  KOREAN: 'ko-KR',
  POLISH: 'pl-PL',
  RUSSIAN: 'ru-RU',
  SLOVAK: 'sk-SK',
  SLOVENIAN: 'sl-SI',
  SPANISH: 'es-ES',
  SWEDISH: 'sv-SE',
  UKRAINIAN: 'uk-UA',
  VIETNAMESE: 'vi-VN',
} as const

export type LanguageCode = (typeof LANGUAGES)[keyof typeof LANGUAGES]

// This makes sure supportedLanguages and LANGUAGES are in sync
type SupportedLanguageCode = (typeof supportedLanguages)[number]['code']
type EqualityGuard<A, B> = Exclude<A, B> | Exclude<B, A>
const assert = <T extends never>() => null as T
assert<EqualityGuard<LanguageCode, SupportedLanguageCode>>()

export const REGIONS = {
  BENGALI: 'BD',
  BRAZILIAN: 'BR',
  CHINESE_SIMPLIFIED: 'Hans',
  CZECH: 'CZ',
  DUTCH: 'NL',
  ENGLISH: 'US',
  FILIPINO: 'PH',
  FRENCH: 'FR',
  GERMAN: 'DE',
  HUNGARIAN: 'HU',
  INDONESIAN: 'ID',
  ITALIAN: 'IT',
  JAPANESE: 'JP',
  KENYAN: 'KE',
  KOREAN: 'KR',
  POLISH: 'PL',
  RUSSIAN: 'RU',
  SLOVAK: 'SK',
  SLOVENIAN: 'SI',
  SPANISH: 'ES',
  SWEDISH: 'SE',
  UKRAINIAN: 'UA',
  VIETNAMESE: 'VN',
} as const
export type RegionCode = (typeof REGIONS)[keyof typeof REGIONS]

export type NumberLocale = {
  prefix: string
  decimalSeparator: string
  groupSeparator: string
  groupSize: number
  secondaryGroupSize: number
  fractionGroupSize: number
  fractionGroupSeparator: string
  suffix: string
}

const standard: NumberLocale = {
  prefix: '',
  decimalSeparator: ',',
  groupSeparator: ' ',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSize: 0,
  fractionGroupSeparator: ' ',
  suffix: '',
}

const decimalDot: NumberLocale = {
  ...standard,
  decimalSeparator: '.',
  groupSeparator: ',',
}

export const numberLocales = {
  [REGIONS.BENGALI]: standard,
  [REGIONS.BRAZILIAN]: standard,
  [REGIONS.CHINESE_SIMPLIFIED]: decimalDot,
  [REGIONS.CZECH]: standard,
  [REGIONS.DUTCH]: decimalDot,
  [REGIONS.ENGLISH]: decimalDot,
  [REGIONS.FILIPINO]: standard,
  [REGIONS.FRENCH]: standard,
  [REGIONS.GERMAN]: standard,
  [REGIONS.HUNGARIAN]: standard,
  [REGIONS.INDONESIAN]: standard,
  [REGIONS.ITALIAN]: standard,
  [REGIONS.JAPANESE]: decimalDot,
  [REGIONS.KENYAN]: decimalDot,
  [REGIONS.KOREAN]: decimalDot,
  [REGIONS.POLISH]: standard,
  [REGIONS.RUSSIAN]: standard,
  [REGIONS.SLOVAK]: standard,
  [REGIONS.SLOVENIAN]: standard,
  [REGIONS.SPANISH]: standard,
  [REGIONS.SWEDISH]: standard,
  [REGIONS.UKRAINIAN]: standard,
  [REGIONS.VIETNAMESE]: standard,
}

const systemLanguageCode = Platform.select({
  ios: () =>
    NativeModules.SettingsManager.settings.AppleLocale ?? NativeModules.SettingsManager.settings.AppleLanguages[0],
  android: () => NativeModules.I18nManager.localeIdentifier,
  default: () => 'en-US',
})()
export const systemLocale = asYoroiLocale(systemLanguageCode)
export const numberLocale = numberLocales[getRegion(systemLanguageCode)]

BigNumber.config({
  FORMAT: numberLocale,
})

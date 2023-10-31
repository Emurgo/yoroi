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

import BigNumber from 'bignumber.js'

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

const defaultNumberFmt: NumberLocale = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSize: 0,
  fractionGroupSeparator: ' ',
  suffix: '',
}

// note(v-almonacid): most countries use comma as decimal separator, so this
// is more genereic than the above
const defaultCommaDecimalSeparatorFmt = {
  ...defaultNumberFmt,
  decimalSeparator: ',',
  groupSeparator: ' ',
}

// Note(ppershing): this is just temporary
// and should be replaced with real configs
const russianNumberFmt = defaultCommaDecimalSeparatorFmt
const spanishNumberFmt = {
  ...defaultNumberFmt,
  decimalSeparator: ',',
  groupSeparator: '.',
}

export const numberLocales = {
  [LANGUAGES.BENGALI]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.BRAZILIAN]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.CHINESE_SIMPLIFIED]: defaultNumberFmt,
  [LANGUAGES.CZECH]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.DUTCH]: defaultNumberFmt,
  [LANGUAGES.ENGLISH]: defaultNumberFmt,
  [LANGUAGES.FILIPINO]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.FRENCH]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.GERMAN]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.HUNGARIAN]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.INDONESIAN]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.ITALIAN]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.JAPANESE]: defaultNumberFmt,
  [LANGUAGES.KENYAN]: defaultNumberFmt,
  [LANGUAGES.KOREAN]: defaultNumberFmt,
  [LANGUAGES.POLISH]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.RUSSIAN]: russianNumberFmt,
  [LANGUAGES.SLOVAK]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.SLOVENIAN]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.SPANISH]: spanishNumberFmt,
  [LANGUAGES.SWEDISH]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.UKRAINIAN]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.VIETNAMESE]: defaultCommaDecimalSeparatorFmt,
}

export const updateLanguageSettings = (code: LanguageCode) => {
  BigNumber.config({
    FORMAT: numberLocales[code],
  })
}

updateLanguageSettings(LANGUAGES.ENGLISH)

export * from './LanguageProvider'

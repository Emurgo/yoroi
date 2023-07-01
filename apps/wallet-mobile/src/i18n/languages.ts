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

import 'moment/locale/bn'
import 'moment/locale/cs'
import 'moment/locale/de'
import 'moment/locale/es'
import 'moment/locale/fr'
import 'moment/locale/hu'
import 'moment/locale/id'
import 'moment/locale/it'
import 'moment/locale/ja'
import 'moment/locale/ko'
import 'moment/locale/nl'
import 'moment/locale/pl'
import 'moment/locale/pt'
import 'moment/locale/ru'
import 'moment/locale/sk'
import 'moment/locale/sl'
import 'moment/locale/sv'
import 'moment/locale/sw'
import 'moment/locale/tl-ph'
import 'moment/locale/uk'
import 'moment/locale/zh-cn'

import BigNumber from 'bignumber.js'
import moment from 'moment'

// note(v-almonacid): there is no distinction between trad vs simplified
// chinese locales in momentjs
const momentLocales = {
  [LANGUAGES.BENGALI]: 'bn',
  [LANGUAGES.BRAZILIAN]: 'pt',
  [LANGUAGES.CHINESE_SIMPLIFIED]: 'zh-cn',
  [LANGUAGES.CZECH]: 'cs',
  [LANGUAGES.DUTCH]: 'nl',
  [LANGUAGES.ENGLISH]: 'en',
  [LANGUAGES.FILIPINO]: 'tl-ph',
  [LANGUAGES.FRENCH]: 'fr',
  [LANGUAGES.GERMAN]: 'de',
  [LANGUAGES.HUNGARIAN]: 'hu',
  [LANGUAGES.KENYAN]: 'sw',
  [LANGUAGES.INDONESIAN]: 'id',
  [LANGUAGES.ITALIAN]: 'it',
  [LANGUAGES.JAPANESE]: 'ja',
  [LANGUAGES.KOREAN]: 'ko',
  [LANGUAGES.POLISH]: 'pl',
  [LANGUAGES.RUSSIAN]: 'ru',
  [LANGUAGES.SLOVAK]: 'sk',
  [LANGUAGES.SLOVENIAN]: 'sl',
  [LANGUAGES.SPANISH]: 'es',
  [LANGUAGES.SWEDISH]: 'sv',
  [LANGUAGES.UKRAINIAN]: 'uk',
  [LANGUAGES.VIETNAMESE]: 'vi',
}

// Add default custom formatting functions
Object.values(momentLocales).forEach((name) => {
  moment.updateLocale(name, {
    format: {
      dateToSeconds: 'Do MMM YYYY HH:mm:ss',
      timeToSeconds: 'LTS',
    },
  })
})

moment.updateLocale('en', {
  calendar: {
    sameDay: '[Today]',
    lastDay: '[Yesterday]',
    nextDay: '[Tomorrow]',
    lastWeek: 'L',
    nextWeek: 'L',
    sameElse: 'L',
  },
})

const defaultNumberFmt = {
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

const numberLocales = {
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
  moment.locale(momentLocales[code])

  BigNumber.config({
    FORMAT: numberLocales[code],
  })
}

updateLanguageSettings(LANGUAGES.ENGLISH)

export * from './LanguageProvider'

import 'moment/locale/ko'
import 'moment/locale/ja'
import 'moment/locale/zh-cn'
import 'moment/locale/ru'
import 'moment/locale/es'
import 'moment/locale/id'
import 'moment/locale/pt'
import 'moment/locale/de'
import 'moment/locale/fr'
import 'moment/locale/it'
import 'moment/locale/nl'
import 'moment/locale/cs'
import 'moment/locale/hu'
import 'moment/locale/sk'

import BigNumber from 'bignumber.js'
import moment from 'moment'

import assert from '../legacy/assert'
import {LANGUAGES} from './languages'

// note(v-almonacid): there is no distinction between trad vs simplified
// chinese locales in momentjs
const momentLocales = {
  [LANGUAGES.ENGLISH]: 'en',
  [LANGUAGES.CHINESE_SIMPLIFIED]: 'zh-cn',
  // TODO: Add when chinese traditional is available
  // [LANGUAGES.CHINESE_TRADITIONAL]: 'zh-cn',
  [LANGUAGES.KOREAN]: 'ko',
  [LANGUAGES.JAPANESE]: 'ja',
  [LANGUAGES.RUSSIAN]: 'ru',
  [LANGUAGES.SPANISH]: 'es',
  [LANGUAGES.INDONESIAN]: 'id',
  [LANGUAGES.BRAZILIAN]: 'pt',
  [LANGUAGES.GERMAN]: 'de',
  [LANGUAGES.FRENCH]: 'fr',
  [LANGUAGES.ITALIAN]: 'it',
  [LANGUAGES.DUTCH]: 'nl',
  [LANGUAGES.CZECH]: 'cs',
  [LANGUAGES.HUNGARIAN]: 'hu',
  [LANGUAGES.SLOVAK]: 'sk',
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
  [LANGUAGES.ENGLISH]: defaultNumberFmt,
  [LANGUAGES.CHINESE_SIMPLIFIED]: defaultNumberFmt,
  // TODO: Add when chinese traditional is available
  // [LANGUAGES.CHINESE_TRADITIONAL]: customNumberFmt,
  [LANGUAGES.KOREAN]: defaultNumberFmt,
  [LANGUAGES.JAPANESE]: defaultNumberFmt,
  [LANGUAGES.RUSSIAN]: russianNumberFmt,
  [LANGUAGES.SPANISH]: spanishNumberFmt,
  [LANGUAGES.INDONESIAN]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.BRAZILIAN]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.GERMAN]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.FRENCH]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.ITALIAN]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.DUTCH]: defaultNumberFmt,
  [LANGUAGES.CZECH]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.HUNGARIAN]: defaultCommaDecimalSeparatorFmt,
  [LANGUAGES.SLOVAK]: defaultCommaDecimalSeparatorFmt,
}

export const setLanguage = (code: string) => {
  assert.assert(Object.values(LANGUAGES).includes(code), 'Unknown language', code)
  moment.locale(momentLocales[code])

  BigNumber.config({
    FORMAT: numberLocales[code],
  })
}

setLanguage(LANGUAGES.ENGLISH)

export * from './LanguageProvider'

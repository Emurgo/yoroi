// @flow
import _ from 'lodash'
import LocalizedStrings from 'localized-strings'
import moment from 'moment'
import BigNumber from 'bignumber.js'

import 'moment/locale/ko'
import 'moment/locale/ja'
import 'moment/locale/zh-cn'
import 'moment/locale/ru'

import en from './en'

import assert from '../utils/assert'

import type {Translation} from './type'

const transform = (obj, transformer) =>
  _.isPlainObject(obj)
    ? _.mapValues(obj, (v) => transform(v, transformer))
    : _.isArray(obj)
      ? _.map(obj, (v) => transform(v, transformer))
      : transformer(obj)

// "Translates" a string or a function returning string
// into random characters from targetChars
const dummyTranslate = (targetChars) => (obj: any): any => {
  const replace = (str: string) => {
    let oldStr = ''
    while (str !== oldStr) {
      oldStr = str
      const target = targetChars[Math.floor(targetChars.length * Math.random())]

      str = str.replace(/[a-zA-Z]/, target)
    }
    return str
  }
  if (_.isFunction(obj)) {
    return (...args) => replace(obj(...args))
  } else {
    return replace(obj)
  }
}

const dummyCn = (transform(
  en,
  dummyTranslate('发送支援请求时出现问题'),
): Translation)

const dummyJa = (transform(
  en,
  dummyTranslate('インポートしようとしたウ'),
): Translation)

const dummyRu = (transform(
  en,
  dummyTranslate('абвгдеёжзийклмнопрстуфхцчшщъыьэюя'),
): Translation)

export const LANGUAGES = {
  CHINESE_SIMPLIFIED: 'zh-Hans',
  CHINESE_TRADITIONAL: 'zh-Hant',
  ENGLISH: 'en-US',
  JAPANESE: 'ja-JP',
  KOREAN: 'ko-KR',
  RUSSIAN: 'ru-RU',
}

const momentLocales = {
  [LANGUAGES.ENGLISH]: 'en',
  [LANGUAGES.CHINESE_SIMPLIFIED]: 'zh-cn',
  [LANGUAGES.CHINESE_TRADITIONAL]: 'zh-cn',
  [LANGUAGES.KOREAN]: 'ko',
  [LANGUAGES.JAPANESE]: 'ja',
  [LANGUAGES.RUSSIAN]: 'ru',
}

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

// Note(ppershing): this is just temporary
// and should be replaced with real configs
const customNumberFmt = {
  ...defaultNumberFmt,
  decimalSeparator: '@',
  groupSeparator: '~',
}

const numberLocales = {
  [LANGUAGES.ENGLISH]: defaultNumberFmt,
  [LANGUAGES.CHINESE_SIMPLIFIED]: customNumberFmt,
  [LANGUAGES.CHINESE_TRADITIONAL]: customNumberFmt,
  [LANGUAGES.KOREAN]: customNumberFmt,
  [LANGUAGES.JAPANESE]: customNumberFmt,
  [LANGUAGES.RUSSIAN]: customNumberFmt,
}

const strings = new LocalizedStrings({
  [LANGUAGES.ENGLISH]: en,
  [LANGUAGES.CHINESE_SIMPLIFIED]: dummyCn,
  [LANGUAGES.CHINESE_TRADITIONAL]: dummyCn,
  [LANGUAGES.KOREAN]: dummyCn,
  [LANGUAGES.JAPANESE]: dummyJa,
  [LANGUAGES.RUSSIAN]: dummyRu,
})

const setLanguage = (code: string) => {
  assert.assert(
    Object.values(LANGUAGES).includes(code),
    'Unknown language',
    code,
  )
  strings.setLanguage(code)
  moment.locale(momentLocales[code])
  BigNumber.config({
    FORMAT: numberLocales[code],
  })
}

setLanguage(LANGUAGES.ENGLISH)

export default {
  translations: (strings: Translation),
  setLanguage,
  LANGUAGES,
}

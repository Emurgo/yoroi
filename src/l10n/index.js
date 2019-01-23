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
import ja from './jp-JP'
import ru from './ru-RU'
import ko from './ko-KR'
import {TEXT_TYPE} from './util'

import assert from '../utils/assert'

import type {Translation} from './type'

const transform = (obj: any, transformer) => {
  if (
    _.isPlainObject(obj) &&
    (!obj.type || !Object.keys(TEXT_TYPE).includes(obj.type))
  ) {
    return _.mapValues(obj, (v) => transform(v, transformer))
  }

  if (_.isArray(obj)) {
    return _.map(obj, (v) => transform(v, transformer))
  }

  return transformer(obj)
}

const transformFormattingFunction = (obj, replace) => {
  if (obj.type === TEXT_TYPE.INLINE) {
    return {
      ...obj,
      block: obj.block.map((item) =>
        transformFormattingFunction(item, replace),
      ),
    }
  } else if (obj.text) {
    return {
      ...obj,
      text: replace(obj.text),
    }
  } else {
    throw new Error('Dummy translation not supported')
  }
}

export const LANGUAGES = {
  // TODO: Add when chinese is available
  // CHINESE_SIMPLIFIED: 'zh-Hans',
  // CHINESE_TRADITIONAL: 'zh-Hant',
  ENGLISH: 'en-US',
  JAPANESE: 'ja-JP',
  KOREAN: 'ko-KR',
  RUSSIAN: 'ru-RU',
}

const momentLocales = {
  [LANGUAGES.ENGLISH]: 'en',
  // TODO: Add when chinese is available
  // [LANGUAGES.CHINESE_SIMPLIFIED]: 'zh-cn',
  // [LANGUAGES.CHINESE_TRADITIONAL]: 'zh-cn',
  [LANGUAGES.KOREAN]: 'ko',
  [LANGUAGES.JAPANESE]: 'ja',
  [LANGUAGES.RUSSIAN]: 'ru',
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

// Note(ppershing): this is just temporary
// and should be replaced with real configs
const russianNumberFmt = {
  ...defaultNumberFmt,
  decimalSeparator: ',',
  groupSeparator: ' ',
}

const numberLocales = {
  [LANGUAGES.ENGLISH]: defaultNumberFmt,
  // TODO: Add when chinese is available
  // [LANGUAGES.CHINESE_SIMPLIFIED]: customNumberFmt,
  // [LANGUAGES.CHINESE_TRADITIONAL]: customNumberFmt,
  [LANGUAGES.KOREAN]: defaultNumberFmt,
  [LANGUAGES.JAPANESE]: defaultNumberFmt,
  [LANGUAGES.RUSSIAN]: russianNumberFmt,
}

const strings = new LocalizedStrings({
  [LANGUAGES.ENGLISH]: en,
  // TODO: Add when chinese is available
  // [LANGUAGES.CHINESE_SIMPLIFIED]: dummyCn,
  // [LANGUAGES.CHINESE_TRADITIONAL]: dummyCn,
  [LANGUAGES.KOREAN]: ko,
  [LANGUAGES.JAPANESE]: ja,
  [LANGUAGES.RUSSIAN]: ru,
})

const setLanguage = (code: string) => {
  assert.assert(
    Object.values(LANGUAGES).includes(code),
    'Unknown language',
    code,
  )
  strings.setLanguage(code)
  moment.locale(momentLocales[code])
  // $FlowFixMe
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

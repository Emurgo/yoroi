// @flow
import _ from 'lodash'
import LocalizedStrings from 'localized-strings'

import en from './en'

import type {Translation} from './type'

const transform = (obj, transformer) =>
  _.isPlainObject(obj)
    ? _.mapValues(obj, (v) => transform(v, transformer))
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

const dummyCn = (
  transform(en, dummyTranslate('发送支援请求时出现问题')): Translation
)

const dummyJa = (
  transform(en, dummyTranslate('インポートしようとしたウ')): Translation
)

const strings = new LocalizedStrings({
  en,
  zh: dummyCn,
  ja: dummyJa,
})

strings.setLanguage('en')

export default (strings: Translation)

const translations = {}

import en_US from "./locales/en-US"
import ja_JP from "./locales/ja-JP"
import ko_KR from "./locales/ko-KR"
import ru_RU from "./locales/ru-RU"

import {LANGUAGES} from './languages'

const termsOfUse = (locale) => {
    return 'require(`./locales/terms-of-use/ada/${locale}.md`)'
}

const defaultLocale = en_US

translations[LANGUAGES.ENGLISH] = en_US

// Merged english messages with selected by user locale messages
// In this case all english data would be overridden to user selected locale, but untranslated
// (missed in object keys) just stay in english
translations[LANGUAGES.JAPANESE] = Object.assign({}, defaultLocale, ja_JP);
translations[LANGUAGES.KOREAN] = Object.assign({}, defaultLocale, ko_KR);
translations[LANGUAGES.RUSSIAN] = Object.assign({}, defaultLocale, ru_RU);


//translations[LANGUAGES.ENGLISH]['global.tos'] = termsOfUse(LANGUAGES.ENGLISH)
//translations[LANGUAGES.JAPANESE]['global.tos'] = require('./locales/terms-of-use/ada/ja-JP.md')
//translations[LANGUAGES.KOREAN]['global.tos'] = require('./locales/terms-of-use/ada/ko-KR.md')
//translations[LANGUAGES.RUSSIAN]['global.tos'] = require('./locales/terms-of-use/ada/ru-RU.md')

export default translations;

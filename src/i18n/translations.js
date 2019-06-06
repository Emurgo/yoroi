// @flow
import enUS from './locales/en-US'
import jaJP from './locales/ja-JP'
import koKR from './locales/ko-KR'
import ruRU from './locales/ru-RU'
import esES from './locales/es-ES'

import {LANGUAGES} from './languages'

const translations = {}
const defaultLocale = enUS

translations[LANGUAGES.ENGLISH] = enUS

// Merged english messages with selected by user locale messages
// In this case all english data would be overridden to user selected locale, but untranslated
// (missed in object keys) just stay in english
translations[LANGUAGES.JAPANESE] = Object.assign({}, defaultLocale, jaJP)
translations[LANGUAGES.KOREAN] = Object.assign({}, defaultLocale, koKR)
translations[LANGUAGES.RUSSIAN] = Object.assign({}, defaultLocale, ruRU)
translations[LANGUAGES.SPANISH] = Object.assign({}, defaultLocale, esES)

export default translations

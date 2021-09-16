// @flow

import enUS from './locales/en-US'
import jaJP from './locales/ja-JP'
import koKR from './locales/ko-KR'
import ruRU from './locales/ru-RU'
import esES from './locales/es-ES'
import zhHans from './locales/zh-Hans'
import idID from './locales/id-ID'
import ptBR from './locales/pt-BR'
import deDE from './locales/de-DE'
import frFR from './locales/fr-FR'
import itIT from './locales/it-IT'
import nlNL from './locales/nl-NL'
import csCZ from './locales/cs-CZ'
import huHU from './locales/hu-HU'
import skSK from './locales/sk-SK'
// TODO: Add when chinese traditional is available
// import zhHant from './locales/zh-Hant'

import {LANGUAGES} from './languages'

const defaultLocale = enUS

const translations = {
  [LANGUAGES.ENGLISH]: enUS,
  // Merged english messages with selected by user locale messages
  // In this case all english data would be overridden to user selected locale, but untranslated
  // (missed in object keys) just stay in english
  [LANGUAGES.JAPANESE]: {...defaultLocale, ...jaJP},
  [LANGUAGES.KOREAN]: {...defaultLocale, ...koKR},
  [LANGUAGES.RUSSIAN]: {...defaultLocale, ...ruRU},
  [LANGUAGES.SPANISH]: {...defaultLocale, ...esES},
  [LANGUAGES.CHINESE_SIMPLIFIED]: {...defaultLocale, ...zhHans,},    
  [LANGUAGES.INDONESIAN]: {...defaultLocale, ...idID},
  [LANGUAGES.BRAZILIAN]: {...defaultLocale, ...ptBR},
  [LANGUAGES.GERMAN]: {...defaultLocale, ...deDE},
  [LANGUAGES.FRENCH]: {...defaultLocale, ...frFR},
  [LANGUAGES.ITALIAN]: {...defaultLocale, ...itIT},
  [LANGUAGES.DUTCH]: {...defaultLocale, ...nlNL},
  [LANGUAGES.CZECH]: {...defaultLocale, ...csCZ},
  [LANGUAGES.HUNGARIAN]: {...defaultLocale, ...huHU},
  [LANGUAGES.SLOVAK]: {...defaultLocale, ...skSK},
  // TODO: Add when chinese traditional is available
  // [LANGUAGES.CHINESE_TRADITIONAL]: {...defaultLocale, ...zhHans},
}

export default translations

import * as Localization from 'expo-localization'
import {freeze} from 'immer'

import deDE from './locales/de-DE.json'
import enUS from './locales/en-US.json'
import esES from './locales/es-ES.json'
import frFR from './locales/fr-FR.json'
import idID from './locales/id-ID.json'
import jaJP from './locales/ja-JP.json'
import koKR from './locales/ko-KR.json'
import ptBR from './locales/pt-BR.json'
import ruRU from './locales/ru-RU.json'
import viVN from './locales/vi-VN.json'
import zhHans from './locales/zh-Hans.json'

export const LANGUAGES = freeze({
  BRAZILIAN: 'pt-BR',
  CHINESE_SIMPLIFIED: 'zh-Hans',
  ENGLISH: 'en-US',
  FRENCH: 'fr-FR',
  GERMAN: 'de-DE',
  INDONESIAN: 'id-ID',
  JAPANESE: 'ja-JP',
  KOREAN: 'ko-KR',
  RUSSIAN: 'ru-RU',
  SPANISH: 'es-ES',
  VIETNAMESE: 'vi-VN',
} as const)

export type LanguageCode = (typeof LANGUAGES)[keyof typeof LANGUAGES]
export type LanguageRecord = {
  code: LanguageCode
  label: string
}

export const supportedLanguages: ReadonlyArray<LanguageRecord> = freeze(
  [
    {code: 'de-DE', label: 'Deutsch'},
    {code: 'en-US', label: 'English'},
    {code: 'es-ES', label: 'Español'},
    {code: 'fr-FR', label: 'Français'},
    {code: 'id-ID', label: 'Bahasa Indonesia'},
    {code: 'ja-JP', label: '日本語'},
    {code: 'ko-KR', label: '한국어'},
    {code: 'pt-BR', label: 'Português brasileiro'},
    {code: 'ru-RU', label: 'Русский'},
    {code: 'vi-VN', label: 'Tiếng Việt'},
    {code: 'zh-Hans', label: '简体中文'},
  ] as const,
  true,
)

export const supportedLanguagesCodes: ReadonlyArray<LanguageCode> =
  supportedLanguages.map(({code}) => code)

export const isLanguageCode = (data: unknown): data is LanguageCode =>
  supportedLanguages.some((l) => l.code === data)

/**
 * NOTE: Locale Selection Logic
 *
 * The system uses the device's preferred locale settings to determine the best
 * language to use. Here's how it works:
 *
 * 1. getLocales() returns an array of locales in the device's preference order
 * 2. The first locale that matches our supported languages is selected
 * 3. If no match is found, it defaults to 'en-US'
 */
const systemLocale = Localization.getLocales().find((l: Localization.Locale) =>
  supportedLanguagesCodes.includes(l.languageTag as LanguageCode),
)
export const systemLanguageCode = (systemLocale?.languageTag ??
  'en-US') as LanguageCode
export const findLocale = (languageCode: LanguageCode) => {
  const locale = Localization.getLocales().find(
    (l: Localization.Locale) => l.languageTag === languageCode,
  )
  return locale
}

/**
 * NOTE: Time Zone
 *
 * For a better estimation you could use the moment-timezone package
 * but it will add significant bloat to your website's bundle size.
 */
const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const timeZone = Localization.getCalendars()[0]?.timeZone
export const systemTimeZone = timeZone ?? defaultTimeZone ?? 'UTC'

const defaultLocale = enUS

export const translations = freeze(
  {
    [LANGUAGES.ENGLISH]: enUS,
    // Merged english messages with selected by user locale messages
    // In this case all english data would be overridden to user selected locale, but untranslated
    // (missed in object keys) just stay in english
    [LANGUAGES.JAPANESE]: {...defaultLocale, ...jaJP},
    [LANGUAGES.KOREAN]: {...defaultLocale, ...koKR},
    [LANGUAGES.RUSSIAN]: {...defaultLocale, ...ruRU},
    [LANGUAGES.SPANISH]: {...defaultLocale, ...esES},
    [LANGUAGES.CHINESE_SIMPLIFIED]: {...defaultLocale, ...zhHans},
    [LANGUAGES.INDONESIAN]: {...defaultLocale, ...idID},
    [LANGUAGES.BRAZILIAN]: {...defaultLocale, ...ptBR},
    [LANGUAGES.GERMAN]: {...defaultLocale, ...deDE},
    [LANGUAGES.FRENCH]: {...defaultLocale, ...frFR},
    [LANGUAGES.VIETNAMESE]: {...defaultLocale, ...viVN},
  },
  true,
)

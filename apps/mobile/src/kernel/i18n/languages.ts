import * as Localization from 'expo-localization'
import {freeze} from 'immer'

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

export const defaultLanguage: Readonly<LanguageRecord> = freeze({
  code: 'en-US',
  label: 'English',
})

export const systemLocale = (Localization.getLocales().find(
  (locale: Localization.Locale) =>
    supportedLanguagesCodes.includes(locale.languageTag as LanguageCode),
)?.languageTag ?? 'en-US') as LanguageCode

export const isLanguageCode = (data: unknown): data is LanguageCode =>
  supportedLanguages.some((language) => language.code === data)

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

export const decimalComma: Readonly<NumberLocale> = freeze({
  prefix: '',
  decimalSeparator: ',',
  groupSeparator: ' ',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSize: 0,
  fractionGroupSeparator: ' ',
  suffix: '',
})

export const decimalDot: Readonly<NumberLocale> = freeze({
  ...decimalComma,
  decimalSeparator: '.',
  groupSeparator: ',',
})

export const supportedLanguages = [
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
] as const

export const defaultLanguage = {code: 'en-US', label: 'English'} as const

export const supportedLanguagesCodes = supportedLanguages.map(({code}) => code)

export const LANGUAGES = {
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
} as const

export type LanguageCode = (typeof LANGUAGES)[keyof typeof LANGUAGES]

// This makes sure supportedLanguages and LANGUAGES are in sync
type SupportedLanguageCode = (typeof supportedLanguages)[number]['code']
type EqualityGuard<A, B> = Exclude<A, B> | Exclude<B, A>
const assert = <T extends never>() => null as T
assert<EqualityGuard<LanguageCode, SupportedLanguageCode>>()

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

export const decimalComma: NumberLocale = {
  prefix: '',
  decimalSeparator: ',',
  groupSeparator: ' ',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSize: 0,
  fractionGroupSeparator: ' ',
  suffix: '',
} as const

export const decimalDot: NumberLocale = {
  ...decimalComma,
  decimalSeparator: '.',
  groupSeparator: ',',
} as const

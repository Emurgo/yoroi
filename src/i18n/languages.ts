export const supportedLanguages = [
  {code: 'en-US', label: 'English'},
  {code: 'ja-JP', label: '日本語'},
  {code: 'ko-KR', label: '한국어'},
  {code: 'ru-RU', label: 'Русский'},
  {code: 'es-ES', label: 'Español'},
  {code: 'zh-Hans', label: '简体中文'},
  {code: 'id-ID', label: 'Bahasa Indonesia'},
  {code: 'pt-BR', label: 'Português brasileiro'},
  {code: 'de-DE', label: 'Deutsch'},
  {code: 'fr-FR', label: 'Français'},
  {code: 'it-IT', label: 'Italiano'},
  {code: 'nl-NL', label: 'Nederlands'},
  {code: 'cs-CZ', label: 'Čeština'},
  {code: 'hu-HU', label: 'Magyar'},
  {code: 'sk-SK', label: 'Slovenčina'},
] as const

export const LANGUAGES = {
  CHINESE_SIMPLIFIED: 'zh-Hans',
  ENGLISH: 'en-US',
  JAPANESE: 'ja-JP',
  KOREAN: 'ko-KR',
  RUSSIAN: 'ru-RU',
  SPANISH: 'es-ES',
  INDONESIAN: 'id-ID',
  BRAZILIAN: 'pt-BR',
  GERMAN: 'de-DE',
  FRENCH: 'fr-FR',
  ITALIAN: 'it-IT',
  DUTCH: 'nl-NL',
  CZECH: 'cs-CZ',
  HUNGARIAN: 'hu-HU',
  SLOVAK: 'sk-SK',
} as const

export type LanguageCode = typeof LANGUAGES[keyof typeof LANGUAGES]

export const supportedLanguages = [
  {code: 'bn-BD', label: 'বাংলা'},
  {code: 'cs-CZ', label: 'Čeština'},
  {code: 'de-DE', label: 'Deutsch'},
  {code: 'en-US', label: 'English'},
  {code: 'es-ES', label: 'Español'},
  {code: 'fr-FR', label: 'Français'},
  {code: 'hu-HU', label: 'Magyar'},
  {code: 'id-ID', label: 'Bahasa Indonesia'},
  {code: 'it-IT', label: 'Italiano'},
  {code: 'ja-JP', label: '日本語'},
  {code: 'ko-KR', label: '한국어'},
  {code: 'nl-NL', label: 'Nederlands'},
  {code: 'pl-PL', label: 'Polski'},
  {code: 'pt-BR', label: 'Português brasileiro'},
  {code: 'ru-RU', label: 'Русский'},
  {code: 'sk-SK', label: 'Slovenčina'},
  {code: 'sl-SI', label: 'Slovenščina'},
  {code: 'sv-SE', label: 'Svenska'},
  {code: 'sw-KE', label: 'Kiswahili'},
  {code: 'fil-PH', label: 'Filipino'},
  {code: 'uk-UA', label: 'Українська'},
  {code: 'vi-VN', label: 'Tiếng Việt'},
  {code: 'zh-Hans', label: '简体中文'},
] as const

export const LANGUAGES = {
  BENGALI: 'bn-BD',
  BRAZILIAN: 'pt-BR',
  CHINESE_SIMPLIFIED: 'zh-Hans',
  CZECH: 'cs-CZ',
  DUTCH: 'nl-NL',
  ENGLISH: 'en-US',
  FILIPINO: 'fil-PH',
  FRENCH: 'fr-FR',
  GERMAN: 'de-DE',
  HUNGARIAN: 'hu-HU',
  INDONESIAN: 'id-ID',
  ITALIAN: 'it-IT',
  JAPANESE: 'ja-JP',
  KENYAN: 'sw-KE',
  KOREAN: 'ko-KR',
  POLISH: 'pl-PL',
  RUSSIAN: 'ru-RU',
  SLOVAK: 'sk-SK',
  SLOVENIAN: 'sl-SI',
  SPANISH: 'es-ES',
  SWEDISH: 'sv-SE',
  UKRAINIAN: 'uk-UA',
  VIETNAMESE: 'vi-VN',
} as const

export type LanguageCode = (typeof LANGUAGES)[keyof typeof LANGUAGES]

import * as Flags from './flags'

export const supportedLanguages = {
  'en-US': {code: 'en-US', label: 'English', icon: Flags.English},
  'ja-JP': {code: 'ja-JP', label: '日本語', icon: Flags.Japanese},
  'ko-KR': {code: 'ko-KR', label: '한국어', icon: Flags.Korean},
  'ru-RU': {code: 'ru-RU', label: 'Русский', icon: Flags.Russian},
  'es-ES': {code: 'es-ES', label: 'Español', icon: Flags.Spanish},
  'zh-Hans': {code: 'zh-Hans', label: '简体中文', icon: Flags.Chinese},
  'id-ID': {code: 'id-ID', label: 'Bahasa Indonesia', icon: Flags.Indonesian},
  'pt-BR': {code: 'pt-BR', label: 'Português brasileiro', icon: Flags.Brazilian},
  'de-DE': {code: 'de-DE', label: 'Deutsch', icon: Flags.German},
  'fr-FR': {code: 'fr-FR', label: 'Français', icon: Flags.French},
  'it-IT': {code: 'it-IT', label: 'Italiano', icon: Flags.Italian},
  'nl-NL': {code: 'nl-NL', label: 'Nederlands', icon: Flags.Dutch},
  'cs-CZ': {code: 'cs-CZ', label: 'Čeština', icon: Flags.Czech},
  'hu-HU': {code: 'hu-HU', label: 'Magyar', icon: Flags.Hungarian},
  'sk-SK': {code: 'sk-SK', label: 'Slovenčina', icon: Flags.Slovak},
} as const

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
}

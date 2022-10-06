import * as Flags from './flags'

export const supportedLanguages = [
  {code: 'en-US', label: 'English', icon: Flags.English},
  {code: 'ja-JP', label: '日本語', icon: Flags.Japanese},
  {code: 'ko-KR', label: '한국어', icon: Flags.Korean},
  {code: 'ru-RU', label: 'Русский', icon: Flags.Russian},
  {code: 'es-ES', label: 'Español', icon: Flags.Spanish},
  {code: 'zh-Hans', label: '简体中文', icon: Flags.Chinese},
  {code: 'id-ID', label: 'Bahasa Indonesia', icon: Flags.Indonesian},
  {code: 'pt-BR', label: 'Português brasileiro', icon: Flags.Brazilian},
  {code: 'de-DE', label: 'Deutsch', icon: Flags.German},
  {code: 'fr-FR', label: 'Français', icon: Flags.French},
  {code: 'it-IT', label: 'Italiano', icon: Flags.Italian},
  {code: 'nl-NL', label: 'Nederlands', icon: Flags.Dutch},
  {code: 'cs-CZ', label: 'Čeština', icon: Flags.Czech},
  {code: 'hu-HU', label: 'Magyar', icon: Flags.Hungarian},
  {code: 'sk-SK', label: 'Slovenčina', icon: Flags.Slovak},
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
}

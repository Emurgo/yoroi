import {LanguageCode, LANGUAGES} from '../languages'

/**
 * Converts a locale string from using underscores to using hyphens Yoroi uses BCP 47 (IETF language tag) standard, or defaults to 'en-US' if the input is not a supported locale.
 *
 * @param {string} locale - The input locale string with underscores (e.g., 'en_US').
 * @returns {string} The converted locale string with hyphens (e.g., 'en-US'), it will default to 'en-US' if the input is not a supported locale.
 * @example asYoroiLocale('en_US') // 'en-US'
 * @example asYoroiLocale('pt_BR') // 'pt-BR'
 */
export const asYoroiLocale = (locale: string): LanguageCode => {
  const parsedLocale = locale.replace('_', '-')
  return isSupportedLocale(parsedLocale) ? parsedLocale : 'en-US'
}

export const isSupportedLocale = (locale: string): locale is LanguageCode => {
  return Object.values(LANGUAGES).includes(locale as LanguageCode)
}

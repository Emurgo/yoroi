import {IntlShape} from 'react-intl'

import {LocalizableError} from './LocalizableError'

export const getTranslatedError = (intl: IntlShape) => {
  return (error?: Error | LocalizableError): string => {
    if (error instanceof LocalizableError) {
      // Ensure descriptor has an id before formatting
      if (error.descriptor?.id) {
        const formatted = intl.formatMessage(error.descriptor)
        // Ensure we return a string (formatMessage can return MessageFormatElement[] for rich text)
        if (typeof formatted === 'string') {
          return formatted
        }
        // Convert MessageFormatElement[] to string - formatMessage with values returns string
        // This should not happen in practice, but TypeScript requires the check
        return String(formatted)
      }
      // Fallback if descriptor is missing id
      const fallback =
        error.descriptor?.defaultMessage || error.message || 'Unknown error'
      return typeof fallback === 'string' ? fallback : String(fallback)
    }

    const errorMessage = error?.toString()

    return errorMessage || 'Unknown error'
  }
}

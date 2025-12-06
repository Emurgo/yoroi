import {IntlShape} from 'react-intl'

import {LocalizableError} from './LocalizableError'

export const getTranslatedError = (intl: IntlShape) => {
  return (error?: Error | LocalizableError): string => {
    if (error instanceof LocalizableError) {
      // Ensure descriptor has an id before formatting
      if (error.descriptor?.id) {
        const formatted = intl.formatMessage(error.descriptor)
        // Ensure we return a string (formatMessage can return MessageFormatElement[] for rich text)
        return typeof formatted === 'string' ? formatted : String(formatted)
      }
      // Fallback if descriptor is missing id
      return (
        error.descriptor?.defaultMessage || error.message || 'Unknown error'
      )
    }

    const errorMessage = error?.toString()

    return errorMessage || 'Unknown error'
  }
}

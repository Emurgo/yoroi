import {IntlShape} from 'react-intl'

import {LocalizableError} from './LocalizableError'

export const getTranslatedError = (intl: IntlShape) => {
  return (error?: Error | LocalizableError) => {
    if (error instanceof LocalizableError) {
      // Ensure descriptor has an id before formatting
      if (error.descriptor?.id) {
        return intl.formatMessage(error.descriptor)
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

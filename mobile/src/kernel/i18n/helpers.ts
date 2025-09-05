import {IntlShape} from 'react-intl'

import {LocalizableError} from './LocalizableError'

export const getTranslatedError = (intl: IntlShape) => {
  return (error?: Error | LocalizableError) => {
    if (error instanceof LocalizableError) {
      return intl.formatMessage(error.descriptor)
    }

    const errorMessage = error?.toString()

    return errorMessage || 'Unknown error'
  }
}

import {useIntl} from 'react-intl'

import {getTranslatedError} from '~/kernel/i18n/helpers'
import {LocalizableError} from '~/kernel/i18n/LocalizableError'

export function useTranslatedError(error?: Error | LocalizableError) {
  const intl = useIntl()
  return getTranslatedError(intl)(error)
}

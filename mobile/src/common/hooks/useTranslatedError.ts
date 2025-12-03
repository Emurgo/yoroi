import {useIntl} from 'react-intl'

import {LocalizableError} from '~/kernel/i18n/LocalizableError'
import {getTranslatedError} from '~/kernel/i18n/helpers'

export function useTranslatedError(error?: Error | LocalizableError) {
  const intl = useIntl()
  return getTranslatedError(intl)(error)
}

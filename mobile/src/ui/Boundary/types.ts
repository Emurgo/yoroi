import {FallbackProps} from 'react-error-boundary'

import {LocalizableError} from '~/kernel/i18n/LocalizableError'

export type ErrorFallbackProps = {
  error: FallbackProps['error'] | LocalizableError
  resetErrorBoundary: FallbackProps['resetErrorBoundary']
  reset?: boolean
  debug?: boolean
}

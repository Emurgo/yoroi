import {freeze} from 'immer'
import {defineMessages, useIntl} from 'react-intl'

import globalMessages from '../../../kernel/i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return freeze({
    unknownError: intl.formatMessage(messages.unknownError),
    tooManyAttempts: intl.formatMessage(messages.tooManyAttempts),
    error: intl.formatMessage(globalMessages.error),
    cancel: intl.formatMessage(globalMessages.cancel),
    authorize: intl.formatMessage(messages.authorize),
    usePasscode: intl.formatMessage(messages.usePasscode),
  })
}

const messages = defineMessages({
  authorize: {
    id: 'components.send.biometricauthscreen.authorizeOperation',
    defaultMessage: '!!!Authorize',
  },
  usePasscode: {
    id: 'auth.usePasscode',
    defaultMessage: '!!!Use passcode',
  },
  tooManyAttempts: {
    id: 'components.send.biometricauthscreen.SENSOR_LOCKOUT',
    defaultMessage: '!!!Too many attempts',
  },
  unknownError: {
    id: 'components.send.biometricauthscreen.UNKNOWN_ERROR',
    defaultMessage: '!!!Unknown error!',
  },
})

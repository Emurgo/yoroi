import {freeze} from 'immer'
import {defineMessages, useIntl} from 'react-intl'

import globalMessages from '../../../kernel/i18n/global-messages'

export const useStrings = () => {
  const {formatMessage: f} = useIntl()

  return freeze({
    unknownError: f(messages.unknownError),
    tooManyAttempts: f(messages.tooManyAttempts),
    error: f(globalMessages.error),
    cancel: f(globalMessages.cancel),
    authorize: f(messages.authorize),
    usePasscode: f(messages.usePasscode),
    titleLoginWithPin: f(messages.titleLoginWithPin),
    titleChangePin: f(messages.titleChangePin),
    subtitleChangePin: f(messages.subtitleChangePin),
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
  titleLoginWithPin: {
    id: 'components.login.custompinlogin.title',
    defaultMessage: '!!!Enter PIN',
  },
  titleChangePin: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.title',
    defaultMessage: '!!!Enter PIN',
  },
  subtitleChangePin: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.subtitle',
    defaultMessage: '!!!Enter your current PIN',
  },
})

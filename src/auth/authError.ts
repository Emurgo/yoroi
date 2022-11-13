/* eslint-disable @typescript-eslint/no-explicit-any */
import {defineMessages, useIntl} from 'react-intl'
import {Alert} from 'react-native'

import globalMessages from '../i18n/global-messages'
import {Keychain} from './Keychain'

export const useAuthOsError = () => {
  const strings = useStrings()

  const alert = (error: any) => {
    if (error instanceof Keychain.Errors.CancelledByUser) return
    if (error instanceof Keychain.Errors.TooManyAttempts) return Alert.alert(strings.error, strings.tooManyAttempts)
    return Alert.alert(strings.error, strings.unknownError)
  }

  const getMessage = (error: any) => {
    if (error instanceof Keychain.Errors.CancelledByUser) return ''
    if (error instanceof Keychain.Errors.TooManyAttempts) return strings.tooManyAttempts
    return strings.unknownError
  }

  return {alert, getMessage}
}

const useStrings = () => {
  const intl = useIntl()

  return {
    unknownError: intl.formatMessage(messages.unknownError),
    tooManyAttempts: intl.formatMessage(messages.tooManyAttempts),
    error: intl.formatMessage(globalMessages.error),
  }
}

const messages = defineMessages({
  tooManyAttempts: {
    id: 'components.send.biometricauthscreen.SENSOR_LOCKOUT',
    defaultMessage: '!!!Too many attempts',
  },
  unknownError: {
    id: 'components.send.biometricauthscreen.UNKNOWN_ERROR',
    defaultMessage: '!!!Unknown error!',
  },
})

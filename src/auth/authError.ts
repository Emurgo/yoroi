import {defineMessages, useIntl} from 'react-intl'

export const useAuthOsErrorDecoder = () => {
  const strings = useStrings()

  const decoder = (error: Error | null | undefined) => {
    if (!error || /code: 13/.test(error?.message)) return // 13 = Cancelled by user
    if (/code: 7/.test(error?.message)) return strings.tooManyAttempts
    return `${strings.unknownError} : ${error?.message}`
  }

  return decoder
}

const useStrings = () => {
  const intl = useIntl()

  return {
    unknownError: intl.formatMessage(messages.unknownError),
    tooManyAttempts: intl.formatMessage(messages.tooManyAttempts),
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

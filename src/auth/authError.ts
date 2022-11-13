/* eslint-disable @typescript-eslint/no-explicit-any */
import {defineMessages, useIntl} from 'react-intl'
import {Platform} from 'react-native'

// react-native-keychain doesn't normalize the errors, iOS = `Error.code`
// Android the code is inside the message i.e "code 7: Too many attempts"
export const useAuthOsErrorDecoder = () => {
  const strings = useStrings()

  return Platform.select({
    android: (error: any): string | undefined => {
      if (!error) return
      if (/code: 13/.test(error?.message)) return // cancelled by user

      // iOS it will fallback to PIN, if wrong pin, sensor would be disabled (app will trigger pin creation)
      if (/code: 7/.test(error?.message)) return strings.tooManyAttempts

      return `${strings.unknownError}`
    },

    ios: (error: any): string | undefined => {
      if (!error) return
      if (error?.code === -128) return // cancelled by user

      return `${strings.unknownError} : ${(error as any)?.code}`
    },

    default: (_error: any): string | undefined => {
      return
    },
  })
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

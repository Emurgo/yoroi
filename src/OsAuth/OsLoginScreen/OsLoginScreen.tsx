import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {useAuthOsAppKey, useAuthOsErrorDecoder, useLoadSecret} from '../../auth'
import {useAuth} from '../../auth/AuthProvider'
import {Button} from '../../components'
import globalMessages from '../../i18n/global-messages'
import {isEmptyString} from '../../legacy/utils'
import {useStorage} from '../../Storage'
import {OsAuthBaseScreen} from '../OsAuthBaseScreen'

export const OsLoginScreen = () => {
  const strings = useStrings()
  const storage = useStorage()
  const secretKey = useAuthOsAppKey(storage)
  const {login} = useAuth()
  const {loadSecret, isLoading, error} = useLoadSecret({
    onSuccess: login,
  })
  const decodeAuthOsError = useAuthOsErrorDecoder()
  const errorMessage = decodeAuthOsError(error)

  if (isEmptyString(secretKey)) throw new Error('Invalid secret key')

  const authenticate = React.useCallback(() => {
    loadSecret({
      key: secretKey,
      authenticationPrompt: {
        title: strings.authorize,
        cancel: strings.cancel,
      },
    })
  }, [loadSecret, secretKey, strings.authorize, strings.cancel])

  return (
    <OsAuthBaseScreen
      headings={[strings.headings1, strings.headings2]}
      buttons={[<Button disabled={isLoading} key="login" title={strings.login} onPress={() => authenticate()} />]}
      error={errorMessage}
      addWelcomeMessage
    />
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    cancel: intl.formatMessage(globalMessages.cancel),
    headings1: intl.formatMessage(messages.headings1),
    headings2: intl.formatMessage(messages.headings2),
    login: intl.formatMessage(messages.login),
    authorize: intl.formatMessage(messages.authorize),
  }
}

const messages = defineMessages({
  authorize: {
    id: 'components.send.biometricauthscreen.authorizeOperation',
    defaultMessage: '!!!Authorize operation',
  },
  headings1: {
    id: 'components.send.biometricauthscreen.headings1',
    defaultMessage: '!!!Authorize with your',
  },
  headings2: {
    id: 'components.send.biometricauthscreen.headings2',
    defaultMessage: '!!!biometrics',
  },
  login: {
    id: 'components.login.appstartscreen.loginButton',
    defaultMessage: '!!!Login',
  },
})

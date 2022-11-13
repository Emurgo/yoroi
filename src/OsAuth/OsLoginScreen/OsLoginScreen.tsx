import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {useAuthOsError, useAuthWithOs} from '../../auth'
import {useAuth} from '../../auth/AuthProvider'
import {Button} from '../../components'
import globalMessages from '../../i18n/global-messages'
import {useStorage} from '../../Storage'
import {OsAuthScreen} from '../OsAuthScreen'

export const OsLoginScreen = () => {
  const strings = useStrings()
  const storage = useStorage()
  const {login} = useAuth()
  const {alert} = useAuthOsError()
  const {authWithOs, isLoading} = useAuthWithOs(
    {storage, authenticationPrompt: {title: strings.authorize, cancel: strings.cancel}},
    {
      onSuccess: login,
      onError: alert,
    },
  )

  return (
    <OsAuthScreen
      headings={[strings.headings1, strings.headings2]}
      buttons={[<Button disabled={isLoading} key="login" title={strings.login} onPress={() => authWithOs()} />]}
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

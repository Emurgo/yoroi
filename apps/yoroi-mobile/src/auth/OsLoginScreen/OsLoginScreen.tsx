import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {useAuth} from '../../auth/AuthProvider'
import {Button} from '../../components'
import {useAuthWithOs} from '../../yoroi-wallets/auth'
import {OsAuthScreen} from '../OsAuthScreen'

export const OsLoginScreen = () => {
  const strings = useStrings()

  const {login} = useAuth()
  const {authWithOs, isLoading} = useAuthWithOs({onSuccess: login})

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
    headings1: intl.formatMessage(messages.headings1),
    headings2: intl.formatMessage(messages.headings2),
    login: intl.formatMessage(messages.login),
  }
}

const messages = defineMessages({
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

import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../components'
import {showErrorDialog} from '../../dialogs'
import {errorMessages} from '../../i18n/global-messages'
import {CONFIG} from '../../legacy/config'
import {useCheckPin} from '../../yoroi-wallets/auth'
import {useAuth} from '../AuthProvider'
import {PinInput, PinInputRef} from '../PinInput'

export const PinLoginScreen = () => {
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const intl = useIntl()
  const strings = useStrings()
  const {login} = useAuth()

  const {checkPin, isLoading} = useCheckPin({
    onSuccess: (isValid) => {
      if (isValid) {
        login()
      } else {
        showErrorDialog(errorMessages.incorrectPin, intl)
        pinInputRef.current?.clear()
      }
    },
  })

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{flex: 1}}>
      <StatusBar />

      <PinInput
        ref={pinInputRef}
        enabled={!isLoading}
        pinMaxLength={CONFIG.PIN_LENGTH}
        title={strings.title}
        onDone={checkPin}
      />
    </SafeAreaView>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
  }
}

const messages = defineMessages({
  title: {
    id: 'components.login.custompinlogin.title',
    defaultMessage: '!!!Enter PIN',
  },
})

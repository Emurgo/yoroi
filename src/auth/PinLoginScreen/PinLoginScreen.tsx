import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../components'
import {errorMessages} from '../../i18n/global-messages'
import {showErrorDialog} from '../../legacy/actions'
import {CONFIG} from '../../legacy/config'
import {storage} from '../../yoroi-wallets/storage'
import {useAuth} from '../AuthProvider'
import {useCheckPin} from '../hooks'
import {PinInput, PinInputRef} from '../PinInput'

export const PinLoginScreen = () => {
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const intl = useIntl()
  const strings = useStrings()
  const {login} = useAuth()

  const {checkPin, isLoading} = useCheckPin(storage, {
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
      <StatusBar type="dark" />

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

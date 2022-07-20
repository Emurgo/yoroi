import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch} from 'react-redux'

import {StatusBar} from '../../components'
import {useCheckPin} from '../../hooks'
import {errorMessages} from '../../i18n/global-messages'
import {showErrorDialog, signin} from '../../legacy/actions'
import {CONFIG} from '../../legacy/config'
import {useStorage} from '../../Storage'
import {PinInput} from '../PinInput'

type Ref = {
  clean: () => void
}

export const PinLoginScreen = () => {
  const inputRef = React.useRef<null | Ref>(null)
  const intl = useIntl()
  const strings = useStrings()
  const dispatch = useDispatch()
  const storage = useStorage()

  const {checkPin, isLoading} = useCheckPin(storage, {
    onSuccess: (isValid) => {
      isValid
        ? dispatch(signin())
        : showErrorDialog({...errorMessages.incorrectPin, onPressYes: () => inputRef.current?.clean()}, intl)
    },
  })

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{flex: 1}}>
      <StatusBar type="dark" />

      <PinInput
        ref={inputRef}
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

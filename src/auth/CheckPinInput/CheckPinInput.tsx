import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {useCheckPin} from '../../hooks'
import {errorMessages} from '../../i18n/global-messages'
import {showErrorDialog} from '../../legacy/actions'
import {CONFIG} from '../../legacy/config'
import {useStorage} from '../../Storage'
import {PinInput} from '../PinInput'

type Ref = {
  clean: () => void
}

export const CheckPinInput = ({onValid}: {onValid: () => void}) => {
  const pinInputRef = React.useRef<null | Ref>(null)
  const intl = useIntl()
  const strings = useStrings()
  const storage = useStorage()
  const {checkPin, isLoading} = useCheckPin(storage, {
    onSuccess: (isValid) => {
      if (isValid) {
        onValid()
      } else {
        showErrorDialog({...errorMessages.incorrectPin, onPressYes: () => pinInputRef.current?.clean()}, intl)
      }
    },
    onError: (error) => {
      showErrorDialog({...errorMessages.generalError, onPressYes: () => pinInputRef.current?.clean()}, intl, {
        message: error.message,
      })
    },
  })

  return (
    <PinInput
      ref={pinInputRef}
      title={strings.title}
      subtitles={[strings.subtitle]}
      enabled={!isLoading}
      onDone={checkPin}
      pinMaxLength={CONFIG.PIN_LENGTH}
    />
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    subtitle: intl.formatMessage(messages.subtitle),
  }
}
const messages = defineMessages({
  title: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.title',
    defaultMessage: '!!!Enter PIN',
  },
  subtitle: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.subtitle',
    defaultMessage: '!!!Enter your current PIN',
  },
})

import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {showErrorDialog} from '../../../kernel/dialogs'
import {errorMessages} from '../../../kernel/i18n/global-messages'
import {PIN_LENGTH} from '../common/constants'
import {useCheckPin} from '../common/hooks'
import {PinInput, PinInputRef} from '../PinInput'

export const CheckPinInput = ({onValid}: {onValid: () => void}) => {
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const intl = useIntl()
  const strings = useStrings()
  const {checkPin, isLoading} = useCheckPin({
    onSuccess: (isValid) => {
      if (isValid) {
        onValid()
      } else {
        showErrorDialog(errorMessages.incorrectPin, intl)
        pinInputRef.current?.clear()
      }
    },
    onError: (error) => {
      showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      pinInputRef.current?.clear()
    },
  })

  return (
    <PinInput
      ref={pinInputRef}
      title={strings.title}
      subtitles={[strings.subtitle]}
      enabled={!isLoading}
      onDone={checkPin}
      pinMaxLength={PIN_LENGTH}
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

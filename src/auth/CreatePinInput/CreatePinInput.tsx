import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {showErrorDialog} from '../../dialogs'
import {errorMessages} from '../../i18n/global-messages'
import {CONFIG} from '../../legacy/config'
import {useCreatePin} from '../hooks'
import {PinInput, PinInputRef} from '../PinInput'

type Props = {onDone: () => void}
export const CreatePinInput = ({onDone}: Props) => {
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const pinConfirmationInputRef = React.useRef<null | PinInputRef>(null)

  const intl = useIntl()
  const strings = useStrings()

  const {createPin, isLoading} = useCreatePin({
    onSuccess: () => onDone(),
    onError: (error) => {
      showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      step === 'pin' ? pinInputRef.current?.clear() : pinConfirmationInputRef.current?.clear()
    },
  })
  const [pin, setPin] = React.useState('')
  const [step, setStep] = React.useState<'pin' | 'pinConfirmation'>('pin')

  const onPinInput = (pin: string) => {
    setPin(pin)
    setStep('pinConfirmation')
  }

  const onPinConfirmation = (pinConfirmation: string) => {
    if (pinConfirmation !== pin) {
      showErrorDialog(errorMessages.pinMismatch, intl)
      step === 'pin' ? pinInputRef.current?.clear() : pinConfirmationInputRef.current?.clear()
      return
    }

    createPin(pin)
  }

  return step === 'pin' ? (
    <PinInput
      ref={pinInputRef}
      key="pinInput"
      title={strings.pinInputTitle}
      subtitles={[strings.pinInputSubtitle]}
      pinMaxLength={CONFIG.PIN_LENGTH}
      onDone={onPinInput}
    />
  ) : (
    <PinInput
      ref={pinConfirmationInputRef}
      key="pinConfirmationInput"
      enabled={!isLoading}
      title={strings.pinInputConfirmationTitle}
      pinMaxLength={CONFIG.PIN_LENGTH}
      onDone={onPinConfirmation}
      onGoBack={() => setStep('pin')}
    />
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    pinInputTitle: intl.formatMessage(messages.pinInputTitle),
    pinInputSubtitle: intl.formatMessage(messages.pinInputSubtitle),
    pinInputConfirmationTitle: intl.formatMessage(messages.pinInputConfirmationTitle),
  }
}

const messages = defineMessages({
  pinInputTitle: {
    id: 'components.firstrun.custompinscreen.pinInputTitle',
    defaultMessage: '!!!Enter the PIN',
  },
  pinInputSubtitle: {
    id: 'components.firstrun.custompinscreen.pinInputSubtitle',
    defaultMessage: '!!!Choose new PIN for quick access to wallet.',
  },
  pinInputConfirmationTitle: {
    id: 'components.firstrun.custompinscreen.pinConfirmationTitle',
    defaultMessage: '!!!Repeat PIN',
  },
})

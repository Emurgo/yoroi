import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {useCreatePin} from '../../hooks'
import {errorMessages} from '../../i18n/global-messages'
import {showErrorDialog} from '../../legacy/actions'
import {CONFIG} from '../../legacy/config'
import {useStorage} from '../../Storage'
import {PinInput} from '../PinInput'

type Ref = {
  clean: () => void
}

export const CreatePinInput: React.FC<{onDone: () => void}> = ({onDone}) => {
  const inputRefPinInput = React.useRef<null | Ref>(null)
  const inputRefPinConfirmationInput = React.useRef<null | Ref>(null)

  const intl = useIntl()
  const strings = useStrings()
  const storage = useStorage()

  const {createPin, isLoading} = useCreatePin(storage, {
    onSuccess: () => onDone(),
    onError: (error) =>
      showErrorDialog(
        {
          ...errorMessages.generalError,
          onPressYesButton: () => (step === 'pin' ? inputRefPinInput : inputRefPinConfirmationInput).current?.clean(),
        },
        intl,
        {
          message: error.message,
        },
      ),
  })
  const [pin, setPin] = React.useState('')
  const [step, setStep] = React.useState<'pin' | 'pinConfirmation'>('pin')

  const onPinInput = (pin: string) => {
    setPin(pin)
    setStep('pinConfirmation')
  }

  const onPinConfirmation = (pinConfirmation: string) => {
    if (pinConfirmation !== pin) {
      showErrorDialog(
        {
          ...errorMessages.pinMismatch,
          onPressYesButton: () => (step === 'pin' ? inputRefPinInput : inputRefPinConfirmationInput).current?.clean(),
        },
        intl,
      )
      return
    }

    createPin(pin)
  }

  return step === 'pin' ? (
    <PinInput
      ref={inputRefPinInput}
      key="pinInput"
      title={strings.pinInputTitle}
      subtitles={[strings.pinInputSubtitle]}
      pinMaxLength={CONFIG.PIN_LENGTH}
      onDone={onPinInput}
    />
  ) : (
    <PinInput
      ref={inputRefPinConfirmationInput}
      key="pinConfirmationInput"
      enabled={!isLoading}
      title={strings.pinInputConfirmationTitle}
      pinMaxLength={CONFIG.PIN_LENGTH}
      onDone={onPinConfirmation}
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

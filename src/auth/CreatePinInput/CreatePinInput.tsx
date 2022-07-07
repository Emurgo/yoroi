import React from 'react'
import {useIntl} from 'react-intl'

import {useCreatePin} from '../../hooks'
import {errorMessages} from '../../i18n/global-messages'
import {showErrorDialog} from '../../legacy/actions'
import {CONFIG} from '../../legacy/config'
import {useStorage} from '../../Storage'
import {PinInput} from '../PinInput'

export type CreatePinStrings = {
  title: string
  subtitle: string
  confirmationTitle: string
}

export const CreatePinInput: React.FC<{onDone: () => void; createPinStrings: CreatePinStrings}> = ({
  onDone,
  createPinStrings,
}) => {
  const intl = useIntl()
  const storage = useStorage()
  const {createPin, isLoading} = useCreatePin(storage, {
    onSuccess: () => onDone(),
    onError: (error) => showErrorDialog(errorMessages.generalError, intl, {message: error.message}),
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
      return
    }

    createPin(pin)
  }

  return step === 'pin' ? (
    <PinInput
      key="pinInput"
      title={createPinStrings.title}
      subtitles={[createPinStrings.subtitle]}
      pinMaxLength={CONFIG.PIN_LENGTH}
      onDone={onPinInput}
    />
  ) : (
    <PinInput
      key="pinConfirmationInput"
      enabled={!isLoading}
      title={createPinStrings.confirmationTitle}
      pinMaxLength={CONFIG.PIN_LENGTH}
      onDone={onPinConfirmation}
    />
  )
}

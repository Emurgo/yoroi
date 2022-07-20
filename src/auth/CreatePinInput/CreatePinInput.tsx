import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {useCreatePin} from '../../hooks'
import {errorMessages} from '../../i18n/global-messages'
import {showErrorDialog} from '../../legacy/actions'
import {CONFIG} from '../../legacy/config'
import {useStorage} from '../../Storage'
import {PinInput} from '../PinInput'

export const CreatePinInput: React.FC<{onDone: () => void}> = ({onDone}) => {
  const intl = useIntl()
  const strings = useStrings()
  const storage = useStorage()

  const [currentPin, setCurrentPin] = React.useState('')
  const [previousPin, setPreviousPin] = React.useState('')

  const {createPin, isLoading} = useCreatePin(storage, {
    onSuccess: () => onDone(),
    onError: (error) =>
      showErrorDialog({...errorMessages.generalError, onPressYesButton: () => setCurrentPin('')}, intl, {
        message: error.message,
      }),
  })

  const [step, setStep] = React.useState<'pin' | 'pinConfirmation'>('pin')

  const onPinInput = (pin: string) => {
    setPreviousPin(pin)
    setCurrentPin('')
    setStep('pinConfirmation')
  }

  const onPinConfirmation = (pinConfirmation: string) => {
    if (pinConfirmation !== previousPin) {
      showErrorDialog({...errorMessages.pinMismatch, onPressYesButton: () => setCurrentPin('')}, intl)
      return
    }

    createPin(previousPin)
  }

  return step === 'pin' ? (
    <PinInput
      key="pinInput"
      title={strings.pinInputTitle}
      subtitles={[strings.pinInputSubtitle]}
      pinMaxLength={CONFIG.PIN_LENGTH}
      onDone={onPinInput}
      pin={currentPin}
      setPin={setCurrentPin}
    />
  ) : (
    <PinInput
      key="pinConfirmationInput"
      enabled={!isLoading}
      title={strings.pinInputConfirmationTitle}
      pinMaxLength={CONFIG.PIN_LENGTH}
      onDone={onPinConfirmation}
      pin={currentPin}
      setPin={setCurrentPin}
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

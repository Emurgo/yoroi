import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {showErrorDialog} from '../../../dialogs'
import {errorMessages} from '../../../i18n/global-messages'
import {useCreatePin} from '../../../yoroi-wallets/auth'
import {PIN_LENGTH} from '../common/constants'
import {PinInput, PinInputRef} from '../PinInput'

type Props = {onDone: (pin: string) => void}
export const CreatePinInput = ({onDone}: Props) => {
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const pinConfirmationInputRef = React.useRef<null | PinInputRef>(null)

  const intl = useIntl()
  const strings = useStrings()

  const {createPin, isLoading} = useCreatePin({
    onSuccess: (_, pin) => onDone(pin),
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
      pinMaxLength={PIN_LENGTH}
      onDone={onPinInput}
    />
  ) : (
    <PinInput
      ref={pinConfirmationInputRef}
      key="pinConfirmationInput"
      enabled={!isLoading}
      title={strings.pinInputConfirmationTitle}
      subtitles={[strings.pinInputConfirmationSubTitle]}
      pinMaxLength={PIN_LENGTH}
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
    pinInputConfirmationSubTitle: intl.formatMessage(messages.pinInputConfirmationSubTitle),
  }
}

const messages = defineMessages({
  pinInputTitle: {
    id: 'components.initialization.custompinscreen.pinInputTitle',
    defaultMessage: '!!!Enter PIN',
  },
  pinInputSubtitle: {
    id: 'components.initialization.custompinscreen.pinInputSubtitle',
    defaultMessage: '!!!Choose a new PIN to quickly access your wallet',
  },
  pinInputConfirmationTitle: {
    id: 'components.initialization.custompinscreen.pinConfirmationTitle',
    defaultMessage: '!!!Repeat PIN',
  },
  pinInputConfirmationSubTitle: {
    id: 'components.firstrun.custompinscreen.pinInputConfirmationSubTitle',
    defaultMessage: '!!!Repeat a new PIN to quickly access your wallet',
  },
})

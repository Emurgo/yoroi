import * as React from 'react'
import {useIntl} from 'react-intl'

import {pinLength} from '~/features/Auth/common/constants'
import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useStrings} from '~/features/Auth/hooks/useStrings'
import {PinInput, PinInputRef} from '~/features/Auth/ui/PinInput/PinInput'
import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/global-messages'
import {logger} from '~/kernel/logger/logger'

export const CreatePinInput = ({onDone}: Props) => {
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const pinConfirmationInputRef = React.useRef<null | PinInputRef>(null)

  const intl = useIntl()
  const strings = useStrings()
  const {createPin} = useAuth()

  const [pin, setPin] = React.useState('')
  const [step, setStep] = React.useState<'pin' | 'pinConfirmation'>('pin')

  const handlePinInput = (inputPin: string) => {
    setPin(inputPin)
    setStep('pinConfirmation')
  }

  const handlePinConfirmation = (pinConfirmation: string) => {
    if (pinConfirmation !== pin) {
      logger.debug('PIN mismatch', {origin: 'CreatePinInput', type: 'user'})
      showErrorDialog(errorMessages.pinMismatch, intl)
      step === 'pin'
        ? pinInputRef.current?.clear()
        : pinConfirmationInputRef.current?.clear()
      return
    }

    logger.info('A new PIN was created', {
      origin: 'CreatePinInput',
      type: 'user',
    })
    createPin(pin)
    onDone(pin)
  }

  return step === 'pin' ? (
    <PinInput
      ref={pinInputRef}
      key="pinInput"
      title={strings.pinInputTitle}
      subtitles={[strings.pinInputSubtitle]}
      pinMaxLength={pinLength}
      onDone={handlePinInput}
    />
  ) : (
    <PinInput
      ref={pinConfirmationInputRef}
      key="pinConfirmationInput"
      title={strings.pinInputConfirmationTitle}
      subtitles={[strings.pinInputConfirmationSubTitle]}
      pinMaxLength={pinLength}
      onDone={handlePinConfirmation}
      onGoBack={() => setStep('pin')}
    />
  )
}

type Props = {onDone: (pin: string) => void}

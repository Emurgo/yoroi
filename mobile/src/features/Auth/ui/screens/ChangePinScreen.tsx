import * as React from 'react'

import {CheckPinInput} from '~/features/Auth/ui/shared/CheckPinInput/CheckPinInput'
import {CreatePinInput} from '~/features/Auth/ui/shared/CreatePinInput/CreatePinInput'
import {SafeArea} from '~/ui/SafeArea/SafeArea'

export const ChangePinScreen: React.FC<Props> = ({onDone}) => {
  const [step, setStep] = React.useState<ChangePinStep>('checkPin')

  const handleValidPin = React.useCallback(() => {
    setStep('newPin')
  }, [])

  return (
    <SafeArea>
      {step === 'checkPin' ? (
        <CheckPinInput onValid={handleValidPin} />
      ) : (
        <CreatePinInput onDone={onDone} />
      )}
    </SafeArea>
  )
}

type ChangePinStep = 'checkPin' | 'newPin'

type Props = {
  onDone(): void
}

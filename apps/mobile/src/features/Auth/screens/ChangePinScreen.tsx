import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {CheckPinInput} from '../ui/CheckPinInput/CheckPinInput'
import {CreatePinInput} from '../ui/CreatePinInput/CreatePinInput'

export const ChangePinScreen: React.FC<Props> = ({onDone}) => {
  const [step, setStep] = React.useState<ChangePinStep>('checkPin')

  const handleValidPin = React.useCallback(() => {
    setStep('newPin')
  }, [])

  return (
    <SafeAreaView style={[a.flex_1, a.full_screen]}>
      {step === 'checkPin' ? (
        <CheckPinInput onValid={handleValidPin} />
      ) : (
        <CreatePinInput onDone={onDone} />
      )}
    </SafeAreaView>
  )
}

type ChangePinStep = 'checkPin' | 'newPin'

type Props = {
  onDone(): void
}

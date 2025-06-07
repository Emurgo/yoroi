import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'

import {CheckPinInput} from '../components/CheckPinInput'
import {CreatePinInput} from '../components/CreatePinInput/CreatePinInput'

export const ChangePinScreen: React.FC<Props> = ({onDone}) => {
  const [step, setStep] = React.useState<ChangePinStep>('checkPin')

  const handleValidPin = React.useCallback(() => {
    setStep('newPin')
  }, [])

  return (
    <View style={[a.flex_1]}>
      {step === 'checkPin' ? (
        <CheckPinInput onValid={handleValidPin} />
      ) : (
        <CreatePinInput onDone={onDone} />
      )}
    </View>
  )
}

type ChangePinStep = 'checkPin' | 'newPin'

type Props = {
  onDone: () => void
}

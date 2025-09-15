import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {CheckPinInput} from '~/features/Auth/ui/shared/CheckPinInput/CheckPinInput'
import {CreatePinInput} from '~/features/Auth/ui/shared/CreatePinInput/CreatePinInput'

export const ChangePinScreen: React.FC<Props> = ({onDone}) => {
  const [step, setStep] = React.useState<ChangePinStep>('checkPin')
  const {atoms: ta} = useTheme()

  const handleValidPin = React.useCallback(() => {
    setStep('newPin')
  }, [])

  return (
    <SafeAreaView style={[a.flex_1, ta.bg_color_max]}>
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

import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../components'
import {CheckPinInput} from '../CheckPinInput'
import {CreatePinInput} from '../CreatePinInput'

export const ChangePinScreen = ({onDone}: {onDone: () => void}) => {
  const [step, setStep] = React.useState<'checkPin' | 'newPin'>('checkPin')

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar type="dark" />

      {step === 'checkPin' ? <CheckPinInput onValid={() => setStep('newPin')} /> : <CreatePinInput onDone={onDone} />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../components'
import {CheckPinInput, CheckPinStrings} from '../CheckPinInput'
import {CreatePinInput, CreatePinStrings} from '../CreatePinInput'

export const ChangePinScreen = ({
  onDone,
  checkPinStrings,
  createPinStrings,
}: {
  onDone: () => void
  checkPinStrings: CheckPinStrings
  createPinStrings: CreatePinStrings
}) => {
  const [step, setStep] = React.useState<'checkPin' | 'newPin'>('checkPin')

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar type="dark" />

      {step === 'checkPin' ? (
        <CheckPinInput checkPinStrings={checkPinStrings} onValid={() => setStep('newPin')} />
      ) : (
        <CreatePinInput createPinStrings={createPinStrings} onDone={onDone} />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useStatusBar} from '../../components/hooks/useStatusBar'
import {CreatePinInput} from '../CreatePinInput'

export const CreatePinScreen = ({onDone}: {onDone: () => void}) => {
  useStatusBar()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <CreatePinInput onDone={onDone} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

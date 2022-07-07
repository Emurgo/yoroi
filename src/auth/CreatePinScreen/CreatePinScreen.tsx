import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../components'
import {CreatePinInput, CreatePinStrings} from '../CreatePinInput'

export const CreatePinScreen = ({
  onDone,
  createPinStrings,
}: {
  onDone: () => void
  createPinStrings: CreatePinStrings
}) => {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar type="dark" />

      <CreatePinInput createPinStrings={createPinStrings} onDone={onDone} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

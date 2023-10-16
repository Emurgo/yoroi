import {useSwap} from '@yoroi/swap'
import React from 'react'
import {Keyboard, StyleSheet, Text} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {COLORS} from '../../../../../../theme'
import {useStrings} from '../../../../common/strings'
import {useSwapForm} from '../../../../common/SwapFormProvider'

export const ClearQuantities = () => {
  const strings = useStrings()
  const {resetQuantities} = useSwap()
  const {poolDefaulted} = useSwapForm()

  const handleReset = () => {
    Keyboard.dismiss()
    resetQuantities()
    poolDefaulted()
  }

  return (
    <TouchableOpacity onPress={handleReset}>
      <Text style={styles.text}>{strings.clear}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  text: {color: COLORS.SHELLEY_BLUE, fontWeight: '600', textTransform: 'uppercase'},
})

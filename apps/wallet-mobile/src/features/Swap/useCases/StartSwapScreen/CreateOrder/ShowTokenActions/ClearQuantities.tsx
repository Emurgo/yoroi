import React from 'react'
import {StyleSheet, Text} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {COLORS} from '../../../../../../theme'
import {useStrings} from '../../../../common/strings'
import {useSwapForm} from '../../../../common/SwapFormProvider'

export const ClearQuantities = () => {
  const strings = useStrings()
  const {resetSwapForm} = useSwapForm()

  return (
    <TouchableOpacity onPress={resetSwapForm}>
      <Text style={styles.text}>{strings.clear}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  text: {color: COLORS.SHELLEY_BLUE, fontWeight: '600', textTransform: 'uppercase'},
})

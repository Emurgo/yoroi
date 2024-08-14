import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {useStrings} from '../../../../../common/strings'
import {useSwapForm} from '../../../../../common/SwapFormProvider'

export const ResetQuantities = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {resetQuantities} = useSwapForm()

  return (
    <TouchableOpacity onPress={resetQuantities}>
      <Text style={styles.text}>{strings.clear}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    text: {
      color: color.primary_c500,
      ...atoms.body_2_md_medium,
      textTransform: 'uppercase',
    },
  })
  return styles
}

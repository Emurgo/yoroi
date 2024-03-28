import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {useStrings} from '../../../../../common/strings'
import {useSwapForm} from '../../../../../common/SwapFormProvider'

export const ClearQuantities = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {clearSwapForm} = useSwapForm()

  return (
    <TouchableOpacity onPress={clearSwapForm}>
      <Text style={styles.text}>{strings.clear}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme

  const styles = StyleSheet.create({
    text: {
      color: color.primary[500],
      ...typography['body-2-m-medium'],
      textTransform: 'uppercase',
    },
  })
  return styles
}

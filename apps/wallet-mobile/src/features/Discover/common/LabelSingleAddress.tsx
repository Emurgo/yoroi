import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from './useStrings'

export const LabelSingleAddress = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  return (
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>{strings.singleAddress}</Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    labelContainer: {
      backgroundColor: color.el_gray_min,
      ...atoms.px_sm,
      paddingVertical: 3,
      borderRadius: 999,
    },
    labelText: {
      ...atoms.body_3_sm_medium,
      color: color.gray_min,
    },
  })

  return {styles} as const
}

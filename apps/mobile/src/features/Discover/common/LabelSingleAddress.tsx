import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from './useStrings'

export const LabelSingleAddress = () => {
  const strings = useStrings()
  const {color} = useTheme()
  return (
    <View style={[styles.labelContainer, {backgroundColor: color.el_gray_min}]}>
      <Text style={[styles.labelText, {color: color.gray_min}]}>{strings.singleAddress}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  labelContainer: {
    ...a.px_sm,
    paddingVertical: 3,
    borderRadius: 999,
  },
  labelText: {
    ...a.body_3_sm_medium,
  },
})
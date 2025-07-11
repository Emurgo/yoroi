import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from './useStrings'

export const LabelConnected = () => {
  const strings = useStrings()
  const {color} = useTheme()
  return (
    <View style={[styles.labelContainer, {backgroundColor: color.secondary_600}]}>
      <Text style={[styles.labelText, {color: color.gray_min}]}>{strings.connected}</Text>
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
    fontWeight: '500',
  },
})
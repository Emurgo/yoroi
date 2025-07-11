import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

export const Line = () => {
  const {color} = useTheme()
  return <View style={[styles.line, {backgroundColor: color.gray_200}]} />
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    ...a.w_full,
  },
})
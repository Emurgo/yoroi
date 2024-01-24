import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {lightPalette} from '../../theme'

export const Hr = ({style, ...rest}: ViewProps) => {
  return <View {...rest} style={[styles.hr, {backgroundColor: lightPalette.gray['200']}, style]} />
}

const styles = StyleSheet.create({
  hr: {
    height: StyleSheet.hairlineWidth,
  },
})

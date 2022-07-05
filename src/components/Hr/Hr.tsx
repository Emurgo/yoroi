import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {lightPalette} from '../../theme'

export const Hr = (props: ViewProps) => {
  return <View {...props} style={[styles.hr, {backgroundColor: lightPalette.gray['200']}]} />
}

const styles = StyleSheet.create({
  hr: {
    height: 1,
  },
})

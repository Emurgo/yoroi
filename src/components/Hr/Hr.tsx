import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {useTheme} from '../../theme'

export const Hr = (props: ViewProps) => {
  const {
    theme: {color},
  } = useTheme()

  return <View {...props} style={[styles.hr, {backgroundColor: color.gray['200']}]} />
}

const styles = StyleSheet.create({
  hr: {
    height: 1,
  },
})

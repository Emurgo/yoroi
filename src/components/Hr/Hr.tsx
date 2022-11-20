import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

export const Hr = ({style, ...props}: ViewProps) => {
  return <View {...props} style={[styles.hr, style]} />
}

const styles = StyleSheet.create({
  hr: {
    borderBottomColor: '#DCE0E9',
    borderBottomWidth: 1,
  },
})

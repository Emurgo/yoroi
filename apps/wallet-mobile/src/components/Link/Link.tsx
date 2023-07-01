import React from 'react'
import {Linking, StyleSheet, Text, TextStyle, TouchableOpacity} from 'react-native'

import {COLORS} from '../../theme'

type Props = {
  url: string
  text?: string
  style?: TextStyle
  children?: React.ReactNode
}

export const Link = ({url, text, style, children}: Props) => (
  <TouchableOpacity onPress={() => Linking.openURL(url)}>
    {children === undefined ? <Text style={[styles.text, style]}>{text}</Text> : children}
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  text: {
    color: COLORS.DARK_BLUE,
    textDecorationLine: 'underline',
  },
})

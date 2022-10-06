import React from 'react'
import {Linking, StyleSheet, Text, TextStyle, TouchableOpacity} from 'react-native'

import {COLORS} from '../../theme'

type Props = {
  url: string
  text: string
  style?: TextStyle
}

export const Link = ({url, text, style}: Props) => (
  <TouchableOpacity onPress={() => Linking.openURL(url)}>
    <Text style={[styles.text, style]}>{text}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  text: {
    color: COLORS.DARK_BLUE,
    textDecorationLine: 'underline',
  },
})

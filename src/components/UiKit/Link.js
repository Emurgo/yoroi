// @flow

import React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity} from 'react-native'
import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

import {COLORS} from '../../styles/config'

const styles = StyleSheet.create({
  text: {
    color: COLORS.DARK_BLUE,
    textDecorationLine: 'underline',
  },
})

type Props = {
  url: string,
  text: string,
  style?: TextStyleProp,
}

const Link = ({url, text, style}: Props) => (
  <TouchableOpacity onPress={() => Linking.openURL(url)}>
    <Text style={[styles.text, style]}>{text}</Text>
  </TouchableOpacity>
)

export default Link

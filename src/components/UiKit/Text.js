// @flow

import React from 'react'
import type {Node} from 'react'
import {StyleSheet, Text as RNText} from 'react-native'
import stylesConfig, {COLORS} from '../../styles/config'

const styles = StyleSheet.create({
  text: {
    fontFamily: stylesConfig.defaultFont,
    color: COLORS.BLACK,
    lineHeight: 20,
    fontSize: 16,
  },
  secondary: {
    color: '#ADAEB6',
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
  },
  light: {
    color: '#fff',
  },
  bold: {
    fontWeight: '700',
  },
})

type Props = {
  children: Node,
  small?: boolean,
  secondary?: boolean,
  light?: boolean,
  style?: any,
  bold?: boolean,
}

const Text = ({children, style, small, secondary, light, bold}: Props) => (
  <RNText
    style={[
      styles.text,
      small && styles.small,
      secondary && styles.secondary,
      light && styles.light,
      bold && styles.bold,
      style,
    ]}
  >
    {children}
  </RNText>
)

export default Text

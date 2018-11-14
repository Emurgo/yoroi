// @flow

import React from 'react'
import type {Node} from 'react'
import {StyleSheet, Text as RNText} from 'react-native'
import stylesConfig, {COLORS} from '../../styles/config'

const styles = StyleSheet.create({
  text: {
    fontFamily: stylesConfig.defaultFont,
    color: COLORS.BLACK,
  },
  secondary: {
    color: '#ADAEB6',
    fontSize: 12,
  },
  small: {
    fontSize: 12,
  },
  light: {
    color: '#fff',
  },
})

type Props = {
  children: Node,
  small?: boolean,
  secondary?: boolean,
  light?: boolean,
  style?: any,
}

const Text = ({children, style, small, secondary, light}: Props) => (
  <RNText
    style={[
      styles.text,
      small && styles.small,
      secondary && styles.secondary,
      light && styles.light,
      style,
    ]}
  >
    {children}
  </RNText>
)

export default Text

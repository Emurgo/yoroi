// @flow

import React from 'react'
import type {Node} from 'react'
import {StyleSheet, Text as RNText, Platform} from 'react-native'
import stylesConfig, {COLORS} from '../../styles/config'

const styles = StyleSheet.create({
  text: {
    fontFamily: stylesConfig.defaultFont,
    color: COLORS.BLACK,
    lineHeight: 18,
    fontSize: 14,
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
  monospace: {
    ...Platform.select({
      ios: {fontFamily: 'Menlo'},
      android: {fontFamily: 'monospace'},
    }),
  },
})

type Props = {
  children: Node,
  small?: boolean,
  secondary?: boolean,
  light?: boolean,
  style?: any,
  bold?: boolean,
  monospace?: boolean,
}

const Text = ({
  children,
  style,
  small,
  secondary,
  light,
  bold,
  monospace,
  ...restProps
}: Props) => (
  <RNText
    style={[
      styles.text,
      small && styles.small,
      secondary && styles.secondary,
      light && styles.light,
      bold && styles.bold,
      monospace && styles.monospace,
      style,
    ]}
    {...restProps}
  >
    {children}
  </RNText>
)

export default Text

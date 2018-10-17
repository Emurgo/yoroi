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
})

type Props = {children: Node, style?: any}

const Text = ({children, style}: Props) => (
  <RNText style={[styles.text, style || {}]}>{children}</RNText>
)

export default Text

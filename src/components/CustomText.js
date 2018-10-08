// @flow

import React from 'react'
import type {Node} from 'react'
import {StyleSheet, Text} from 'react-native'
import stylesConfig, {COLORS} from '../styles/config'

const styles = StyleSheet.create({
  text: {
    fontFamily: stylesConfig.defaultFont,
    color: COLORS.BLACK,
  },
})

type Props = {children: Node, style?: any}

const CustomText = ({children, style}: Props) => (
  <Text style={[styles.text, style || {}]}>{children}</Text>
)

export default CustomText

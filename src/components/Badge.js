// @flow

import React from 'react'
import {StyleSheet, View, Text} from 'react-native'
import stylesConfig, {COLORS} from '../styles/config'

const styles = StyleSheet.create({
  container: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 20,
  },
  text: {
    fontFamily: stylesConfig.defaultFont,
  },
})

type Props = {text: string, color?: string, backgroundColor?: string}

const Badge = ({text, color, backgroundColor}: Props) => (
  <View
    style={{
      ...styles.container,
      backgroundColor: backgroundColor || COLORS.PRIMARY,
    }}
  >
    <Text
      style={{
        ...styles.text,
        color: color || COLORS.PRIMARY_TEXT,
      }}
    >{text}</Text>
  </View>
)

export default Badge

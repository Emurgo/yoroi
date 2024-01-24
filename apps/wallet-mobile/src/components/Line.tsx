import React from 'react'
import {StyleSheet, View} from 'react-native'

import {COLORS} from '../theme'

type Props = {backgroundColor?: string}

export const Line = ({backgroundColor}: Props) => (
  <View
    style={{
      ...styles.container,
      backgroundColor: backgroundColor != null ? backgroundColor : COLORS.SECONDARY_TEXT,
    }}
  />
)

const styles = StyleSheet.create({
  container: {
    height: 1,
    opacity: 0.3,
  },
})
